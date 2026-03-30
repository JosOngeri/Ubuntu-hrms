const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  attendanceDate: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' },
  shift: { type: String, enum: ['Morning', 'Afternoon'] },
  checkIn: { type: Date },
  breakOut: { type: Date },
  breakIn: { type: Date },
  checkOut: { type: Date },
  totalHoursWorked: { type: Number },
});

module.exports = mongoose.model('Attendance', attendanceSchema);