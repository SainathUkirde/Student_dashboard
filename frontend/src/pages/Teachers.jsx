import React from 'react';
import { Users, BookOpen } from 'lucide-react';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid, SkeletonCard } from '../components/LoadingSkeleton';
import useFetch from '../hooks/useFetch';
import { teachersAPI } from '../services/api';

const TEACHER_COLORS = [
  { bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#4f46e5', light: '#eef2ff' },
  { bg: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: '#0891b2', light: '#ecfeff' },
  { bg: 'linear-gradient(135deg, #16a34a, #4ade80)', color: '#16a34a', light: '#f0fdf4' },
  { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#d97706', light: '#fffbeb' },
  { bg: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#e11d48', light: '#fff1f2' },
];

function TeacherCard({ teacher, colorIdx }) {
  const tc = TEACHER_COLORS[colorIdx % TEACHER_COLORS.length];
  const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="card card-interactive" style={{ textAlign: 'center', padding: '24px 18px' }}>
      {/* Avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: tc.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
        fontSize: 22, fontWeight: 800, color: '#fff',
        boxShadow: `0 4px 14px ${tc.color}40`
      }}>
        {initials}
      </div>

      {/* Name */}
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        {teacher.name}
      </div>

      {/* Designation */}
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
        {teacher.designation} &nbsp;•&nbsp; {teacher.department}
      </div>

      {/* Abbreviation badge */}
      <span style={{
        display: 'inline-block',
        padding: '3px 10px', borderRadius: 20,
        background: tc.light, color: tc.color,
        fontSize: 12, fontWeight: 700, marginBottom: 14,
        border: `1px solid ${tc.color}30`
      }}>
        {teacher.abbreviation}
      </span>

      {/* Courses taught */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Teaching
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {teacher.courses?.length ? teacher.courses.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 8, background: 'var(--bg-surface)',
              fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)'
            }}>
              <BookOpen size={12} color={tc.color} />
              {c}
            </div>
          )) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No courses assigned</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard teachers (5 primary course teachers shown prominently)
const DASHBOARD_TEACHERS = [
  { abbr: 'AK', name: 'Aparna Kulkarni', course: 'Full Stack', role: 'Class Coordinator' },
  { abbr: 'RD', name: 'Ritu Dudhmal', course: 'Design and Analysis of Algorithms', role: '' },
  { abbr: 'PV', name: 'Pankaj Vishwakarma', course: 'Agentic AI Foundation', role: '' },
  { abbr: 'VW', name: 'Vaishali Wangikar', course: 'Deep Learning & LLM', role: '' },
  { abbr: 'SK', name: 'Sayali Kalbhor', course: 'MDM', role: '' },
];

function Teachers() {
  const { data: teachers, loading, error, refetch } = useFetch(teachersAPI.getAll);

  if (loading) return (
    <div>
      <div className="page-header"><div className="page-header-info"><h1>Course Teachers</h1><p>Loading faculty...</p></div></div>
      <SkeletonGrid count={5} card={<SkeletonCard lines={4} />} />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!teachers?.length) return <EmptyState title="No teachers found" />;

  // Find the 5 primary teachers based on abbreviations
  const primaryAbbrs = ['AK', 'RD', 'PV', 'VW', 'SK'];
  const primaryTeachers = primaryAbbrs
    .map(abbr => teachers.find(t => t.abbreviation === abbr))
    .filter(Boolean);

  const otherTeachers = teachers.filter(t => !primaryAbbrs.includes(t.abbreviation));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Course Teachers</h1>
          <p>Faculty for TY B.Tech Data Science — Division A, Semester 5</p>
        </div>
        <span className="badge badge-info" style={{ alignSelf: 'center' }}>
          <Users size={12} style={{ marginRight: 4 }} />
          {teachers.length} Faculty Members
        </span>
      </div>

      {/* Class Coordinator Spotlight */}
      {primaryTeachers.find(t => t.abbreviation === 'AK') && (
        <div className="card" style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
          border: '1px solid #c7d2fe',
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0
            }}>
              AK
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5' }}>Aparna Kulkarni</div>
              <div style={{ fontSize: 13, color: '#6366f1', marginTop: 2 }}>Class Coordinator — TY B.Tech Data Science Division A</div>
            </div>
            <span className="badge" style={{ background: '#4f46e5', color: '#fff', marginLeft: 'auto' }}>
              Class Coordinator
            </span>
          </div>
        </div>
      )}

      {/* Primary 5 Teachers Grid */}
      <div className="section-title">Subject Faculty</div>
      <div className="grid-auto" style={{ marginBottom: 24 }}>
        {primaryTeachers.map((teacher, idx) => (
          <TeacherCard key={teacher.id} teacher={teacher} colorIdx={idx} />
        ))}
      </div>

      {/* Other teachers if any */}
      {otherTeachers.length > 0 && (
        <>
          <div className="section-title">Other Faculty</div>
          <div className="grid-auto">
            {otherTeachers.map((teacher, idx) => (
              <TeacherCard key={teacher.id} teacher={teacher} colorIdx={idx + 5} />
            ))}
          </div>
        </>
      )}

      {/* Teacher–Course Map */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">Teacher–Course Map</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Abbreviation</th>
                <th>Course(s)</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {primaryTeachers.map((t, i) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: TEACHER_COLORS[i % TEACHER_COLORS.length].bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0
                      }}>
                        {t.abbreviation}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-accent">{t.abbreviation}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {t.courses?.join(', ') || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Teachers;
