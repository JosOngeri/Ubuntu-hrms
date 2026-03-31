import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { attendanceAPI, employeeAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { BsClipboardCheck, BsClock } from 'react-icons/bs'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../../components/ui/select'
// import './Attendance.css'

const Attendance = ({ role = 'employee' }) => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPunchModal, setShowPunchModal] = useState(false)
  const [punchData, setPunchData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    punchState: 'checkOut',
    employeeId: '',
  })
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    fetchAttendance()
    if (role === 'manager') {
      fetchEmployees()
    }
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll()
      setEmployees(res.data || [])
    } catch (err) {
      setEmployees([])
    }
  }

  const fetchAttendance = async (empId) => {
  try {
    setLoading(true)
    const employeeId = empId || user?.userId || user?.id
    if (employeeId) {
      const response = await attendanceAPI.getByEmployeeId(employeeId)
      setAttendance(response.data || [])
    }
  } catch (error) {
    console.error('Failed to fetch attendance', error)
    toast.error('Failed to load attendance records')
  } finally {
    setLoading(false)
  }
}

const handleManagerPunch = async (e) => {
    e.preventDefault()
    try {
      if (!punchData.employeeId) {
        toast.error('Please select an employee')
        return
      }
      await attendanceAPI.managerManualPunch({
        ...punchData,
      })
      toast.success('Attendance recorded successfully')
      setShowPunchModal(false)
      fetchAttendance(punchData.employeeId)
    } catch (error) {
      toast.error('Failed to record attendance')
    }
}

  const formatTime = (time) => {
    if (!time) return '-'
    return new Date(time).toLocaleTimeString('en-US', { hour12: true })
  }

  const formatHours = (hours) => {
    if (!hours) return '-'
    return hours.toFixed(2) + ' hrs'
  }

  const columns = [
    {
      key: 'attendanceDate',
      label: 'Date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { key: 'status', label: 'Status' },
    { key: 'shift', label: 'Shift' },
    {
      key: 'checkIn',
      label: 'Check In',
      render: formatTime,
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: formatTime,
    },
    {
      key: 'totalHoursWorked',
      label: 'Hours',
      render: formatHours,
    },
  ]

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">View and manage attendance records</p>
      </div>

      {role === 'manager' && (
        <Card>
          <div className="attendance-actions">
            <Button variant="primary" onClick={() => setShowPunchModal(true)}>
              <BsClock size={18} />
              Manual Punch (Flexible Time)
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={attendance} loading={loading} />
      </Card>

      {role === 'manager' && (
        <Modal isOpen={showPunchModal} onClose={() => setShowPunchModal(false)} title="Manager Manual Punch">
          <form onSubmit={handleManagerPunch} className="punch-form space-y-4">
            <div className="form-group">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee</label>
              <Select
                value={punchData.employeeId}
                onValueChange={(val) => setPunchData({ ...punchData, employeeId: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.fullName || emp.name || emp.username || emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Punch Type</label>
              <select
                value={punchData.punchState}
                onChange={(e) => setPunchData({ ...punchData, punchState: e.target.value })}
                className="form-select w-full"
              >
                <option value="checkIn">Check In</option>
                <option value="checkOut">Check Out</option>
              </select>
            </div>
            <Input
              label="Date & Time"
              type="datetime-local"
              value={punchData.timestamp}
              onChange={(e) => setPunchData({ ...punchData, timestamp: e.target.value })}
              required
            />
            <div className="form-actions flex gap-2 mt-4">
              <Button type="submit" variant="primary">
                Record Punch
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowPunchModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Attendance
