import React, { useState } from 'react';
import { X, BookOpen, Sliders, Hash, Play } from 'lucide-react';
import { quizAPI } from '../../services/api';
import useFetch from '../../hooks/useFetch';

const DIFFICULTIES = [
  { value: 'mixed',  label: 'Mixed', desc: 'All difficulties' },
  { value: 'easy',   label: 'Easy',  desc: 'Fundamental concepts' },
  { value: 'medium', label: 'Medium',desc: 'Intermediate problems' },
  { value: 'hard',   label: 'Hard',  desc: 'Advanced challenges' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const QUIZ_MODES = [
  { value: 'practice',   label: 'Practice Mode', icon: '📖', desc: 'No timer. Learn at your own pace.' },
  { value: 'timed_test', label: 'Timed Test',    icon: '⏱️', desc: '2 min per question. Auto-submits.' },
  { value: 'mock_test',  label: 'Mock Test',     icon: '📝', desc: 'Exam-like. Results after submission.' },
];

function OptionButton({ selected, onClick, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
        background: selected ? 'var(--accent-primary-light)' : 'var(--bg-primary)',
        color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontWeight: selected ? 700 : 500,
        fontSize: 13.5,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function QuizConfigModal({ onClose, onStart }) {
  const { data: subjectsRaw } = useFetch(quizAPI.getSubjects);
  const subjects = subjectsRaw || [];
  const [subjectId, setSubjectId] = useState('all');
  const [difficulty, setDifficulty] = useState('mixed');
  const [numQ, setNumQ] = useState(10);
  const [mode, setMode] = useState('practice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await quizAPI.startQuiz({
        subject_id: subjectId === 'all' ? null : parseInt(subjectId),
        difficulty,
        total_questions: numQ,
        quiz_mode: mode,
      });
      onStart(result.attempt_id);
    } catch (err) {
      setError(err.message || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Play size={20} color="var(--accent-primary)" /> Configure Quiz
          </h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>
        )}

        {/* Subject */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={14} /> Subject
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            <OptionButton selected={subjectId === 'all'} onClick={() => setSubjectId('all')}>All Subjects</OptionButton>
            {subjects.map(s => (
              <OptionButton key={s.id} selected={subjectId === String(s.id)} onClick={() => setSubjectId(String(s.id))}>
                {s.abbreviation}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={14} /> Difficulty
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {DIFFICULTIES.map(d => (
              <OptionButton key={d.value} selected={difficulty === d.value} onClick={() => setDifficulty(d.value)}>
                <div style={{ fontWeight: 600 }}>{d.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{d.desc}</div>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={14} /> Number of Questions
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUESTION_COUNTS.map(n => (
              <OptionButton key={n} selected={numQ === n} onClick={() => setNumQ(n)} style={{ flex: 1 }}>
                {n}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Quiz Mode */}
        <div className="form-group">
          <label className="form-label">Quiz Mode</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUIZ_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: mode === m.value ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: mode === m.value ? 'var(--accent-primary-light)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: mode === m.value ? 'var(--accent-primary)' : 'var(--text-primary)'
                  }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={loading}>
            {loading ? 'Starting…' : <><Play size={16} /> Start Quiz</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizConfigModal;
