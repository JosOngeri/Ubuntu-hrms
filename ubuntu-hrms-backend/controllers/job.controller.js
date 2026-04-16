const Job = require('../models/Job.model');
const JobApplication = require('../models/JobApplication.model');
const path = require('path');

const jobController = {
  // 3.4.1 Job Posting CRUD
  async createJob(req, res) {
    try {
      const job = await Job.create({ ...req.body, postedBy: req.user?.id });
      res.status(201).json(job);
    } catch (err) {
      res.status(400).json({ msg: 'Failed to create job', error: err.message });
    }
  },
  async getJobs(req, res) {
    try {
      const onlyOpen = req.query.open === 'true';
      const jobs = await Job.findAll({ onlyOpen });
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch jobs', error: err.message });
    }
  },
  async getJob(req, res) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ msg: 'Job not found' });
      res.json(job);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch job', error: err.message });
    }
  },
  async updateJob(req, res) {
    try {
      const job = await Job.update(req.params.id, req.body);
      res.json(job);
    } catch (err) {
      res.status(400).json({ msg: 'Failed to update job', error: err.message });
    }
  },
  async deleteJob(req, res) {
    try {
      await Job.delete(req.params.id);
      res.json({ msg: 'Job deleted' });
    } catch (err) {
      res.status(400).json({ msg: 'Failed to delete job', error: err.message });
    }
  },

  // 3.4.4 Available Jobs Listing (public)
  async listOpenJobs(req, res) {
    try {
      const jobs = await Job.findAll({ onlyOpen: true });
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch open jobs', error: err.message });
    }
  },

  // 3.4.5 Application Submission
  async applyToJob(req, res) {
    try {
      const { applicantName, applicantEmail, applicantPhone } = req.body;
      const jobId = req.params.id;
      const cvPath = req.file ? path.relative(path.join(__dirname, '../'), req.file.path) : null;
      const application = await JobApplication.create({
        jobId,
        applicantName,
        applicantEmail,
        applicantPhone,
        cvPath,
        status: 'pending',
      });
      res.status(201).json(application);
    } catch (err) {
      res.status(400).json({ msg: 'Failed to apply', error: err.message });
    }
  },

  // 3.4.6 Application Review (manager)
  async getApplications(req, res) {
    try {
      const jobId = req.params.id;
      const applications = await JobApplication.findByJob(jobId);
      res.json(applications);
    } catch (err) {
      res.status(500).json({ msg: 'Failed to fetch applications', error: err.message });
    }
  },
  async updateApplicationStatus(req, res) {
    try {
      const { status } = req.body;
      const application = await JobApplication.update(req.params.appId, { status });
      res.json(application);
    } catch (err) {
      res.status(400).json({ msg: 'Failed to update application', error: err.message });
    }
  },
};

module.exports = jobController;
