const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizFunction');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get quiz questions for a specific test
router.get('/:testId/questions', quizController.getQuizQuestions);

// Start a test session
router.post('/:testId/start', quizController.startTest);

// Save student answer
router.post('/answer', quizController.saveAnswer);

// Submit test
router.post('/submit', quizController.submitTest);

module.exports = router;