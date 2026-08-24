import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { SkeletonStatCard, SkeletonCard } from '../components/LoadingSkeleton';
import useFetch from '../hooks/useFetch';
import { attendanceAPI } from '../services/api';

const COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#7c3aed'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 14px', fontSize: 13
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{d.course_name}</div>
        <div style={{ color: 'var(--text-secondary)' }}>Attendance: <strong>{d.attendance_percentage}%</strong></div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Attended: {d.classes_attended} / {d.total_classes}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Missed: {d.classes_missed}
        </div>
      </div>
    );
  }
  return null;
};

function StatusBadge({ status }) {
  if (status === 'good')
    return <span className="badge badge-success"><CheckCircle size={11} style={{ marginRight: 3 }} />Good</span>;
  if (status === 'warning')
    return <span className="badge badge-warning"><AlertTriangle size={11} style={{ marginRight: 3 }} />Warning</span>;
  return <span className="badge badge-danger"><XCircle size={11} style={{ marginRight: 3 }} />Critical</span>;
}

function Attendance() {
  const { data: attendance, loading, error, refetch } = useFetch(attendanceAPI.getAll);
  const { data: summary, loading: sumLoading } = useFetch(attendanceAPI.getSummary);

  if (loading || sumLoading) return (
    <div>
      <div className="page-header"><div className="page-header-info"><h1>Attendance</h1><p>Loading...</p></div></div>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonCard />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!attendance?.length) return <EmptyState title="No attendance records" description="No attendance data is available yet." />;

  const threshold = attendance[0]?.threshold ?? 75;
  const overall = summary?.overall_attendance ?? 0;

  const goodCount = attendance.filter(a => a.status === 'good').length;
  const warningCount = attendance.filter(a => a.status === 'warning').length;
  const criticalCount = attendance.filter(a => a.status === 'critical').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Attendance</h1>
          <p>Course-wise attendance tracking for Semester 5 • Threshold: {threshold}%</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          icon={BarChart2}
          value={`${overall}%`}
          label="Overall Attendance"
          color="indigo"
          subtitle={`${summary?.total_attended}/${summary?.total_classes} classes`}
        />
        <StatCard
          icon={CheckCircle}
          value={goodCount}
          label="Courses Above Threshold"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          value={warningCount}
          label="Courses Needing Attention"
          color="amber"
        />
        <StatCard
          icon={XCircle}
          value={criticalCount}
          label="Critical Courses"
          color="rose"
        />
      </div>

      {/* Total Attendance Banner */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Attendance
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: overall >= threshold ? 'var(--success-color)' : overall >= 65 ? 'var(--warning-color)' : 'var(--danger-color)', letterSpacing: '-0.03em' }}>
              {overall}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Classes: {summary?.total_classes}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attended: {summary?.total_attended}</div>
            <div style={{ fontSize: 12, color: 'var(--danger-color)' }}>Missed: {summary?.total_missed}</div>
          </div>
        </div>
        <ProgressBar value={overall} status={overall >= threshold ? 'good' : overall >= 65 ? 'warning' : 'critical'} height={12} />
        {overall < threshold && (
          <div className="alert alert-warning" style={{ marginTop: 12, marginBottom: 0 }}>
            <AlertTriangle size={15} />
            Your overall attendance is below the required {threshold}% threshold. Attend classes to improve.
          </div>
        )}
      </div>

      {/* Course-Wise Details */}
      <div className="section-title">Course-wise Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {attendance.map((a, idx) => (
          <div key={a.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{a.course_name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.teacher_name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={a.status} />
                <span style={{
                  fontSize: 20, fontWeight: 800,
                  color: a.status === 'good' ? 'var(--success-color)' : a.status === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)'
                }}>
                  {a.attendance_percentage}%
                </span>
              </div>
            </div>

            <ProgressBar value={a.attendance_percentage} status={a.status} height={10} />

            <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Classes', value: a.total_classes, color: 'var(--text-primary)' },
                { label: 'Attended', value: a.classes_attended, color: 'var(--success-color)' },
                { label: 'Missed', value: a.classes_missed, color: 'var(--danger-color)' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: item.color, marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
              <div style={{ flex: 1, minWidth: 80 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To reach {threshold}%</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {a.attendance_percentage >= threshold
                    ? '✓ OK'
                    : `${Math.max(0, Math.ceil((threshold * a.total_classes / 100) - a.classes_attended))} more`
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart Visualization */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>Attendance Chart</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={attendance} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="abbreviation" tick={{ fontSize: 11.5, fill: 'var(--text-muted)' }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={threshold} stroke="var(--warning-color)" strokeDasharray="5 3"
              label={{ value: `${threshold}% Threshold`, fill: 'var(--warning-color)', fontSize: 11 }} />
            <Bar dataKey="attendance_percentage" radius={[6, 6, 0, 0]} maxBarSize={56} name="Attendance">
              {attendance.map((a, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Attendance;
