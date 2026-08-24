const { getDb } = require('../database/db');

const db = getDb();

// GET /api/teachers
const getTeachers = (req, res) => {
  try {
    const teachers = db.prepare(`
      SELECT t.*, GROUP_CONCAT(c.course_name, ' | ') as courses,
             GROUP_CONCAT(c.id, ',') as course_ids
      FROM teachers t
      LEFT JOIN courses c ON c.teacher_id = t.id
      GROUP BY t.id
      ORDER BY t.name
    `).all();

    // Parse courses into arrays
    const enriched = teachers.map(t => ({
      ...t,
      courses: t.courses ? t.courses.split(' | ') : [],
      course_ids: t.course_ids ? t.course_ids.split(',').map(Number) : []
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teachers', message: err.message });
  }
};

module.exports = { getTeachers };
