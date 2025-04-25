import React, { useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CBadge,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'
import { useProductStore } from '../../../../stores/useNaverStore'

const ProductAttributesCard = () => {
  const { fetchProductAttributes } = useNaverProductActions();
  const { selectedCategory, productAttributes, setProductAttributes, selectedProductAttributes, setSelectedProductAttributes } = useProductStore();
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  useEffect(() => {
    if (selectedCategory?.id) {
      fetchProductAttributes(selectedCategory.id);
    }
  }, [selectedCategory]);

  const handleAttributeChange = (attributeSeq, value) => {
    const updatedAttributes = productAttributes.map(attr => {
      if (attr.attributeSeq === attributeSeq) {
        if(value == '') {
          return { ...attr, selectedValue: null };
        }
        return { ...attr, selectedValue: value };
      }
      return attr;
    });
    setProductAttributes(updatedAttributes);

    // 선택된 속성 업데이트
    const selectedAttr = updatedAttributes.find(attr => attr.attributeSeq === attributeSeq);
    if (selectedAttr) {
      const updatedSelectedAttributes = selectedProductAttributes.filter(
        attr => attr.attributeSeq !== attributeSeq
      );
      if (value) {
        updatedSelectedAttributes.push(selectedAttr);
      }
      setSelectedProductAttributes(updatedSelectedAttributes);
    }
  };

  const handleMultiSelectChange = (attributeSeq, value, checked) => {
    const attribute = productAttributes.find(attr => attr.attributeSeq === attributeSeq);
    const currentValues = attribute?.selectedValues || [];
    
    let newValues;
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    // 최대 선택 개수 체크
    if (attribute?.attributeValueMaxMatchingCount > 0 && 
        newValues.length > attribute.attributeValueMaxMatchingCount) {
      alert(`최대 ${attribute.attributeValueMaxMatchingCount}개까지만 선택할 수 있습니다.`);
      return;
    }

    const updatedAttributes = productAttributes.map(attr => {
      if (attr.attributeSeq === attributeSeq) {
        return { ...attr, selectedValues: newValues };
      }
      return attr;
    });
    setProductAttributes(updatedAttributes);

    // 선택된 속성 업데이트
    const selectedAttr = updatedAttributes.find(attr => attr.attributeSeq === attributeSeq);
    if (selectedAttr) {
      const updatedSelectedAttributes = selectedProductAttributes.filter(
        attr => attr.attributeSeq !== attributeSeq
      );
      if (newValues.length > 0) {
        updatedSelectedAttributes.push(selectedAttr);
      }
      setSelectedProductAttributes(updatedSelectedAttributes);
    }
  };

  const renderAttributeInput = (attr) => {
    const isMultiSelect = attr.attributeClassificationType === 'MULTI_SELECT';
    const isSingleSelect = attr.attributeClassificationType === 'SINGLE_SELECT';
    const isRange = attr.attributeClassificationType === 'RANGE';

    const validValues = attr.values?.filter(value =>
      value && value.attributeValueSeq && value.minAttributeValue
    ) || [];

    if (isMultiSelect && validValues.length > 0) {
      return (
        <div className="d-flex flex-wrap gap-3">
          {validValues.sort((a, b) => a.exposureOrder - b.exposureOrder).map(value => (
            <div key={value.attributeValueSeq} className="form-check-inline">
              <input
                type="checkbox"
                id={`attr-${attr.attributeSeq}-${value.attributeValueSeq}`}
                name={`attr-${attr.attributeSeq}`}
                value={value.attributeValueSeq}
                checked={attr.selectedValues?.includes(value.attributeValueSeq) || false}
                onChange={(e) => handleMultiSelectChange(attr.attributeSeq, value.attributeValueSeq, e.target.checked)}
              />
              <label htmlFor={`attr-${attr.attributeSeq}-${value.attributeValueSeq}`}>
              {value.minAttributeValue}{attr.representativeUnitCodeName? attr.representativeUnitCodeName: ""}
              </label>
            </div>
          ))}
          {attr.attributeValueMaxMatchingCount > 0 && (
            <div className="text-muted small w-100">
              최대 {attr.attributeValueMaxMatchingCount}개 선택 가능
            </div>
          )}
        </div>
      );
    }

    if (isSingleSelect && validValues.length > 0) {
      return (
        <div className="d-flex flex-wrap gap-3">
          {validValues.sort((a, b) => a.exposureOrder - b.exposureOrder).map(value => (
            <div key={value.attributeValueSeq} className="form-check">
              <input
                type="radio"
                id={`attr-${attr.attributeSeq}-${value.attributeValueSeq}`}
                name={`attr-${attr.attributeSeq}`}
                value={value.attributeValueSeq}
                checked={attr.selectedValue == value.attributeValueSeq}
                onChange={(e) => handleAttributeChange(attr.attributeSeq, e.target.value)}
                onClick={(e) => {
                  if (attr.selectedValue == value.attributeValueSeq) {
                    handleAttributeChange(attr.attributeSeq, '');
                  }
                }}
                className="form-check-input"
              />
              <label 
                htmlFor={`attr-${attr.attributeSeq}-${value.attributeValueSeq}`}
                className="form-check-label"
              >
                {value.minAttributeValue}{attr.representativeUnitCodeName ? attr.representativeUnitCodeName : ""}
              </label>
            </div>
          ))}
        </div>
      );
    }

    if (isRange) {
      return (
        <div className="d-flex flex-column gap-3 w-100">
          <CFormSelect
            id={`attr-${attr.attributeSeq}`}
            name={`attr-${attr.attributeSeq}`}
            value={attr.selectedValue?.rangeValue || ''}
            onChange={(e) => handleAttributeChange(attr.attributeSeq, { 
              ...attr.selectedValue, 
              rangeValue: e.target.value 
            })}
            placeholder="범위 선택"
            className="w-100"
          >
            <option value="">선택해주세요</option>
            {validValues.sort((a, b) => a.exposureOrder - b.exposureOrder).map(value => (
              <option key={value.attributeValueSeq} value={value.attributeValueSeq}>
                {value.minAttributeValue? value.minAttributeValue + (attr.representativeUnitCodeName?
                 attr.representativeUnitCodeName: "" ) : ""}
                 ~ {value.maxAttributeValue? value.maxAttributeValue + (attr.representativeUnitCodeName?
                  attr.representativeUnitCodeName: "" ) : ""}
              </option>
            ))}
          </CFormSelect>
          <div className="d-flex gap-2 align-items-center">
            <CFormInput
              type="number"
              id={`attr-${attr.attributeSeq}-real`}
              name={`attr-${attr.attributeSeq}-real`}
              value={attr.selectedValue?.attributeRealValue || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                const updatedAttr = {
                  ...attr,
                  selectedValue: {
                    ...attr.selectedValue,
                    attributeRealValue: newValue
                  }
                };
                const updatedAttributes = productAttributes.map(a => 
                  a.attributeSeq === attr.attributeSeq ? updatedAttr : a
                );
                setProductAttributes(updatedAttributes);

                // 선택된 속성 업데이트
                const updatedSelectedAttributes = selectedProductAttributes.filter(
                  a => a.attributeSeq !== attr.attributeSeq
                );
                if (newValue) {
                  updatedSelectedAttributes.push(updatedAttr);
                }
                setSelectedProductAttributes(updatedSelectedAttributes);
              }}
              placeholder="실제 값 입력"
              className="flex-grow-1"
            />
            {attr.representativeUnitCodeName && (
              <span className="ms-2 text-muted">{attr.representativeUnitCodeName}</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <CFormInput
        type="text"
        id={`attr-${attr.attributeSeq}`}
        name={`attr-${attr.attributeSeq}`}
        value={attr.selectedValue || ''}
        onChange={(e) => handleAttributeChange(attr.attributeSeq, e.target.value)}
        placeholder={`${attr.attributeName} 입력`}
        className="w-100"
      />
    );
  };

  const renderAttributeTable = (attributes) => {
    // attributeTypeCode로 그룹화
    const groupedAttributes = attributes.reduce((acc, attr) => {
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

    return (
      <div>
        {Object.entries(groupedAttributes).map(([typeCode, group]) => (
          <div key={typeCode} className="mb-4">
            <CTable responsive hover className="product-attributes-table">
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '30%' }}>{group.typeName}속성</CTableHeaderCell>
                  <CTableHeaderCell>속성값</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {group.attributes.map(attr => {
                  if (!attr.attributeSeq || !attr.attributeName) return null;
                  return (
                    <CTableRow key={attr.attributeSeq}>
                      <CTableDataCell className="align-middle">
                        <div className="d-flex align-items-center">
                          <strong>{attr.attributeName}</strong>
                        </div>
                        {attr.attributeValueMaxMatchingCount > 0 && attr.attributeClassificationType === 'MULTI_SELECT' && (
                          <div className="text-muted small mt-1">
                            최대 {attr.attributeValueMaxMatchingCount}개 선택 가능
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {renderAttributeInput(attr)}
                        {attr.description && (
                          <div className="form-text small">{attr.description}</div>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedAttributesPreview = () => {
    if (!selectedProductAttributes.length) {
      return <CAlert color="info">선택된 상품 속성이 없습니다.</CAlert>;
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
          <div key={typeCode} className="mb-4">
            <h6 className="mb-3">{group.typeName}</h6>
            <CTable responsive hover>
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '30%' }}>속성명</CTableHeaderCell>
                  <CTableHeaderCell>선택값</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {group.attributes.map(attr => (
                  <CTableRow key={attr.attributeSeq}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
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

  if (!selectedCategory) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <strong>상품 속성</strong>
        </CCardHeader>
        <CCardBody>
          <CAlert color="info">
            카테고리를 먼저 선택해주세요. 카테고리에 따라 필요한 상품 속성이 표시됩니다.
          </CAlert>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>상품 속성</strong>
          <CBadge color="info" className="ms-2">
            {selectedCategory.name}
          </CBadge>
          <CButton
            color="primary"
            variant="outline"
            className="float-end"
            onClick={() => setShowPreviewModal(true)}
          >
            선택된 속성 미리보기
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <div className="text-muted small">
              선택한 카테고리에 필요한 필수 속성을 입력해주세요.
            </div>
          </div>
          {renderAttributeTable(productAttributes)}
        </CCardBody>
      </CCard>

      <CModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>선택된 상품 속성 미리보기</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {renderSelectedAttributesPreview()}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPreviewModal(false)}>
            닫기
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ProductAttributesCard;
