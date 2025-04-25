import React, { useState } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CSpinner
} from '@coreui/react';
import AccountBasicInfoSection from './AccountModalSections/AccountBasicInfoSection';
import CoupangApiSection from './AccountModalSections/CoupangApiSection';
import NaverApiSection from './AccountModalSections/NaverApiSection';

const AccountModal = ({ 
  visible, 
  title, 
  mode, 
  account, 
  onClose, 
  onSave, 
  onChange, 
  isLoading 
}) => {
  const [showSecretKeys, setShowSecretKeys] = useState({
    coupangSecretKey: false,
    naverSecretKey: false
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...account, [name]: value });
  };
  
  const toggleSecretKeyVisibility = (keyName) => {
    setShowSecretKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  if (!account) return null;
  
  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" keyboard={true} size="lg">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <AccountBasicInfoSection mode={mode} account={account} onChange={handleInputChange} />
          <CoupangApiSection 
            mode={mode}
            account={account}
            onChange={handleInputChange}
            showSecretKey={showSecretKeys.coupangSecretKey}
            onToggleSecretKey={() => toggleSecretKeyVisibility('coupangSecretKey')}
          />
          <NaverApiSection 
            account={account}
            onChange={handleInputChange}
            showSecretKey={showSecretKeys.naverSecretKey}
            onToggleSecretKey={() => toggleSecretKeyVisibility('naverSecretKey')}
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>취소</CButton>
        <CButton color="primary" onClick={onSave} disabled={isLoading}>
          {isLoading ? (<><CSpinner size="sm" className="me-2" /> 저장 중...</>) : (mode === 'add' ? '계정 추가' : '변경사항 저장')}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AccountModal;
