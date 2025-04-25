import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import useCoupangStore from '../../../../stores/useCoupangStore'

const ProductNotice = () => {
  const { productNotices, selectedProductNotice, setSelectedProductNotice, } = useCoupangStore()

  const onChangeProductNotice = (e) => {
    const selectedNotice = productNotices.find(noti => noti.name === e.target.value);
    setSelectedProductNotice(selectedNotice)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>상품정보제공고시</strong>
      </CCardHeader>
      <CCardBody>
        <CFormSelect
          value={selectedProductNotice?.name || ''}
          onChange={(e) => onChangeProductNotice(e)}
          className="w-100"
        >
          <option value="">상품 유형을 선택해주세요</option>
          {productNotices.map((noti) => (
            <option key={noti.name} value={noti.name}>
              {noti.name}
            </option>
          ))}
        </CFormSelect>
      </CCardBody>
    </CCard>
  )
}

export default ProductNotice 