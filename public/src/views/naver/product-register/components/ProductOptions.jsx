import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'

const ProductOptions = ({ productId, index }) => {
  const { products, setProduct, mainProduct, setMainProduct } = useProductStore();
  const [optionName, setOptionName] = useState('');
  const [optionValues, setOptionValues] = useState('');

  const product = products.find(p => p.id === productId);
  const isMainProduct = product.id === mainProduct?.id;
  const options = product.options || [];

  useEffect(() => {
    if (index === 0) {
      // setOptionName(`(${index+1}개)`);
      setOptionValues(`${index+1}개`);
    }
  }, []);

  // 메인 상품 옵션이 변경될 때 나머지 상품들의 옵션 값을 수정하는 함수
  const updateOtherProductsOptions = (mainProductOptions) => {
    const otherProducts = products.filter(p => p.id !== mainProduct.id);
    
    // 메인 상품의 옵션이 없거나 빈 배열인 경우
    if (!mainProductOptions || mainProductOptions.length === 0) {
      otherProducts.forEach(otherProduct => {
        setProduct({
          ...otherProduct,
          options: []
        });
      });
      return;
    }

    if (mainProductOptions[0].values.length > 1) {              // 메인 상품의 옵션값이 2개 이상인 경우 옵션명을 변경
      otherProducts.forEach((otherProduct, index) => {
        const newOptions = mainProductOptions.map(mainOption => ({
          id: crypto.randomUUID(),
          name: `${mainOption.name}(${index + 2}개)`,
          values: mainOption.values.map(value => ({
            id: crypto.randomUUID(),
            value: value.value
          }))
        }));
        setProduct({
          ...otherProduct,
          options: newOptions
        });
      });
    } else if (mainProductOptions[0].values.length === 1){      // 메인 상품의 옵션값이 1개인 경우 옵션값을 변경
      otherProducts.forEach((otherProduct, index) => {
        const newOptions = mainProductOptions.map(mainOption => ({      
          id: crypto.randomUUID(),
          name: mainOption.name,
          values: mainOption.values.map(value => ({
            id: crypto.randomUUID(),
            value: `${index + 2}개`
          }))
        }));
  
        setProduct({
          ...otherProduct,
          options: newOptions
        });
      });
    }
  }

  const handleAddOption = () => {
    if (!optionName.trim() || !optionValues.trim()) return;
    
    // 이미 존재하는 옵션명인지 확인
    const existingOption = options.find(opt => opt.name === optionName.trim());

    // 옵션이 이미 3개인 경우 추가 방지
    if (options.length >= 1 && !existingOption) {
      alert('옵션명은 1개만 추가할 수 있습니다.');
      return;
    }

    const newValues = optionValues.split(',').map(value => value.trim());
    
    // 입력한 옵션값들 사이에서 중복 제거
    const uniqueNewValues = [...new Set(newValues)];
    
    let updatedProduct;
    if (existingOption) {
      // 이미 존재하는 옵션명인 경우, 중복되지 않는 값만 추가
      const existingValues = existingOption.values.map(v => v.value);
      const uniqueValues = uniqueNewValues.filter(value => !existingValues.includes(value));
      
      // 중복되지 않는 값들만 추가
      const newValueObjects = uniqueValues.map(value => ({
        id: crypto.randomUUID(),
        value: value
      }));

      if(newValueObjects.length > 3){
        alert('옵션값은 3개만 추가할 수 있습니다.');
        return;
      }

      updatedProduct = {
        ...product,
        options: options.map(opt => 
          opt.id === existingOption.id 
            ? { ...opt, values: [...opt.values, ...newValueObjects] }
            : opt
        )
      };
    } else {
      // 새로운 옵션명인 경우
      const newOption = {
        id: crypto.randomUUID(),
        name: optionName.trim(),
        values: uniqueNewValues.map(value => ({
          id: crypto.randomUUID(),
          value: value
        }))
      };

      updatedProduct = {
        ...product,
        options: [...options, newOption]
      };
    }

    setProduct(updatedProduct);
    
    // 첫 번째 상품인 경우 메인 상품도 업데이트하고 다른 상품들의 옵션도 수정
    if (isMainProduct) {
      setMainProduct(updatedProduct);
      updateOtherProductsOptions(updatedProduct.options);
    }
  };

  const handleRemoveOption = (optionId, valueId) => {
    const updatedProduct = {
      ...product,
      options: options.map(opt => {
        if (opt.id === optionId) {
          // 해당 옵션의 남은 값들을 필터링
          const remainingValues = opt.values.filter(v => v.id !== valueId);
          // 남은 값이 있으면 옵션을 유지하고 값만 업데이트
          if (remainingValues.length > 0) {
            return {
              ...opt,
              values: remainingValues
            };
          }
          // 남은 값이 없으면 옵션을 삭제하기 위해 null 반환
          return null;
        }
        return opt;
      }).filter(opt => opt !== null) // null인 옵션들 제거
    };

    setProduct(updatedProduct);
    
    // 첫 번째 상품인 경우 메인 상품도 업데이트하고 다른 상품들의 옵션도 수정
    if (isMainProduct) {
      setMainProduct(updatedProduct);
      updateOtherProductsOptions(updatedProduct.options);
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>옵션 정보</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-4">
          <CCol sm={1}>
            <CFormLabel>옵션명</CFormLabel>
          </CCol>
          <CCol sm={3}>
            <CFormInput
              type="text"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              placeholder="옵션명을 입력하세요"
            />
          </CCol>
          <CCol sm={1}>
            <CFormLabel>옵션값</CFormLabel>
          </CCol>
          <CCol sm={5}>
            <CFormInput
              type="text"
              value={optionValues}
              onChange={(e) => setOptionValues(e.target.value)}
              placeholder="옵션값을 쉼표(,)로 구분하여 입력하세요"
            />
          </CCol>
          <CCol sm={2}>
            <CButton 
              color="primary" 
              onClick={handleAddOption}
            >
              <CIcon icon={cilPlus} className="me-2" />
              추가
            </CButton>
          </CCol>
        </CRow>

        {options.length === 0 ? (
          <div className="text-muted">등록된 옵션이 없습니다.</div>
        ) : (
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>옵션명</CTableHeaderCell>
                <CTableHeaderCell>옵션값</CTableHeaderCell>
                <CTableHeaderCell>작업</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {options.map((option) => (
                option.values.map((value) => (
                  <CTableRow key={`${option.id}-${value.id}`}>
                    <CTableDataCell>{option.name}</CTableDataCell>
                    <CTableDataCell>{value.value}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(option.id, value.id)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ProductOptions; 