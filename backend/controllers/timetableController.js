const { getDb } = require('../database/db');

// GET /api/timetable
const getTimetable = (req, res) => {
  try {
    const db = getDb();
    const entries = db.prepare(`
      SELECT * FROM timetable
      ORDER BY
        CASE day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          ELSE 7
        END,
        period_no
    `).all();

    // Group by day
    const grouped = {};
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayOrder.forEach(day => { grouped[day] = []; });

    entries.forEach(entry => {
      if (grouped[entry.day]) grouped[entry.day].push(entry);
    });

    res.json({ timetable: grouped, days: dayOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetable', message: err.message });
  }
};

// GET /api/timetable/today
const getTodayTimetable = (req, res) => {
  try {
    const db = getDb();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const entries = db.prepare(
      'SELECT * FROM timetable WHERE day = ? ORDER BY period_no'
    ).all(today);
    res.json({ day: today, entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today timetable', message: err.message });
  }
};

module.exports = { getTimetable, getTodayTimetable };
