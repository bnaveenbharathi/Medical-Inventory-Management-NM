const express = require('express');
const router = express.Router();
const questionController = require('../controllers/QuestionController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/topics', questionController.getTopics);


router.get('/sub-topics', questionController.getSubTopics);

router.get('/sub-topics-with-questions', questionController.getSubTopicsWithQuestions);

router.get('/subtopics/:sub_topic_id/questions', authMiddleware, questionController.getQuestionsBySubTopic);

router.put('/sub-topics-with-questions/:question_id', questionController.updateQuestion); 

router.put('/addquestions', questionController.addQuestion);


module.exports = router;
