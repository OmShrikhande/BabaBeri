import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import GoalsCard from '../../components/GoalsCard';
import authService from '../../services/authService';

const AdminGoals = () => {
  const [metrics, setMetrics] = useState({
    masterAgencies: { current: 0, target: 5 }
  });

  useEffect(() => {
    let ignore = false;
    const fetchGoals = async () => {
      try {
        const countRes = await authService.countByRole('MASTER_AGENCY');
        if (!ignore && countRes?.data?.count !== undefined) {
          setMetrics(prev => ({
            ...prev,
            masterAgencies: { ...prev.masterAgencies, current: countRes.data.count }
          }));
        }
      } catch (err) {
        console.error('Failed to fetch admin goals', err);
      }
    };
    fetchGoals();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="mb-6">
      <GoalsCard
        title="Admin Goals"
        icon={Target}
        metrics={[
          { label: 'Minimum Diamonds', current: 0, target: 10000, color: 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' },
          { label: 'Minimum Master Agencies', current: metrics.masterAgencies.current, target: metrics.masterAgencies.target, color: 'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]' }
        ]}
      />
    </div>
  );
};

export default AdminGoals;
