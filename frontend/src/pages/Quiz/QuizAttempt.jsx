import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Flag, ChevronLeft, ChevronRight, Send, AlertTriangle, X } from 'lucide-react';
import { quizAPI } from '../../services/api';

// ── Timer display ─────────────────────────────────────────────────────────────
function TimerDisplay({ seconds, warning }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 'var(--radius-md)',
      background: warning ? 'var(--danger-bg)' : 'var(--bg-surface)',
      border: `1px solid ${warning ? 'var(--danger-border)' : 'var(--border-color)'}`,
      color: warning ? 'var(--danger-color)' : 'var(--text-secondary)',
      fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)',
      animation: warning ? 'pulse 1s infinite' : 'none',
    }}>
      <Clock size={16} />
      {mm}:{ss}
    </div>
  );
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({ letter, text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
        padding: '14px 18px', marginBottom: 10, textAlign: 'left',
        borderRadius: 'var(--radius-md)', cursor: 'pointer',
        border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
        background: selected ? 'var(--accent-primary-light)' : 'var(--bg-secondary)',
        color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontWeight: selected ? 600 : 400,
        fontSize: 14.5, transition: 'all 0.15s ease',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 12,
        background: selected ? 'var(--accent-primary)' : 'var(--bg-surface)',
        color: selected ? '#fff' : 'var(--text-muted)',
        border: selected ? 'none' : '1px solid var(--border-color)',
      }}>{letter}</span>
      <span style={{ lineHeight: 1.5, paddingTop: 4 }}>{text}</span>
    </button>
  );
}

