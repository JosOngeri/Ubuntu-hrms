const express = require('express');
const auth = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getEmployees, getEmployeeById, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee.controller');

const router = express.Router();

router.get('/', auth, roleMiddleware(['admin', 'manager', 'supervisor']), getEmployees);
router.get('/:id', auth, roleMiddleware(['admin', 'manager', 'supervisor', 'employee']), getEmployeeById);
router.post('/', auth, roleMiddleware(['admin', 'manager']), addEmployee);  // Create: Admin and Manager
router.put('/:id', auth, roleMiddleware(['admin', 'manager']), updateEmployee);  // Update: Admin and Manager
router.delete('/:id', auth, roleMiddleware(['admin']), deleteEmployee);  // Delete: Admin only

module.exports = router;