import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import GoalsCard from '../../components/GoalsCard';
import authService from '../../services/authService';

const AgencyGoals = () => {
  const [metrics, setMetrics] = useState({
    hosts: { current: 0, target: 10 }
  });

  useEffect(() => {
    let ignore = false;
    const fetchGoals = async () => {
      try {
        const countRes = await authService.countByRole('HOST');
        if (!ignore && countRes?.data?.count !== undefined) {
          setMetrics(prev => ({
            ...prev,
            hosts: { ...prev.hosts, current: countRes.data.count }
          }));
        }
      } catch (err) {
        console.error('Failed to fetch agency goals', err);
      }
    };
    fetchGoals();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="mb-6">
      <GoalsCard
        title="Agency Goals"
        icon={Target}
        metrics={[
          { label: 'Minimum Diamonds', current: 0, target: 10000, color: 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' },
          { label: 'Minimum Hosts', current: metrics.hosts.current, target: metrics.hosts.target, color: 'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]' }
        ]}
      />
    </div>
  );
};

export default AgencyGoals;
