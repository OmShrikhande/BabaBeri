/**
 * Sidebar: overlay drawer below lg, push layout on lg+ (content width adjusts).
 */
export function getDashboardAsideClasses(isOpen) {
  return [
    'fixed lg:relative left-0 top-0 h-full shrink-0 bg-[#121212]',
    'w-[min(100vw-1rem,18rem)] sm:w-72',
    'transform transition-all duration-300 z-50 lg:z-auto flex flex-col',
    'max-lg:shadow-2xl border-r border-gray-800',
    isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
    'lg:translate-x-0',
    isOpen ? 'lg:w-72' : 'lg:w-0 lg:overflow-hidden lg:border-r-0',
  ].join(' ');
}

export const DASHBOARD_MODAL_OVERLAY =
  'fixed inset-0 z-[200] lg:left-[var(--dashboard-sidebar-width,0px)] transition-[left] duration-300 flex items-center justify-center p-3 sm:p-4';
