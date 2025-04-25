import React, { useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'
import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'

const BasicInfoCard = () => {
  // useProductActions()는 store의 상태와 액션 함수를 모두 반환합니다.
  const { commonInfo, 
    setCommonInfo, 
    selectedMainCategory, 
    productProvidedNotice, 
    selectedProductProvidedNotice, 
    setSelectedProductProvidedNotice 
  } = useProductStore();
  const { fetchProductProvidedNotice } = useNaverProductActions();

  useEffect(() => {
    if(selectedMainCategory){
      fetchProductProvidedNotice(selectedMainCategory.id);
    }
  }, [selectedMainCategory]);
  // 상품군 옵션 데이터

  // 공통 정보 변경 핸들러: 기존 commonInfo를 병합하여 업데이트
  const handleCommonInfoChange = (e) => {
    const { name, value } = e.target;
    setCommonInfo({ ...commonInfo, [name]: value });
  };

  const handleProductProvidedNoticeChange = (e) => {
    const { name, value } = e.target;
    const selectedNotice = productProvidedNotice.find(group => group.productInfoProvidedNoticeType === value);
    setSelectedProductProvidedNotice(selectedNotice);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>상품 주요 정보</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="g-3">
          {/* <CCol xs={12} md={6}>
            <CFormLabel htmlFor="brand" className="fw-semibold mb-1">브랜드</CFormLabel>
            <CFormInput 
              type="text" 
              id="brand" 
              name="brand"
              value={commonInfo.brand || ''}
              onChange={e=>handleCommonInfoChange(e)}
              placeholder="브랜드명 입력"
            />
          </CCol>
          <CCol xs={12} md={6}>
            <CFormLabel htmlFor="manufacturer" className="fw-semibold mb-1">제조사</CFormLabel>
            <CFormInput 
              type="text" 
              id="manufacture" 
              name="manufacture"
              value={commonInfo.manufacture || ''}
              onChange={e=>handleCommonInfoChange(e)}
              placeholder="제조사명 입력"
            />
          </CCol> */}
          <CCol xs={12}>
            <CFormLabel htmlFor="productGroup" className="fw-semibold mb-1">상품정보제공고시 - 상품군</CFormLabel>
            <CFormSelect
              id="productProvidedNotice"
              name="productProvidedNotice"
              value={selectedProductProvidedNotice?.productInfoProvidedNoticeType}
              onChange={e => handleProductProvidedNoticeChange(e)}
              disabled={!productProvidedNotice}
            >
              <option value="">선택해주세요</option>
              {productProvidedNotice?.length > 0 && productProvidedNotice.map((group) => (
                <option key={group.productInfoProvidedNoticeType} value={group.productInfoProvidedNoticeType}>
                  {group.productInfoProvidedNoticeTypeName}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default BasicInfoCard;
