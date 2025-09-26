const express = require('express');
const router = express.Router();
const uploadstudentController = require('../controllers/uploadstudentController');

// POST /api/student/upload
router.post('/upload', uploadstudentController.uploadStudents);

module.exports = router;

