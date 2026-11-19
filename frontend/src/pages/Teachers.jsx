import React from 'react';
import { Users, BookOpen, Linkedin } from 'lucide-react';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid, SkeletonCard } from '../components/LoadingSkeleton';
import TeacherAvatar from '../components/TeacherAvatar';
import useFetch from '../hooks/useFetch';
import { teachersAPI } from '../services/api';

const TEACHER_COLORS = [
  { bg: 'linear-gradient(135deg, #4338ca, #7c3aed)', color: '#4338ca', light: '#eef2ff' },
  { bg: 'linear-gradient(135deg, #0e7490, #06b6d4)', color: '#0e7490', light: '#ecfeff' },
  { bg: 'linear-gradient(135deg, #15803d, #4ade80)', color: '#15803d', light: '#f0fdf4' },
  { bg: 'linear-gradient(135deg, #b45309, #f59e0b)', color: '#b45309', light: '#fffbeb' },
  { bg: 'linear-gradient(135deg, #be185d, #f43f5e)', color: '#be185d', light: '#fdf2f8' },
];

function TeacherCard({ teacher, colorIdx }) {
  const tc = TEACHER_COLORS[colorIdx % TEACHER_COLORS.length];

  return (
    <div className="card card-interactive" style={{ textAlign: 'center', padding: '24px 18px' }}>
      {/* Avatar */}
      <div style={{ margin: '0 auto 14px', width: 68 }}>
        <TeacherAvatar
          name={teacher.name}
          photoUrl={teacher.photo_url || undefined}
          size={68}
          fontSize={20}
          gradient={tc.bg}
          borderColor={tc.light}
          boxShadow={`0 6px 20px ${tc.color}35`}
        />
      </div>

      {/* Name */}
      <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: 15.5, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
        {teacher.name}
      </div>

      {/* LinkedIn */}
      {teacher.linkedin_url && (
        <a
          href={teacher.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600, color: '#0a66c2',
            textDecoration: 'none', marginBottom: 6,
          }}
        >
          <Linkedin size={12} />
          LinkedIn
        </a>
      )}

      {/* Designation */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
        {teacher.designation}
        {teacher.department && <> &nbsp;·&nbsp; <span style={{ color: tc.color }}>{teacher.department}</span></>}
      </div>

      {/* Abbreviation badge */}
      <span style={{
        display: 'inline-block',
        padding: '3px 11px', borderRadius: 20,
        background: tc.light, color: tc.color,
        fontSize: 11.5, fontWeight: 800, marginBottom: 14,
        border: `1.5px solid ${tc.color}35`,
        letterSpacing: '0.03em',
      }}>
        {teacher.abbreviation}
      </span>

      {/* Courses taught */}
      <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: 12 }}>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Teaching
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {teacher.courses?.length ? teacher.courses.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 10px', borderRadius: 8,
              background: tc.light,
              fontSize: 12, fontWeight: 600, color: tc.color,
              border: `1px solid ${tc.color}20`,
            }}>
              <BookOpen size={11} color={tc.color} />
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

  const akTeacher = primaryTeachers.find(t => t.abbreviation === 'AK');

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
      {akTeacher && (
        <div className="card" style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
          border: '1.5px solid #c7d2fe',
          padding: '18px 22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <TeacherAvatar
              name={akTeacher.name}
              photoUrl={akTeacher.photo_url || undefined}
              size={52}
              fontSize={16}
              gradient="linear-gradient(135deg, #4338ca, #7c3aed)"
              borderColor="#eef2ff"
              boxShadow="0 4px 14px rgba(67,56,202,0.3)"
            />
            <div>
              <div style={{ fontFamily: 'Manrope, Inter, sans-serif', fontSize: 15.5, fontWeight: 800, color: '#4338ca', letterSpacing: '-0.01em' }}>Aparna Kulkarni</div>
              <div style={{ fontSize: 12.5, color: '#6366f1', marginTop: 3 }}>Class Coordinator — TY B.Tech Data Science Division A</div>
            </div>
            <span className="badge" style={{ background: '#4338ca', color: '#fff', marginLeft: 'auto', letterSpacing: '0.03em' }}>
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
                      <TeacherAvatar
                        name={t.name}
                        photoUrl={t.photo_url || undefined}
                        size={30}
                        fontSize={11}
                        gradient={TEACHER_COLORS[i % TEACHER_COLORS.length].bg}
                        borderColor={TEACHER_COLORS[i % TEACHER_COLORS.length].light}
                        boxShadow="none"
                      />
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
