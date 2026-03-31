import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Ensure every protected request carries the latest JWT from storage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers['x-auth-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auto-clear invalid sessions so the app can redirect to login cleanly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
    }
    return Promise.reject(error)
  }
)

// Employees
export const employeeAPI = {
  getAll: () => api.get('/api/employees'),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
}

// Attendance
export const attendanceAPI = {
  getByEmployeeId: (employeeId) => api.get(`/api/attendance/${employeeId}`),
  biometricPush: (data) => api.post('/api/attendance/biometrics/push', data),
  manualSelfPunch: (data) => api.post('/api/attendance/manual/self', data),
  managerManualPunch: (data) => api.post('/api/attendance/manual/manager', data),
  update: (id, data) => api.put(`/api/attendance/${id}`, data),
}

// Payroll
export const payrollAPI = {
  calculate: (period) => api.get(`/api/payroll/calculate/${period}`),
  disburse: (data) => api.post('/api/payroll/disburse', data),
  getPayments: () => api.get('/api/payroll/payments'),
}

// KPIs
export const kpiAPI = {
  getByEmployeeId: (employeeId) => api.get(`/api/kpis/${employeeId}`),
  create: (data) => api.post('/api/kpis', data),
  update: (id, data) => api.put(`/api/kpis/${id}`, data),
  delete: (id) => api.delete(`/api/kpis/${id}`),
}

// Leaves
export const leaveAPI = {
  getByEmployeeId: (employeeId) => api.get(`/api/leaves/${employeeId}`),
  create: (data) => api.post('/api/leaves', data),
  update: (id, data) => api.put(`/api/leaves/${id}`, data),
  delete: (id) => api.delete(`/api/leaves/${id}`),
}

// Contracts
export const contractAPI = {
  getByEmployeeId: (employeeId) => api.get(`/api/contracts/${employeeId}`),
  create: (data) => api.post('/api/contracts', data),
  update: (id, data) => api.put(`/api/contracts/${id}`, data),
  delete: (id) => api.delete(`/api/contracts/${id}`),
}

export default api
