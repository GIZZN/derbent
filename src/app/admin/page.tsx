'use client';

import React from 'react';
import HRDashboard from '../Components/HRDashboard';
import RoleGuard from '../Components/RoleGuard';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Административная панель
            </h1>
            <p className="text-gray-600">
              Управление системой стажировок и откликами компаний
            </p>
          </div>
          
          <HRDashboard />
        </div>
      </div>
    </RoleGuard>
  );
}
