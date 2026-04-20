import React, { useEffect, useState } from 'react'
import { BsPeople, BsClipboardCheck, BsHandThumbsUp, BsGraphUp } from 'react-icons/bs'
import Card from '../../components/common/Card'
import DashboardLayout from '../../components/DashboardLayout'
import { employeeAPI } from '../../services/api'

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    teamSize: 0,
    presentToday: 0,
    pendingApprovals: 0,
    avgKPI: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await employeeAPI.getAll()
        setStats({
          teamSize: response.data.length,
          presentToday: Math.floor(response.data.length * 0.85),
          pendingApprovals: 3,
          avgKPI: 82,
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
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">Manage your team and day-to-day operations</p>
      </div>

      <div className="grid-4">
        <Card>
          <div className="stat-card">
            <div className="stat-icon">
              <BsPeople size={28} />
            </div>
            <span className="stat-label">Team Size</span>
            <span className="stat-value">{stats.teamSize}</span>
            <span className="stat-change">Active members</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon present">
              <BsClipboardCheck size={28} />
            </div>
            <span className="stat-label">Present Today</span>
            <span className="stat-value">{stats.presentToday}</span>
            <span className="stat-change">{Math.round((stats.presentToday / stats.teamSize) * 100)}% attendance</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon pending">
              <BsHandThumbsUp size={28} />
            </div>
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
            <span className="stat-change">Leave requests</span>
          </div>
        </Card>

        <Card>
          <div className="stat-card">
            <div className="stat-icon success">
              <BsGraphUp size={28} />
            </div>
            <span className="stat-label">Team Avg KPI</span>
            <span className="stat-value">{stats.avgKPI}%</span>
            <span className="stat-change">Performing well</span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <div className="recent-activity">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary dark:bg-primary-light rounded-full"></span>
              Quick Actions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              You can approve leaves, adjust attendance, and perform manual punches for your team members.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ManagerDashboard
