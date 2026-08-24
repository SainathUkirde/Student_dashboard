import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, CheckCircle, XCircle, Clock, Target, BarChart2,
  RefreshCw, BookOpen, ChevronRight, Award
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
  if (!secs) return '0m 0s';
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [retaking, setRetaking] = React.useState(false);

  const fetchResult = React.useCallback(() => quizAPI.getResult(parseInt(attemptId)), [attemptId]);
  const { data: result, loading, error } = useFetch(fetchResult);

  const handleRetake = async () => {
    setRetaking(true);
    try {
      const r = await quizAPI.retakeQuiz(parseInt(attemptId));
      navigate(`/quiz/attempt/${r.attempt_id}`, { replace: true });
    } catch (e) {
      alert('Failed to create retake: ' + e.message);
    } finally {
      setRetaking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <p style={{ color: 'var(--danger-color)' }}>{error || 'Result not found'}</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/quiz')}>Back to Quiz</button>
      </div>
    );
  }

  const cls = getClassification(result.percentage);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (result.percentage / 100) * circumference;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Result Hero Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: '36px 24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 20, marginBottom: 20,
          background: cls.bg, color: cls.color, fontWeight: 700, fontSize: 13
        }}>
          <Award size={14} /> {cls.label}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>
          Quiz Completed!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
          {result.subject_name ? `Subject: ${result.subject_name}` : 'Mixed subjects'} &nbsp;·&nbsp;
          <span style={{ textTransform: 'capitalize' }}>{result.quiz_mode?.replace('_', ' ')}</span>
        </p>

        {/* Score Ring */}
        <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 24px' }}>
          <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={65} cy={65} r={48} fill="none" stroke="var(--bg-surface)" strokeWidth={10} />
            <circle
              cx={65} cy={65} r={48} fill="none"
              stroke={cls.color} strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: cls.color, lineHeight: 1 }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {result.score}/{result.total_questions}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: CheckCircle, label: 'Correct', value: result.correct_answers, color: 'var(--success-color)', bg: 'var(--success-bg)' },
            { icon: XCircle,     label: 'Incorrect', value: result.incorrect_answers, color: 'var(--danger-color)', bg: 'var(--danger-bg)' },
            { icon: Clock,       label: 'Time Taken', value: formatTime(result.time_taken), color: 'var(--text-secondary)', bg: 'var(--bg-surface)' },
          ].map(s => (
            <div key={s.label} style={{ padding: 14, background: s.bg, borderRadius: 'var(--radius-md)' }}>
              <s.icon size={18} color={s.color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Accuracy */}
        <div style={{
          padding: '12px 20px', background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)', marginBottom: 24, display: 'inline-flex', gap: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-primary)' }}>{result.accuracy}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ACCURACY</div>
          </div>
          <div style={{ width: 1, background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{result.unanswered}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>UNANSWERED</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate(`/quiz/analysis/${attemptId}`)}>
            <BookOpen size={15} /> View Analysis
          </button>
          <button className="btn btn-secondary" onClick={handleRetake} disabled={retaking}>
            <RefreshCw size={15} /> {retaking ? 'Creating…' : 'Retake Quiz'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
            Quiz Dashboard <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Quick topic breakdown (if available) */}
    </div>
  );
}

export default QuizResult;
