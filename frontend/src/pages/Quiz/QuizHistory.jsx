import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, RefreshCw, Search, Filter } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { quizAPI } from '../../services/api';

function getClassification(pct) {
  if (pct >= 90) return { label: 'Excellent', color: 'var(--success-color)' };
  if (pct >= 75) return { label: 'Strong', color: 'var(--info-color)' };
  if (pct >= 60) return { label: 'Developing', color: 'var(--warning-color)' };
  return { label: 'Needs Improvement', color: 'var(--danger-color)' };
}

function formatTime(secs) {
  if (!secs) return '—';
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function QuizHistory() {
  const navigate = useNavigate();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');

  const { data: allHistory, loading, error, refetch } = useFetch(quizAPI.getHistoryFn);
  const { data: subjectsRaw } = useFetch(quizAPI.getSubjects);
  const subjects = subjectsRaw || [];

  const history = (allHistory || []).filter(h => {
    if (subjectFilter !== 'all' && String(h.subject_id) !== subjectFilter) return false;
    if (diffFilter !== 'all' && h.difficulty !== diffFilter) return false;
    return true;
  });

  const [retaking, setRetaking] = useState(null);
  const handleRetake = async (id) => {
    setRetaking(id);
    try {
      const r = await quizAPI.retakeQuiz(id);
      navigate(`/quiz/attempt/${r.attempt_id}`);
    } catch (e) {
      alert('Retake failed: ' + e.message);
    } finally {
      setRetaking(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={22} color="var(--accent-primary)" /> Quiz History
          </h1>
          <p>All your previous quiz attempts with scores and analysis.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
            <ArrowLeft size={15} /> Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 140 }}
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.course_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 120 }}
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {(subjectFilter !== 'all' || diffFilter !== 'all') && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSubjectFilter('all'); setDiffFilter('all'); }}>
              Clear Filters
            </button>
          )}
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>
            {history.length} attempt{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--danger-color)' }}>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <History size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No quiz history found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            {allHistory?.length === 0
              ? 'You haven\'t completed any quizzes yet.'
              : 'No quizzes match the selected filters.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
            Go to Quiz Dashboard
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Subject</th>
                  <th>Difficulty</th>
                  <th>Mode</th>
                  <th>Questions</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const cls = getClassification(h.percentage);
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        Quiz #{h.id}
                      </td>
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {h.subject_abbr || 'Mixed'}
                        {h.subject_name && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{h.subject_name}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${h.difficulty === 'hard' ? 'badge-danger' : h.difficulty === 'medium' ? 'badge-warning' : 'badge-info'}`}
                          style={{ textTransform: 'capitalize' }}>{h.difficulty}</span>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {h.quiz_mode?.replace('_', ' ')}
                      </td>
                      <td style={{ textAlign: 'center' }}>{h.total_questions}</td>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {h.correct_answers}/{h.total_questions}
                        <div style={{ fontSize: 12, color: cls.color, fontWeight: 700 }}>{h.percentage}%</div>
                      </td>
                      <td style={{ fontWeight: 600, color: cls.color }}>{h.accuracy}%</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{formatTime(h.time_taken)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(h.completed_at)}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          color: cls.color, background: 'var(--bg-surface)'
                        }}>{cls.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/quiz/analysis/${h.id}`)}
                          >
                            Analysis
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRetake(h.id)}
                            disabled={retaking === h.id}
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizHistory;
