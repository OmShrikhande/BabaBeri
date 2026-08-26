import React from 'react';
import FinancialInsightsSection from '../../components/FinancialInsightsSection';

const MasterAgencyFinancialPage = () => {
  return (
    <div className="p-6 space-y-8 bg-black/70 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Track revenue, profits, analytics and your goals</p>
      </div>

      <FinancialInsightsSection
        compact
        overviewHeadingId="ma-fin-heading"
        analyticsHeadingId="ma-analytics-heading"
      />
    </div>
  );
};

export default MasterAgencyFinancialPage;
