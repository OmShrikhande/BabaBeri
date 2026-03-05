import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import GoalsCard from '../../components/GoalsCard';
import authService from '../../services/authService';

const MasterAgencyGoals = () => {
  const [metrics, setMetrics] = useState({
    agencies: { current: 0, target: 10 }
  });

  useEffect(() => {
    let ignore = false;
    const fetchGoals = async () => {
      try {
        const countRes = await authService.countByRole('AGENCY');
        if (!ignore && countRes?.data?.count !== undefined) {
          setMetrics(prev => ({
            ...prev,
            agencies: { ...prev.agencies, current: countRes.data.count }
          }));
        }
      } catch (err) {
        console.error('Failed to fetch master agency goals', err);
      }
    };
    fetchGoals();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="mb-6">
      <GoalsCard
        title="Master Agency Goals"
        icon={Target}
        metrics={[
          { label: 'Minimum Diamonds', current: 0, target: 10000, color: 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' },
          { label: 'Minimum Agencies', current: metrics.agencies.current, target: metrics.agencies.target, color: 'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]' }
        ]}
      />
    </div>
  );
};

export default MasterAgencyGoals;
