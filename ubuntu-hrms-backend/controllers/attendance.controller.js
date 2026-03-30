const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');

const toAttendanceDate = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const applyPunchState = (attendance, punchState, punchTime) => {
  switch (punchState) {
    case 'checkIn':
      attendance.checkIn = punchTime;
      attendance.status = 'Present';
      return true;
    case 'breakOut':
      attendance.breakOut = punchTime;
      return true;
    case 'breakIn':
      attendance.breakIn = punchTime;
      return true;
    case 'checkOut':
      attendance.checkOut = punchTime;
      return true;
    default:
      return false;
  }
};

const recomputeTotalHours = (attendance) => {
  if (!attendance.checkIn || !attendance.checkOut) {
    attendance.totalHoursWorked = undefined;
    return;
  }

  const totalMillis = attendance.checkOut - attendance.checkIn;
  let breakMillis = 0;

  if (attendance.breakOut && attendance.breakIn && attendance.breakIn > attendance.breakOut) {
    breakMillis = attendance.breakIn - attendance.breakOut;
  }

  attendance.totalHoursWorked = Math.max((totalMillis - breakMillis) / (1000 * 60 * 60), 0);
};

const findOrCreateAttendance = async (employeeId, punchTime, shift) => {
  const attendanceDate = toAttendanceDate(punchTime);
  let attendance = await Attendance.findOne({ employeeId, attendanceDate });

  if (!attendance) {
    attendance = new Attendance({
      employeeId,
      attendanceDate,
      shift: shift || 'Morning',
    });
  } else if (!attendance.shift && shift) {
    attendance.shift = shift;
  }

  return attendance;
};

const pushBiometric = async (req, res) => {
  const { biometricDeviceId, timestamp, punchState, shift } = req.body;

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    const punchTime = new Date(timestamp);
    if (Number.isNaN(punchTime.getTime())) {
      return res.status(400).json({ msg: 'Invalid timestamp' });
    }

    const attendance = await findOrCreateAttendance(employee._id, punchTime, shift);
    const applied = applyPunchState(attendance, punchState, punchTime);
    if (!applied) {
      return res.status(400).json({ msg: 'Invalid punch state' });
    }

    recomputeTotalHours(attendance);

    await attendance.save();
    res.status(200).json({ msg: 'Biometric attendance recorded', attendance });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const manualSelfPunch = async (req, res) => {
  const { biometricDeviceId, punchState, shift } = req.body;

  if (!biometricDeviceId || !punchState) {
    return res.status(400).json({ msg: 'biometricDeviceId and punchState are required' });
  }

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    const serverNow = new Date();
    const attendance = await findOrCreateAttendance(employee._id, serverNow, shift);
    const applied = applyPunchState(attendance, punchState, serverNow);
    if (!applied) {
      return res.status(400).json({ msg: 'Invalid punch state' });
    }

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
  const { employeeId, biometricDeviceId, punchState, timestamp, shift } = req.body;

  if (!punchState || !timestamp) {
    return res.status(400).json({ msg: 'punchState and timestamp are required' });
  }

  try {
    const employee = employeeId
      ? await Employee.findById(employeeId)
      : await Employee.findOne({ biometricDeviceId });

    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    const punchTime = new Date(timestamp);
    if (Number.isNaN(punchTime.getTime())) {
      return res.status(400).json({ msg: 'Invalid timestamp' });
    }

    const attendance = await findOrCreateAttendance(employee._id, punchTime, shift);
    const applied = applyPunchState(attendance, punchState, punchTime);
    if (!applied) {
      return res.status(400).json({ msg: 'Invalid punch state' });
    }

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

// Get attendance (unchanged)
const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.params.employeeId });
    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const adjustAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ msg: 'Attendance not found' });

    recomputeTotalHours(attendance);
    await attendance.save();

    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

module.exports = {
  pushBiometric,
  manualSelfPunch,
  managerPunchForEmployee,
  getAttendance,
  adjustAttendance,
};