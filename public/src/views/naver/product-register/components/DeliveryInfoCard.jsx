import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'

const DeliveryInfoCard = () => {
  const { deliveryInfo, setDeliveryInfo } = useNaverProductActions();

  const handleDeliveryCheckChange = (e) => {
    const { name, checked } = e.target;
    setDeliveryInfo({ ...deliveryInfo, [name]: checked });
  };

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({ ...deliveryInfo, [name]: value });
  };

  const handleNumberKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!(e.key >= '0' && e.key <= '9') && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>배송 정보</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol sm={12}>
            <CFormCheck
              id="isFreeShipping"
              name="isFreeShipping"
              label="무료배송"
              checked={deliveryInfo.isFreeShipping}
              onChange={handleDeliveryCheckChange}
            />
          </CCol>
        </CRow>
        {!deliveryInfo.isFreeShipping && (
          <CRow className="mb-3">
            <CFormLabel htmlFor="shippingFee" className="col-sm-2 col-form-label">
              배송비
            </CFormLabel>
            <CCol sm={4}>
              <CInputGroup>
                <CFormInput
                  type="text"
                  id="shippingFee"
                  name="shippingFee"
                  value={deliveryInfo.shippingFee}
                  onChange={handleDeliveryInputChange}
                  onKeyDown={handleNumberKeyDown}
                  placeholder="2,500"
                />
                <CInputGroupText>원</CInputGroupText>
              </CInputGroup>
            </CCol>
            <CFormLabel htmlFor="returnShippingFee" className="col-sm-2 col-form-label">
              반품 배송비
            </CFormLabel>
            <CCol sm={4}>
              <CInputGroup>
                <CFormInput
                  type="text"
                  id="returnShippingFee"
                  name="returnShippingFee"
                  value={deliveryInfo.returnShippingFee}
                  onChange={handleDeliveryInputChange}
                  onKeyDown={handleNumberKeyDown}
                  placeholder="5,000"
                />
                <CInputGroupText>원</CInputGroupText>
              </CInputGroup>
            </CCol>
          </CRow>
        )}
        <CRow className="mb-3">
          <CFormLabel htmlFor="exchangeShippingFee" className="col-sm-2 col-form-label">
            교환 배송비
          </CFormLabel>
          <CCol sm={4}>
            <CInputGroup>
              <CFormInput
                type="text"
                id="exchangeShippingFee"
                name="exchangeShippingFee"
                value={deliveryInfo.exchangeShippingFee}
                onChange={handleDeliveryInputChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="5,000"
              />
              <CInputGroupText>원</CInputGroupText>
            </CInputGroup>
          </CCol>
          <CFormLabel htmlFor="islandExtraFee" className="col-sm-2 col-form-label">
            도서산간 추가비용
          </CFormLabel>
          <CCol sm={4}>
            <CInputGroup>
              <CFormInput
                type="text"
                id="islandExtraFee"
                name="islandExtraFee"
                value={deliveryInfo.islandExtraFee}
                onChange={handleDeliveryInputChange}
                onKeyDown={handleNumberKeyDown}
                placeholder="3,000"
              />
              <CInputGroupText>원</CInputGroupText>
            </CInputGroup>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default DeliveryInfoCard;
