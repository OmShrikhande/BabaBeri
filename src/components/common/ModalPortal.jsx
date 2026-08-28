import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders modals at document.body so they sit above the sidebar (avoids z-index stacking traps).
 */
const ModalPortal = ({ children, open }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(children, document.body);
};

export default ModalPortal;
