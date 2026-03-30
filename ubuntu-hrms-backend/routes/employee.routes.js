const express = require('express');
const auth = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee.controller');

const router = express.Router();

router.get('/', auth, roleMiddleware(['admin', 'manager']), getEmployees);  // View: Both
router.post('/', auth, roleMiddleware(['admin']), addEmployee);  // Create: Admin only
router.put('/:id', auth, roleMiddleware(['admin']), updateEmployee);  // Update: Admin only
router.delete('/:id', auth, roleMiddleware(['admin']), deleteEmployee);  // Delete: Admin only

module.exports = router;