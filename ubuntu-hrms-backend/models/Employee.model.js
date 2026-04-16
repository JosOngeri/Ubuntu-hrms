const { query } = require('../config/db');
const { normalizeId, toOptionalText, toDate } = require('../utils/postgres');

const mapRow = (row) => {
  if (!row) {
    return null;
  }

  return new Employee({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    biometricDeviceId: row.biometric_device_id,
    mpesaPhoneNumber: row.mpesa_phone_number,
    employmentType: row.employment_type,
    wageRate: row.wage_rate === null ? null : Number(row.wage_rate),
    department: row.department,
    dateJoined: row.date_joined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
};

class Employee {
  constructor(data = {}) {
    this.id = normalizeId(data.id) ?? data.id ?? null;
    this.firstName = data.firstName ?? null;
    this.lastName = data.lastName ?? null;
    this.email = data.email ?? null;
    this.phone = data.phone ?? null;
    this.biometricDeviceId = data.biometricDeviceId ?? null;
    this.mpesaPhoneNumber = data.mpesaPhoneNumber ?? null;
    this.employmentType = data.employmentType ?? null;
    this.wageRate = data.wageRate ?? null;
    this.department = data.department ?? null;
    this.dateJoined = data.dateJoined ?? data.date_joined ?? null;
    this.createdAt = data.createdAt ?? data.created_at ?? null;
    this.updatedAt = data.updatedAt ?? data.updated_at ?? null;
  }

  static fromRow(row) {
    return mapRow(row);
  }

  static async find() {
    const { rows } = await query('SELECT * FROM employees ORDER BY created_at DESC');
    return rows.map(mapRow);
  }

  static async findById(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) {
      return null;
    }

    const { rows } = await query('SELECT * FROM employees WHERE id = $1 LIMIT 1', [normalizedId]);
    return mapRow(rows[0]);
  }

  static async findOne(criteria = {}) {
    if (criteria.biometricDeviceId !== undefined) {
      const { rows } = await query(
        'SELECT * FROM employees WHERE biometric_device_id = $1 LIMIT 1',
        [criteria.biometricDeviceId]
      );
      return mapRow(rows[0]);
    }

    if (criteria.email !== undefined) {
      const { rows } = await query('SELECT * FROM employees WHERE email = $1 LIMIT 1', [criteria.email]);
      return mapRow(rows[0]);
    }

    return null;
  }

  static async findByIdAndDelete(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) {
      return null;
    }

    const { rows } = await query('DELETE FROM employees WHERE id = $1 RETURNING *', [normalizedId]);
    return mapRow(rows[0]);
  }

  static async findByIdAndUpdate(id, update = {}) {
    const employee = await Employee.findById(id);
    if (!employee) {
      return null;
    }

    employee.set(update);
    await employee.save();
    return employee;
  }

  set(update = {}) {
    Object.assign(this, update);
  }

  async save() {
    const now = new Date();
    const normalizedEmail = toOptionalText(this.email);
    const normalizedPhone = toOptionalText(this.phone);
    const normalizedBiometricDeviceId = toOptionalText(this.biometricDeviceId);
    const normalizedMpesaPhoneNumber = toOptionalText(this.mpesaPhoneNumber);
    const normalizedDepartment = toOptionalText(this.department);
    const normalizedWageRate = this.wageRate === null || this.wageRate === undefined ? null : Number(this.wageRate);
    const normalizedDateJoined = this.dateJoined ? toDate(this.dateJoined) : now;

    if (this.id) {
      const { rows } = await query(
        `
          UPDATE employees
          SET first_name = $1,
              last_name = $2,
              email = $3,
              phone = $4,
              biometric_device_id = $5,
              mpesa_phone_number = $6,
              employment_type = $7,
              wage_rate = $8,
              department = $9,
              date_joined = COALESCE($10, date_joined),
              updated_at = $11
          WHERE id = $12
          RETURNING *
        `,
        [
          this.firstName,
          this.lastName,
          normalizedEmail,
          normalizedPhone,
          normalizedBiometricDeviceId,
          normalizedMpesaPhoneNumber,
          this.employmentType,
          normalizedWageRate,
          normalizedDepartment,
          normalizedDateJoined,
          now,
          this.id,
        ]
      );

      Object.assign(this, mapRow(rows[0]));
      return this;
    }

    const { rows } = await query(
      `
        INSERT INTO employees (
          first_name, last_name, email, phone, biometric_device_id, mpesa_phone_number,
          employment_type, wage_rate, department, date_joined, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        RETURNING *
      `,
      [
        this.firstName,
        this.lastName,
        normalizedEmail,
        normalizedPhone,
        normalizedBiometricDeviceId,
        normalizedMpesaPhoneNumber,
        this.employmentType,
        normalizedWageRate,
        normalizedDepartment,
        normalizedDateJoined,
        now,
      ]
    );

    Object.assign(this, mapRow(rows[0]));
    return this;
  }

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  toJSON() {
    return {
      _id: String(this.id),
      id: String(this.id),
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      biometricDeviceId: this.biometricDeviceId,
      mpesaPhoneNumber: this.mpesaPhoneNumber,
      employmentType: this.employmentType,
      wageRate: this.wageRate === null || this.wageRate === undefined ? null : Number(this.wageRate),
      department: this.department,
      dateJoined: this.dateJoined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Employee;