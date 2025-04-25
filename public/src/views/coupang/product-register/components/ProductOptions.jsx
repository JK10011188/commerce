import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormCheck,
} from '@coreui/react'
import useCoupangStore from '../../../../stores/useCoupangStore'

const ProductOptions = () => {
  const { attributes, selectedAttributes, setSelectedAttributes } = useCoupangStore()
  
  // 체크박스 클릭 처리
  const handleCheckboxChange = (attributeTypeName, value) => {
    console.log(`체크박스 클릭: ${attributeTypeName} - ${value}`)
    
    // 현재 선택된 속성에서 해당 속성 타입의 값을 찾습니다
    const existingAttribute = selectedAttributes.find(attr => attr.key === attributeTypeName)
    
    if (existingAttribute) {
      // 이미 선택된 속성이 있는 경우
      if (existingAttribute.value.includes(value)) {
        // 이미 선택된 값이면 제거
        setSelectedAttributes(
          selectedAttributes.map(attr => 
            attr.key === attributeTypeName 
              ? { ...attr, value: [] } 
              : attr
          )
        )
      } else {
        // 다른 값이 선택되어 있으면 새 값으로 교체
        setSelectedAttributes(
          selectedAttributes.map(attr => 
            attr.key === attributeTypeName 
              ? { ...attr, value: [value] } 
              : attr
          )
        )
      }
    } else {
      // 선택된 속성이 없는 경우 새로 추가
      setSelectedAttributes([
        ...selectedAttributes,
        { key: attributeTypeName, value: [value] }
      ])
    }
  }
  
  // 입력 필드 변경 처리
  const handleInputChange = (attributeTypeName, value) => {
    console.log(`입력 필드 변경: ${attributeTypeName} - ${value}`)
    
    // 현재 선택된 속성에서 해당 속성 타입의 값을 찾습니다
    const existingAttribute = selectedAttributes.find(attr => attr.key === attributeTypeName)
    
    if (existingAttribute) {
      // 이미 선택된 속성이 있는 경우
      if (value) {
        // 값이 있으면 업데이트
        setSelectedAttributes(
          selectedAttributes.map(attr => 
            attr.key === attributeTypeName 
              ? { ...attr, value: [value] } 
              : attr
          )
        )
      } else {
        // 값이 없으면 속성을 제거
        setSelectedAttributes(selectedAttributes.filter(attr => attr.key !== attributeTypeName))
      }
    } else if (value) {
      // 선택된 속성이 없고 값이 있는 경우 새로 추가
      setSelectedAttributes([
        ...selectedAttributes,
        { key: attributeTypeName, value: [value] }
      ])
    }
  }
  
  // 체크박스가 선택되었는지 확인
  const isOptionSelected = (attributeTypeName, value) => {
    const attribute = selectedAttributes.find(attr => attr.key === attributeTypeName)
    return attribute && attribute.value.includes(value)
  }
  
  // 입력 필드의 값을 가져옴
  const getInputValue = (attributeTypeName) => {
    const attribute = selectedAttributes.find(attr => attr.key === attributeTypeName)
    return attribute ? attribute.value[0] : ''
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>상품 옵션</strong>
      </CCardHeader>
      <CCardBody>
        {attributes.map((attribute) => (
          attribute.inputValues?.length > 0 && (
            <div key={attribute.attributeTypeName} className="mb-3">
              <CFormLabel className="d-flex align-items-center">
                <strong>{attribute.attributeTypeName}</strong>
                {attribute.required === "MANDATORY" && <span className="text-danger ms-1">*</span>}
                {attribute.basicUnit && <span className="text-muted ms-1">({attribute.basicUnit})</span>}
              </CFormLabel>
              <div className="d-flex flex-wrap gap-2">
                {attribute.inputType === "SELECT" ? (
                  attribute.inputValues.map((value, index) => (
                    <CFormCheck
                      key={index}
                      type="checkbox"
                      name={attribute.attributeTypeName}
                      id={`${attribute.attributeTypeName}-${value}`}
                      label={value}
                      checked={isOptionSelected(attribute.attributeTypeName, value)}
                      onChange={() => handleCheckboxChange(attribute.attributeTypeName, value)}
                    />
                  ))
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    name={attribute.attributeTypeName}
                    placeholder={`${attribute.attributeTypeName} 입력`}
                    value={getInputValue(attribute.attributeTypeName)}
                    onChange={(e) => handleInputChange(attribute.attributeTypeName, e.target.value)}
                  />
                )}
              </div>
            </div>
          )
        ))}
      </CCardBody>
    </CCard>
  )
}

export default ProductOptions 