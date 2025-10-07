const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all tests for the authenticated user
router.get('/', testController.getTestsByUser);

// Get a specific test by ID
router.get('/:test_id', testController.getTestById);

// Create a new test
router.post('/', testController.createTest);

// Update a test
router.put('/:test_id', testController.updateTest);

// Delete a test
router.delete('/:test_id', testController.deleteTest);

// Toggle test active status
router.put('/:test_id/toggle-status', testController.toggleTestStatus);

// Test questions routes
router.post('/:test_id/assign-questions', testController.assignQuestionsToTest);
router.get('/:test_id/questions', testController.getTestQuestions);
router.get('/:test_id/questions/count', testController.getTestQuestionsCount);

// Preview questions route
router.get('/preview/:sub_topic_id/questions', testController.getPreviewQuestions);

module.exports = router;