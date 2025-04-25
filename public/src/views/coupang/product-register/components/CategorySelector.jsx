import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react'
import useCoupangStore from '../../../../stores/useCoupangStore'
import { useAccountStore } from '../../../../stores/useAccountStore'
import { useCoupangProductActions } from '../../../../hooks/useCoupangProductActions'

const CategorySelector = () => {
  const { 
    categories,
    setCategories,
    selectedCategories,
    setSelectedCategories,
    setError,
    setLastCategory,
    resetCategories,
    setCategoryMetas,
    lastCategory,
  } = useCoupangStore()

  const { selectedAccount } = useAccountStore();    

  const [categoryLoading, setCategoryLoading] = useState(false)
  const { fetchCoupangCategories, fetchCoupangCategoryMetas } = useCoupangProductActions()

  useEffect(() => {
    resetCategories();
    loadCategories(1, []);
  }, [selectedAccount]);

  useEffect(() => {
    if(lastCategory){
      setCategoryMetas(fetchCoupangCategoryMetas(lastCategory.displayItemCategoryCode));
    }
  }, [lastCategory]);

  const loadCategories = async (level, categories) => {
    try {
      setCategoryLoading(true)
      setError('')
      if(categories.length === 0){
        const res = await fetchCoupangCategories()
        if (res?.result === 'success') {
          // ROOT 카테고리의 child 배열을 첫 번째 레벨 카테고리로 설정
          const firstLevelCategories = res.data.data.child || []
          setCategories(level, firstLevelCategories)
        } else if(res?.result === 'error'){
          setError(res.message)
        } else {
          setError('카테고리 로드 실패')
        }
      } else {
        setCategories(level, categories)
      }
    } catch (err) {
      setError(err)
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleCategorySelect = (level, value) => {
    if (!value) return;

    // 현재 레벨의 카테고리 목록에서 선택된 카테고리 찾기
    const currentCategories = categories[level] || [];
    const selectedCategory = currentCategories.find(cat => cat.displayItemCategoryCode == value);

    if (!selectedCategory) return;
    
    // 선택된 카테고리 저장
    setSelectedCategories(level, selectedCategory);

    // 마지막 카테고리인 경우 (child 배열이 비어있는 경우)
    if (selectedCategory.child.length === 0) {
      setLastCategory(selectedCategory);
      return;
    }

    // 다음 레벨의 카테고리 로드
    if (level < 5) {
      for(let i = level+1; i <= 5; i++){
        setCategories(i, [])
      }

      loadCategories(level + 1, selectedCategory.child);
    }
  }

  useEffect(() => {
    loadCategories(1, [])
  }, [])

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>카테고리 선택</strong>
      </CCardHeader>
      <CCardBody>
        <div className="row g-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="col-md">
              <CFormSelect
                value={selectedCategories[level]?.displayItemCategoryCode || ''}
                onChange={(e) => handleCategorySelect(level, e.target.value)}
                disabled={level > 1 && !selectedCategories[level - 1] || categories[level].length === 0 || categoryLoading}
              >
                <option value="">{level}차 카테고리</option>
                {categories[level]?.map((category) => (
                  <option 
                    key={category.displayItemCategoryCode} 
                    value={category.displayItemCategoryCode}
                  >
                    {category.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
          ))}
        </div>
        {categoryLoading && (
          <div className="text-center my-3">
            <CSpinner />
          </div>
        )}
        {categories.error && (
          <CAlert color="danger" className="mt-3">
            {categories.error}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default CategorySelector 