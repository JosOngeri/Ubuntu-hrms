const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'supervisor', 'employee'], default: 'manager' },
  resetToken: { type: String, default: null },
  resetTokenExpire: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);