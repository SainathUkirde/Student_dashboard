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
  { to: '/courses', icon: BookOpen, label: 'Courses', color: '#4338ca', bg: '#eef2ff' },
  { to: '/attendance', icon: BarChart2, label: 'Attendance', color: '#0e7490', bg: '#ecfeff' },
  { to: '/results', icon: Award, label: 'Results', color: '#15803d', bg: '#f0fdf4' },
  { to: '/timetable', icon: Calendar, label: 'Timetable', color: '#b45309', bg: '#fffbeb' },
  { to: '/teachers', icon: Users, label: 'Teachers', color: '#7c3aed', bg: '#f5f3ff' },
  { to: '/student-details', icon: User, label: 'My Profile', color: '#be185d', bg: '#fdf2f8' },
];

const ATTENDANCE_COLORS = ['#4338ca', '#0e7490', '#15803d', '#b45309', '#7c3aed'];

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
      <div style={{
        backgroundImage: `linear-gradient(135deg, rgba(10, 16, 35, 0.58) 0%, rgba(25, 20, 65, 0.50) 45%, rgba(10, 16, 35, 0.62) 100%), url('/college.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 16,
        color: 'white',
        marginBottom: 24,
        padding: '26px 28px',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.14)'
      }}>
        {/* decorative circle */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, position: 'relative' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 20,
              padding: '3px 11px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 10
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
              MIT Academy of Engineering
            </div>
            <h2 style={{ fontSize: 25, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.025em', fontFamily: 'Manrope, Inter, sans-serif', lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
              {sLoad ? 'Welcome back' : `Welcome back, ${student?.name?.split(' ')[0] || 'Sainath'}!`}
            </h2>
            <p style={{ opacity: 0.95, fontSize: 13.5, textShadow: '0 1px 6px rgba(0,0,0,0.65)' }}>
              TY B.Tech Data Science &nbsp;·&nbsp; Division A1 &nbsp;·&nbsp; Semester 5
            </p>
            <p style={{ opacity: 0.85, fontSize: 12, marginTop: 4, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{today}</p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)', borderRadius: 14, padding: '14px 22px',
            textAlign: 'center', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontWeight: 800, fontSize: 32, lineHeight: 1, letterSpacing: '-0.04em', color: '#ffffff' }}>
              {rLoad ? '–' : resultSummary?.sgpa ?? '–'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Current SGPA</div>
          </div>
        </div>

        {/* Highlight footer bar in banner similar to MIT placement highlight */}
        <div style={{
          marginTop: 18,
          paddingTop: 13,
          borderTop: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 12.5,
          color: 'rgba(255, 255, 255, 0.92)'
        }}>
          <div>
            <strong style={{ color: '#fbbf24', fontSize: 13.5, fontWeight: 800 }}>503+</strong> Placement Offers &nbsp;•&nbsp; <strong style={{ color: '#fbbf24', fontSize: 13.5, fontWeight: 800 }}>450+</strong> Recruiting Companies
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.7 }}>
            Academic Year 2026–2027
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))', gap: 12 }}>
        {QUICK_LINKS.map(link => (
          <button
            key={link.to}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '18px 12px', cursor: 'pointer',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 14,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
              textDecoration: 'none',
            }}
            onClick={() => navigate(link.to)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = link.color + '50'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: link.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.18s ease',
            }}>
              <link.icon size={20} color={link.color} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Academic Info Row */}
      <div className="grid-3" style={{ marginTop: 22 }}>
        {[
          { label: 'Name', value: student?.name || 'Sainath Ukirde' },
          { label: 'PRN', value: student?.prn || '202401120011' },
          { label: 'Roll No.', value: student?.roll_no || '5' },
          { label: 'Branch', value: student?.branch || 'Data Science' },
          { label: 'Batch', value: student?.batch || 'A-1' },
          { label: 'Year', value: student?.year || '3rd Year' },
        ].map(info => (
          <div key={info.label} className="card" style={{ padding: '13px 16px' }}>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {info.label}
            </div>
            <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, letterSpacing: '-0.01em' }}>
              {sLoad ? <span className="skeleton" style={{ display: 'block', height: 16, width: '70%' }} /> : info.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
