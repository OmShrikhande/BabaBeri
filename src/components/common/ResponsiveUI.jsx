import React from 'react';

/** Standard page padding for dashboard content areas */
export const PagePadding = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden ${className}`}>
    {children}
  </div>
);

/** Label + value row for mobile data cards */
export const MobileCardRow = ({ label, value, mono = false }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{label}</p>
    <p
      className={`text-sm text-gray-200 truncate ${mono ? 'font-mono text-[#F72585]' : ''}`}
      title={typeof value === 'string' ? value : undefined}
    >
      {value ?? '—'}
    </p>
  </div>
);

/** Mobile list card container */
export const MobileDataCard = ({ children, onClick, className = '' }) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    className={`p-4 border-b border-gray-800 last:border-b-0 hover:bg-[#1A1A1A] transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

/** Horizontal scroll wrapper with mobile hint */
export const ScrollTableWrap = ({ children, className = '' }) => (
  <div className={`responsive-table-scroll ${className}`}>
    <p className="scroll-table-hint lg:hidden">Swipe horizontally to see more columns →</p>
    {children}
  </div>
);
