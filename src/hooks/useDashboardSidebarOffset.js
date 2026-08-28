import { useEffect } from 'react';

const LG_MEDIA = '(min-width: 1024px)';
export const DASHBOARD_SIDEBAR_WIDTH = '18rem';

/**
 * Sets --dashboard-sidebar-width on :root so portaled modals align with main content on lg+ screens.
 */
export function useDashboardSidebarOffset(isOpen, width = DASHBOARD_SIDEBAR_WIDTH) {
  useEffect(() => {
    const mq = window.matchMedia(LG_MEDIA);

    const apply = () => {
      const offset = mq.matches && isOpen ? width : '0px';
      document.documentElement.style.setProperty('--dashboard-sidebar-width', offset);
    };

    apply();
    mq.addEventListener('change', apply);
    window.addEventListener('resize', apply);

    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('resize', apply);
      document.documentElement.style.removeProperty('--dashboard-sidebar-width');
    };
  }, [isOpen, width]);
}

export function closeSidebarOnMobile(setSidebarOpen) {
  if (window.matchMedia('(max-width: 1023px)').matches) {
    setSidebarOpen(false);
  }
}
