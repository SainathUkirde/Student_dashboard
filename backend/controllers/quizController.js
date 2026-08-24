const { getDb } = require('../database/db');

function getStudentId() {
  const db = getDb();
  const row = db.prepare('SELECT id FROM students ORDER BY id LIMIT 1').get();
  return row ? row.id : 1;
}

// ─── GET /api/quizzes/subjects ───────────────────────────────────────────────
function getSubjects(req, res) {
  const db = getDb();
  const subjects = db.prepare('SELECT id, course_code, course_name, abbreviation FROM courses ORDER BY course_name').all();
  res.json(subjects);
}

// ─── GET /api/quizzes/questions ──────────────────────────────────────────────
// Query params: subject_id, difficulty, limit
function getQuestions(req, res) {
  const db = getDb();
  let { subject_id, difficulty, limit = 10 } = req.query;
  limit = Math.min(Math.max(parseInt(limit) || 10, 5), 20);

  let query = 'SELECT * FROM quiz_questions WHERE 1=1';
  const params = [];

  if (subject_id && subject_id !== 'all') {
    query += ' AND subject_id = ?';
    params.push(parseInt(subject_id));
  }
  if (difficulty && difficulty !== 'mixed') {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  // Get total available then random-sample
  const total = db.prepare(`SELECT COUNT(*) as cnt FROM quiz_questions WHERE 1=1${subject_id && subject_id !== 'all' ? ' AND subject_id = ?' : ''}${difficulty && difficulty !== 'mixed' ? ' AND difficulty = ?' : ''}`).get(...params);
  if (total.cnt === 0) {
    return res.status(404).json({ error: 'No questions found for the selected filters' });
  }

  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(limit);

  const questions = db.prepare(query).all(...params);
  // Strip correct_answer and explanation for the attempt phase
  const sanitized = questions.map(q => ({
    id: q.id,
    subject_id: q.subject_id,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
  }));
  res.json(sanitized);
}

// ─── POST /api/quizzes/start ─────────────────────────────────────────────────
function startQuiz(req, res) {
  const db = getDb();
  const { subject_id, difficulty, total_questions, quiz_mode } = req.body;

  if (!quiz_mode) return res.status(400).json({ error: 'quiz_mode is required' });
  const numQ = Math.min(Math.max(parseInt(total_questions) || 10, 5), 20);

  // Fetch random questions
  let qQuery = 'SELECT * FROM quiz_questions WHERE 1=1';
  const qParams = [];
  if (subject_id && subject_id !== 'all') { qQuery += ' AND subject_id = ?'; qParams.push(parseInt(subject_id)); }
  if (difficulty && difficulty !== 'mixed') { qQuery += ' AND difficulty = ?'; qParams.push(difficulty); }
  qQuery += ' ORDER BY RANDOM() LIMIT ?';
  qParams.push(numQ);

  const questions = db.prepare(qQuery).all(...qParams);
  if (!questions.length) return res.status(404).json({ error: 'No questions found for the selected criteria' });

  const now = new Date().toISOString();
  const insertAttempt = db.prepare(`
    INSERT INTO quiz_attempts
      (student_id, subject_id, difficulty, quiz_mode, total_questions,
       correct_answers, incorrect_answers, unanswered, score, percentage, accuracy,
       time_taken, started_at, completed_at, status)
    VALUES (?, ?, ?, ?, ?, 0, 0, ?, 0, 0, 0, 0, ?, NULL, 'in_progress')
  `);
  const result = insertAttempt.run(
    getStudentId(),
    subject_id && subject_id !== 'all' ? parseInt(subject_id) : null,
    difficulty || 'mixed',
    quiz_mode,
    questions.length,
    questions.length,
    now
  );
  const attemptId = result.lastInsertRowid;

  // Insert placeholder answer rows
  const insertAns = db.prepare(`
    INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct, time_spent, marked_for_review)
    VALUES (?, ?, NULL, 0, 0, 0)
  `);
  const insertMany = db.transaction((qs) => {
    qs.forEach(q => insertAns.run(attemptId, q.id));
  });
  insertMany(questions);

  // Return question list (no correct answers)
  const sanitized = questions.map(q => ({
    id: q.id, subject_id: q.subject_id, topic: q.topic, difficulty: q.difficulty,
    question: q.question, option_a: q.option_a, option_b: q.option_b,
    option_c: q.option_c, option_d: q.option_d,
  }));

  res.json({ attempt_id: attemptId, questions: sanitized, started_at: now });
}

// ─── POST /api/quizzes/:attemptId/answer ─────────────────────────────────────
function saveAnswer(req, res) {
  const db = getDb();
  const { attemptId } = req.params;
  const { question_id, selected_answer, marked_for_review, time_spent } = req.body;

  const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ?').get(parseInt(attemptId), getStudentId());
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.status !== 'in_progress') return res.status(400).json({ error: 'Quiz already submitted' });

  db.prepare(`
    UPDATE quiz_answers SET selected_answer = ?, marked_for_review = ?, time_spent = ?
    WHERE attempt_id = ? AND question_id = ?
  `).run(
    selected_answer || null,
    marked_for_review ? 1 : 0,
    parseInt(time_spent) || 0,
    parseInt(attemptId),
    parseInt(question_id)
  );

  res.json({ success: true });
}

