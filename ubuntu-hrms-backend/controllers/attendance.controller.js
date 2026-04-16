const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');
const {
  applyPunchState,
  isValidObjectId,
  recomputeTotalHours,
  toAttendanceDate,
  toDateValue,
  validateAttendancePayload,
} = require('../utils/validation');

const findOrCreateAttendance = async (employeeId, punchTime, shift) => {
  const attendanceDate = toAttendanceDate(punchTime);
  let attendance = await Attendance.findOne({ employeeId, attendanceDate });

  if (!attendance) {
    attendance = new Attendance({
      employeeId,
      attendanceDate,
      shift: shift || 'Morning',
      status: 'Present',
    });
  } else if (!attendance.shift && shift) {
    attendance.shift = shift;
  }

  return attendance;
};

const pushBiometric = async (req, res) => {
  const { normalized, errors } = validateAttendancePayload(req.body, { requireTimestamp: true });

  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation failed', errors });
  }

  const { biometricDeviceId, timestamp, punchState, shift } = normalized;

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const attendance = await findOrCreateAttendance(employee.id, timestamp, shift);
    applyPunchState(attendance, punchState, timestamp, 'biometric');

    recomputeTotalHours(attendance);

    await attendance.save();
    return res.status(200).json({ msg: 'Biometric attendance recorded', attendance });
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

const manualSelfPunch = async (req, res) => {
  const { normalized, errors } = validateAttendancePayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation failed', errors });
  }

  const { biometricDeviceId, punchState, shift } = normalized;

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const serverNow = new Date();
    const attendance = await findOrCreateAttendance(employee.id, serverNow, shift);
    applyPunchState(attendance, punchState, serverNow, 'manual-self');

    recomputeTotalHours(attendance);
    await attendance.save();

    return res.status(200).json({
      msg: 'Manual attendance recorded with server time',
      recordedTime: serverNow,
      attendance,
    });
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

const managerPunchForEmployee = async (req, res) => {
  const { normalized, errors } = validateAttendancePayload(req.body, { requireTimestamp: true });

  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation failed', errors });
  }

  const { employeeId, biometricDeviceId, punchState, timestamp, shift } = normalized;

  try {
    const employee = employeeId
      ? await Employee.findById(employeeId)
      : await Employee.findOne({ biometricDeviceId });

    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const attendance = await findOrCreateAttendance(employee.id, timestamp, shift);
    applyPunchState(attendance, punchState, timestamp, 'manual-manager');

    recomputeTotalHours(attendance);
    await attendance.save();

    return res.status(200).json({
      msg: 'Manager/supervisor attendance entry recorded',
      attendance,
    });
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ msg: 'Invalid employee id' });
    }

    if (req.user?.role === 'employee' && String(req.user?.id) !== String(employeeId)) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const attendance = await Attendance.findByEmployeeId(employeeId);
    return res.json(attendance);
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

const adjustAttendance = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid attendance id' });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ msg: 'Attendance not found' });
    }

    const allowedFields = ['attendanceDate', 'status', 'shift', 'checkIn', 'breakOut', 'breakIn', 'checkOut', 'punchState'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        attendance[field] = field === 'attendanceDate' || field === 'checkIn' || field === 'breakOut' || field === 'breakIn' || field === 'checkOut'
          ? toDateValue(req.body[field])
          : req.body[field];
      }
    }

    recomputeTotalHours(attendance);
    await attendance.save();

    return res.json(attendance);
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

module.exports = {
  pushBiometric,
  manualSelfPunch,
  managerPunchForEmployee,
  getAttendance,
  adjustAttendance,
};