const express = require('express');
const router = express.Router();
const { getResults, getResultsSummary, upsertResult } = require('../controllers/resultsController');

router.get('/', getResults);
router.get('/summary', getResultsSummary);
router.post('/', upsertResult);

module.exports = router;
