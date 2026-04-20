import React, { useState } from 'react';
import  Card  from '../../components/common/Card';
import  Button  from '../../components/common/Button';
import  Input  from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';

export default function JobApplicationForm({ jobId }) {
  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    coverLetter: '',
    cv: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="applicantName" value={form.applicantName} onChange={handleChange} required />
          <Input label="Email" name="applicantEmail" value={form.applicantEmail} onChange={handleChange} type="email" required />
          <Input label="Phone" name="applicantPhone" value={form.applicantPhone} onChange={handleChange} />
          <div className="form-group">
            <label>Cover Letter</label>
            <textarea name="coverLetter" className="form-input" value={form.coverLetter} onChange={handleChange} rows={4} />
          </div>
          <div className="form-group">
            <label>Upload CV (PDF/DOCX)</label>
            <input type="file" name="cv" accept=".pdf,.docx" onChange={handleChange} required />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
          </div>
        </form>
        <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Application Submitted">
          <div className="p-4 text-center">
            <p className="mb-4">Thank you for your application! We will review your submission and contact you if shortlisted.</p>
            <Button variant="primary" onClick={() => setShowSuccess(false)}>Close</Button>
          </div>
        </Modal>
      </Card>
    </div>
    </DashboardLayout>
  );
}
