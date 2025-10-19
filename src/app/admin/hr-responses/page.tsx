'use client';

import React from 'react';
import HRResponsesPanel from '@/app/Components/HRResponsesPanel';
import RoleGuard from '@/app/Components/RoleGuard';

const HRResponsesPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <HRResponsesPanel />
      </div>
    </RoleGuard>
  );
};

export default HRResponsesPage;
