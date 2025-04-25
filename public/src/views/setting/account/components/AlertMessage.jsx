import React from 'react';
import { CAlert } from '@coreui/react';

const AlertMessage = ({ visible, color, message, onClose }) => {
  if (!visible) return null;
  
  return (
    <CAlert color={color} dismissible className="mb-4" onClose={onClose}>
      {message}
    </CAlert>
  );
};

export default AlertMessage; 