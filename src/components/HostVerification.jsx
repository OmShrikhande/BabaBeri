import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import HostTable from './HostTable';
import Pagination from './Pagination';
import { hostVerificationData } from '../data/hostVerificationData';

const HostVerification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHosts, setFilteredHosts] = useState(hostVerificationData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filter hosts based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredHosts(hostVerificationData);
    } else {
      const filtered = hostVerificationData.filter(host =>
        host.hostId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHosts(filtered);
    }
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [searchTerm]);

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
    
    setFilteredHosts(prevHosts => updateHost(prevHosts));
  };

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
            <HostTable 
              hosts={currentHosts}
              onStatusChange={handleStatusChange}
            />
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
};

export default HostVerification;