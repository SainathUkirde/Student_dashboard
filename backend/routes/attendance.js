const express = require('express');
const router = express.Router();
const { getAttendance, getAttendanceSummary, updateAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.get('/summary', getAttendanceSummary);
router.post('/', updateAttendance);

module.exports = router;
