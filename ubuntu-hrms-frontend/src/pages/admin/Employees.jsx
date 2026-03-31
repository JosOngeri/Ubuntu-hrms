import React, { useEffect, useState } from 'react'
import { BsPlus, BsTrash, BsPencil, BsSearch } from 'react-icons/bs'
import DashboardLayout from '../../components/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { employeeAPI } from '../../services/api'
import { toast } from 'react-toastify'
// import './Employees.css'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    biometricDeviceId: '',
    mpesaPhoneNumber: '',
    employmentType: 'Permanent',
    wageRate: '',
    department: '',
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await employeeAPI.getAll()
      setEmployees(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    try {
      await employeeAPI.create(formData)
      toast.success('Employee added successfully')
      setShowModal(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        biometricDeviceId: '',
        mpesaPhoneNumber: '',
        employmentType: 'Permanent',
        wageRate: '',
        department: '',
      })
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to add employee')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id)
        toast.success('Employee deleted successfully')
        fetchEmployees()
      } catch (error) {
        toast.error('Failed to delete employee')
      }
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'department', label: 'Department' },
    { key: 'employmentType', label: 'Type' },
    {
      key: '_id',
      label: 'Actions',
      render: (id) => (
        <div className="action-buttons">
          <button className="btn-icon edit" title="Edit">
            <BsPencil size={16} />
          </button>
          <button className="btn-icon delete" onClick={() => handleDelete(id)} title="Delete">
            <BsTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">Manage all employees in the system</p>
      </div>

      <Card>
        <div className="employees-header">
          <div className="search-box">
            <BsSearch size={18} />
            <Input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <BsPlus size={20} />
            Add Employee
          </Button>
        </div>

        <Table columns={columns} data={filteredEmployees} loading={loading} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Employee" size="md">
        <form onSubmit={handleAddEmployee} className="employee-form">
          <div className="form-row">
            <Input
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Phone"
            placeholder="+254123456789"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div className="form-row">
            <Input
              label="Biometric Device ID"
              placeholder="BIO-001"
              value={formData.biometricDeviceId}
              onChange={(e) => setFormData({ ...formData, biometricDeviceId: e.target.value })}
              required
            />
            <Input
              label="M-Pesa Number"
              placeholder="254700000000"
              value={formData.mpesaPhoneNumber}
              onChange={(e) => setFormData({ ...formData, mpesaPhoneNumber: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="form-select"
              >
                <option>Permanent</option>
                <option>Contractor</option>
                <option>Daily</option>
              </select>
            </div>
            <Input
              label="Wage Rate"
              type="number"
              placeholder="100"
              value={formData.wageRate}
              onChange={(e) => setFormData({ ...formData, wageRate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Department"
            placeholder="Kitchen"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          />

          <div className="form-actions">
            <Button type="submit" variant="primary">
              Add Employee
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export default Employees
