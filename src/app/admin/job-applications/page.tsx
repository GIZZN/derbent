'use client';

import React from 'react';
import JobApplicationsPanel from '@/app/Components/JobApplicationsPanel';
import RoleGuard from '@/app/Components/RoleGuard';

const JobApplicationsPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <JobApplicationsPanel />
      </div>
    </RoleGuard>
  );
};

export default JobApplicationsPage;
