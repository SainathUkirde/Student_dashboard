import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenSquare, TrendingUp, Target, Trophy, BookOpen, Zap, CheckCircle,
  BarChart2, Clock, ChevronRight, Plus, History, AlertCircle, Lightbulb
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import StatCard from '../../components/StatCard';
import { SkeletonStatCard } from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import useFetch from '../../hooks/useFetch';
import { quizAPI } from '../../services/api';
import QuizConfigModal from './QuizConfigModal';

// Performance classification helper
function getClassification(pct) {
  if (pct >= 90) return { label: 'Excellent', color: 'var(--success-color)', bg: 'var(--success-bg)' };
  if (pct >= 75) return { label: 'Strong', color: 'var(--info-color)', bg: 'var(--info-bg)' };
  if (pct >= 60) return { label: 'Developing', color: 'var(--warning-color)', bg: 'var(--warning-bg)' };
  return { label: 'Needs Improvement', color: 'var(--danger-color)', bg: 'var(--danger-bg)' };
}

function ScoreTrendTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Quiz #{d.index} — {d.subject_name || 'Mixed'}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>Score: <strong>{d.percentage}%</strong></div>
        <div style={{ color: 'var(--text-muted)' }}>Accuracy: {d.accuracy}%</div>
      </div>
    );
  }
  return null;
}

