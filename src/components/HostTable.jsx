import React from 'react';
import TableRow from './TableRow';

const HostTable = ({ hosts, onStatusChange, onRowClick }) => {
  if (!hosts || hosts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No hosts found</div>
          <p className="text-gray-500 text-sm">
            Try adjusting your search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="hidden lg:block flex-shrink-0">
        <div className="grid grid-cols-10 gap-3 py-3 px-4 border-b border-gray-700 bg-gray-800/30 rounded-t-xl ">
          <div className="col-span-4 text-center">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Host Name
            </h3>
          </div>
          <div className="col-span-2 text-center">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Host ID
            </h3>
          </div>
          <div className="col-span-2 text-center">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Status
            </h3>
          </div>
          <div className="col-span-2 text-center">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Nationality
            </h3>
          </div>
          {/* <div className="col-span-2 text-center">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
              Action
            </h3>
          </div> */}
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 table-scroll-container min-h-0">
        <div className="divide-y divide-gray-800">
          {hosts.map((host) => (
            <TableRow
              key={host.id}
              host={host}
              onStatusChange={onStatusChange}
              onView={onRowClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostTable;