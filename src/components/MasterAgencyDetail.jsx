import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Diamond, Search, ChevronDown, MoreVertical } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import EntityMovementModal from './EntityMovementModal';
import authService from '../services/authService';
import { APP_CONFIG } from '../config/api';

const ownerBase = `/${APP_CONFIG.OWNER_SECRET_PATH}`;

const MasterAgencyDetail = ({ currentUser }) => {
  const { adminCode, masterAgencyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const onBack = () => navigate(-1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [apiAgencies, setApiAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const masterAgencyName = location.state?.name || masterAgencyId || 'Master Agency';
  const adminName = location.state?.adminName || adminCode || 'Admin';
  const maCode = String(masterAgencyId || '').replace(/^#/, '');

  useEffect(() => {
    let ignore = false;
    const fetchAgencies = async () => {
      if (!maCode) return;
      setLoading(true);
      setError(null);
      try {
        const res = await authService.getAllSubUserByCode(maCode, 'AGENCY');
        if (!ignore) {
          if (res.success) {
            const dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.result || []);
            const mapped = dataList.map((item, idx) => {
              const agencyId = authService.extractUserCode(item) || item.agencyId || '';
              return {
                id: item.id || item._id || agencyId || idx,
                name: item.name || item.username || 'Agency',
                agencyId,
                totalHosts: item.totalHosts || item.hostsCount || item.hosts || 0,
                myEarning: item.earning || item.myEarning || 0,
                redeemed: item.redeemed || item.redeem || 0,
                coins: item.coins || 0,
                diamond: item.diamond || item.totaldiamonds || 0,
              };
            }).filter((a) => a.agencyId);
            setApiAgencies(mapped);
          } else {
            setError(res.error || 'Failed to fetch agencies');
            setApiAgencies([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An error occurred');
          setApiAgencies([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchAgencies();
    return () => { ignore = true; };
  }, [maCode]);

  const stats = useMemo(() => apiAgencies.reduce((acc, curr) => ({
    totalDiamonds: acc.totalDiamonds + (Number(curr.diamond) || 0),
    totalCoins: acc.totalCoins + (Number(curr.coins) || 0),
    totalRedeem: acc.totalRedeem + (Number(curr.redeemed) || 0),
    hostCount: acc.hostCount + (Number(curr.totalHosts) || 0),
  }), { totalDiamonds: 0, totalCoins: 0, totalRedeem: 0, hostCount: 0 }), [apiAgencies]);

  const filteredAgencies = apiAgencies.filter(agency =>
    (agency.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(agency.agencyId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAgency = (agency) => {
    const code = agency.agencyId || agency.id;
    navigate(`${ownerBase}/sub-admins/${encodeURIComponent(adminCode)}/${encodeURIComponent(maCode)}/${encodeURIComponent(code)}`, {
      state: { name: agency.name, masterAgencyName, adminName },
    });
  };

  const handleMoveEntity = (agency) => {
    setSelectedAgency({
      ...agency,
      currentParent: masterAgencyName
    });
    setShowMovementModal(true);
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-y-auto flex flex-col">
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-gray-400 text-sm">
            {adminName} / <span className="text-white">{masterAgencyName}</span>
            <span className="ml-2 font-mono text-xs text-gray-500">{maCode}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Agencies</p>
            <span className="text-xl font-bold text-white">{apiAgencies.length}</span>
          </div>
          <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Hosts</p>
            <span className="text-xl font-bold text-white">{stats.hostCount}</span>
          </div>
          <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Diamonds</p>
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 text-blue-400" />
              <span className="text-xl font-bold text-white">{stats.totalDiamonds.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Coins</p>
            <span className="text-xl font-bold text-white">{stats.totalCoins.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-white">List of Agencies</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] w-64"
              />
            </div>
          </div>

          <div className="bg-[#0A0A0A] border-b border-gray-800">
            <div className="grid grid-cols-6 gap-8 px-6 py-4">
              <div className="text-gray-400 font-bold text-sm uppercase">Agency Name</div>
              <div className="text-gray-400 font-bold text-sm uppercase">Agency Code</div>
              <div className="text-gray-400 font-bold text-sm uppercase">Hosts</div>
              <div className="text-gray-400 font-bold text-sm uppercase">Earning</div>
              <div className="text-gray-400 font-bold text-sm uppercase">Redeemed</div>
              {currentUser?.userType === 'super-admin' && (
                <div className="text-gray-400 font-bold text-sm uppercase">Actions</div>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {loading && <div className="px-6 py-8 text-gray-400 text-center">Loading agencies...</div>}
            {!loading && error && <div className="px-6 py-8 text-red-400 text-center">{error}</div>}
            {!loading && !error && filteredAgencies.map((agency, index) => (
              <div
                key={agency.agencyId || agency.id}
                role="button"
                tabIndex={0}
                onClick={() => openAgency(agency)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openAgency(agency);
                  }
                }}
                className="grid grid-cols-6 gap-8 px-6 py-5 hover:bg-[#222222] transition-all duration-200 group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors" />
                  <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors">
                    {agency.name}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{agency.agencyId}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{agency.totalHosts}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                  <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{agency.myEarning}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                  <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{agency.redeemed}</span>
                </div>
                {currentUser?.userType === 'super-admin' && (
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveEntity(agency);
                      }}
                      className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                      title="Move agency"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!loading && !error && filteredAgencies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-10 h-10 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">No agencies found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm ? 'No agencies match your search.' : 'This master agency has no agencies yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMovementModal && selectedAgency && (
        <EntityMovementModal
          isOpen={showMovementModal}
          onClose={() => {
            setShowMovementModal(false);
            setSelectedAgency(null);
          }}
          entityType="agency"
          entityData={selectedAgency}
          availableTargets={[]}
          onMove={() => {
            setShowMovementModal(false);
            setSelectedAgency(null);
          }}
        />
      )}
    </div>
  );
};

export default MasterAgencyDetail;
