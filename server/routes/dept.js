const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');


router.get('/departments', deptController.getDepartments);

module.exports = router;
