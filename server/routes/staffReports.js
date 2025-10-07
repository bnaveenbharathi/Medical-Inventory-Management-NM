const express = require('express');
const router = express.Router();
const staffReportController = require('../controllers/staffReportController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Individual Student Report Routes
router.get('/students', staffReportController.getStudentsByFaculty);
router.get('/student/:studentId', staffReportController.getStudentReport);
router.get('/student/:studentId/test-history', staffReportController.getStudentTestHistory);

// Test-wise Report Routes
router.get('/tests', staffReportController.getTestsByFaculty);
router.get('/test-analysis/:testId', staffReportController.getTestAnalysis);

// Department/Batch Report Routes
router.get('/department-report', staffReportController.getDepartmentReport);
router.get('/batch-report', staffReportController.getBatchReport);

// Question Analysis Report Routes
router.get('/question-analysis/:testId', staffReportController.getQuestionAnalysis);

// Test Progress Report Routes (Live Tests)
router.get('/live-tests', staffReportController.getLiveTests);

// Dashboard Statistics
router.get('/dashboard-stats', staffReportController.getDashboardStats);

module.exports = router;