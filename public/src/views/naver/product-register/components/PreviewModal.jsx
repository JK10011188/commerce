import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilXCircle } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'

const PreviewModal = () => {
  const { 
    tags, 
    previewModal, 
    setPreviewModal, 
    selectedCategory, 
    commonInfo, 
    products, 
    selectedProductAttributes, 
    asInfo, 
    deliveryInfo,
    detailImages,
    selectedMainCategory,
    selectedSubCategory,
    selectedDetailCategory,
    selectedMicroCategory,
  } = useProductStore();

  const { registerProduct } = useNaverProductActions();

  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const closePreviewModal = () => {
    setPreviewModal(false);
  };

  const handleSubmitFromModal = async () => {
    setIsLoading(true);
    try {
      await registerProduct();
      closePreviewModal();
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectedAttributes = () => {
    if (!selectedProductAttributes.length) {
      return (
        <div className="text-muted">
          <CIcon icon={cilXCircle} className="me-1" />
          선택된 상품 속성이 없습니다.
        </div>
      );
    }
    const groupedAttributes = selectedProductAttributes.reduce((acc, attr) => {
      const typeCode = attr.attributeTypeCode;
      if (!acc[typeCode]) {
        acc[typeCode] = {
          typeName: attr.attributeTypeCodeName,
          attributes: []
        };
      }
      acc[typeCode].attributes.push(attr);
      return acc;
    }, {});

    
    const renderAttributeValues = (attr) => {
      if(attr.selectedValue) {
        return (
          <span>
            {attr.values.find(v => v.attributeValueSeq == attr.selectedValue.rangeValue)?.minAttributeValue}{attr.representativeUnitCodeName? attr.representativeUnitCodeName : ""}
            ~ {attr.values.find(v => v.attributeValueSeq == attr.selectedValue.rangeValue)?.maxAttributeValue}{attr.representativeUnitCodeName? attr.representativeUnitCodeName : ""}
            <br/>
            (실제값 : {attr.selectedValue.attributeRealValue}{attr.representativeUnitCodeName? attr.representativeUnitCodeName : "" })
          </span>
        )
      }
      return null;
    }

    return (
      <div>
        {Object.entries(groupedAttributes).map(([typeCode, group]) => (
          <div key={typeCode} className="mb-3">
            <CTable responsive hover size="sm">
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '30%' }}>{group.typeName}속성</CTableHeaderCell>
                  <CTableHeaderCell>선택값</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {group.attributes.map(attr => (
                  <CTableRow key={attr.attributeSeq}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        {attr.attributeType === 'PRIMARY' && <span className="text-danger me-1">*</span>}
                        <strong>{attr.attributeName}</strong>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {attr.attributeClassificationType === 'MULTI_SELECT' ? (
                        <div className="d-flex flex-wrap gap-2">
                          {attr.selectedValues?.map(valueSeq => {
                            const value = attr.values.find(v => v.attributeValueSeq === valueSeq);
                            return value ? (
                              <CBadge key={valueSeq} color="info">
                                {value.minAttributeValue}
                              </CBadge>
                            ) : null;
                          })}
                        </div>
                      ) : attr.attributeClassificationType === 'RANGE' && attr.selectedValue? (
                        <>
                          {renderAttributeValues(attr)}
                        </> 
                      ) : (
                        <span>
                          {attr.values?.find(v => v.attributeValueSeq == attr.selectedValue)?.minAttributeValue}{attr.representativeUnitCodeName? attr.representativeUnitCodeName : ""}
                        </span>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CModal
      visible={previewModal}
      onClose={closePreviewModal}
      size="xl"
      backdrop="static"
      scrollable
    >
      <CModalHeader onClose={closePreviewModal}>
        <CModalTitle>상품 확인</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CCard className="mb-4">
          <CCardHeader>
            <h5>카테고리 정보</h5>
          </CCardHeader>
          <CCardBody>
            {selectedCategory ? (
              <div className="d-flex align-items-center">
                <strong className="me-2">선택된 카테고리:</strong>
                <div className="d-flex align-items-center">
                <CBadge color="success" className="py-2 px-3 fs-6">
                  {selectedMainCategory?.name} &gt; {selectedSubCategory?.name} &gt; {selectedDetailCategory?.name}
                  {selectedMicroCategory && ` > ${selectedMicroCategory.name}`}
                </CBadge>
                </div>
              </div>
            ) : (
              <div className="text-danger">
                <CIcon icon={cilXCircle} className="me-1" />
                카테고리가 선택되지 않았습니다.
              </div>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>태그</h5>
          </CCardHeader>
          <CCardBody>
            {tags?.length === 0 ? (
              <div className="text-muted">
                <CIcon icon={cilXCircle} className="me-1" />
                입력된 태그가 없습니다.
              </div>
            ) : (
              <div>
                {tags?.map((tag, index) => (
                  <CBadge color="info" className="me-2 mb-2" key={index}>
                    {tag}
                  </CBadge>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>상품 상세 이미지</h5>
          </CCardHeader>
          <CCardBody>
            {detailImages.length === 0 ? (
              <div className="text-muted">
                <CIcon icon={cilXCircle} className="me-1" />
                등록된 상세 이미지가 없습니다.
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {detailImages.map((image, index) => (
                  <div key={image.id} className="position-relative">
                    <CImage
                      rounded
                      thumbnail
                      src={image.preview}
                      width={200}
                      height={200}
                      alt={`상세 이미지 ${index + 1}`}
                    />
                    <div className="position-absolute top-0 start-0 bg-dark text-white px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>상품 속성</h5>
          </CCardHeader>
          <CCardBody>
            {renderSelectedAttributes()}
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>공통 정보</h5>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol sm={3}><strong>브랜드</strong></CCol>
              <CCol>{commonInfo.brand || '(입력되지 않음)'}</CCol>
            </CRow>
            <CRow>
              <CCol sm={3}><strong>제조사</strong></CCol>
              <CCol>{commonInfo.manufacture || '(입력되지 않음)'}</CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>AS 정보</h5>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol sm={3}><strong>AS 전화번호</strong></CCol>
              <CCol>{asInfo.asNumber || '(입력되지 않음)'}</CCol>
            </CRow>
            <CRow>
              <CCol sm={3}><strong>AS 안내</strong></CCol>
              <CCol>{asInfo.asDescription || '(입력되지 않음)'}</CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <h5>배송 정보</h5>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <CRow className="mb-3">
                  <CCol sm={4}><strong>배송 유형</strong></CCol>
                  <CCol sm={8}>
                    {deliveryInfo.deliveryType === 'DELIVERY' ? '택배' : 
                     deliveryInfo.deliveryType === 'DIRECT' ? '직접배송' : 
                     deliveryInfo.deliveryType === 'QUICK' ? '퀵배송' : '(입력되지 않음)'}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={4}><strong>출발일</strong></CCol>
                  <CCol sm={8}>
                    {deliveryInfo.deliveryAttributeType === 'TODAY' ? '오늘출발' : 
                     deliveryInfo.deliveryAttributeType === 'NORMAL' ? '일반출발' : '(입력되지 않음)'}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={4}><strong>배송사</strong></CCol>
                  <CCol sm={8}>
                    {deliveryInfo.deliveryCompany === 'CJGLS' ? '대한통운' : 
                     deliveryInfo.deliveryCompany === 'KGB' ? '로젠택배' : 
                     deliveryInfo.deliveryCompany === 'EPOST' ? '우체국택배' : 
                     deliveryInfo.deliveryCompany === 'REGISTPOST' ? '우편등기' : 
                     deliveryInfo.deliveryCompany === 'DIRECT' ? '직접배송' : '(입력되지 않음)'}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={4}><strong>배송비</strong></CCol>
                  <CCol sm={8}>
                    {deliveryInfo.deliveryFee?.deliveryFeeType === 'FREE' ? '무료배송' : 
                     deliveryInfo.deliveryFee?.deliveryFeeType === 'PAID' ? 
                     `${formatPrice(deliveryInfo.deliveryFee.baseFee)}원 (${deliveryInfo.deliveryFee.deliveryFeePayType === 'PREPAID' ? '선불' : '착불'})` : 
                     '(입력되지 않음)'}
                  </CCol>
                </CRow>
              </CCol>
              <CCol md={6}>
                {deliveryInfo.deliveryFee?.deliveryFeeByArea && (
                  <>
                    <CRow className="mb-3">
                      <CCol sm={4}><strong>제주도 추가 배송비</strong></CCol>
                      <CCol sm={8}>{formatPrice(deliveryInfo.deliveryFee.deliveryFeeByArea.area2extraFee)}원</CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm={4}><strong>도서산간 추가 배송비</strong></CCol>
                      <CCol sm={8}>{formatPrice(deliveryInfo.deliveryFee.deliveryFeeByArea.area3extraFee)}원</CCol>
                    </CRow>
                  </>
                )}
                {deliveryInfo.claimDeliveryInfo && (
                  <>
                    <CRow className="mb-3">
                      <CCol sm={4}><strong>반품 배송비</strong></CCol>
                      <CCol sm={8}>{formatPrice(deliveryInfo.claimDeliveryInfo.returnDeliveryFee)}원</CCol>
                    </CRow>
                    <CRow>
                      <CCol sm={4}><strong>교환 배송비</strong></CCol>
                      <CCol sm={8}>{formatPrice(deliveryInfo.claimDeliveryInfo.exchangeDeliveryFee)}원</CCol>
                    </CRow>
                  </>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {products.map((product, index) => (
          <CCard className="mb-4" key={product.id}>
            <CCardHeader>
              <h5>상품 정보 {index + 1} - {product.name || '이름 없음'}</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-4">
                <CCol sm={3}><strong>상품명</strong></CCol>
                <CCol>{product.name || '(입력되지 않음)'}
                {product.name && product.price && (
                  <div className="mt-2 text-muted small">
                    추가상품: '곧 세일 끝 하나 더!' - '{product.name}' ({new Intl.NumberFormat('ko-KR').format(product.price)}원)
                  </div>
                )}
                </CCol>
              </CRow>
              <CRow className="mb-4">
                <CCol sm={3}><strong>가격 정보</strong></CCol>
                <CCol>
                  <div className="d-flex gap-4">
                    <div>
                      <span className="text-muted">정상가:</span> {formatPrice(product.regularPrice)}원
                    </div>
                    <div>
                      <span className="text-muted">할인율:</span> {product.discountRate}%
                    </div>
                    <div>
                      <span className="text-muted">판매가:</span> {formatPrice(product.price)}원
                    </div>
                  </div>
                </CCol>
              </CRow>

              {/* 상품 이미지 */}
              <CRow className="mb-4">
                <CCol sm={3}><strong>상품 이미지</strong></CCol>
                <CCol>
                  <div className="d-flex gap-3">
                    {product.mainImage && (
                      <div className="position-relative">
                        <CImage
                          rounded
                          thumbnail
                          src={product.mainImage.preview}
                          width={200}
                          height={200}
                          alt="대표 이미지"
                        />
                        <div className="position-absolute top-0 start-0 bg-dark text-white px-2 py-1 rounded">
                          대표
                        </div>
                      </div>
                    )}
                    {product.additionalImages.map((image, idx) => (
                      <div key={image.id} className="position-relative">
                        <CImage
                          rounded
                          thumbnail
                          src={image.preview}
                          width={200}
                          height={200}
                          alt={`추가 이미지 ${idx + 1}`}
                        />
                        <div className="position-absolute top-0 start-0 bg-dark text-white px-2 py-1 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCol>
              </CRow>

              {/* 옵션 정보 */}
              <CRow className="mb-4">
                <CCol sm={3}><strong>옵션 정보</strong></CCol>
                <CCol>
                  {product.options && product.options.length > 0 ? (
                    <CTable size="sm">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>옵션명</CTableHeaderCell>
                          <CTableHeaderCell>옵션값</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {product.options.map((option) => (
                          option.values.map((value) => (
                            <CTableRow key={`${option.id}-${value.id}`}>
                              <CTableDataCell>{option.name}</CTableDataCell>
                              <CTableDataCell>{value.value}</CTableDataCell>
                            </CTableRow>
                          ))
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <div className="text-muted">등록된 옵션이 없습니다.</div>
                  )}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        ))}
      </CModalBody>
      <CModalFooter>
        <CButton 
          color="secondary" 
          onClick={closePreviewModal}
          disabled={isLoading}
        >
          닫기
        </CButton>
        <CButton 
          color="primary" 
          onClick={handleSubmitFromModal}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              등록 중...
            </>
          ) : (
            '상품등록'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default PreviewModal;
