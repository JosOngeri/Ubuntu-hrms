import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { BsArrowLeft, BsPerson, BsEnvelope, BsPhone, BsFileEarmarkText, BsClock } from 'react-icons/bs';

export default function ApplicantDetail() {
  const { jobId, applicantId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplicant = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${jobId}/applicants/${applicantId}`);
        setApplicant(res.data);
        setStatus(res.data.status || 'pending');
      } catch (err) {
        toast.error('Failed to fetch applicant details');
        navigate(`/recruitment/jobs/${jobId}/applicants`);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [jobId, applicantId, navigate]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/jobs/${jobId}/applicants/${applicantId}`, { status });
      toast.success('Applicant status updated');
      setApplicant({ ...applicant, status });
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    api.delete(`/jobs/${jobId}/applicants/${applicantId}`)
      .then(() => {
        toast.success('Application deleted successfully');
        navigate(`/recruitment/jobs/${jobId}/applicants`);
      })
      .catch(() => {
        toast.error('Failed to delete application');
      });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!applicant) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <p className="text-center text-slate-500">Applicant not found</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/recruitment/jobs/${jobId}/applicants`)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <BsArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Applicant Details</h1>
          </div>
        </div>

        {/* Main Applicant Card */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary-50 rounded-lg">
              <BsPerson size={32} className="text-primary-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{applicant.fullName || applicant.name || 'Unnamed Applicant'}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(applicant.status)}`}>
                  {applicant.status || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BsEnvelope size={14} />
                Email
              </label>
              <p className="text-lg font-semibold mt-1">
                <a href={`mailto:${applicant.email}`} className="text-primary-600 hover:underline">
                  {applicant.email || 'N/A'}
                </a>
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BsPhone size={14} />
                Phone
              </label>
              <p className="text-lg font-semibold mt-1">{applicant.phone || 'N/A'}</p>
            </div>

            {/* Applied At */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BsClock size={14} />
                Applied At
              </label>
              <p className="text-lg font-semibold mt-1">
                {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {/* CV Status */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <BsFileEarmarkText size={14} />
                CV Submitted
              </label>
              <p className="text-lg font-semibold mt-1">
                {applicant.cvUrl ? (
                  <a href={applicant.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    View CV
                  </a>
                ) : (
                  <span className="text-slate-500">Not submitted</span>
                )}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          {applicant.coverLetter && (
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Cover Letter</label>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{applicant.coverLetter}</p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-3">Update Status</label>
            <div className="flex gap-3 items-end">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select flex-1"
                disabled={updating}
              >
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <Button
                variant="primary"
                onClick={handleStatusUpdate}
                loading={updating}
                disabled={updating}
              >
                Update
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="secondary"
              onClick={() => navigate(`/recruitment/jobs/${jobId}/applicants`)}
            >
              Back to Applicants
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Application
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
