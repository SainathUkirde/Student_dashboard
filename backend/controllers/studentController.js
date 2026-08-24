const { getDb } = require('../database/db');

const db = getDb();

// GET /api/student
const getStudent = (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students LIMIT 1').get();
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student', message: err.message });
  }
};

// PUT /api/student/:id
const updateStudent = (req, res) => {
  try {
    const { id } = req.params;
    const { name, prn, roll_no, batch, branch, year, address, email, phone } = req.body;

    if (!name || !prn || !branch || !year) {
      return res.status(400).json({ error: 'Name, PRN, Branch and Year are required' });
    }
    if (isNaN(Number(roll_no))) {
      return res.status(400).json({ error: 'Roll number must be numeric' });
    }

    const stmt = db.prepare(`
      UPDATE students
      SET name=?, prn=?, roll_no=?, batch=?, branch=?, year=?, address=?, email=?, phone=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `);
    const result = stmt.run(name, prn, Number(roll_no), batch, branch, year, address, email, phone, id);

    if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });

    const updated = db.prepare('SELECT * FROM students WHERE id=?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student', message: err.message });
  }
};

module.exports = { getStudent, updateStudent };
