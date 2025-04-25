import React from 'react';
import { CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilPlus } from '@coreui/icons';

const EmptyAccountView = ({ onAddAccount }) => {
  return (
    <div className="text-center my-5 py-5">
      <CIcon icon={cilUser} size="3xl" className="text-muted mb-3" />
      <h5 className="text-muted">등록된 계정이 없습니다</h5>
      <p className="text-muted mb-4">새 계정을 추가하여 API 서비스를 이용해보세요.</p>
      <CButton 
        color="primary" 
        size="lg"
        onClick={onAddAccount}
      >
        <CIcon icon={cilPlus} className="me-2" />
        새 계정 추가하기
      </CButton>
    </div>
  );
};

export default EmptyAccountView; 