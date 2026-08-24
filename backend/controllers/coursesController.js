const { getDb } = require('../database/db');

const db = getDb();

function getStudentId() {
  const row = db.prepare('SELECT id FROM students ORDER BY id LIMIT 1').get();
  return row ? row.id : 1;
}

// GET /api/courses
const getCourses = (req, res) => {
  try {
    const studentId = getStudentId();
    const courses = db.prepare(`
      SELECT c.*, t.name as teacher_name, t.abbreviation as teacher_abbr, t.designation as teacher_designation,
             a.total_classes, a.classes_attended,
             CASE WHEN a.total_classes > 0
               THEN ROUND((a.classes_attended * 100.0 / a.total_classes), 2)
               ELSE 0 END as attendance_percentage
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN attendance a ON a.course_id = c.id AND a.student_id = ?
    `).all(studentId);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses', message: err.message });
  }
};

// GET /api/courses/:id
const getCourseById = (req, res) => {
  try {
    const studentId = getStudentId();
    const course = db.prepare(`
      SELECT c.*, t.name as teacher_name, t.abbreviation as teacher_abbr, t.designation as teacher_designation,
             a.total_classes, a.classes_attended,
             CASE WHEN a.total_classes > 0
               THEN ROUND((a.classes_attended * 100.0 / a.total_classes), 2)
               ELSE 0 END as attendance_percentage
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN attendance a ON a.course_id = c.id AND a.student_id = ?
      WHERE c.id = ?
    `).get(studentId, req.params.id);

    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course', message: err.message });
  }
};

module.exports = { getCourses, getCourseById };
