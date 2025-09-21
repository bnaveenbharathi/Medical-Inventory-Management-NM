const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Fetch user details by roll number
router.get('/user/:rollNo', authController.getUserByRollNo);

// Signup (set password if not already set)
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

module.exports = router;
