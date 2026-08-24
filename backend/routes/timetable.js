const express = require('express');
const router = express.Router();
const { getTimetable, getTodayTimetable } = require('../controllers/timetableController');

router.get('/', getTimetable);
router.get('/today', getTodayTimetable);

module.exports = router;
