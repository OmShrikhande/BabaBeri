import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import HostTable from './HostTable';
import Pagination from './Pagination';
import authService from '../services/services';
import { API_CONFIG } from '../config/api';

const HostDetails = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar state
  const [selectedHost, setSelectedHost] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarError, setSidebarError] = useState(null);

  // Fetch hosts data
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!authService.isAuthenticated()) {
          setError('Please login as a super admin to access this feature');
          setLoading(false);
          return;
        }

        const result = await authService.getPendingHosts();

        if (result.success) {
          setHosts(result.data || []);
          setFilteredHosts(result.data || []);
        } else {
          setError(result.error || 'Failed to fetch hosts');
          setHosts([]);
          setFilteredHosts([]);
        }
      } catch (err) {
        setError(`Failed to fetch hosts: ${err.message}`);
        setHosts([]);
        setFilteredHosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  // Filter for Accepted hosts
  useEffect(() => {
    const filtered = hosts.filter(host => {
        const status = host.status;
        return status === 'approved';
    });
    setFilteredHosts(filtered);
    setCurrentPage(1);
  }, [hosts]);

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
    setCurrentPage(1);
  };

  // Status change handler (if needed in future, currently just updates local state to reflect changes)
  const handleStatusChange = async (hostId, newStatus) => {
     // Implementation can be added if we want to allow changing status from here
     console.log('Status change requested:', hostId, newStatus);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleRowClick = async (host) => {
    setIsSidebarOpen(true);
    setSidebarLoading(true);
    setSidebarError(null);
    setSelectedHost(null);
    
    try {
      const result = await authService.getHostDetails(host.hostId);
      
      if (result.success) {
        setSelectedHost(result.data);
      } else {
        setSidebarError(result.error || 'Failed to fetch host details');
      }
    } catch (err) {
      setSidebarError(err.message || 'An error occurred fetching host details');
    } finally {
      setSidebarLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
    <main className="flex-1 flex flex-col bg-gradient-to-b from-[#0d0d0d] to-[#121212] overflow-y-auto w-full">
      {/* Header Section */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Accepted Hosts
            </h1>
            <p className="text-gray-400 text-sm">
              View and manage accepted hosts ({totalItems} total)
            </p>
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
                  <div className="text-gray-400 text-lg">Loading hosts...</div>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-red-400 text-lg mb-2">⚠️ Error loading hosts</div>
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
                onRowClick={handleRowClick}
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
    
    {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeSidebar}
        />
      )}

      {/* Right Sidebar */}
      <div className={`fixed inset-0 bg-gray-900 z-50 overflow-y-auto ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Host Details</h2>
                <button 
                    onClick={closeSidebar}
                    className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {sidebarLoading ? (
                 <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F72585] mb-4"></div>
                    <p className="text-gray-400">Loading details...</p>
                 </div>
            ) : sidebarError ? (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                    <p>{sidebarError}</p>
                 </div>
            ) : selectedHost ? (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Info</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block">Full Name</label>
                                <p className="text-gray-200">{selectedHost.name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Nationality</label>
                                    <p className="text-gray-200">{selectedHost.nationality}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block">Date of Birth</label>
                                    <p className="text-gray-200">{selectedHost.dateOfBirth}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block">Email</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-200 break-all">{selectedHost.email}</p>
                                    {selectedHost.emailstatus && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedHost.emailstatus === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {selectedHost.emailstatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-500 block">WhatsApp</label>
                                <p className="text-gray-200">{selectedHost.whatsappNumber}</p>
                            </div>
                        </div>
                    </div>

                     {/* System Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">System Info</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block">User Code</label>
                                <code className="text-[#F72585] font-mono">{selectedHost.usercode}</code>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block">Agency Code</label>
                                <code className="text-[#7209B7] font-mono">{selectedHost.agencycode}</code>
                            </div>
                             <div>
                                <label className="text-xs text-gray-500 block">Status</label>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${['approved', 'accepted', 'active'].includes(selectedHost.status?.toLowerCase()) ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {selectedHost.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Documents */}
                     <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Documents</h3>
                        
                        {selectedHost.aadhaarNumber && (
                             <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-3">
                                <label className="text-xs text-gray-500 block">Aadhaar Number</label>
                                <p className="text-gray-200 font-mono tracking-wider">{selectedHost.aadhaarNumber}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {selectedHost.document1Path && (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-2">Document 1</label>
                                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group">
                                        <img 
                                            src={selectedHost.document1Path.startsWith('http') ? selectedHost.document1Path : `${API_CONFIG.BASE_URL}${selectedHost.document1Path}`} 
                                            alt="Document 1" 
                                            className="w-full h-full object-cover"
                                        />
                                        <a 
                                            href={selectedHost.document1Path.startsWith('http') ? selectedHost.document1Path : `${API_CONFIG.BASE_URL}${selectedHost.document1Path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-white text-sm font-medium">View Full Size</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                            
                            {selectedHost.document2Path && (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-2">Document 2</label>
                                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group">
                                        <img 
                                            src={selectedHost.document2Path.startsWith('http') ? selectedHost.document2Path : `${API_CONFIG.BASE_URL}${selectedHost.document2Path}`} 
                                            alt="Document 2" 
                                            className="w-full h-full object-cover"
                                        />
                                         <a 
                                            href={selectedHost.document2Path.startsWith('http') ? selectedHost.document2Path : `${API_CONFIG.BASE_URL}${selectedHost.document2Path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-white text-sm font-medium">View Full Size</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export default HostDetails;