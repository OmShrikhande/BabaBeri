import React, { useState, useEffect } from 'react';
import { Building, Users, Mic, Hash } from 'lucide-react';
import MetricsCard from './MetricsCard';
import LoadingCard from './LoadingCard';
import StatusBadge from './StatusBadge';
import authService from '../services/authService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    masterAgencies: 0,
    agencies: 0,
    hosts: 0
  });
  const [masterAgencies, setMasterAgencies] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const info = authService.getUserInfo();
        if (!ignore) {
          setUserInfo(info);
        }

        const adminCode = authService.extractUserCode(info);

        // Fetch metrics
        const [masterAgencyCount, agencyCount, hostCount, masterAgenciesData] = await Promise.all([
          authService.countByRole('MASTER_AGENCY'),
          authService.countByRole('AGENCY'),
          authService.countByRole('HOST'),
          adminCode ? authService.getAllSubUserByCode(adminCode, 'MASTER_AGENCY') : Promise.resolve({ success: true, data: [] })
        ]);

        if (ignore) return;

        setMetrics({
          masterAgencies: masterAgencyCount?.data?.count ?? 0,
          agencies: agencyCount?.data?.count ?? 0,
          hosts: hostCount?.data?.count ?? 0
        });

        if (masterAgenciesData.success) {
          const list = Array.isArray(masterAgenciesData.data) ? masterAgenciesData.data : [];
          setMasterAgencies(list);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching admin dashboard data:', err);
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/50">
                Admin
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {userInfo?.username || userInfo?.name || 'Admin'}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-400">⚠</div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <MetricsCard
                title="Master Agencies"
                value={metrics.masterAgencies}
                icon="Building"
                color="purple"
              />
              <MetricsCard
                title="Agencies"
                value={metrics.agencies}
                icon="Users"
                color="blue"
              />
              <MetricsCard
                title="Hosts"
                value={metrics.hosts}
                icon="Mic"
                color="pink"
              />
              <MetricsCard
                title="My Code"
                value={authService.extractUserCode(userInfo) || 'N/A'}
                icon="Hash"
                color="cyan"
              />
            </>
          )}
        </div>

        {/* Master Agencies Table */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Master Agencies</h2>
            <p className="text-gray-400 text-sm mt-1">Manage your master agencies</p>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : masterAgencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No master agencies found</p>
              <p className="text-gray-600 text-sm mt-1">Master agencies will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">#</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Name</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Code</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {masterAgencies.map((agency, index) => (
                    <tr key={agency.id || index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white">{index + 1}</td>
                      <td className="px-6 py-4 text-white">{agency.name || agency.username || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-800 text-gray-300">
                          {authService.extractUserCode(agency) || agency.code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={agency.status || 'active'} />
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-2 transition-all border border-gray-700">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
