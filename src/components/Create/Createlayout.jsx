import React, { useState, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import AdminForm from '../AdminForm';
import MasterAgencyForm from '../MasterAgencyForm';
import AgencyForm from '../AgencyForm';
import MoveLayout from '../Move/MoveLayout';
import { Loader2, ArrowRightLeft } from 'lucide-react';

function Createlayout() {
  const [view, setView] = useState('create'); // 'create' or 'move'
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{view === 'create' ? 'Create User Accounts' : 'Move User Accounts'}</h1>
              <p className="text-gray-400">
                {view === 'create' 
                  ? 'Create admins, master agencies, and agencies for your platform'
                  : 'Move or reassign users between different roles in your platform'
                }
              </p>
            </div>
            <button
              onClick={() => setView(view === 'create' ? 'move' : 'create')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg text-white font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50"
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span>{view === 'create' ? 'Switch to Move' : 'Switch to Create'}</span>
            </button>
          </div>

          {view === 'create' ? (
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
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <MoveLayout />
            </Suspense>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Createlayout;
