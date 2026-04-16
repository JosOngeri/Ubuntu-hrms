const { query } = require('../config/db');
const { normalizeId, toDate, toOptionalText } = require('../utils/postgres');

const buildWhereClause = (criteria = {}) => {
  const clauses = [];
  const params = [];
  let index = 1;

  for (const [key, value] of Object.entries(criteria)) {
    if (value === undefined) {
      continue;
    }

    if (key === 'resetTokenExpire' && value && typeof value === 'object' && '$gt' in value) {
      clauses.push(`reset_token_expire > $${index}`);
      params.push(toDate(value.$gt));
      index += 1;
      continue;
    }

    const columnMap = {
      id: 'id',
      username: 'username',
      email: 'email',
      resetToken: 'reset_token',
      role: 'role',
    };

    const column = columnMap[key];
    if (!column) {
      continue;
    }

    clauses.push(`${column} = $${index}`);
    params.push(value);
    index += 1;
  }

  return {
    clause: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
};

class User {
  constructor(data = {}) {
    this.id = normalizeId(data.id) ?? data.id ?? null;
    this.username = data.username ?? null;
    this.email = data.email ?? null;
    this.password = data.password ?? null;
    this.role = data.role ?? 'manager';
    this.resetToken = data.resetToken ?? data.reset_token ?? null;
    this.resetTokenExpire = data.resetTokenExpire ?? data.reset_token_expire ?? null;
    this.createdAt = data.createdAt ?? data.created_at ?? null;
    this.updatedAt = data.updatedAt ?? data.updated_at ?? null;
  }

  static fromRow(row) {
    if (!row) {
      return null;
    }

    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      resetToken: row.reset_token,
      resetTokenExpire: row.reset_token_expire,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  static async findOne(criteria = {}) {
    const { clause, params } = buildWhereClause(criteria);
    const { rows } = await query(`SELECT * FROM users${clause} LIMIT 1`, params);
    return User.fromRow(rows[0]);
  }

  static async findById(id) {
    const normalizedId = normalizeId(id);
    if (!normalizedId) {
      return null;
    }

    const { rows } = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [normalizedId]);
    return User.fromRow(rows[0]);
  }

  async save() {
    const now = new Date();
    const normalizedEmail = toOptionalText(this.email);
    const normalizedResetToken = toOptionalText(this.resetToken);
    const normalizedResetTokenExpire = this.resetTokenExpire ? toDate(this.resetTokenExpire) : null;

    if (this.id) {
      const { rows } = await query(
        `
          UPDATE users
          SET username = $1,
              email = $2,
              password = $3,
              role = $4,
              reset_token = $5,
              reset_token_expire = $6,
              updated_at = $7
          WHERE id = $8
          RETURNING *
        `,
        [
          this.username,
          normalizedEmail,
          this.password,
          this.role,
          normalizedResetToken,
          normalizedResetTokenExpire,
          now,
          this.id,
        ]
      );

      Object.assign(this, User.fromRow(rows[0]));
      return this;
    }

    const { rows } = await query(
      `
        INSERT INTO users (username, email, password, role, reset_token, reset_token_expire, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING *
      `,
      [
        this.username,
        normalizedEmail,
        this.password,
        this.role,
        normalizedResetToken,
        normalizedResetTokenExpire,
        now,
      ]
    );

    Object.assign(this, User.fromRow(rows[0]));
    return this;
  }

  toJSON() {
    return {
      _id: String(this.id),
      id: String(this.id),
      username: this.username,
      email: this.email,
      role: this.role,
      resetToken: this.resetToken,
      resetTokenExpire: this.resetTokenExpire,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;