import React from 'react';
import { Award, Star, TrendingUp, Info, AlertCircle } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import StatCard from '../components/StatCard';
import { SkeletonStatCard, SkeletonRow } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useFetch from '../hooks/useFetch';
import { resultsAPI } from '../services/api';

const GRADE_COLORS = {
  'A+': '#16a34a', 'A': '#4f46e5', 'B+': '#0891b2',
  'B': '#d97706', 'C': '#e11d48', 'F': '#dc2626'
};

function GradePill({ grade }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: '50%',
      background: `${GRADE_COLORS[grade] || '#718096'}20`,
      color: GRADE_COLORS[grade] || '#718096',
      fontWeight: 800, fontSize: 13
    }}>
      {grade}
    </span>
  );
}

function Results() {
  const { data: resultData, loading, error, refetch } = useFetch(resultsAPI.getAll);
  const { data: summary, loading: sumLoading } = useFetch(resultsAPI.getSummary);

  if (loading || sumLoading) return (
    <div>
      <div className="page-header"><div className="page-header-info"><h1>Results</h1><p>Loading...</p></div></div>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="card"><table className="data-table"><tbody>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </tbody></table></div>
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const results = resultData?.results || [];

  const radarData = results.map(r => ({
    course: r.abbreviation,
    grade_point: r.grade_point,
    full: 10
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Results</h1>
          <p>Semester 5 academic results — Academic Year 2026–27</p>
        </div>
      </div>

      {/* Demo Warning */}
      <div className="demo-banner">
        <AlertCircle size={15} />
        <span><strong>Sample / Demo Data</strong> — Results shown are for demonstration purposes and do not represent actual university results.</span>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={Star}
          value={summary?.sgpa ?? '–'}
          label="SGPA (Sem 5)"
          color="purple"
          subtitle="Sample value"
        />
        <StatCard
          icon={TrendingUp}
          value={summary?.cgpa ?? '–'}
          label="CGPA"
          color="indigo"
          subtitle="Cumulative"
        />
        <StatCard
          icon={Award}
          value={summary?.total_credits ?? '–'}
          label="Total Credits"
          color="cyan"
        />
        <StatCard
          icon={Info}
          value={results.filter(r => r.result_status === 'Pass').length}
          label="Courses Passed"
          color="emerald"
        />
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Results Table */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="section-title">Grade Sheet</div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Grade Point</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length ? results.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.course_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.course_code}</div>
                    </td>
                    <td><GradePill grade={r.grade} /></td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent-primary)' }}>
                        {r.grade_point.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> /10</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.credits}</td>
                    <td>
                      <span className={`badge ${r.result_status === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
                        {r.result_status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No results available</td></tr>
                )}
              </tbody>
              {results.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--bg-surface)' }}>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>SGPA</td>
                    <td colSpan={2}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--accent-primary)' }}>
                        {summary?.sgpa?.toFixed(2) ?? '–'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{summary?.total_credits}</td>
                    <td><span className="badge badge-success">Promoted</span></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <div className="section-title">Performance Radar</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="course" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Radar
                name="Grade Point"
                dataKey="grade_point"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
              <Tooltip
                formatter={(val) => [`${val}/10`, 'Grade Point']}
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {results.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{r.abbreviation}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${r.grade_point * 10}%`,
                    background: GRADE_COLORS[r.grade] || '#4f46e5',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', width: 28, textAlign: 'right' }}>
                  {r.grade_point.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SGPA/CGPA Card */}
      <div className="grid-2">
        {[
          { label: 'SGPA', value: summary?.sgpa, desc: 'Semester 5 Grade Point Average' },
          { label: 'CGPA', value: summary?.cgpa, desc: 'Cumulative Grade Point Average' },
        ].map(item => (
          <div key={item.label} className="card" style={{
            textAlign: 'center', padding: '24px 20px',
            background: 'linear-gradient(135deg, var(--accent-primary-light), var(--bg-secondary))'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {item.value?.toFixed(2) ?? '–'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{item.desc}</div>
            <div className="badge badge-warning" style={{ marginTop: 8 }}>Sample Data</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;
