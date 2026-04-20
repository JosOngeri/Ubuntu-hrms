import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  Card  from '../../components/common/Card';
import  Table  from '../../components/common/Table';
import  Button  from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { downloadPdfReport } from '../../utils/reportExport';


export default function ApplicantReviewDashboard({ jobId }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${jobId}/applications`);
      setApplications(res.data || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const openModal = (app) => {
    setSelected(app);
    setStatus(app.status);
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/jobs/applications/${selected.id}/status`, { status });
      toast.success('Status updated');
      setShowModal(false);
      fetchApplications();
    } catch {
      toast.error('Update failed');
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredApplications = applications.filter((row) => {
    const matchesSearch =
      !normalizedSearch ||
      (row.applicantName || '').toLowerCase().includes(normalizedSearch) ||
      (row.applicantEmail || '').toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'all' || (row.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportApplicationsReport = async () => {
    await downloadPdfReport({
      fileName: 'job-applications-report.pdf',
      title: 'Job Applications Report',
      rows: filteredApplications,
      columns: [
        { label: 'Name', getValue: (row) => row.applicantName || '' },
        { label: 'Email', getValue: (row) => row.applicantEmail || '' },
        { label: 'Phone', getValue: (row) => row.applicantPhone || '' },
        { label: 'Status', getValue: (row) => row.status || '' },
        { label: 'CV', getValue: (row) => (row.cvPath ? 'Submitted' : 'N/A') },
      ],
      metadata: [
        { label: 'Status Filter', value: statusFilter === 'all' ? 'All' : statusFilter },
      ],
    });
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Job Applications</h2>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Input
            label="Search"
            placeholder="Search name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-[240px]"
          />
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          <Button type="button" variant="secondary" onClick={handleExportApplicationsReport}>Export Report</Button>
        </div>
        <Table
          columns={[
            { key: 'applicantName', label: 'Name' },
            { key: 'applicantEmail', label: 'Email' },
            { key: 'applicantPhone', label: 'Phone' },
            { key: 'status', label: 'Status' },
            {
              key: 'cvPath',
              label: 'CV',
              render: (cvPath) => cvPath ? <a href={`/${cvPath}`} target="_blank" rel="noopener noreferrer">Download</a> : '-',
            },
            {
              key: 'actions',
              label: '',
              render: (_, row) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => navigate(`/recruitment/jobs/${jobId}/applicants/${row.id}`)}>View Details</Button>
                  <Button size="sm" onClick={() => openModal(row)}>Review</Button>
                </div>
              ),
            },
          ]}
          data={filteredApplications}
          loading={loading}
        />
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Application">
        {selected && (
          <div className="space-y-4">
            <div><strong>Name:</strong> {selected.applicantName}</div>
            <div><strong>Email:</strong> {selected.applicantEmail}</div>
            <div><strong>Phone:</strong> {selected.applicantPhone}</div>
            <div><strong>CV:</strong> {selected.cvPath ? <a href={`/${selected.cvPath}`} target="_blank" rel="noopener noreferrer">Download CV</a> : '-'}</div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="primary" onClick={handleStatusUpdate}>Update</Button>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </DashboardLayout>
  );
}
