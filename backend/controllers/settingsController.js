const { getDb } = require('../database/db');

// GET /api/settings
const getSettings = (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
};

// PUT /api/settings/:key
const updateSetting = (req, res) => {
  try {
    const db = getDb();
    const { key } = req.params;
    const { value } = req.body;
    if (!value) return res.status(400).json({ error: 'Value is required' });

    db.prepare(
      'UPDATE settings SET value = ? WHERE key = ?'
    ).run(value, key);

    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update setting', message: err.message });
  }
};

module.exports = { getSettings, updateSetting };
