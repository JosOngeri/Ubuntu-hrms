import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import  Table  from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { downloadPdfReport } from '../../utils/reportExport';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Support',
  'Legal',
  'Other',
];
const defaultJob = {
  title: '',
  description: '',
  department: '',
  location: '',
  employmentType: '',
  status: 'open',
  salaryRange: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  applicationDeadline: '',
};

export default function JobPostingManagement() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultJob);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openModal = (job = null) => {
    setEditing(job);
    setForm(job ? { ...job } : defaultJob);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/jobs/${editing.id}`, form);
        toast.success('Job updated');
      } else {
        await api.post('/jobs', form);
        toast.success('Job created');
      }
      setShowModal(false);
      fetchJobs();
    } catch {
      toast.error('Save failed');
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredJobs = jobs.filter((row) => {
    const matchesSearch =
      !normalizedSearch ||
      (row.title || '').toLowerCase().includes(normalizedSearch) ||
      (row.location || '').toLowerCase().includes(normalizedSearch);
    const matchesDepartment = departmentFilter === 'all' || (row.department || '') === departmentFilter;
    const matchesStatus = statusFilter === 'all' || (row.status || '') === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleExportJobsReport = async () => {
    await downloadPdfReport({
      fileName: 'job-postings-report.pdf',
      title: 'Job Postings Report',
      rows: filteredJobs,
      columns: [
        { label: 'Title', getValue: (row) => row.title || '' },
        { label: 'Department', getValue: (row) => row.department || '' },
        { label: 'Location', getValue: (row) => row.location || '' },
        { label: 'Type', getValue: (row) => row.employmentType || '' },
        { label: 'Status', getValue: (row) => row.status || '' },
        { label: 'Deadline', getValue: (row) => row.applicationDeadline || '' },
      ],
      metadata: [
        { label: 'Department', value: departmentFilter === 'all' ? 'All' : departmentFilter },
        { label: 'Status', value: statusFilter === 'all' ? 'All' : statusFilter },
      ],
    });
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <Button variant="primary" onClick={() => openModal()}>Create Job</Button>
        </div>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Input
            label="Search"
            placeholder="Search title or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-[240px]"
          />
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
            <select className="form-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All departments</option>
              {DEPARTMENTS.map((dep) => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <Button type="button" variant="secondary" onClick={handleExportJobsReport}>Export Report</Button>
        </div>
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'department', label: 'Department' },
            { key: 'location', label: 'Location' },
            { key: 'employmentType', label: 'Type' },
            { key: 'status', label: 'Status' },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => navigate(`/recruitment/jobs/${row.id}`)}>View Details</Button>
                  <Button size="sm" onClick={() => openModal(row)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={filteredJobs}
          loading={loading}
        />
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Job' : 'Create Job'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group md:col-span-2">
            <label>Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
              <option value="">Select</option>
              {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Employment Type</label>
            <select className="form-input" value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}>
              <option value="">Select</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Salary Range</label>
            <input className="form-input" value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Application Deadline</label>
            <input className="form-input" type="date" value={form.applicationDeadline} onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} />
          </div>
          <div className="form-group md:col-span-2">
            <label>Description</label>
            <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-group md:col-span-2">
            <label>Requirements</label>
            <textarea className="form-input" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="List requirements, separated by commas or lines" />
          </div>
          <div className="form-group md:col-span-2">
            <label>Responsibilities</label>
            <textarea className="form-input" value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} placeholder="List responsibilities, separated by commas or lines" />
          </div>
          <div className="form-group md:col-span-2">
            <label>Benefits</label>
            <textarea className="form-input" value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} placeholder="List benefits, separated by commas or lines" />
          </div>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="submit" variant="primary">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
    </DashboardLayout>
  );
}
