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


// Office location and allowed radius (meters)
const OFFICE_LOCATION = { lat: -1.19293, lng: 36.93057 }; // Updated to match your current location
const ALLOWED_RADIUS_METERS = 1000;
function haversineDistance(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Dummy function for remote/leave check (replace with real logic)
function isEmployeeAllowedRemote(employee) {
  // TODO: Check employee's leave/remote status from DB
  return false;
}

const manualSelfPunch = async (req, res) => {
  const { normalized, errors } = validateAttendancePayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation failed', errors });
  }

  const { biometricDeviceId, punchState, shift } = normalized;
  const { geolocation } = req.body;

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    // Geolocation validation
    if (geolocation && geolocation.lat && geolocation.lng) {
      const dist = haversineDistance(
        geolocation.lat, geolocation.lng,
        OFFICE_LOCATION.lat, OFFICE_LOCATION.lng
      );
      if (dist > ALLOWED_RADIUS_METERS && !isEmployeeAllowedRemote(employee)) {
        return res.status(403).json({ msg: 'You are not at the allowed work location.' });
      }
    } else {
      return res.status(400).json({ msg: 'Location required to log attendance.' });
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
    // Only allow for active employees
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.status !== 'active') {
      return res.status(404).json({ msg: 'Active employee not found' });
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