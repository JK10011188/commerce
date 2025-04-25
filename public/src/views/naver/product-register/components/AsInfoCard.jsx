import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { useProductStore } from '../../../../stores/useProductStore'

const AsInfoCard = () => {
  const { asInfo, setAsInfo } = useProductStore();

  const handleAsInfoChange = (e) => {
    const { name, value } = e.target;
    setAsInfo({ ...asInfo, [name]: value });
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>A/S 정보</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CFormLabel htmlFor="asNumber" className="col-sm-2 col-form-label">
            A/S 연락처
          </CFormLabel>
          <CCol sm={10}>
            <CFormInput
              type="text"
              id="asNumber"
              name="asNumber"
              value={asInfo.asNumber || ''}
              onChange={handleAsInfoChange}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CFormLabel htmlFor="asDescription" className="col-sm-2 col-form-label">
            A/S 안내
          </CFormLabel>
          <CCol sm={10}>
            <CFormTextarea
              id="asDescription"
              name="asDescription"
              value={asInfo.asDescription || ''}
              onChange={handleAsInfoChange}
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default AsInfoCard;
