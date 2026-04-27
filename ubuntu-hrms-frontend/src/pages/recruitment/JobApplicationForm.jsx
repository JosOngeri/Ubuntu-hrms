import React, { useEffect, useState } from 'react';
import  Card  from '../../components/common/Card';
import  Button  from '../../components/common/Button';
import  Input  from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const normalizeProfile = (raw = {}) => ({
  ...raw,
  fullName: raw.fullName ?? raw.fullname ?? '',
  email: raw.email ?? '',
  phone: raw.phone ?? '',
  summary: raw.summary ?? '',
  skills: raw.skills ?? [],
});

export default function JobApplicationForm({ jobId }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    coverLetter: '',
    cv: null,
    workHistoryText: '',
    educationText: '',
    referencesText: '',
    additionalInfo: '',
  });
  const [job, setJob] = useState(null);
  const [mode, setMode] = useState('scratch');
  const [importingProfile, setImportingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isPermanentRole = (job?.employmentType || '').toLowerCase().includes('permanent')
    || (job?.employmentType || '').toLowerCase().includes('full');

  const parseListText = (text) =>
    String(text || '')
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const resetForm = () => {
    setForm({
      applicantName: '',
      applicantEmail: '',
      applicantPhone: '',
      coverLetter: '',
      cv: null,
      workHistoryText: '',
      educationText: '',
      referencesText: '',
      additionalInfo: '',
    });
    setMode('scratch');
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get('/jobs/public/list');
        const matched = (res.data || []).find((item) => String(item.id) === String(jobId));
        setJob(matched || null);
      } catch {
        setJob(null);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleStartFromScratch = () => {
    resetForm();
  };

  const handleImportProfile = async () => {
    setMode('import-profile');
    setImportingProfile(true);
    try {
      const res = await api.get('/profile/me');
      const profile = normalizeProfile(res.data || {});
      if (!Object.keys(profile).length) {
        toast.info('No saved profile found. Please start from scratch.');
        return;
      }

      const skillsLine = Array.isArray(profile.skills) && profile.skills.length
        ? `Key skills: ${profile.skills.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ')}.`
        : '';

      setForm((prev) => ({
        ...prev,
        applicantName: profile.fullName || prev.applicantName,
        applicantEmail: profile.email || prev.applicantEmail,
        applicantPhone: profile.phone || prev.applicantPhone,
        coverLetter:
          prev.coverLetter ||
          [
            profile.summary ? profile.summary : 'I am interested in this role and believe my background is a strong fit.',
            skillsLine,
          ]
            .filter(Boolean)
            .join(' '),
      }));

      toast.success('Work profile imported. You can edit any field before submitting.');
    } catch {
      toast.error('Failed to import work profile. Please fill the form manually.');
    } finally {
      setImportingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('applicantName', form.applicantName);
      data.append('applicantEmail', form.applicantEmail);
      data.append('applicantPhone', form.applicantPhone);
      data.append('coverLetter', form.coverLetter);
      data.append('applicationMode', mode);
      const currentUserId = user?.id || user?.userId;
      if (currentUserId) data.append('userId', currentUserId);

      if (isPermanentRole) {
        data.append('workHistory', JSON.stringify(parseListText(form.workHistoryText)));
        data.append('education', JSON.stringify(parseListText(form.educationText)));
        data.append('references', JSON.stringify(parseListText(form.referencesText)));
        data.append('additionalInfo', form.additionalInfo || '');
      }

      if (form.cv) data.append('cv', form.cv);
      await api.post(`/jobs/${jobId}/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error('Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Apply for this Job</h2>
        {job && (
          <div className="mb-4 text-sm text-slate-600">
            Applying for: <strong>{job.title}</strong> ({job.employmentType || 'Role type not set'})
          </div>
        )}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            type="button"
            variant={mode === 'scratch' ? 'primary' : 'secondary'}
            onClick={handleStartFromScratch}
          >
            Start from Scratch
          </Button>
          <Button
            type="button"
            variant={mode === 'import-profile' ? 'primary' : 'secondary'}
            onClick={handleImportProfile}
            disabled={importingProfile}
          >
            {importingProfile ? 'Importing...' : 'Import Work Profile'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => document.getElementById('cv-upload-input')?.click()}>
            Upload Resume
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="applicantName" value={form.applicantName} onChange={handleChange} required />
          <Input label="Email" name="applicantEmail" value={form.applicantEmail} onChange={handleChange} type="email" required />
          <Input label="Phone" name="applicantPhone" value={form.applicantPhone} onChange={handleChange} />
          <div className="form-group">
            <label>Cover Letter</label>
            <textarea name="coverLetter" className="form-input" value={form.coverLetter} onChange={handleChange} rows={4} />
          </div>

          {isPermanentRole && (
            <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold">Extended Information (Permanent Role)</h3>
              <div className="form-group">
                <label>Work History (comma or newline separated)</label>
                <textarea
                  name="workHistoryText"
                  className="form-input"
                  value={form.workHistoryText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Company A - Software Engineer, Company B - Team Lead"
                />
              </div>
              <div className="form-group">
                <label>Education Background (comma or newline separated)</label>
                <textarea
                  name="educationText"
                  className="form-input"
                  value={form.educationText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="BSc Computer Science - University X"
                />
              </div>
              <div className="form-group">
                <label>References (comma or newline separated)</label>
                <textarea
                  name="referencesText"
                  className="form-input"
                  value={form.referencesText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jane Doe (Manager) - 07xx..."
                />
              </div>
              <div className="form-group">
                <label>Additional Background Notes</label>
                <textarea
                  name="additionalInfo"
                  className="form-input"
                  value={form.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any extra information relevant for this permanent role"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Upload CV (PDF/DOCX) (optional but recommended)</label>
            <input id="cv-upload-input" type="file" name="cv" accept=".pdf,.docx" onChange={handleChange} />
            {form.cv && <div className="text-sm text-slate-600 mt-1">Selected file: {form.cv.name}</div>}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
          </div>
        </form>
        <Modal
          isOpen={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            resetForm();
          }}
          title="Application Submitted"
        >
          <div className="p-4 text-center">
            <p className="mb-4">Thank you for your application! We will review your submission and contact you if shortlisted.</p>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccess(false);
                resetForm();
              }}
            >
              Okay
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
    </DashboardLayout>
  );
}
