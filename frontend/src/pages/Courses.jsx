import React, { useState } from 'react';
import { BookOpen, Code2, Brain, Layers, Cpu, Database, Info } from 'lucide-react';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { SkeletonGrid, SkeletonCard } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useFetch from '../hooks/useFetch';
import { coursesAPI } from '../services/api';

const COURSE_ICONS = {
  FS:   { icon: Code2,    bg: '#eef2ff', color: '#4338ca' },
  DAA:  { icon: Cpu,      bg: '#fdf2f8', color: '#be185d' },
  AgAI: { icon: Brain,    bg: '#f0fdf4', color: '#15803d' },
  DL:   { icon: Layers,   bg: '#ecfeff', color: '#0e7490' },
  MDM:  { icon: Database, bg: '#fffbeb', color: '#b45309' },
};

const DEFAULT_ICON = { icon: BookOpen, bg: '#f5f3ff', color: '#7c3aed' };

function CourseCard({ course, onViewDetails }) {
  const { icon: Icon, bg, color } = COURSE_ICONS[course.abbreviation] || DEFAULT_ICON;
  const pct = course.attendance_percentage ?? 0;
  const status = pct >= 75 ? 'good' : pct >= 65 ? 'warning' : 'critical';
  const statusColor = status === 'good' ? 'var(--success-color)' : status === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)';

  return (
    <div className="course-card">
      {/* top accent strip matching course color */}
      <div style={{ height: 3, background: color, borderRadius: '4px 4px 0 0', margin: '-20px -20px 0', marginBottom: 16, opacity: 0.7 }} />

      <div className="course-card-header">
        <div className="course-icon" style={{ background: bg, boxShadow: `0 2px 8px ${color}25` }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="course-name">{course.course_name}</div>
          <div className="course-teacher">{course.teacher_name}</div>
        </div>
        <span className="badge" style={{ background: bg, color, border: `1px solid ${color}30`, alignSelf: 'flex-start', fontSize: 10.5 }}>
          {course.abbreviation}
        </span>
      </div>

      {/* Type & Credits */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <span className="badge badge-info">{course.course_type}</span>
        <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
          {course.credits} cr
        </span>
      </div>

      {/* Attendance */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: statusColor, fontFamily: 'Manrope, Inter, sans-serif' }}>{pct}%</span>
        </div>
        <ProgressBar value={pct} status={status} height={7} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>{course.classes_attended ?? '–'} attended</span>
          <span>{course.total_classes ?? '–'} total</span>
        </div>
      </div>

      <button
        className="btn btn-outline btn-sm"
        style={{ width: '100%', marginTop: 'auto' }}
        onClick={() => onViewDetails(course)}
      >
        <Info size={13} /> View Details
      </button>
    </div>
  );
}

function CourseDetailModal({ course, onClose }) {
  const { icon: Icon, bg, color } = COURSE_ICONS[course.abbreviation] || DEFAULT_ICON;
  const pct = course.attendance_percentage ?? 0;
  const status = pct >= 75 ? 'good' : pct >= 65 ? 'warning' : 'critical';

  return (
    <Modal title="Course Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} color={color} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{course.course_name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {course.course_code} &nbsp;•&nbsp; {course.abbreviation}
          </p>
        </div>
      </div>

      {course.description && (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          {course.description}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Teacher', value: course.teacher_name },
          { label: 'Course Type', value: course.course_type },
          { label: 'Credits', value: course.credits },
          { label: 'Department', value: 'Computer Science' },
        ].map(item => (
          <div key={item.label} style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{item.value || '—'}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Attendance</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: status === 'good' ? 'var(--success-color)' : status === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)' }}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={pct} status={status} height={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Attended: {course.classes_attended ?? '–'}</span>
          <span>Total: {course.total_classes ?? '–'}</span>
          <span>Missed: {(course.total_classes ?? 0) - (course.classes_attended ?? 0)}</span>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function Courses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState('all');
  const { data: courses, loading, error, refetch } = useFetch(coursesAPI.getAll);

  if (loading) return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Courses</h1>
          <p>Loading enrolled courses...</p>
        </div>
      </div>
      <SkeletonGrid count={5} />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!courses?.length) return <EmptyState title="No courses found" description="No course data is available." />;

  const filtered = filter === 'all' ? courses
    : courses.filter(c => {
        const pct = c.attendance_percentage ?? 0;
        if (filter === 'good') return pct >= 75;
        if (filter === 'warning') return pct >= 65 && pct < 75;
        if (filter === 'critical') return pct < 65;
        return true;
      });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Courses</h1>
          <p>Enrolled courses for Semester 5, Academic Year 2026–27</p>
        </div>
        <div className="page-header-actions">
          {['all', 'good', 'warning', 'critical'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-auto">
        {filtered.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onViewDetails={setSelectedCourse}
          />
        ))}
      </div>

      {selectedCourse && (
        <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}

export default Courses;
