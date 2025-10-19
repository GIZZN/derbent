'use client';

import React from 'react';
import UnifiedHRPanel from '../Components/UnifiedHRPanel';
import RoleGuard from '../Components/RoleGuard';

export default function HRPage() {
  return (
    <RoleGuard allowedRoles={['HR']}>
      <div className="min-h-screen bg-gray-50">
        <UnifiedHRPanel />
      </div>
    </RoleGuard>
  );
}