// ─── POST /api/quizzes/:attemptId/submit ─────────────────────────────────────
function submitQuiz(req, res) {
  const db = getDb();
  const { attemptId } = req.params;
  const { time_taken } = req.body;

  const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ?').get(parseInt(attemptId), getStudentId());
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.status !== 'in_progress') return res.status(400).json({ error: 'Quiz already submitted' });

  // Fetch answers with correct answers
  const answers = db.prepare(`
    SELECT qa.*, qq.correct_answer, qq.subject_id, qq.topic
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qa.attempt_id = ?
  `).all(parseInt(attemptId));

  let correct = 0, incorrect = 0, unanswered = 0;
  const updateAns = db.prepare('UPDATE quiz_answers SET is_correct = ? WHERE id = ?');

  const processAnswers = db.transaction(() => {
    answers.forEach(a => {
      if (!a.selected_answer) {
        unanswered++;
        updateAns.run(0, a.id);
      } else if (a.selected_answer === a.correct_answer) {
        correct++;
        updateAns.run(1, a.id);
      } else {
        incorrect++;
        updateAns.run(0, a.id);
      }
    });
  });
  processAnswers();

  const total = answers.length;
  const score = correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const timeTaken = parseInt(time_taken) || 0;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE quiz_attempts SET
      correct_answers = ?, incorrect_answers = ?, unanswered = ?,
      score = ?, percentage = ?, accuracy = ?, time_taken = ?,
      completed_at = ?, status = 'completed'
    WHERE id = ?
  `).run(correct, incorrect, unanswered, score, percentage, accuracy, timeTaken, now, parseInt(attemptId));

  res.json({
    attempt_id: parseInt(attemptId),
    total_questions: total,
    correct_answers: correct,
    incorrect_answers: incorrect,
    unanswered,
    score,
    percentage,
    accuracy,
    time_taken: timeTaken,
    completed_at: now,
  });
}

// ─── GET /api/quizzes/:attemptId/result ──────────────────────────────────────
function getResult(req, res) {
  const db = getDb();
  const { attemptId } = req.params;

  const attempt = db.prepare(`
    SELECT qa.*, c.course_name as subject_name, c.abbreviation as subject_abbr
    FROM quiz_attempts qa
    LEFT JOIN courses c ON qa.subject_id = c.id
    WHERE qa.id = ? AND qa.student_id = ?
  `).get(parseInt(attemptId), getStudentId());

  if (!attempt) return res.status(404).json({ error: 'Result not found' });
  res.json(attempt);
}

// ─── GET /api/quizzes/:attemptId/analysis ────────────────────────────────────
function getAnalysis(req, res) {
  const db = getDb();
  const { attemptId } = req.params;

  const attempt = db.prepare(`
    SELECT qa.*, c.course_name as subject_name, c.abbreviation as subject_abbr
    FROM quiz_attempts qa
    LEFT JOIN courses c ON qa.subject_id = c.id
    WHERE qa.id = ? AND qa.student_id = ?
  `).get(parseInt(attemptId), getStudentId());

  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const answers = db.prepare(`
    SELECT qa.*, qq.question, qq.option_a, qq.option_b, qq.option_c, qq.option_d,
           qq.correct_answer, qq.explanation, qq.topic, qq.difficulty, qq.subject_id,
           c.course_name as subject_name
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    LEFT JOIN courses c ON qq.subject_id = c.id
    WHERE qa.attempt_id = ?
    ORDER BY qa.id
  `).all(parseInt(attemptId));

  res.json({ attempt, answers });
}

// ─── GET /api/quizzes/history ─────────────────────────────────────────────────
function getHistory(req, res) {
  const db = getDb();
  const { subject_id, difficulty, status } = req.query;

  let query = `
    SELECT qa.*, c.course_name as subject_name, c.abbreviation as subject_abbr
    FROM quiz_attempts qa
    LEFT JOIN courses c ON qa.subject_id = c.id
    WHERE qa.student_id = ? AND qa.status = 'completed'
  `;
  const params = [getStudentId()];

  if (subject_id && subject_id !== 'all') { query += ' AND qa.subject_id = ?'; params.push(parseInt(subject_id)); }
  if (difficulty && difficulty !== 'all') { query += ' AND qa.difficulty = ?'; params.push(difficulty); }

  query += ' ORDER BY qa.completed_at DESC';

  const attempts = db.prepare(query).all(...params);
  res.json(attempts);
}

// ─── GET /api/quizzes/statistics ─────────────────────────────────────────────
function getStatistics(req, res) {
  const db = getDb();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_quizzes,
      COALESCE(AVG(percentage), 0) as avg_score,
      COALESCE(MAX(percentage), 0) as best_score,
      COALESCE(MIN(percentage), 0) as lowest_score,
      COALESCE(SUM(total_questions), 0) as total_questions,
      COALESCE(SUM(correct_answers), 0) as total_correct,
      COALESCE(SUM(incorrect_answers), 0) as total_incorrect,
      COALESCE(SUM(unanswered), 0) as total_unanswered,
      COALESCE(AVG(accuracy), 0) as avg_accuracy
    FROM quiz_attempts
    WHERE student_id = ? AND status = 'completed'
  `).get(getStudentId());

  res.json({
    total_quizzes: stats.total_quizzes,
    avg_score: Math.round(stats.avg_score),
    best_score: Math.round(stats.best_score),
    lowest_score: Math.round(stats.lowest_score),
    total_questions: stats.total_questions,
    total_correct: stats.total_correct,
    total_incorrect: stats.total_incorrect,
    total_unanswered: stats.total_unanswered,
    avg_accuracy: Math.round(stats.avg_accuracy),
  });
}

