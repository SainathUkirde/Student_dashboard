import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Minus, ArrowLeft, RefreshCw,
  BookOpen, Clock, Target, PenSquare, ChevronRight
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { quizAPI } from '../../services/api';

function getClassification(pct) {
  if (pct >= 90) return { label: 'Excellent', color: 'var(--success-color)', bg: 'var(--success-bg)' };
  if (pct >= 75) return { label: 'Strong', color: 'var(--info-color)', bg: 'var(--info-bg)' };
  if (pct >= 60) return { label: 'Developing', color: 'var(--warning-color)', bg: 'var(--warning-bg)' };
  return { label: 'Needs Improvement', color: 'var(--danger-color)', bg: 'var(--danger-bg)' };
}

function formatTime(secs) {
  if (!secs) return '—';
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function QuizAnalysis() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [retaking, setRetaking] = React.useState(false);

  const fetchAnalysis = React.useCallback(() => quizAPI.getAnalysis(parseInt(attemptId)), [attemptId]);
  const { data, loading, error } = useFetch(fetchAnalysis);

  const handleRetake = async () => {
    setRetaking(true);
    try {
      const r = await quizAPI.retakeQuiz(parseInt(attemptId));
      navigate(`/quiz/attempt/${r.attempt_id}`, { replace: true });
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setRetaking(false);
    }
  };

  if (loading) {
    return (
      <div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 14, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: 'var(--danger-color)', marginBottom: 16 }}>{error || 'Analysis not found'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>Back to Quiz</button>
      </div>
    );
  }

  const { attempt, answers } = data;
  const cls = getClassification(attempt.percentage);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={22} color="var(--accent-primary)" />
            Test Analysis — Quiz #{attempt.id}
          </h1>
          <p>{attempt.subject_name || 'Mixed'} · {attempt.quiz_mode?.replace('_', ' ')} · {formatDate(attempt.completed_at)}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/quiz/result/${attemptId}`)}>
            <PenSquare size={15} /> Result
          </button>
          <button className="btn btn-outline" onClick={handleRetake} disabled={retaking}>
            <RefreshCw size={15} /> {retaking ? '…' : 'Retake'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Score', val: `${attempt.score}/${attempt.total_questions}`, sub: `${attempt.percentage}%`, color: cls.color, bg: cls.bg },
          { label: 'Correct', val: attempt.correct_answers, sub: 'answers', color: 'var(--success-color)', bg: 'var(--success-bg)' },
          { label: 'Incorrect', val: attempt.incorrect_answers, sub: 'answers', color: 'var(--danger-color)', bg: 'var(--danger-bg)' },
          { label: 'Unanswered', val: attempt.unanswered, sub: 'questions', color: 'var(--text-muted)', bg: 'var(--bg-surface)' },
          { label: 'Accuracy', val: `${attempt.accuracy}%`, sub: 'of attempted', color: 'var(--info-color)', bg: 'var(--info-bg)' },
          { label: 'Time Taken', val: formatTime(attempt.time_taken), sub: attempt.difficulty, color: 'var(--warning-color)', bg: 'var(--warning-bg)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border: 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: s.color, opacity: 0.85 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Q&A Review */}
      <div className="section-title">
        <BookOpen size={16} /> Question-by-Question Review
      </div>

      {answers.map((a, idx) => {
        const isCorrect = a.is_correct === 1;
        const isUnanswered = !a.selected_answer;
        const statusColor = isCorrect ? 'var(--success-color)' : isUnanswered ? 'var(--text-muted)' : 'var(--danger-color)';
        const statusBg = isCorrect ? 'var(--success-bg)' : isUnanswered ? 'var(--bg-surface)' : 'var(--danger-bg)';

        const options = [
          ['A', a.option_a],
          ['B', a.option_b],
          ['C', a.option_c],
          ['D', a.option_d],
        ];

        return (
          <div
            key={a.id}
            className="card"
            style={{
              marginBottom: 14,
              borderLeft: `4px solid ${statusColor}`,
            }}
          >
            {/* Question header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)'
                }}>Q{idx + 1}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.topic}</span>
                <span className={`badge ${a.difficulty === 'hard' ? 'badge-danger' : a.difficulty === 'medium' ? 'badge-warning' : 'badge-info'}`}
                  style={{ textTransform: 'capitalize', fontSize: 10 }}>{a.difficulty}</span>
                {a.marked_for_review === 1 && (
                  <span className="badge badge-warning" style={{ fontSize: 10 }}>Marked</span>
                )}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20,
                background: statusBg, color: statusColor, fontWeight: 700, fontSize: 12
              }}>
                {isUnanswered
                  ? <><Minus size={12} /> Unanswered</>
                  : isCorrect
                    ? <><CheckCircle size={12} /> Correct</>
                    : <><XCircle size={12} /> Incorrect</>
                }
              </div>
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.6 }}>
              {a.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {options.map(([letter, text]) => {
                const isSelected = a.selected_answer === letter;
                const isCorrectOpt = a.correct_answer === letter;
                let bg = 'var(--bg-surface)';
                let border = '1px solid var(--border-color)';
                let color = 'var(--text-secondary)';
                let fontWeight = 400;

                if (isCorrectOpt) {
                  bg = 'var(--success-bg)'; border = '1.5px solid var(--success-color)';
                  color = 'var(--success-color)'; fontWeight = 700;
                } else if (isSelected && !isCorrectOpt) {
                  bg = 'var(--danger-bg)'; border = '1.5px solid var(--danger-color)';
                  color = 'var(--danger-color)'; fontWeight = 700;
                }

                return (
                  <div key={letter} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                    background: bg, border, color, fontWeight, fontSize: 13.5,
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isCorrectOpt ? 'var(--success-color)' : isSelected ? 'var(--danger-color)' : 'var(--border-color)',
                      color: (isCorrectOpt || isSelected) ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: 11, flexShrink: 0,
                    }}>{letter}</span>
                    <span>{text}</span>
                    {isCorrectOpt && <CheckCircle size={14} color="var(--success-color)" style={{ marginLeft: 'auto' }} />}
                    {isSelected && !isCorrectOpt && <XCircle size={14} color="var(--danger-color)" style={{ marginLeft: 'auto' }} />}
                  </div>
                );
              })}
            </div>

            {/* Your answer / correct answer summary */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{
                padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12.5,
                background: isUnanswered ? 'var(--bg-surface)' : isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: isUnanswered ? 'var(--text-muted)' : isCorrect ? 'var(--success-color)' : 'var(--danger-color)',
                fontWeight: 600,
              }}>
                Your Answer: {isUnanswered ? 'Not Answered'
                  : `${a.selected_answer} — ${options.find(o => o[0] === a.selected_answer)?.[1] || ''}`}
              </div>
              <div style={{
                padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12.5,
                background: 'var(--success-bg)', color: 'var(--success-color)', fontWeight: 600,
              }}>
                Correct Answer: {a.correct_answer} — {options.find(o => o[0] === a.correct_answer)?.[1] || ''}
              </div>
            </div>

            {/* Explanation */}
            {a.explanation && (
              <div style={{
                padding: '10px 14px', background: 'var(--accent-primary-light)',
                borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Explanation: </strong>
                {a.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <button className="btn btn-outline" onClick={handleRetake} disabled={retaking}>
          <RefreshCw size={15} /> {retaking ? 'Creating…' : 'Retake Quiz'}
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/quiz/history')}>
          Quiz History <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default QuizAnalysis;
