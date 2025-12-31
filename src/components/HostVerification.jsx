import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import HostTable from './HostTable';
import Pagination from './Pagination';
import authService from '../services/services';

const HostVerification = () => {
  console.log('🔍 HostVerification component rendered at:', new Date().toISOString());

  const [searchTerm, setSearchTerm] = useState('');
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending hosts data
  useEffect(() => {
    console.log('🔄 HostVerification useEffect triggered at:', new Date().toISOString());

    const fetchPendingHosts = async () => {
      console.log('📡 Starting fetchPendingHosts function at:', new Date().toISOString());
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated first
        // console.log('HostVerification - Checking authentication...');
        // console.log('HostVerification - isAuthenticated:', authService.isAuthenticated());
        // console.log('HostVerification - token exists:', !!authService.getToken());
        // console.log('HostVerification - user type:', authService.getUserType());

        if (!authService.isAuthenticated()) {
          setError('Please login as a super admin to access this feature');
          setLoading(false);
          return;
        }

        // console.log('HostVerification - Calling getPendingHosts...');
        const result = await authService.getPendingHosts();
        // console.log('HostVerification - getPendingHosts result:', result);

        if (result.success) {
          // console.log('HostVerification - Success! Hosts loaded:', result.data?.length || 0);
          setHosts(result.data || []);
          setFilteredHosts(result.data || []);
        } else {
          // console.log('HostVerification - API call failed with error:', result.error);
          // console.log('HostVerification - Full result:', result);
          setError(result.error || 'Failed to fetch pending hosts');
          setHosts([]);
          setFilteredHosts([]);
        }
      } catch (err) {
        // console.error('HostVerification - Error in fetchPendingHosts:', err);
        // console.error('HostVerification - Error message:', err.message);
        // console.error('HostVerification - Error stack:', err.stack);
        setError(`Failed to fetch pending hosts: ${err.message}`);
        setHosts([]);
        setFilteredHosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingHosts();
  }, []);

  // Filter hosts based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredHosts(hosts);
    } else {
      const filtered = hosts.filter(host =>
        host.hostId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHosts(filtered);
    }
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [searchTerm, hosts]);

  // Calculate pagination
  const totalItems = filteredHosts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHosts = filteredHosts.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (hostId, newStatus) => {
    // Update both the original data and filtered data
    const updateHost = (hosts) =>
      hosts.map(host =>
        host.id === hostId ? { ...host, status: newStatus } : host
      );

    setHosts(prevHosts => updateHost(prevHosts));
    setFilteredHosts(prevHosts => updateHost(prevHosts));
  };

  try {
    return (
    <main className="flex-1 flex flex-col bg-gradient-to-b from-[#0d0d0d] to-[#121212] overflow-y-auto">
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Host Verification
            </h1>
            <p className="text-gray-400 text-sm">
              Review and manage host verification requests ({totalItems} total)
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by Host ID, name, or email..."
              className="
                block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg 
                bg-gray-800/50 text-gray-200 placeholder-gray-400 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent
                transition-all duration-200
              "
              aria-label="Search hosts"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Table Container */}
        <div className="flex-1 p-4 lg:p-6 pb-2 min-h-0">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F72585] mx-auto mb-4"></div>
                  <div className="text-gray-400 text-lg">Loading pending hosts...</div>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-red-400 text-lg mb-2">⚠️ Error loading hosts</div>
                  {/* <p className="text-gray-500 text-sm mb-4">{error}</p> */}
                  <div className="bg-gray-800/50 rounded-lg p-4 text-left max-w-md">
                    <div className="text-xs text-gray-400 mb-2">Debug Information:</div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>• Verify you're logged in as super admin</div>
                  </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#F72585] text-white rounded-lg hover:bg-[#F72585]/80 transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <HostTable
                hosts={currentHosts}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 px-4 lg:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </main>
  );
  } catch (error) {
    console.error('💥 HostVerification component error:', error);
    console.error('💥 Error stack:', error.stack);
    return (
      <main className="flex-1 flex flex-col bg-gradient-to-b from-[#0d0d0d] to-[#121212] overflow-y-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-red-400 text-lg mb-2">💥 Component Error</div>
            <p className="text-gray-500 text-sm mb-4">The HostVerification component encountered an error</p>
            <div className="bg-gray-800/50 rounded-lg p-4 text-left max-w-md">
              <div className="text-xs text-gray-400 mb-2">Error Details:</div>
              <div className="text-xs text-red-300">{error.message}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }
};

export default HostVerification;