// ─── GET /api/quizzes/performance ────────────────────────────────────────────
function getPerformance(req, res) {
  const db = getDb();

  const trend = db.prepare(`
    SELECT id, percentage, accuracy, completed_at, total_questions, correct_answers,
           quiz_mode, difficulty,
           (SELECT course_name FROM courses WHERE id = quiz_attempts.subject_id) as subject_name
    FROM quiz_attempts
    WHERE student_id = ? AND status = 'completed'
    ORDER BY completed_at ASC
  `).all(getStudentId());

  res.json(trend);
}

// ─── GET /api/quizzes/subject-analysis ───────────────────────────────────────
function getSubjectAnalysis(req, res) {
  const db = getDb();

  const analysis = db.prepare(`
    SELECT
      c.id as subject_id, c.course_name, c.abbreviation,
      COUNT(qa.id) as quizzes_attempted,
      COALESCE(AVG(qa.percentage), 0) as avg_score,
      COALESCE(MAX(qa.percentage), 0) as best_score,
      COALESCE(MIN(qa.percentage), 0) as lowest_score,
      COALESCE(AVG(qa.accuracy), 0) as avg_accuracy,
      COALESCE(SUM(qa.total_questions), 0) as total_questions,
      COALESCE(SUM(qa.correct_answers), 0) as total_correct
    FROM courses c
    LEFT JOIN quiz_attempts qa ON c.id = qa.subject_id AND qa.student_id = ? AND qa.status = 'completed'
    GROUP BY c.id
    ORDER BY c.course_name
  `).all(getStudentId());

  res.json(analysis.map(a => ({
    ...a,
    avg_score: Math.round(a.avg_score),
    best_score: Math.round(a.best_score),
    lowest_score: Math.round(a.lowest_score),
    avg_accuracy: Math.round(a.avg_accuracy),
  })));
}

