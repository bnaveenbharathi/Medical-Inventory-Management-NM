const express = require('express');
const router = express.Router();
const uploadstudentController = require('../controllers/userController');



// students
router.post('/upload', uploadstudentController.uploadStudents);

router.get('/list', uploadstudentController.getStudents);

router.delete('/delete/:id', uploadstudentController.deleteStudent);

router.post('/reset-password/:id', uploadstudentController.resetStudentPassword); 

router.put('/update/:id', uploadstudentController.updateStudent);

router.post('/add', uploadstudentController.addStudent);


// faculty
router.get('/faculty-list', uploadstudentController.getFaculty);

router.post('/reset-password-faculty/:id', uploadstudentController.resetFacultyPassword); 

router.post('/add-staff', uploadstudentController.addStaff);

router.delete('/delete-faculty/:id', uploadstudentController.deleteFaculty);

router.put('/update-faculty/:id', uploadstudentController.updateFaculty);


// admin
router.post('/reset-password-admin/:id', uploadstudentController.adminResetPassword);

module.exports = router;