// ── Submit Confirm Dialog ─────────────────────────────────────────────────────
function SubmitConfirmDialog({ questions, answers, onConfirm, onCancel, submitting }) {
  const attempted = Object.values(answers).filter(a => a && a.selected).length;
  const marked = Object.values(answers).filter(a => a && a.marked).length;
  const total = questions.length;
  const unattempted = total - attempted;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">Submit Quiz?</h2>
          <button className="modal-close" onClick={onCancel}><X size={16} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
          Are you sure you want to submit? You won't be able to change your answers after submission.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            ['Total Questions', total, 'var(--text-primary)', 'var(--bg-surface)'],
            ['Attempted', attempted, 'var(--success-color)', 'var(--success-bg)'],
            ['Unattempted', unattempted, unattempted > 0 ? 'var(--warning-color)' : 'var(--text-muted)', unattempted > 0 ? 'var(--warning-bg)' : 'var(--bg-surface)'],
            ['Marked for Review', marked, 'var(--info-color)', 'var(--info-bg)'],
          ].map(([label, val, color, bg]) => (
            <div key={label} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: bg }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Submitting…' : <><Send size={15} /> Submit Quiz</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Quiz Attempt Page ────────────────────────────────────────────────────
function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizMode, setQuizMode] = useState('practice');

  // Timer
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const submittedRef = useRef(false);

  // Modals
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // Load quiz using the safe questions endpoint
  useEffect(() => {
    let cancelled = false;

    async function loadAttempt() {
      try {
        // Use the dedicated questions endpoint (no correct answers leaked)
        const data = await quizAPI.getAttemptQuestions(parseInt(attemptId));

        if (cancelled) return;

        if (data.status !== 'in_progress') {
          navigate(`/quiz/result/${attemptId}`, { replace: true });
          return;
        }

        setQuestions(data.questions);
        setAnswers(data.saved_answers || {});
        setQuizMode(data.quiz_mode);

        // Set timer for timed modes
        if (data.quiz_mode === 'timed_test' || data.quiz_mode === 'mock_test') {
          const startedAt = new Date(data.started_at).getTime();
          startedAtRef.current = startedAt;
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          const totalTime = data.questions.length * 120; // 2 min per question
          const remaining = Math.max(0, totalTime - elapsed);
          setTimeLeft(remaining);
          if (remaining > 0) setTimerRunning(true);
        } else {
          startedAtRef.current = new Date(data.started_at).getTime();
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load quiz');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAttempt();
    return () => { cancelled = true; };
  }, [attemptId, navigate]);

  // Submit handler (stable ref to avoid stale closure in timer)
  const doSubmitRef = useRef(null);
  doSubmitRef.current = async (timeTaken) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await quizAPI.submitQuiz(parseInt(attemptId), { time_taken: timeTaken });
      navigate(`/quiz/result/${attemptId}`, { replace: true });
    } catch (err) {
      submittedRef.current = false;
      setError(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!timerRunning || timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerRunning(false);
          // Auto-submit using ref to avoid stale closure
          const timeTaken = startedAtRef.current
            ? Math.floor((Date.now() - startedAtRef.current) / 1000)
            : 0;
          doSubmitRef.current(timeTaken);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Show warning at 60s remaining
  useEffect(() => {
    if (timeLeft === 60 && !warningShown) {
      setWarningShown(true);
    }
  }, [timeLeft, warningShown]);

  const handleSubmit = async () => {
    setShowSubmit(false);
    const timeTaken = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : timeLeft !== null
        ? (questions.length * 120 - timeLeft)
        : 0;
    await doSubmitRef.current(timeTaken);
  };

  const saveAnswerToServer = useCallback(async (qId, selected, marked) => {
    try {
      await quizAPI.saveAnswer(parseInt(attemptId), {
        question_id: qId,
        selected_answer: selected,
        marked_for_review: marked ? 1 : 0,
        time_spent: 0,
      });
    } catch (_) { /* silent — answer is saved in state */ }
  }, [attemptId]);

  const selectOption = useCallback((qId, letter) => {
    setAnswers(prev => {
      const updated = { ...prev, [qId]: { ...(prev[qId] || {}), selected: letter } };
      saveAnswerToServer(qId, letter, prev[qId]?.marked || false);
      return updated;
    });
  }, [saveAnswerToServer]);

  const toggleMark = useCallback((qId) => {
    setAnswers(prev => {
      const current = prev[qId] || {};
      const marked = !current.marked;
      saveAnswerToServer(qId, current.selected || null, marked);
      return { ...prev, [qId]: { ...current, marked } };
    });
  }, [saveAnswerToServer]);

  const q = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px' }} />
          <p>Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <AlertTriangle size={40} color="var(--danger-color)" style={{ margin: '0 auto 12px', display: 'block' }} />
        <h3 style={{ color: 'var(--danger-color)', marginBottom: 8 }}>Error Loading Quiz</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>Back to Quiz</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No questions found for this attempt.</p>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>Back to Quiz</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Question {currentIdx + 1} of {questions.length}
            </div>
            {q && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Topic: {q.topic} &nbsp;·&nbsp;
                <span style={{ textTransform: 'capitalize' }}>{q.difficulty}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {timeLeft !== null && (
              <TimerDisplay seconds={timeLeft} warning={timeLeft < 60} />
            )}
            <button className="btn btn-danger btn-sm" onClick={() => setShowSubmit(true)}>
              <Send size={14} /> Submit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12 }}>
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill good"
              style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      {warningShown && timeLeft !== null && timeLeft < 60 && timeLeft > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <strong>Less than 1 minute remaining!</strong> Submit your quiz soon.
        </div>
      )}

      {/* Error banner (non-fatal) */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Question Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {q && (
            <div className="card" style={{ marginBottom: 14 }}>
              <p style={{
                fontSize: 17, fontWeight: 600, color: 'var(--text-primary)',
                lineHeight: 1.6, marginBottom: 24
              }}>
                {q.question}
              </p>
              {[
                ['A', q.option_a],
                ['B', q.option_b],
                ['C', q.option_c],
                ['D', q.option_d],
              ].map(([letter, text]) => (
                <OptionBtn
                  key={letter}
                  letter={letter}
                  text={text}
                  selected={answers[q.id]?.selected === letter}
                  onClick={() => selectOption(q.id, letter)}
                />
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <button
              className="btn btn-secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(i => i - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn btn-sm ${answers[q?.id]?.marked ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => q && toggleMark(q.id)}
              >
                <Flag size={14} />
                {answers[q?.id]?.marked ? 'Unmark' : 'Mark for Review'}
              </button>
            </div>
            {currentIdx < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrentIdx(i => i + 1)}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>
                <Send size={16} /> Finish
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="card" style={{ width: 180, flexShrink: 0, padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text-primary)' }}>
            Navigator
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {questions.map((qq, idx) => {
              const ans = answers[qq.id];
              const isCurrentQ = idx === currentIdx;
              const isAnswered = ans?.selected;
              const isMarked = ans?.marked;

              let bg = 'var(--bg-surface)';
              let color = 'var(--text-muted)';
              let border = '1px solid var(--border-color)';

              if (isCurrentQ) {
                bg = 'var(--accent-primary)'; color = '#fff'; border = 'none';
              } else if (isMarked) {
                bg = 'var(--warning-bg)'; color = 'var(--warning-color)'; border = '1px solid var(--warning-border)';
              } else if (isAnswered) {
                bg = 'var(--success-bg)'; color = 'var(--success-color)'; border = '1px solid var(--success-border)';
              }

              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)',
                    border, background: bg, color,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['var(--accent-primary)', '#fff', 'Current'],
              ['var(--success-bg)', 'var(--success-color)', 'Answered'],
              ['var(--warning-bg)', 'var(--warning-color)', 'Review'],
              ['var(--bg-surface)', 'var(--text-muted)', 'Not Attempted'],
            ].map(([bg, color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1px solid ${color}`, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit confirm dialog */}
      {showSubmit && (
        <SubmitConfirmDialog
          questions={questions}
          answers={answers}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmit(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default QuizAttempt;
