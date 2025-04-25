import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CButton,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilChevronTop, cilChevronBottom, cilTrash } from '@coreui/icons'
import useCoupangStore from '../../../../stores/useCoupangStore'
import ProductImageUploader from './ProductImageUploader'

const ProductList = () => {
  const { products, addProduct, updateProduct, removeProduct, setBasicInfo, attributes } = useCoupangStore()
  const [isDefault, setIsDefault] = useState(true)

  const handleToggleExpand = (productId) => {
    updateProduct(productId, 'isExpanded', !products.find(p => p.id === productId).isExpanded)
  }

  const handleInputChange = (productId, field, value) => {
    updateProduct(productId, field, value)

    if (productId === 1 && field === 'name') {
      const firstWord = value.split(' ')[0]
      if (firstWord) {
        setBasicInfo('brand', firstWord)
        setBasicInfo('manufacturer', firstWord)
      }
      products.map(product => {
        if (product.id !== 1) {
          updateProduct(product.id, "displayName", `${value} ${product.id}개`)
          updateProduct(product.id, "name", `${value} ${product.id}개`)
        } else {
          updateProduct(productId, "displayName", value)
        }
      })
    }

    if (productId === 1 && (field === 'optionName' || field === 'optionValue' || field === 'optionValueUnit' || field === 'quantityUnit')) {
      products.map(product => {
        if (product.id !== 1) {
          updateProduct(product.id, field, value)
        }
      })
    }

    if (productId === 1 && (field === 'quantity')) {
      products.map(product => {
        if (product.id !== 1) {
          updateProduct(product.id, field, Number(product.id))
        }
      })
    }   
  }

  // 숫자 입력 필드에서 스크롤 이벤트 방지
  const preventScrollOnNumberInput = (e) => {
    e.target.blur();
  }

  const calculateRegularPrice = (discountPrice) => {
    if (!discountPrice) return '';
    // 23% 할인 적용 전 가격 계산 후 100의 자리에서 반올림
    const price = discountPrice / 0.77;
    return Math.round(price / 100) * 100;
  }

  // 옵션명 선택 시 해당 속성의 단위들을 가져오는 함수
  const getUnitsForAttribute = (attributeTypeName) => {
    if(isDefault) {
      return getDefaultUnits(attributeTypeName)
    }

    const attribute = attributes?.find(attr => attr.attributeTypeName === attributeTypeName);
    if (!attribute) return [];

    return attribute.usableUnits || []; // 중복 제거
  };

  // useEffect 추가
  useEffect(() => {
    if (attributes?.filter(attr => attr.groupNumber === 1).length > 0) {
      setIsDefault(false);
    } else if (attributes?.filter(attr => attr.attributeTypeName !== '수량').length > 0) {
      setIsDefault(false);
    } else {
      setIsDefault(true);
    }
  }, [attributes]);

  const getOptionNameList = () => {
    if (attributes?.filter(attr => attr.groupNumber === 1).length > 0) {
      return attributes.filter(attr => attr.groupNumber === 1 && attr.dataType === 'NUMBER');
    } else if (attributes?.filter(attr => attr.attributeTypeName !== '수량').length > 0) {
      return attributes.filter(attr => attr.attributeTypeName !== '수량' && attr.dataType === 'NUMBER');
    } else {
      return [
        { attributeTypeName: '개당 중량' },
        { attributeTypeName: '개당 캡슐/정' },
        { attributeTypeName: '개당 용량' }
      ];
    }
  };

  // 기본 옵션명에 따른 단위 반환 함수
  const getDefaultUnits = (optionName) => {
    switch (optionName) {
      case '개당 중량':
        return ['mg', 'g', 'kg', 't', 'oz', 'lb'];
      case '개당 캡슐/정':
        return ['캡슐', '정'];
      case '개당 용량':
        return ['ml', 'L', 'cc', 'm3'];
      default:
        return [];
    }
  };

  // 수량 관련 단위를 가져오는 함수
  const getQuantityUnits = () => {
    const quantityAttribute = attributes?.find(attr => attr.attributeTypeName === '수량');
    if (!quantityAttribute) return ['개'];
    
    // usableUnits와 basicUnit을 합치고 중복 제거
    const allUnits = [
      ...(quantityAttribute.usableUnits || []),
      quantityAttribute.basicUnit
    ].filter(Boolean); // null/undefined 제거
    
    return [...new Set(allUnits)]; // 중복 제거
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-danger bg-opacity-25">
        <strong>상품 목록</strong>
        <CButton color="primary" onClick={() => addProduct()}>
          상품 추가
        </CButton>
      </CCardHeader>
      <CCardBody>
        {products.map((product, index) => (
          <CCard key={product.id} className="mb-3">
            <CCardHeader 
              className="d-flex justify-content-between align-items-center cursor-pointer bg-danger bg-opacity-25"
            >
              <div className="d-flex align-items-center gap-2">
                
                <span>{product.name ? `상품 ${index + 1} : ${product.name}` : `상품 ${index + 1}`}</span>
              </div>
              <div className="d-flex gap-2">
                {products.length > 1 && (
                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeProduct(product.id)
                    }}
                    className="p-2"
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                )}
                <CButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleExpand(product.id)}
                  className="p-2"
                >
                  <CIcon icon={product.isExpanded ? cilChevronTop : cilChevronBottom} />
                </CButton>
              </div>
            </CCardHeader>
            {product.isExpanded && (
              <CCardBody>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormInput
                      label="노출 상품명"
                      value={product.displayName}
                      readOnly
                      // onChange={(e) => handleInputChange(product.id, 'displayName', e.target.value)}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label={`등록 상품명 ${index + 1}개`}
                      value={product.name}
                      readOnly={index !== 0}
                      onChange={(e) => handleInputChange(product.id, 'name', e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    {index === 0 ? (
                      <CFormSelect
                        label="옵션명"
                        value={product.optionName}
                        onChange={(e) => handleInputChange(product.id, 'optionName', e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        {getOptionNameList().map(attr => (
                          <option key={attr.attributeTypeName} value={attr.attributeTypeName}>
                            {attr.attributeTypeName}
                          </option>
                        ))}
                      </CFormSelect>
                    ) : (
                      <CFormInput
                        label="옵션명"
                        value={product.optionName}
                        readOnly
                      />
                    )}
                  </CCol>
                  <CCol md={4}>
                    {index === 0 ? (
                      <div className="d-flex gap-2">
                        <div className="flex-grow-1">
                          <CFormInput
                            label="옵션값"
                            type="number"
                            value={product.optionValue || ''}
                            onChange={(e) => {
                              handleInputChange(product.id, 'optionValue', e.target.value);
                            }}
                            onWheel={preventScrollOnNumberInput}
                            placeholder="숫자 입력"
                          />
                        </div>
                        <div className="d-flex align-items-end">
                          <CFormSelect
                            value={product.optionValueUnit || ''}
                            onChange={(e) => {
                              handleInputChange(product.id, 'optionValueUnit', e.target.value);
                            }}
                            style={{ width: '100px' }}
                          >
                            <option value="">단위</option>
                            {product.optionName && getUnitsForAttribute(product.optionName).map(unit => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </CFormSelect>
                        </div>
                      </div>
                    ) : (
                      <CFormInput
                        label="옵션값"
                        value={product.optionValue && product.optionValueUnit ? `${product.optionValue}${product.optionValueUnit}` : ''}
                        readOnly
                      />
                    )}
                  </CCol>
                  <CCol md={4}>
                    {index === 0 ? (
                      <div className="d-flex gap-2">
                        <div className="flex-grow-1">
                          <CFormInput
                            label="수량"
                            type="number"
                            value={product.quantity || ''}
                            onChange={(e) => {
                              handleInputChange(product.id, 'quantity', e.target.value);
                            }}
                            onWheel={preventScrollOnNumberInput}
                            placeholder="숫자 입력"
                          />
                        </div>
                        <div className="d-flex align-items-end">
                          <CFormSelect
                            value={product.quantityUnit || ''}
                            onChange={(e) => {
                              handleInputChange(product.id, 'quantityUnit', e.target.value);
                            }}
                            style={{ width: '100px' }}
                          >
                            <option value="">단위</option>
                            {getQuantityUnits().map(unit => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </CFormSelect>
                        </div>
                      </div>
                    ) : (
                      <CFormInput
                        label="수량"
                        value={product.quantity && product.quantityUnit ? `${product.quantity}${product.quantityUnit}` : ''}
                        readOnly
                      />
                    )}
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="정상가"
                      type="number"
                      value={product.regularPrice}
                      readOnly
                      onWheel={preventScrollOnNumberInput}
                    />
                  </CCol>
                  <CCol md={6}>
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <CFormInput
                          label="할인가"
                          type="number"
                          value={product.discountPrice}
                          onChange={(e) => {
                            const discountPrice = e.target.value;
                            handleInputChange(product.id, 'discountPrice', discountPrice);
                            handleInputChange(product.id, 'regularPrice', calculateRegularPrice(discountPrice));
                          }}
                          onWheel={preventScrollOnNumberInput}
                        />
                      </div>
                      <div className="d-flex align-items-end">
                        <div className="form-control bg-light d-flex align-items-center justify-content-center" style={{ height: '38px', width: '80px' }}>
                          23%
                        </div>
                      </div>
                    </div>
                  </CCol>
                  <ProductImageUploader productId={product.id} />
                </CRow>
              </CCardBody>
            )}
          </CCard>
        ))}
      </CCardBody>
    </CCard>
  )
}

export default ProductList 