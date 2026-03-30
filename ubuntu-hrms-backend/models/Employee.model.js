const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  biometricDeviceId: { type: String, required: false, unique: true },  // Kept for biometric
  mpesaPhoneNumber: { type: String, required: true },  // Kept for M-Pesa
  employmentType: { type: String, enum: ['Daily', 'Contractor', 'Permanent'], required: true },
  wageRate: { type: Number, required: true },  // Replaced hourlyRate
  department: { type: String, required: true },
  dateJoined: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', employeeSchema);