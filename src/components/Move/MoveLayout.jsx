import React, { useState, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { Loader2 } from 'lucide-react';
import MoveHostForm from './MoveHostForm';
import MoveMasterAgencyForm from './MoveMasterAgencyForm';
import MoveAgencyForm from './MoveAgencyForm';

function MoveLayout() {
  const [movedItems, setMovedItems] = useState({
    admins: [],
    masterAgencies: [],
    agencies: []
  });

  const handleAdminMoved = (movedAdmin) => {
    setMovedItems((prev) => ({
      ...prev,
      admins: [movedAdmin, ...prev.admins]
    }));
  };

  const handleMasterAgencyMoved = (movedMasterAgency) => {
    setMovedItems((prev) => ({
      ...prev,
      masterAgencies: [movedMasterAgency, ...prev.masterAgencies]
    }));
  };

  const handleAgencyMoved = (movedAgency) => {
    setMovedItems((prev) => ({
      ...prev,
      agencies: [movedAgency, ...prev.agencies]
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Suspense fallback={<LoadingFallback />}>
              <MoveMasterAgencyForm onMoved={handleMasterAgencyMoved} />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <MoveAgencyForm onMoved={handleAgencyMoved} />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <MoveHostForm onMoved={handleAdminMoved} />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default MoveLayout;