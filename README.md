# UBU HRMS - Ubuntu Eco Lodge Human Resource Management System

## Overview
UBUNTU HRMS is a web-based Human Resource Management System designed for Ubuntu Eco Lodge. It automates employee management, biometric attendance tracking, payroll calculations, and automated disbursements via Safaricom M-Pesa. The system uses the MERN stack (MongoDB, Express.js, React.js, Node.js) and integrates with biometric devices (e.g., ZKTeco) and the Daraja API.

Key features:
- Employee registration and management
- Biometric attendance tracking with punch states (check-in, break-out, break-in, check-out)
- Automated payroll based on attendance hours
- M-Pesa B2C payments
- Additional modules: KPIs, Leaves, Contracts
- Dashboards for monitoring and reporting

## Project Structure
ubu-hrms/
├── backend/          # Backend server (Node.js/Express)
├── frontend/         # Frontend application (React.js)
├── docs/             # Documentation (e.g., concept note)
├── cert/             # M-Pesa certificates
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore file
└── README.md         # This file
text## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Safaricom Daraja developer account (for M-Pesa)
- Biometric device (e.g., ZKTeco with ADMS support)
- Git

## Setup Instructions
1. Clone the repository: `git clone <repo-url>`.
2. Set up the backend (see backend/README.md).
3. Set up the frontend (see frontend/README.md).
4. Configure `.env` files in both backend and frontend.
5. Start the backend: `cd backend && npm start`.
6. Start the frontend: `cd frontend && npm start`.
7. Access the app at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend API).

## Deployment
- Backend: Deploy to Heroku, AWS, or Vercel. Ensure public access for biometric pushes and M-Pesa callbacks.
- Frontend: Deploy to Vercel, Netlify, or AWS S3.
- Use HTTPS in production.
- For M-Pesa production, update `.env` with production credentials and register callbacks in Daraja portal.

## Security Notes
- Use strong JWT secrets.
- Hash passwords.
- Restrict API access with CORS.
- Handle sensitive data (e.g., M-Pesa keys) securely.

## Contributing
- Fork the repo.
- Create a feature branch.
- Commit changes.
- Push and open a PR.

## License
MIT License. See LICENSE file for details.
