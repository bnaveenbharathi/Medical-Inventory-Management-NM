const express = require('express');
const router = express.Router();
const uploadstudentController = require('../controllers/uploadstudentController');




router.post('/upload', uploadstudentController.uploadStudents);

router.get('/list', uploadstudentController.getStudents);

router.delete('/delete/:id', uploadstudentController.deleteStudent);

router.post('/reset-password/:id', uploadstudentController.resetStudentPassword); 

router.put('/update/:id', uploadstudentController.updateStudent);

router.post('/add', uploadstudentController.addStudent);


module.exports = router;


