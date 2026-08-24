import React, { useState, useContext } from 'react';
import { User, Edit2, Save, X, MapPin, Hash, Building, Calendar, Phone, Mail } from 'lucide-react';
import Modal from '../components/Modal';
import { SkeletonCard } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import useFetch from '../hooks/useFetch';
import { studentAPI } from '../services/api';
import { ToastCtx } from '../layouts/Layout';

const FIELD_ICONS = {
  name: User, prn: Hash, roll_no: Hash,
  batch: Building, branch: Building, year: Calendar,
  address: MapPin, email: Mail, phone: Phone
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: 'var(--accent-primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
      }}>
        <Icon size={14} color="var(--accent-primary)" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function EditProfileModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({ ...student });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (!form.prn?.trim()) e.prn = 'PRN is required';
    if (!form.branch?.trim()) e.branch = 'Branch is required';
    if (!form.year?.trim()) e.year = 'Year is required';
    if (form.roll_no && isNaN(Number(form.roll_no))) e.roll_no = 'Roll number must be numeric';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Edit Profile" onClose={onClose} size="lg">
      {errors._global && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>{errors._global}</div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid-2">
          {[
            { key: 'name', label: 'Full Name', type: 'text', required: true },
            { key: 'prn', label: 'PRN', type: 'text', required: true },
            { key: 'roll_no', label: 'Roll Number', type: 'number', required: false },
            { key: 'batch', label: 'Batch', type: 'text', required: false },
            { key: 'branch', label: 'Branch', type: 'text', required: true },
            { key: 'year', label: 'Year', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: false },
            { key: 'phone', label: 'Phone', type: 'tel', required: false },
          ].map(f => (
            <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={`edit-${f.key}`}>
                {f.label}{f.required && <span style={{ color: 'var(--danger-color)' }}> *</span>}
              </label>
              <input
                id={`edit-${f.key}`}
                className={`form-input ${errors[f.key] ? 'error' : ''}`}
                type={f.type}
                value={form[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                aria-describedby={errors[f.key] ? `${f.key}-error` : undefined}
              />
              {errors[f.key] && (
                <div className="form-error" id={`${f.key}-error`}>{errors[f.key]}</div>
              )}
            </div>
          ))}
        </div>
        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="edit-address">Address</label>
          <textarea
            id="edit-address"
            className="form-textarea"
            value={form.address || ''}
            onChange={e => set('address', e.target.value)}
            rows={3}
          />
        </div>
        <div className="modal-footer" style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StudentDetails() {
  const [editOpen, setEditOpen] = useState(false);
  const { data: student, loading, error, refetch } = useFetch(studentAPI.get);
  const toast = useContext(ToastCtx);

  const handleSave = async (formData) => {
    await studentAPI.update(student.id, formData);
    toast?.success('Profile updated successfully!');
    refetch();
  };

  if (loading) return (
    <div>
      <div className="page-header"><div className="page-header-info"><h1>Student Details</h1></div></div>
      <div className="grid-2"><SkeletonCard lines={6} /><SkeletonCard lines={4} /></div>
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const initials = student?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SU';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Student Details</h1>
          <p>Personal and academic information</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setEditOpen(true)}>
            <Edit2 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Profile Card */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 16px rgba(79,70,229,0.3)'
            }}>
              {initials}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {student?.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Roll No. {student?.roll_no}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="badge badge-accent" style={{ justifyContent: 'center' }}>
                {student?.branch}
              </span>
              <span className="badge badge-info" style={{ justifyContent: 'center' }}>
                {student?.year}
              </span>
              <span className="badge badge-success" style={{ justifyContent: 'center' }}>
                Batch {student?.batch}
              </span>
            </div>
          </div>

          {/* Academic Quick Info */}
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
              Academic Info
            </div>
            {[
              { label: 'Semester', value: '5' },
              { label: 'Academic Year', value: '2026–2027' },
              { label: 'Division', value: 'A' },
              { label: 'Class Coordinator', value: 'Aparna Kulkarni' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Personal Information</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
              <Edit2 size={12} /> Edit
            </button>
          </div>

          <InfoRow icon={User}     label="Full Name"   value={student?.name} />
          <InfoRow icon={Hash}     label="PRN"         value={student?.prn} />
          <InfoRow icon={Hash}     label="Roll Number" value={student?.roll_no} />
          <InfoRow icon={Building} label="Batch"       value={student?.batch} />
          <InfoRow icon={Building} label="Branch"      value={student?.branch} />
          <InfoRow icon={Calendar} label="Year"        value={student?.year} />
          {student?.email && <InfoRow icon={Mail}  label="Email"   value={student.email} />}
          {student?.phone && <InfoRow icon={Phone} label="Phone"   value={student.phone} />}
          <InfoRow icon={MapPin}   label="Address"     value={student?.address} />
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          student={student}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default StudentDetails;
