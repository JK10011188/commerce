import React from 'react';
import {
  CFormLabel,
  CCol,
  CRow,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilLockLocked, 
  cilSettings, 
  cilShieldAlt
} from '@coreui/icons';

const NaverApiSection = ({ account, onChange, showSecretKey, onToggleSecretKey }) => {
  return (
    <section className="mb-4">
      <div className="section-header mb-3">
        <h5 className="section-title">
          <CIcon icon={cilShieldAlt} className="me-2" />
          네이버 API 설정
        </h5>
      </div>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="naverAppId" className="col-sm-3 col-form-label">네이버 APP ID</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSettings} />
            </CInputGroupText>
            <CFormInput 
              type="text" 
              id="naverAppId" 
              name="n_id"
              value={account.n_id}
              onChange={onChange}
              placeholder="네이버 APP ID 입력"
            />
          </CInputGroup>
        </CCol>
      </CRow>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="naverSecretKey" className="col-sm-3 col-form-label">네이버 Secret Key</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput 
              type={showSecretKey ? "text" : "password"}
              id="naverSecretKey" 
              name="n_sk"
              value={account.n_sk}
              onChange={onChange}
              placeholder="네이버 Secret Key 입력"
            />
            <CButton
              type="button"
              color="secondary"
              variant="outline"
              onClick={onToggleSecretKey}
            >
              {showSecretKey ? '숨기기' : '보기'}
            </CButton>
          </CInputGroup>
        </CCol>
      </CRow>
    </section>
  );
};

export default NaverApiSection; 