// ─── GET /api/quizzes/topic-analysis ─────────────────────────────────────────
function getTopicAnalysis(req, res) {
  const db = getDb();

  const topics = db.prepare(`
    SELECT
      qq.topic,
      qq.subject_id,
      c.course_name,
      c.abbreviation,
      COUNT(ans.id) as total_answered,
      SUM(CASE WHEN ans.selected_answer IS NOT NULL AND ans.selected_answer != '' THEN 1 ELSE 0 END) as attempted,
      SUM(CASE WHEN ans.is_correct = 1 THEN 1 ELSE 0 END) as correct,
      CASE
        WHEN SUM(CASE WHEN ans.selected_answer IS NOT NULL AND ans.selected_answer != '' THEN 1 ELSE 0 END) > 0
        THEN ROUND(100.0 * SUM(CASE WHEN ans.is_correct = 1 THEN 1 ELSE 0 END)
             / SUM(CASE WHEN ans.selected_answer IS NOT NULL AND ans.selected_answer != '' THEN 1 ELSE 0 END), 1)
        ELSE 0
      END as accuracy
    FROM quiz_questions qq
    JOIN quiz_answers ans ON ans.question_id = qq.id
    JOIN quiz_attempts att ON ans.attempt_id = att.id AND att.student_id = ? AND att.status = 'completed'
    LEFT JOIN courses c ON qq.subject_id = c.id
    GROUP BY qq.topic, qq.subject_id
    ORDER BY accuracy ASC
  `).all(getStudentId());

  res.json(topics);
}

