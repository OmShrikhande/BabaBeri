import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import UserActivationHeader from './components/UserActivationHeader';
import UserActivationResults from './components/UserActivationResults';
import UserActivationDetails from './components/UserActivationDetails';
import { userActivationRecords, userRoleFilters } from '../../data/userActivationData';
import { getStatusConfig } from './utils/statusConfig';

const identifierOptions = [
  { value: 'role', label: 'Role' },
  { value: 'name', label: 'Full Name' },
  { value: 'id', label: 'Unique ID' }
];

const DEFAULT_PAGE_SIZE = 10;

const UserActivationLayout = () => {
  const [identifierType, setIdentifierType] = useState(identifierOptions[0].value);
  const [query, setQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery('');
    setSelectedRecord(null);
    setCurrentPage(1);
    searchInputRef.current?.focus();
  }, [identifierType]);

  const buildSearchPlaceholder = (type) => {
    switch (type) {
      case 'role':
        return 'Search by role (e.g., Master Agency)';
      case 'name':
        return 'Search by full name or partial match';
      case 'id':
        return 'Search by unique identifier';
      default:
        return 'Enter search text';
    }
  };

  const filteredRecords = useMemo(() => {
    if (!query.trim()) {
      return userActivationRecords;
    }

    const normalizedQuery = query.trim().toLowerCase();

    return userActivationRecords.filter((record) => {
      switch (identifierType) {
        case 'role': {
          const roleLabel = userRoleFilters.find((option) => option.value === record.role)?.label;
          return (
            record.role.toLowerCase().includes(normalizedQuery) ||
            record.displayRole.toLowerCase().includes(normalizedQuery) ||
            roleLabel?.toLowerCase().includes(normalizedQuery)
          );
        }
        case 'name':
          return record.name.toLowerCase().includes(normalizedQuery);
        case 'id':
          return record.id.toLowerCase().includes(normalizedQuery);
        default:
          return false;
      }
    });
  }, [identifierType, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRecords.length, pageSize]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const handleResetFilters = () => {
    setQuery('');
    setSelectedRecord(null);
    setIdentifierType(identifierOptions[0].value);
    setCurrentPage(1);
    searchInputRef.current?.focus();
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setIsHistoryExpanded(true);
  };

  const handleStatusToggle = () => {
    if (!selectedRecord) return;

    const nextStatus = selectedRecord.status === 'active' ? 'suspended' : 'active';
    const historyEntry = {
      status: nextStatus,
      timestamp: new Date().toISOString(),
      actor: 'Super Admin'
    };

    setSelectedRecord((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        status: nextStatus,
        auditHistory: [historyEntry, ...(previous.auditHistory || [])]
      };
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-white flex flex-col">
      <UserActivationHeader
        identifierOptions={identifierOptions}
        identifierType={identifierType}
        onIdentifierChange={setIdentifierType}
        query={query}
        onQueryChange={setQuery}
        buildPlaceholder={buildSearchPlaceholder}
        searchInputRef={searchInputRef}
        onReset={handleResetFilters}
        totalMatches={filteredRecords.length}
        currentRoleFilter={identifierType === 'role' ? query.trim() : ''}
      />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <UserActivationResults
              records={paginatedRecords}
              totalRecords={filteredRecords.length}
              identifierType={identifierType}
              selectedRecordId={selectedRecord?.id || null}
              onSelectRecord={handleSelectRecord}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              searchQuery={query}
              statusResolver={getStatusConfig}
            />

            <UserActivationDetails
              record={selectedRecord}
              onToggleStatus={handleStatusToggle}
              isHistoryExpanded={isHistoryExpanded}
              onToggleHistory={() => setIsHistoryExpanded((value) => !value)}
              statusResolver={getStatusConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivationLayout;