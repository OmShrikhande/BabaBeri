import React from 'react';
import { Info, UserCheck } from 'lucide-react';
import Pagination from '../../Pagination';
import { formatRoleLabel } from '../utils/roleHelpers';

const UserActivationResults = ({
  records,
  totalRecords,
  identifierType,
  selectedRecordId,
  onSelectRecord,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  statusResolver
}) => {
  const renderIdentifierSummary = (record) => {
    if (identifierType === 'role') {
      return formatRoleLabel(record.role);
    }

    if (identifierType === 'name') {
      return record.name;
    }

    return record.id;
  };

  return (
    <section className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl shadow-black/30 flex flex-col">
      <ul className="divide-y divide-gray-800 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {records.map((record) => {
          const isSelected = selectedRecordId === record.id;
          const status = statusResolver(record.status);

          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => onSelectRecord(record)}
                className={`w-full text-left px-5 sm:px-6 py-4 transition-all duration-300 hover:bg-[#181818]
                  ${isSelected ? 'bg-gradient-to-r from-[#F72585]/15 to-[#7209B7]/15 border-l-4 border-[#F72585]' : 'border-l-4 border-transparent'}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-white">{record.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRoleLabel(record.role)} · {record.region}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] sm:text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {renderIdentifierSummary(record)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        {record.coins.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 py-1 border rounded-full ${status.badgeClass}`}
                  >
                    <status.icon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>
              </button>
            </li>
          );
        })}

        {records.length === 0 && (
          <li className="px-5 sm:px-6 py-8 text-center text-sm text-gray-400">
            {searchQuery
              ? 'No records match your search criteria.'
              : 'No records available.'}
          </li>
        )}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={pageSize}
        onPageChange={onPageChange}
        onItemsPerPageChange={onPageSizeChange}
      />
    </section>
  );
};

export default UserActivationResults;