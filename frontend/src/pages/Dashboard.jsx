import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, BarChart2, Award, User, Users, Calendar,
  GraduationCap, TrendingUp, Clock, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { SkeletonStatCard, SkeletonCard } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import useFetch from '../hooks/useFetch';
import { attendanceAPI, resultsAPI, studentAPI, coursesAPI } from '../services/api';

const QUICK_LINKS = [
  { to: '/courses', icon: BookOpen, label: 'Courses', color: '#4f46e5', bg: '#eef2ff' },
  { to: '/attendance', icon: BarChart2, label: 'Attendance', color: '#0891b2', bg: '#ecfeff' },
  { to: '/results', icon: Award, label: 'Results', color: '#16a34a', bg: '#f0fdf4' },
  { to: '/timetable', icon: Calendar, label: 'Timetable', color: '#d97706', bg: '#fffbeb' },
  { to: '/teachers', icon: Users, label: 'Teachers', color: '#7c3aed', bg: '#f5f3ff' },
  { to: '/student-details', icon: User, label: 'My Profile', color: '#e11d48', bg: '#fff1f2' },
];

const ATTENDANCE_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#7c3aed'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{d.course_name}</div>
        <div style={{ color: 'var(--text-secondary)' }}>Attendance: <strong>{d.attendance_percentage}%</strong></div>
        <div style={{ color: 'var(--text-muted)' }}>{d.classes_attended} / {d.total_classes} classes</div>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();

  const { data: student, loading: sLoad, error: sErr } = useFetch(studentAPI.get);
  const { data: summary, loading: aLoad, error: aErr, refetch: aRefetch } = useFetch(attendanceAPI.getSummary);
  const { data: resultSummary, loading: rLoad, error: rErr } = useFetch(resultsAPI.getSummary);
  const { data: courses, loading: cLoad } = useFetch(coursesAPI.getAll);
  const { data: attendance, loading: attLoad } = useFetch(attendanceAPI.getAll);

  const loading = sLoad || aLoad || rLoad || cLoad || attLoad;

  const getAttendanceStatus = (pct) => pct >= 75 ? 'good' : pct >= 65 ? 'warning' : 'critical';

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #0891b2 100%)',
        border: 'none', color: 'white', marginBottom: 24, padding: '24px 28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>
              Welcome back, {sLoad ? 'Student' : student?.name?.split(' ')[0] || 'Sainath'} 👋
            </h2>
            <p style={{ opacity: 0.85, fontSize: 14 }}>
              TY B.Tech Data Science &nbsp;•&nbsp; Division A1 &nbsp;•&nbsp; Semester 5
            </p>
            <p style={{ opacity: 0.6, fontSize: 12.5, marginTop: 4 }}>{today}</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 18px',
            textAlign: 'center', backdropFilter: 'blur(4px)'
          }}>
            <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1 }}>
              {rLoad ? '–' : resultSummary?.sgpa ?? '–'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>Current SGPA</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {aLoad ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={BarChart2}
              value={summary ? `${summary.overall_attendance}%` : '—'}
              label="Overall Attendance"
              color="indigo"
              subtitle={summary ? `${summary.total_attended}/${summary.total_classes} classes` : ''}
            />
            <StatCard
              icon={Star}
              value={rLoad ? '—' : resultSummary?.sgpa ?? '—'}
              label="SGPA (Sem 5)"
              color="purple"
              subtitle="Sample data"
            />
            <StatCard
              icon={TrendingUp}
              value={rLoad ? '—' : resultSummary?.cgpa ?? '—'}
              label="CGPA"
              color="emerald"
              subtitle="Cumulative"
            />
            <StatCard
              icon={BookOpen}
              value={cLoad ? '—' : courses?.length ?? '5'}
              label="Courses"
              color="cyan"
              subtitle="This semester"
            />
            <StatCard
              icon={GraduationCap}
              value="5"
              label="Semester"
              color="amber"
              subtitle="3rd Year"
            />
            <StatCard
              icon={Clock}
              value="2026–27"
              label="Academic Year"
              color="rose"
              subtitle="Current"
            />
          </>
        )}
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Attendance Chart */}
        <div className="card">
          <div className="section-title">Attendance Overview</div>
          {attLoad ? (
            <div className="skeleton skeleton-card" style={{ height: 200 }} />
          ) : attendance?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="abbreviation" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="attendance_percentage" radius={[5, 5, 0, 0]} maxBarSize={48}>
                  {attendance.map((_, i) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[i % ATTENDANCE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No attendance data</div>
          )}
        </div>

        {/* Quick Course Attendance */}
        <div className="card">
          <div className="section-title">Course-wise Attendance</div>
          {attLoad ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 8 }} />
              </div>
            ))
          ) : attendance?.map(a => (
            <div key={a.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {a.abbreviation}
                </span>
                <span style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: a.attendance_percentage >= 75 ? 'var(--success-color)'
                       : a.attendance_percentage >= 65 ? 'var(--warning-color)'
                       : 'var(--danger-color)'
                }}>
                  {a.attendance_percentage}%
                </span>
              </div>
              <ProgressBar value={a.attendance_percentage} status={getAttendanceStatus(a.attendance_percentage)} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="section-title">Quick Access</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {QUICK_LINKS.map(link => (
          <button
            key={link.to}
            className="card card-interactive"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '18px 12px', cursor: 'pointer', border: 'none', textDecoration: 'none',
              background: 'var(--bg-secondary)'
            }}
            onClick={() => navigate(link.to)}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: link.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <link.icon size={20} color={link.color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Academic Info Row */}
      <div className="grid-3" style={{ marginTop: 24 }}>
        {[
          { label: 'Name', value: student?.name || 'Sainath Ukirde' },
          { label: 'PRN', value: student?.prn || '202401120011' },
          { label: 'Roll No.', value: student?.roll_no || '5' },
          { label: 'Branch', value: student?.branch || 'Data Science' },
          { label: 'Batch', value: student?.batch || 'A-1' },
          { label: 'Year', value: student?.year || '3rd Year' },
        ].map(info => (
          <div key={info.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {info.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {sLoad ? <span className="skeleton" style={{ display: 'block', height: 16, width: '70%' }} /> : info.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
