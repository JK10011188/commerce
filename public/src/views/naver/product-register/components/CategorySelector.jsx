import React, { useEffect, useCallback } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CSpinner,
  CBadge,
  CCard,
  CCardHeader,
  CCardBody,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'

// 별도 컴포넌트로 분리된 CategorySelectField (필요 시)
const CategorySelectField = React.memo(({ 
  label, 
  id, 
  value, 
  options, 
  onChange,
  disabled,
  onFocus
}) => {
  return (
    <CCol xs={12} md={3} className="mb-3 mb-md-0">
      <CFormLabel htmlFor={id} className="form-label fw-semibold mb-1">
        {label}
      </CFormLabel>
      <CFormSelect
        id={id}
        value={value || ''}
        onChange={onChange}
        onFocus={onFocus}
        disabled={disabled}
        aria-label={`${label} 선택`}
      >
        <option value="">선택해주세요</option>
        {options && options.length > 0 && options.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </CFormSelect>
    </CCol>
  );
});

import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'
import { useAccountStore } from '../../../../stores/useAccountStore'

const CategorySelector = React.memo(() => {
  const productStore = useProductStore();
  const productActions = useNaverProductActions();
  const { selectedAccount } = useAccountStore();

  const {
    mainCategories,
    subCategories,
    detailCategories,
    microCategories,
    selectedMainCategory,
    selectedSubCategory,
    selectedDetailCategory,
    selectedMicroCategory,
    selectedCategory,
    isCategoryLoading,
    categoryError
  } = productStore;

  useEffect(() => {
    // 계정 변경 시 카테고리 초기화 및 재로드
    productStore.resetCategories();
    if (selectedAccount?.n_id) {
      productActions.fetchMainCategories();
    }
  }, [selectedAccount]);

  const handleCategoryChange = (e, type) => {
    const categoryId = e.target.value;
    console.log(`${type} 카테고리 선택:`, categoryId);

    // 선택 해제 시 하위 카테고리 초기화
    if (!categoryId) {
      return;
    }

    switch (type) {
      case 'Main':
        productStore.selectCategory('Sub', null);
        productStore.selectCategory('Detail', null);
        productStore.selectCategory('Micro', null);
        productStore.setSelectCategory(null);
        productStore.setTags([]);
        break;
      case 'Sub':
        productStore.selectCategory('Detail', null);
        productStore.selectCategory('Micro', null);
        productStore.setSelectCategory(null);
        productStore.setTags([]);
        break;
      case 'Detail':
        productStore.selectCategory('Micro', null);
        productStore.setSelectCategory(null);
        productStore.setTags([]);
        break;
      default:
        break;
    }

    // 카테고리 선택 처리
    let category;
    switch (type) {
      case 'Main':
        category = mainCategories.find(cat => cat.id === categoryId);
        if (category) {
          productStore.selectCategory('Main', category);
          if (!category.last) {
            productActions.fetchSubCategories('sub', categoryId)
              .then(() => console.log('서브 카테고리 로드 완료'))
              .catch(error => console.error('서브 카테고리 로드 오류:', error));
          }
        }
        break;
      case 'Sub':
        category = subCategories.find(cat => cat.id === categoryId);
        if (category) {
          productStore.selectCategory('Sub', category);
          if (!category.last) {
            productActions.fetchSubCategories('detail', categoryId)
              .catch(error => console.error('상세 카테고리 로드 오류:', error));
          } else {
            productStore.setCategories('detail', []);
            productStore.setCategories('micro', []);
            productStore.setSelectCategory(category);
            productActions.fetchCategoryTags(categoryId);
          }
        }
        break;
      case 'Detail':
        category = detailCategories.find(cat => cat.id === categoryId);
        if (category) {
          productStore.selectCategory('Detail', category);
          if (!category.last) {
            productActions.fetchSubCategories('micro', categoryId)
              .catch(error => console.error('마이크로 카테고리 로드 오류:', error));
          } else {
            productStore.setCategories('micro', []);
            productStore.setSelectCategory(category);
            productActions.fetchCategoryTags(categoryId);
          }
        }
        break;
      case 'Micro':
        category = microCategories.find(cat => cat.id === categoryId);
        if (category) {
          productStore.selectCategory('Micro', category);
          productStore.setSelectCategory(category);
          productActions.fetchCategoryTags(categoryId);
        } else {
          productStore.setSelectCategory(null);
        }
        break;
      default:
        break;
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <strong>카테고리 선택</strong>
          {isCategoryLoading && (<CSpinner size="sm" />)}
        </div>
      </CCardHeader>
      <CCardBody>
        {categoryError && (
          <CAlert color="danger" className="d-flex align-items-center mb-4">
            <CIcon icon={cilWarning} className="flex-shrink-0 me-2" />
            <div>
              <div><strong>카테고리 조회 불가</strong></div>
              <p className="mb-2">{categoryError}</p>
            </div>
          </CAlert>
        )}
        <CRow className="mb-3 align-items-center gx-3">
          <CategorySelectField
            label="대분류"
            id="mainCategory"
            value={selectedMainCategory?.id}
            options={mainCategories}
            onChange={(e) => handleCategoryChange(e, 'Main')}
            onFocus={() => {
              if (!mainCategories || mainCategories.length === 0) {
                productActions.fetchMainCategories();
              }
            }}
            disabled={isCategoryLoading || categoryError}
          />
          <CategorySelectField
            label="중분류"
            id="subCategory"
            value={selectedSubCategory?.id}
            options={subCategories}
            onChange={(e) => handleCategoryChange(e, 'Sub')}
            disabled={isCategoryLoading || !selectedMainCategory || subCategories.length === 0 || categoryError}
          />
          <CategorySelectField
            label="소분류"
            id="detailCategory"
            value={selectedDetailCategory?.id}
            options={detailCategories}
            onChange={(e) => handleCategoryChange(e, 'Detail')}
            disabled={isCategoryLoading || !selectedSubCategory || detailCategories.length === 0 || categoryError}
          />
          <CategorySelectField
            label="세부분류"
            id="microCategory"
            value={selectedMicroCategory?.id}
            options={microCategories}
            onChange={(e) => handleCategoryChange(e, 'Micro')}
            disabled={isCategoryLoading || !selectedDetailCategory || microCategories.length === 0 || categoryError}
          />
        </CRow>
        {selectedCategory && (
          <div className="mt-3 pt-3 border-top">
            <p className="mb-2 fw-semibold">선택된 카테고리:</p>
            <CBadge color="success" className="py-2 px-3 fs-6">
              {selectedMainCategory?.name} &gt; {selectedSubCategory?.name} &gt; {selectedDetailCategory?.name}
              {selectedMicroCategory && ` > ${selectedMicroCategory.name}`}
            </CBadge>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
});

export default CategorySelector;
