const Attendance = require('../models/Attendance.model');
const Employee = require('../models/Employee.model');

const pushBiometric = async (req, res) => {
  const { biometricDeviceId, timestamp, punchState, shift } = req.body;  // Added shift if device sends it

  try {
    const employee = await Employee.findOne({ biometricDeviceId });
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    const date = new Date(timestamp).toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ employeeId: employee._id, attendanceDate: new Date(date) });

    if (!attendance) {
      attendance = new Attendance({ employeeId: employee._id, attendanceDate: new Date(date), shift: shift || 'Morning' });
    }

    const punchTime = new Date(timestamp);
    switch (punchState) {
      case 'checkIn':
        attendance.checkIn = punchTime;
        attendance.status = 'Present';
        break;
      case 'breakOut':
        attendance.breakOut = punchTime;
        break;
      case 'breakIn':
        attendance.breakIn = punchTime;
        break;
      case 'checkOut':
        attendance.checkOut = punchTime;
        break;
      default:
        return res.status(400).json({ msg: 'Invalid punch state' });
    }

    if (attendance.checkOut && attendance.checkIn && attendance.breakOut && attendance.breakIn) {
      const workMorning = (attendance.breakOut - attendance.checkIn) / (1000 * 60 * 60);
      const workAfternoon = (attendance.checkOut - attendance.breakIn) / (1000 * 60 * 60);
      attendance.totalHoursWorked = workMorning + workAfternoon;
    }

    await attendance.save();
    res.status(200).json({ msg: 'Attendance recorded' });
  } catch (err) {
    res.status(500).send('Server error');
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

// Adjust attendance (updated to handle status/shift)
const adjustAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ msg: 'Attendance not found' });

    if (attendance.checkOut && attendance.checkIn && attendance.breakOut && attendance.breakIn) {
      const workMorning = (attendance.breakOut - attendance.checkIn) / (1000 * 60 * 60);
      const workAfternoon = (attendance.checkOut - attendance.breakIn) / (1000 * 60 * 60);
      attendance.totalHoursWorked = workMorning + workAfternoon;
      await attendance.save();
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

module.exports = { pushBiometric, getAttendance, adjustAttendance };