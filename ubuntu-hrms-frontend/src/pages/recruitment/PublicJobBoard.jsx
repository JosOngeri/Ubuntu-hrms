import React, { useEffect, useState } from 'react';
import Card  from '../../components/common/Card';
import  Button  from '../../components/common/Button';
import  Table  from '../../components/common/Table';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout'

export default function PublicJobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/public/list');
      setJobs(res.data || []);
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Current Job Openings</h2>
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'department', label: 'Department' },
            { key: 'location', label: 'Location' },
            { key: 'employmentType', label: 'Type' },
            {
              key: 'actions',
              label: '',
              render: (_, row) => (
                <Button variant="primary" size="sm" href={`/recruitment/apply/${row.id}`}>Apply</Button>
              ),
            },
          ]}
          data={jobs}
          loading={loading}
        />
      </Card>
    </div>
    </DashboardLayout>
  );
}
