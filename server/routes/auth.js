const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user/:rollNo', authController.getUserByRollNo);

router.post('/signup', authController.signup);

router.post('/login', authController.login);

// Profile management routes (require authentication)
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/reset-password', authMiddleware, authController.resetPassword);

module.exports = router;
