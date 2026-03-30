const express = require('express');
const auth = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
	pushBiometric,
	manualSelfPunch,
	managerPunchForEmployee,
	getAttendance,
	adjustAttendance,
} = require('../controllers/attendance.controller');

const router = express.Router();

router.post('/biometrics/push', pushBiometric);  
router.post('/manual/self', manualSelfPunch);
router.post('/manual/manager', auth, roleMiddleware(['admin', 'manager', 'supervisor']), managerPunchForEmployee);
router.get('/:employeeId', auth, roleMiddleware(['admin', 'manager', 'supervisor']), getAttendance);
router.put('/:id', auth, roleMiddleware(['admin', 'manager', 'supervisor']), adjustAttendance);

module.exports = router;