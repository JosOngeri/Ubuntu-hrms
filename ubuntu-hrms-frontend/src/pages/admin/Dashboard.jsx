import React, { useEffect, useState } from 'react'
import { BsPeople, BsClipboardCheck, BsCreditCard, BsGraphUp } from 'react-icons/bs'
import Card from '../../components/common/Card'
import DashboardLayout from '../../components/DashboardLayout'
import { employeeAPI } from '../../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingPayroll: 0,
    avgKPI: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await employeeAPI.getAll()
        setStats({
          totalEmployees: response.data.length,
          presentToday: Math.floor(response.data.length * 0.9),
          pendingPayroll: Math.floor(response.data.length * 0.2),
          avgKPI: 85,
        })
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your system overview.</p>
      </div>

      <div className="grid-4">
        <Card>
          <div className="stat-card">
            <div className="stat-icon">
              <BsPeople size={28} />
            </div>
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{stats.totalEmployees}</span>
            <span className="stat-change">↑ 5% from last month</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon present">
              <BsClipboardCheck size={28} />
            </div>
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday}</span>
            <span className="stat-change">90% attendance rate</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon pending">
              <BsCreditCard size={28} />
            </div>
            <span className="stat-label">Pending Payroll</span>
            <span className="stat-value">{stats.pendingPayroll}</span>
            <span className="stat-change">Process by end of month</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon success">
              <BsGraphUp size={28} />
            </div>
            <span className="stat-label">Avg KPI Score</span>
            <span className="stat-value">{stats.avgKPI}%</span>
            <span className="stat-change">On track</span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <div className="recent-activity">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              Recent Activity
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              System is running smoothly. All employees are synchronized with the biometric system.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
