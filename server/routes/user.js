const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/userController');
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');



// students
router.post('/upload', userControllers.uploadStudents);

router.get('/list', userControllers.getStudents);

router.delete('/delete/:id', userControllers.deleteStudent);

router.post('/reset-password/:id', userControllers.resetStudentPassword); 

router.put('/update/:id', userControllers.updateStudent);

router.post('/add', userControllers.addStudent);


// faculty
router.get('/faculty-list', userControllers.getFaculty);

router.post('/reset-password-faculty/:id', userControllers.resetFacultyPassword); 

router.post('/add-staff', userControllers.addStaff);

router.delete('/delete-faculty/:id', userControllers.deleteFaculty);

router.put('/update-faculty/:id', userControllers.updateFaculty);


// admin
router.post('/reset-password-admin/:id', userControllers.adminResetPassword);

// HOD Staff Management Routes (protected by authMiddleware)
router.get('/department-staff', authMiddleware, userControllers.getDepartmentStaff);
router.get('/department-staff/:id', authMiddleware, userControllers.getStaffDetails);
router.post('/department-staff/add', authMiddleware, userControllers.addDepartmentStaff);
router.put('/department-staff/:id', authMiddleware, userControllers.updateDepartmentStaff);
router.delete('/department-staff/:id', authMiddleware, userControllers.deleteDepartmentStaff);
router.post('/department-staff/:id/reset-password', authMiddleware, userControllers.resetDepartmentStaffPassword);

// HOD Student Management Routes (protected by authMiddleware)
router.get('/department-students', authMiddleware, userControllers.getDepartmentStudents);
router.get('/department-students/:id', authMiddleware, userControllers.getStudentDetails);
router.post('/department-students/add', authMiddleware, userControllers.addDepartmentStudent);
router.put('/department-students/:id', authMiddleware, userControllers.updateDepartmentStudent);
router.delete('/department-students/:id', authMiddleware, userControllers.deleteDepartmentStudent);
router.post('/department-students/:id/reset-password', authMiddleware, userControllers.resetDepartmentStudentPassword);


router.get('/profile', authMiddleware, userControllers.getProfile);

// Topics with subtopics
router.get('/topics-with-subtopics', authMiddleware, topicController.getTopicsWithSubTopics);

module.exports = router;


