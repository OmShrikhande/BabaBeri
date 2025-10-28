import React, { useState, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import AdminForm from '../AdminForm';
import MasterAgencyForm from '../MasterAgencyForm';
import AgencyForm from '../AgencyForm';
import { Loader2 } from 'lucide-react';

function Createlayout() {
  const [createdItems, setCreatedItems] = useState({
    admins: [],
    masterAgencies: [],
    agencies: []
  });

  const handleAdminCreated = (newAdmin) => {
    setCreatedItems((prev) => ({
      ...prev,
      admins: [newAdmin, ...prev.admins]
    }));
  };

  const handleMasterAgencyCreated = (newMasterAgency) => {
    setCreatedItems((prev) => ({
      ...prev,
      masterAgencies: [newMasterAgency, ...prev.masterAgencies]
    }));
  };

  const handleAgencyCreated = (newAgency) => {
    setCreatedItems((prev) => ({
      ...prev,
      agencies: [newAgency, ...prev.agencies]
    }));
  };

  const LoadingFallback = () => (
    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 text-[#F72585] animate-spin" />
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-[#0F0F0F] to-[#1A1A1A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create User Accounts</h1>
            <p className="text-gray-400">Create admins, master agencies, and agencies for your platform</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Suspense fallback={<LoadingFallback />}>
              <AdminForm onCreated={handleAdminCreated} />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <MasterAgencyForm onCreated={handleMasterAgencyCreated} />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <AgencyForm onCreated={handleAgencyCreated} />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Createlayout;
