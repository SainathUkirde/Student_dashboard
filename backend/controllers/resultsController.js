const { getDb } = require('../database/db');

const db = getDb();

function getStudentId() {
  const row = db.prepare('SELECT id FROM students ORDER BY id LIMIT 1').get();
  return row ? row.id : 1;
}

// GET /api/results
const getResults = (req, res) => {
  try {
    const studentId = getStudentId();
    const results = db.prepare(`
      SELECT r.*, c.course_name, c.abbreviation, c.course_code, c.course_type,
             t.name as teacher_name
      FROM results r
      JOIN courses c ON r.course_id = c.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE r.student_id = ?
      ORDER BY c.course_name
    `).all(studentId);

    res.json({ results, is_demo: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results', message: err.message });
  }
};

// GET /api/results/summary
const getResultsSummary = (req, res) => {
  try {
    const studentId = getStudentId();
    const results = db.prepare(`
      SELECT r.grade_point, r.credits
      FROM results r
      WHERE r.student_id = ?
    `).all(studentId);

    if (!results.length) {
      return res.json({ sgpa: 0, cgpa: 0, total_credits: 0, is_demo: true });
    }

    // SGPA = Σ(credit × grade_point) / Σcredits
    const sumWeighted = results.reduce((s, r) => s + r.credits * r.grade_point, 0);
    const sumCredits = results.reduce((s, r) => s + r.credits, 0);
    const sgpa = sumCredits > 0 ? Math.round((sumWeighted / sumCredits) * 100) / 100 : 0;

    const cgpaRow = db.prepare("SELECT value FROM settings WHERE key='cgpa'").get();
    const cgpa = cgpaRow ? parseFloat(cgpaRow.value) : 8.75;

    res.json({ sgpa, cgpa, total_credits: sumCredits, is_demo: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute results summary', message: err.message });
  }
};

// POST /api/results
const upsertResult = (req, res) => {
  try {
    const { course_id, grade, grade_point, credits, result_status } = req.body;
    if (!course_id || !grade || grade_point == null || !credits) {
      return res.status(400).json({ error: 'course_id, grade, grade_point and credits are required' });
    }

    const studentId = getStudentId();
    db.prepare(`
      INSERT INTO results (student_id, course_id, grade, grade_point, credits, result_status, semester, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, 5, 1)
      ON CONFLICT(student_id, course_id, semester) DO UPDATE SET
        grade = excluded.grade,
        grade_point = excluded.grade_point,
        credits = excluded.credits,
        result_status = excluded.result_status
    `).run(studentId, course_id, grade, grade_point, credits, result_status || 'Pass');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert result', message: err.message });
  }
};

module.exports = { getResults, getResultsSummary, upsertResult };
