import React from 'react';
import {
  CFormLabel,
  CCol,
  CRow,
  CFormInput
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';

const AccountBasicInfoSection = ({mode, account, onChange }) => {
  return (
    <section className="mb-4">
      <div className="section-header mb-3">
        <h5 className="section-title">
          <CIcon icon={cilUser} className="me-2" />
          계정 정보
        </h5>
      </div>
      
      <CRow className="mb-3">
        <CFormLabel htmlFor="accName" className="col-sm-3 col-form-label">계정 이름</CFormLabel>
        <CCol sm={9}>
          <CFormInput 
            type="text" 
            id="accName" 
            name="accName"
            value={account.accName}
            placeholder="계정 이름 입력"
            required
            readOnly={mode === 'edit'}
            onChange={onChange}
          />
          <div className="form-text">이 계정을 식별하기 위한 이름을 입력하세요.</div>
        </CCol>
      </CRow>
    </section>
  );
};

export default AccountBasicInfoSection; 