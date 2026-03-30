const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));