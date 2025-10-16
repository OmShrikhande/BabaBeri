import React from 'react';
import PropTypes from 'prop-types';
import Toast from './Toast';

const ToastList = ({ toasts, removeToast }) => (
  <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        id={toast.id}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onRemove={removeToast}
      />
    ))}
  </div>
);

ToastList.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning']),
      duration: PropTypes.number,
    })
  ).isRequired,
  removeToast: PropTypes.func.isRequired,
};

export default ToastList;