const express = require('express');
const router = express.Router();
const deptController = require('../controllers/deptController');



// Get all departments
router.get('/departments', deptController.getDepartments);

// Add department
router.post('/add-department', deptController.addDepartment);

// Update department
router.put('/update-department/:id', deptController.updateDepartment);

// Delete department
router.delete('/delete-department/:id', deptController.deleteDepartment);

module.exports = router;
