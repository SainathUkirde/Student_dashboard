const { getDb } = require('../database/db');

// GET /api/search?q=query
const search = (req, res) => {
  try {
    const db = getDb();
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ courses: [], teachers: [], student: null });
    }
    const query = `%${q.trim()}%`;

    const courses = db.prepare(`
      SELECT c.id, c.course_name as name, c.abbreviation, c.course_code, 'course' as type,
             t.name as teacher_name
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.course_name LIKE ? OR c.abbreviation LIKE ? OR c.course_code LIKE ?
      LIMIT 5
    `).all(query, query, query);

    const teachers = db.prepare(`
      SELECT t.id, t.name, t.abbreviation, t.designation, 'teacher' as type,
             c.course_name as course_name
      FROM teachers t
      LEFT JOIN courses c ON c.teacher_id = t.id
      WHERE t.name LIKE ? OR t.abbreviation LIKE ?
      LIMIT 5
    `).all(query, query);

    const student = db.prepare(`
      SELECT id, name, prn, roll_no, branch, year, 'student' as type
      FROM students
      WHERE name LIKE ? OR prn LIKE ? OR branch LIKE ?
      LIMIT 1
    `).get(query, query, query);

    res.json({ courses, teachers, student: student || null });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
};

module.exports = { search };
