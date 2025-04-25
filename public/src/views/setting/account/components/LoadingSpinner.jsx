import React from 'react';
import { CSpinner } from '@coreui/react';

const LoadingSpinner = ({ message = '데이터를 불러오는 중입니다...' }) => {
  return (
    <div className="text-center my-5">
      <CSpinner color="primary" />
      <p className="mt-2 mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 