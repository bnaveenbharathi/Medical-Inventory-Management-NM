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
router.post('/create-test', testController.createTest);

// Update a test
router.put('/:test_id', testController.updateTest);

// Delete a test
router.delete('/:test_id', testController.deleteTest);

// Toggle test active status
router.patch('/:test_id/toggle-status', testController.toggleTestStatus);

module.exports = router;