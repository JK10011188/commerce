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
  cilUser, 
  cilShieldAlt
} from '@coreui/icons';

const CoupangApiSection = ({ account, onChange, showSecretKey, onToggleSecretKey }) => {
  return (
    <section className="mb-4">
      <div className="section-header mb-3">
        <h5 className="section-title">
          <CIcon icon={cilShieldAlt} className="me-2" />
          쿠팡 API 설정
        </h5>
      </div>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="coupangLoginId" className="col-sm-3 col-form-label">쿠팡 로그인 ID</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilUser} />
            </CInputGroupText>
            <CFormInput 
              type="text" 
              id="coupangLoginId" 
              name="cp_id"
              value={account.cp_id}
              onChange={onChange}
              placeholder="쿠팡 로그인 ID 입력"
            />
          </CInputGroup>
        </CCol>
      </CRow>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="coupangVendorId" className="col-sm-3 col-form-label">쿠팡 업체코드</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSettings} />
            </CInputGroupText>
            <CFormInput 
              type="text" 
              id="coupangVendorId" 
              name="cp_code"
              value={account.cp_code}
              onChange={onChange}
              placeholder="쿠팡 업체코드 입력"
            />
          </CInputGroup>
        </CCol>
      </CRow>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="coupangAccessKey" className="col-sm-3 col-form-label">쿠팡 Access Key</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput 
              type="text" 
              id="coupangAccessKey" 
              name="cp_ak"
              value={account.cp_ak}
              onChange={onChange}
              placeholder="쿠팡 API Access Key 입력"
            />
          </CInputGroup>
        </CCol>
      </CRow>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="coupangSecretKey" className="col-sm-3 col-form-label">쿠팡 Secret Key</CFormLabel>
        <CCol sm={9}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilLockLocked} />
            </CInputGroupText>
            <CFormInput 
              type={showSecretKey ? "text" : "password"}
              id="coupangSecretKey" 
              name="cp_sk"
              value={account.cp_sk}
              onChange={onChange}
              placeholder="쿠팡 API Secret Key 입력"
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

export default CoupangApiSection; 