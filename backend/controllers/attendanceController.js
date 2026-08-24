const { getDb } = require('../database/db');

const db = getDb();

function getStudentId() {
  const row = db.prepare('SELECT id FROM students ORDER BY id LIMIT 1').get();
  return row ? row.id : 1;
}

// GET /api/attendance
const getAttendance = (req, res) => {
  try {
    const studentId = getStudentId();
    const threshold = Number(
      (db.prepare("SELECT value FROM settings WHERE key='attendance_threshold'").get() || {}).value || 75
    );

    const records = db.prepare(`
      SELECT a.*, c.course_name, c.abbreviation, c.course_code,
             t.name as teacher_name,
             CASE WHEN a.total_classes > 0
               THEN ROUND((a.classes_attended * 100.0 / a.total_classes), 2)
               ELSE 0 END as attendance_percentage,
             (a.total_classes - a.classes_attended) as classes_missed
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE a.student_id = ?
      ORDER BY c.course_name
    `).all(studentId);

    // Add status based on threshold
    const enriched = records.map(r => ({
      ...r,
      status: r.attendance_percentage >= threshold ? 'good'
              : r.attendance_percentage >= 65 ? 'warning' : 'critical',
      threshold
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance', message: err.message });
  }
};

// GET /api/attendance/summary
const getAttendanceSummary = (req, res) => {
  try {
    const studentId = getStudentId();
    const records = db.prepare(`
      SELECT a.total_classes, a.classes_attended,
             CASE WHEN a.total_classes > 0
               THEN ROUND((a.classes_attended * 100.0 / a.total_classes), 2)
               ELSE 0 END as attendance_percentage
      FROM attendance a
      WHERE a.student_id = ?
    `).all(studentId);

    if (!records.length) {
      return res.json({ overall_attendance: 0, total_courses: 0 });
    }

    const totalClasses = records.reduce((s, r) => s + r.total_classes, 0);
    const totalAttended = records.reduce((s, r) => s + r.classes_attended, 0);
    const overall = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 10000) / 100 : 0;

    res.json({
      overall_attendance: overall,
      total_courses: records.length,
      total_classes: totalClasses,
      total_attended: totalAttended,
      total_missed: totalClasses - totalAttended
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance summary', message: err.message });
  }
};

// POST /api/attendance
const updateAttendance = (req, res) => {
  try {
    const { course_id, total_classes, classes_attended } = req.body;
    if (!course_id || total_classes == null || classes_attended == null) {
      return res.status(400).json({ error: 'course_id, total_classes, and classes_attended are required' });
    }
    if (classes_attended > total_classes) {
      return res.status(400).json({ error: 'Classes attended cannot exceed total classes' });
    }

    const studentId = getStudentId();
    const stmt = db.prepare(`
      INSERT INTO attendance (student_id, course_id, total_classes, classes_attended, last_updated)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, course_id) DO UPDATE SET
        total_classes = excluded.total_classes,
        classes_attended = excluded.classes_attended,
        last_updated = CURRENT_TIMESTAMP
    `);
    stmt.run(studentId, course_id, total_classes, classes_attended);

    const updated = db.prepare(`
      SELECT a.*, c.course_name, ROUND((a.classes_attended * 100.0 / a.total_classes), 2) as attendance_percentage
      FROM attendance a JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ? AND a.course_id = ?
    `).get(studentId, course_id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update attendance', message: err.message });
  }
};

module.exports = { getAttendance, getAttendanceSummary, updateAttendance };
