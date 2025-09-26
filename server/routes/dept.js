const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');

// GET /departments
router.get('/departments', deptController.getDepartments);

module.exports = router;
