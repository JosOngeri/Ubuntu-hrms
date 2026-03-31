import React, { useState } from 'react'
import { BsClipboardCheck, BsCalendarCheck, BsFileText, BsPersonCircle, BsPersonCheck } from 'react-icons/bs'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import DashboardLayout from '../../components/DashboardLayout'
import { attendanceAPI } from '../../services/api'
import { toast } from 'react-toastify'

const EmployeeDashboard = () => {
  const [punchLoading, setPunchLoading] = useState(false)

  const handleQuickPunch = async () => {
    setPunchLoading(true)
    try {
      const deviceId = localStorage.getItem('biometricDeviceId') || 'BIO-001'
      await attendanceAPI.manualSelfPunch({
        biometricDeviceId: deviceId,
        punchState: 'checkOut',
      })
      toast.success('Punch recorded successfully')
    } catch (error) {
      toast.error('Failed to record punch')
    } finally {
      setPunchLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Dashboard</h1>
        <p className="page-subtitle">Welcome! Here's your personal overview.</p>
      </div>

      <div className="grid-2">
        <Card>
          <div className="quick-action">
            <div className="quick-action-icon text-2xl text-blue-600 dark:text-blue-400">
              <BsPersonCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-3">Quick Punch</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Record your attendance with server time</p>
            <Button variant="primary" onClick={handleQuickPunch} loading={punchLoading} className="w-full mt-4">
              Punch Now
            </Button>
          </div>
        </Card>

        <Card>
          <div className="quick-action">
            <div className="quick-action-icon text-2xl text-green-600 dark:text-green-400">
              <BsClipboardCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-3">My Attendance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">View your attendance records</p>
            <a href="/employee/attendance" className="w-full">
              <Button variant="secondary" className="w-full mt-4">View Details</Button>
            </a>
          </div>
        </Card>

        <Card>
          <div className="quick-action">
            <div className="quick-action-icon text-2xl text-orange-600 dark:text-orange-400">
              <BsCalendarCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-3">My Leaves</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Manage your leave requests</p>
            <a href="/employee/leaves" className="w-full">
              <Button variant="secondary" className="w-full mt-4">Manage Leaves</Button>
            </a>
          </div>
        </Card>

        <Card>
          <div className="quick-action">
            <div className="quick-action-icon text-2xl text-purple-600 dark:text-purple-400">
              <BsPersonCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-3">My Profile</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">View and update your profile</p>
            <a href="/employee/profile" className="w-full">
              <Button variant="secondary" className="w-full mt-4">View Profile</Button>
            </a>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <div className="info-box">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              Quick Tips
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                <span>Use the Quick Punch button above to record your attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                <span>Check My Attendance to view your attendance history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                <span>Submit leave requests under My Leaves</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                <span>Update your profile information anytime</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default EmployeeDashboard
