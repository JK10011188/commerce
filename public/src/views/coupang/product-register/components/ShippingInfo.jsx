import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CAlert,
} from '@coreui/react'
import useCoupangStore from '../../../../stores/useCoupangStore'

const ShippingInfo = () => {
  const { shippingDays, setShippingDays } = useCoupangStore()

  const handleChange = (e) => {
    const value = e.target.value
    if (value === '' || /^\d+$/.test(value)) {
      setShippingDays(value)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>출고 소요일</strong>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex align-items-center gap-2">
          <CFormInput
            type="text"
            value={shippingDays}
            onChange={handleChange}
            className="w-25"
            placeholder="일"
          />
          <span className="text-muted">일</span>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default ShippingInfo 