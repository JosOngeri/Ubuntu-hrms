const Employee = require('../models/Employee.model');
const Attendance = require('../models/Attendance.model');
const {
  isValidObjectId,
  validateEmployeePayload,
} = require('../utils/validation');

const handleDbError = (res, err) => {
  if (err?.code === '23505') {
    return res.status(400).json({ msg: 'Employee already exists with the same unique field' });
  }

  return res.status(500).send('Server error');
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: 'Invalid employee id' });
    }

    if (req.user?.role === 'employee' && String(req.user?.id) !== String(id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    return res.json(employee);
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

// Add employee
const addEmployee = async (req, res) => {
  try {
    const { normalized, errors } = validateEmployeePayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ msg: 'Validation failed', errors });
    }

    const newEmployee = new Employee(normalized);
    await newEmployee.save();
    return res.status(201).json(newEmployee);
  } catch (err) {
    return handleDbError(res, err);
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid employee id' });
    }

    const { normalized, errors } = validateEmployeePayload(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ msg: 'Validation failed', errors });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    const updates = Object.fromEntries(
      Object.entries(normalized).filter(([, value]) => value !== undefined)
    );

    employee.set(updates);
    await employee.save();
    return res.json(employee);
  } catch (err) {
    return handleDbError(res, err);
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid employee id' });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    await Attendance.deleteMany({ employeeId: req.params.id });
    return res.json({ msg: 'Employee deleted' });
  } catch (err) {
    return res.status(500).send('Server error');
  }
};

module.exports = { getEmployees, getEmployeeById, addEmployee, updateEmployee, deleteEmployee };