// ─── GET /api/quizzes/insights ────────────────────────────────────────────────
function getInsights(req, res) {
  const db = getDb();

  const stats = db.prepare(`
    SELECT COUNT(*) as total, AVG(percentage) as avg_pct
    FROM quiz_attempts WHERE student_id = ? AND status = 'completed'
  `).get(getStudentId());

  if (!stats.total || stats.total < 2) {
    return res.json({ insights: [] });
  }

  const insights = [];

  // Last 5 vs previous 5 trend
  const last5 = db.prepare(`SELECT AVG(percentage) as avg FROM quiz_attempts WHERE student_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 5`).get(getStudentId());
  const prev5 = db.prepare(`SELECT AVG(percentage) as avg FROM (SELECT percentage FROM quiz_attempts WHERE student_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 10) t LIMIT 5 OFFSET 5`).get(getStudentId());

  if (last5?.avg && prev5?.avg) {
    const diff = Math.round(last5.avg - prev5.avg);
    if (Math.abs(diff) >= 3) {
      insights.push(diff > 0
        ? `Your average score has improved by ${diff}% across your last 5 attempts. Keep it up!`
        : `Your recent performance has dipped by ${Math.abs(diff)}% compared to your previous attempts. A little more practice can help.`
      );
    }
  }

  // Best subject
  const bestSubject = db.prepare(`
    SELECT c.course_name, ROUND(AVG(qa.percentage),1) as avg
    FROM quiz_attempts qa JOIN courses c ON qa.subject_id = c.id
    WHERE qa.student_id = ? AND qa.status = 'completed'
    GROUP BY qa.subject_id ORDER BY avg DESC LIMIT 1
  `).get(getStudentId());
  if (bestSubject) insights.push(`Your strongest subject is ${bestSubject.course_name} with an average score of ${bestSubject.avg}%.`);

  // Weakest subject
  const weakSubject = db.prepare(`
    SELECT c.course_name, ROUND(AVG(qa.percentage),1) as avg
    FROM quiz_attempts qa JOIN courses c ON qa.subject_id = c.id
    WHERE qa.student_id = ? AND qa.status = 'completed'
    GROUP BY qa.subject_id HAVING COUNT(*) >= 1 ORDER BY avg ASC LIMIT 1
  `).get(getStudentId());
  if (weakSubject && bestSubject?.course_name !== weakSubject?.course_name) {
    if (weakSubject.avg < stats.avg_pct - 10) {
      insights.push(`Your performance in ${weakSubject.course_name} (${weakSubject.avg}%) is below your overall average. Consider practicing more questions from this subject.`);
    }
  }

  res.json({ insights });
}

// ─── POST /api/quizzes/:attemptId/retake ─────────────────────────────────────
function retakeQuiz(req, res) {
  const db = getDb();
  const { attemptId } = req.params;

  const original = db.prepare('SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ?').get(parseInt(attemptId), getStudentId());
  if (!original) return res.status(404).json({ error: 'Original attempt not found' });

  // Same settings, new random questions
  req.body = {
    subject_id: original.subject_id,
    difficulty: original.difficulty,
    total_questions: original.total_questions,
    quiz_mode: original.quiz_mode,
  };
  return startQuiz(req, res);
}

// ─── GET /api/quizzes/:attemptId/questions ───────────────────────────────────
// Returns the questions for an in-progress attempt WITHOUT correct answers
function getAttemptQuestions(req, res) {
  const db = getDb();
  const { attemptId } = req.params;

  const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ?').get(parseInt(attemptId), getStudentId());
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const rows = db.prepare(`
    SELECT qa.question_id, qa.selected_answer, qa.marked_for_review, qa.time_spent,
           qq.question, qq.option_a, qq.option_b, qq.option_c, qq.option_d,
           qq.topic, qq.difficulty, qq.subject_id
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qa.attempt_id = ?
    ORDER BY qa.id
  `).all(parseInt(attemptId));

  res.json({
    attempt_id: attempt.id,
    quiz_mode: attempt.quiz_mode,
    started_at: attempt.started_at,
    status: attempt.status,
    questions: rows.map(r => ({
      id: r.question_id,
      question: r.question,
      option_a: r.option_a,
      option_b: r.option_b,
      option_c: r.option_c,
      option_d: r.option_d,
      topic: r.topic,
      difficulty: r.difficulty,
      subject_id: r.subject_id,
    })),
    saved_answers: rows.reduce((acc, r) => {
      acc[r.question_id] = {
        selected: r.selected_answer || null,
        marked: r.marked_for_review === 1,
      };
      return acc;
    }, {}),
  });
}

module.exports = {
  getSubjects,
  getQuestions,
  startQuiz,
  saveAnswer,
  submitQuiz,
  getResult,
  getAnalysis,
  getAttemptQuestions,
  getHistory,
  getStatistics,
  getPerformance,
  getSubjectAnalysis,
  getTopicAnalysis,
  getInsights,
  retakeQuiz,
};