function QuizHome() {
  const navigate = useNavigate();
  const [showConfig, setShowConfig] = useState(false);

  const { data: stats, loading: sLoad, error: sErr, refetch: refetchStats } = useFetch(quizAPI.getStatistics);
  const { data: performance, loading: pLoad, refetch: refetchPerf } = useFetch(quizAPI.getPerformance);
  const { data: subjectAnalysis, loading: saLoad } = useFetch(quizAPI.getSubjectAnalysis);
  const { data: topicData } = useFetch(quizAPI.getTopicAnalysis);
  const { data: recentRaw, loading: hLoad } = useFetch(quizAPI.getHistoryFn);
  const { data: insightsData } = useFetch(quizAPI.getInsights);

  const refetchAll = useCallback(() => {
    refetchStats();
    refetchPerf();
  }, [refetchStats, refetchPerf]);

  const handleQuizStarted = useCallback((attemptId) => {
    setShowConfig(false);
    navigate(`/quiz/attempt/${attemptId}`);
  }, [navigate]);

  const recentHistory = (recentRaw || []).slice(0, 5);

  // Prepare trend data
  const trendData = (performance || []).map((p, i) => ({
    ...p,
    index: i + 1,
    percentage: Math.round(p.percentage),
    accuracy: Math.round(p.accuracy),
  }));

  // Topic analysis: strong vs weak
  const strongTopics = (topicData || []).filter(t => t.attempted > 0 && t.accuracy >= 75);
  const weakTopics = (topicData || []).filter(t => t.attempted > 0 && t.accuracy < 60);
  const devTopics = (topicData || []).filter(t => t.attempted > 0 && t.accuracy >= 60 && t.accuracy < 75);

  const noData = !sLoad && !sErr && (stats?.total_quizzes === 0);

  const formatTime = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PenSquare size={24} style={{ color: 'var(--accent-primary)' }} />
            Quiz &amp; Practice
          </h1>
          <p>Test your knowledge, practice important concepts, and track your academic progress.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/quiz/history')}>
            <History size={16} /> Quiz History
          </button>
          <button className="btn btn-primary" onClick={() => setShowConfig(true)}>
            <Plus size={16} /> Start New Quiz
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {sLoad ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : sErr ? (
          <div style={{ gridColumn: '1/-1' }}>
            <ErrorState message={sErr} onRetry={refetchStats} />
          </div>
        ) : (
          <>
            <StatCard icon={PenSquare}   value={stats?.total_quizzes ?? 0}      label="Total Quizzes"       color="indigo"  />
            <StatCard icon={TrendingUp}  value={`${stats?.avg_score ?? 0}%`}    label="Average Score"       color="cyan"    />
            <StatCard icon={Trophy}      value={`${stats?.best_score ?? 0}%`}   label="Best Score"          color="amber"   />
            <StatCard icon={BookOpen}    value={stats?.total_questions ?? 0}    label="Questions Attempted" color="purple"  />
            <StatCard icon={CheckCircle} value={stats?.total_correct ?? 0}      label="Correct Answers"     color="emerald" />
            <StatCard icon={Target}      value={`${stats?.avg_accuracy ?? 0}%`} label="Avg Accuracy"        color="rose"    />
          </>
        )}
      </div>

      {/* Empty state */}
      {noData && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <PenSquare size={32} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            No quiz attempts yet
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 20px', fontSize: 14 }}>
            Start your first quiz and your performance analytics will appear here.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowConfig(true)}>
            <Plus size={18} /> Start Your First Quiz
          </button>
        </div>
      )}

      {!noData && !sLoad && !sErr && (
        <>
          {/* Performance Trend + Insights */}
          <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
            {/* Score Trend */}
            <div className="card">
              <div className="section-title"><TrendingUp size={16} /> Score Progress</div>
              {pLoad ? (
                <div className="skeleton skeleton-card" style={{ height: 220 }} />
              ) : trendData.length < 2 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  Complete at least 2 quizzes to see your trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="index" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `Q${v}`} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                    <RechartsTooltip content={<ScoreTrendTooltip />} />
                    <ReferenceLine y={75} stroke="var(--success-color)" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line
                      type="monotone" dataKey="percentage"
                      stroke="var(--accent-primary)" strokeWidth={2.5}
                      dot={{ fill: 'var(--accent-primary)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Performance Insights */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="section-title"><Lightbulb size={16} /> Performance Insights</div>
              {insightsData?.insights?.length > 0 ? (
                insightsData.insights.map((insight, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', background: 'var(--accent-primary-light)',
                    borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)',
                    fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}>
                    <Zap size={14} style={{ color: 'var(--accent-primary)', marginRight: 6, verticalAlign: 'middle' }} />
                    {insight}
                  </div>
                ))
              ) : (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', textAlign: 'center', padding: '20px 0'
                }}>
                  <Lightbulb size={32} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                    Complete more quizzes to unlock detailed performance insights.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="section-title" style={{ marginBottom: 14 }}>
            <BarChart2 size={16} /> Subject Performance
          </div>
          <div className="grid-auto" style={{ marginBottom: 24 }}>
            {saLoad ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 140 }} />
              ))
            ) : (subjectAnalysis || []).map(sub => {
              const cls = sub.quizzes_attempted > 0 ? getClassification(sub.avg_score) : null;
              return (
                <div key={sub.subject_id} className="card card-interactive" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{sub.abbreviation}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub.course_name}</div>
                    </div>
                    {cls && (
                      <span className="badge" style={{ background: cls.bg, color: cls.color, borderColor: 'transparent', fontSize: 11 }}>
                        {cls.label}
                      </span>
                    )}
                  </div>
                  {sub.quizzes_attempted === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No quizzes yet</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                      {[
                        ['Quizzes', sub.quizzes_attempted],
                        ['Avg Score', `${sub.avg_score}%`],
                        ['Best Score', `${sub.best_score}%`],
                        ['Accuracy', `${sub.avg_accuracy}%`],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strong / Weak Areas */}
          {(topicData || []).some(t => t.attempted > 0) && (
            <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
              {/* Strong Areas */}
              <div className="card">
                <div className="section-title" style={{ color: 'var(--success-color)' }}>
                  <CheckCircle size={16} /> Strong Areas
                </div>
                {strongTopics.length === 0 && devTopics.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                    Complete more quizzes to identify strong areas (75%+ accuracy).
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {strongTopics.map(t => (
                      <div key={`${t.subject_id}-${t.topic}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: 'var(--success-bg)',
                        borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--success-color)'
                      }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          ✓ {t.topic} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>({t.abbreviation})</span>
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success-color)' }}>{t.accuracy}%</span>
                      </div>
                    ))}
                    {devTopics.map(t => (
                      <div key={`${t.subject_id}-${t.topic}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: 'var(--info-bg)',
                        borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--info-color)'
                      }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          ~ {t.topic} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>({t.abbreviation})</span>
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--info-color)' }}>{t.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weak Areas */}
              <div className="card">
                <div className="section-title" style={{ color: 'var(--warning-color)' }}>
                  <AlertCircle size={16} /> Areas to Improve
                </div>
                {weakTopics.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                    No weak areas identified yet. Keep taking quizzes!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {weakTopics.map(t => (
                      <div key={`${t.subject_id}-${t.topic}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: 'var(--warning-bg)',
                        borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--warning-color)'
                      }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          ⚠ {t.topic} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>({t.abbreviation})</span>
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning-color)' }}>{t.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Attempts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              <Clock size={16} /> Recent Quiz Attempts
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quiz/history')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {hLoad ? (
            <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          ) : recentHistory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13.5 }}>
              No completed quizzes yet.
            </div>
          ) : (
            <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Difficulty</th>
                      <th>Mode</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Time</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentHistory.map((h) => {
                      const cls = getClassification(h.percentage);
                      return (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{h.id}</td>
                          <td style={{ fontWeight: 600 }}>{h.subject_abbr || 'Mixed'}</td>
                          <td>
                            <span
                              className={`badge ${h.difficulty === 'hard' ? 'badge-danger' : h.difficulty === 'medium' ? 'badge-warning' : 'badge-info'}`}
                              style={{ textTransform: 'capitalize' }}
                            >
                              {h.difficulty}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize', fontSize: 13 }}>
                            {h.quiz_mode?.replace('_', ' ')}
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            {h.correct_answers}/{h.total_questions}
                            <span style={{ fontSize: 12, color: cls.color, marginLeft: 6 }}>({h.percentage}%)</span>
                          </td>
                          <td style={{ fontWeight: 600, color: cls.color }}>{h.accuracy}%</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatTime(h.time_taken)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(h.completed_at)}</td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/quiz/analysis/${h.id}`)}
                            >
                              Analysis
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quiz Config Modal */}
      {showConfig && (
        <QuizConfigModal
          onClose={() => setShowConfig(false)}
          onStart={handleQuizStarted}
        />
      )}
    </div>
  );
}

export default QuizHome;
