const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/topics-with-subtopics', authMiddleware, topicController.getTopicsWithSubTopics);

router.get('/subtopics/:topicId', authMiddleware, topicController.getSubTopics);

// Create topic route
router.post('/create-topics', authMiddleware, topicController.createTopic);

// Create subtopic route
router.post('/create-subtopics', authMiddleware, topicController.createSubTopic);

module.exports = router;