const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getQuestions,
  startQuiz,
  saveAnswer,
  submitQuiz,
  getResult,
  getAnalysis,
  getAttemptQuestions,
  getHistory,
  getStatistics,
  getPerformance,
  getSubjectAnalysis,
  getTopicAnalysis,
  getInsights,
  retakeQuiz,
} = require('../controllers/quizController');

// Static routes BEFORE :attemptId
router.get('/subjects',         getSubjects);
router.get('/questions',        getQuestions);
router.get('/history',          getHistory);
router.get('/statistics',       getStatistics);
router.get('/performance',      getPerformance);
router.get('/subject-analysis', getSubjectAnalysis);
router.get('/topic-analysis',   getTopicAnalysis);
router.get('/insights',         getInsights);

router.post('/start', startQuiz);

// Dynamic attempt routes
router.get('/:attemptId/questions', getAttemptQuestions);
router.post('/:attemptId/answer',   saveAnswer);
router.post('/:attemptId/submit',   submitQuiz);
router.get('/:attemptId/result',    getResult);
router.get('/:attemptId/analysis',  getAnalysis);
router.post('/:attemptId/retake',   retakeQuiz);

module.exports = router;
