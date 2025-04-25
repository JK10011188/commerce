import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CCol,
  CFormLabel,
  CRow,
} from '@coreui/react'
import useCoupangStore from '../../../../stores/useCoupangStore'

const BasicInfo = () => {
  const { basicInfo, setBasicInfo } = useCoupangStore()

  const handleChange = (field, value) => {
    setBasicInfo(field, value)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>기본 정보</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="g-3">
          <CCol xs={12} md={6}>
            <CFormLabel htmlFor="brand" className="fw-semibold mb-1">브랜드</CFormLabel>
            <CFormInput
              type="text" 
              id="brand" 
              name="brand"
              value={basicInfo.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="브랜드명 입력"
            />
          </CCol>
          <CCol xs={12} md={6}>
            <CFormLabel htmlFor="manufacturer" className="fw-semibold mb-1">제조사</CFormLabel>
            <CFormInput
              type="text" 
              id="brand" 
              name="manufacturer"
              value={basicInfo.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="제조사명 입력"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default BasicInfo 