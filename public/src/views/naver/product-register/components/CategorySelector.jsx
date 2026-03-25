import React, { useEffect, useMemo, useState } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CSpinner,
  CBadge,
  CCard,
  CCardHeader,
  CCardBody,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'
import { useAccountStore } from '../../../../stores/useAccountStore'

const SearchableCategoryField = React.memo(
  ({ label, id, value, options, onSelect, disabled, onFocus }) => {
    const [inputValue, setInputValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const selectedOption = useMemo(
      () => options.find((category) => category.id === value) || null,
      [options, value],
    )

    useEffect(() => {
      setInputValue(selectedOption?.name || '')
    }, [selectedOption])

    const filteredOptions = useMemo(() => {
      const keyword = inputValue.trim().toLowerCase()
      if (!keyword) {
        return options
      }

      return options.filter((category) =>
        String(category?.name || '').toLowerCase().includes(keyword),
      )
    }, [inputValue, options])

    const handleFocus = () => {
      onFocus?.()
      setIsOpen(true)
    }

    const handleBlur = () => {
      window.setTimeout(() => {
        setIsOpen(false)
        setInputValue(selectedOption?.name || '')
      }, 150)
    }

    const handleChange = (event) => {
      setInputValue(event.target.value)
      setIsOpen(true)
    }

    const handleSelect = (category) => {
      setInputValue(category.name)
      setIsOpen(false)
      onSelect(category.id)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && filteredOptions.length > 0) {
        event.preventDefault()
        handleSelect(filteredOptions[0])
      }
    }

    return (
      <CCol xs={12} md={3} className="mb-3 mb-md-0">
        <CFormLabel htmlFor={id} className="form-label fw-semibold mb-1">
          {label}
        </CFormLabel>
        <div className="position-relative">
          <CFormInput
            id={id}
            className={isOpen ? 'rounded-bottom-0' : ''}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
            placeholder={`${label} 선택 또는 검색`}
          />
          {isOpen && !disabled && (
            <div
              className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
              style={{ zIndex: 20, maxHeight: '240px', overflowY: 'auto' }}
            >
              {filteredOptions.length > 0 ? (
                <ul className="list-unstyled mb-0">
                  {filteredOptions.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        className={`w-100 text-start bg-white border-0 px-3 py-2${
                          category.id === value ? ' fw-semibold bg-light' : ''
                        }`}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          handleSelect(category)
                        }}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-body-secondary">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </CCol>
    )
  },
)

const CategorySelector = React.memo(() => {
  const productStore = useProductStore()
  const productActions = useNaverProductActions()
  const { selectedAccount } = useAccountStore()

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
    setUnitPriceCategory,
    isCategoryLoading,
    categoryError,
  } = productStore

  useEffect(() => {
    productStore.resetCategories()
    if (selectedAccount?.n_id) {
      productActions.fetchMainCategories()
    }
  }, [selectedAccount])

  const handleCategoryChange = (categoryId, type) => {
    if (!categoryId) {
      return
    }

    switch (type) {
      case 'Main':
        productStore.selectCategory('Sub', null)
        productStore.selectCategory('Detail', null)
        productStore.selectCategory('Micro', null)
        productStore.setSelectCategory(null)
        setUnitPriceCategory(false)
        productStore.setTags([])
        break
      case 'Sub':
        productStore.selectCategory('Detail', null)
        productStore.selectCategory('Micro', null)
        productStore.setSelectCategory(null)
        setUnitPriceCategory(false)
        productStore.setTags([])
        break
      case 'Detail':
        productStore.selectCategory('Micro', null)
        productStore.setSelectCategory(null)
        setUnitPriceCategory(false)
        productStore.setTags([])
        break
      default:
        break
    }

    let category
    switch (type) {
      case 'Main':
        category = mainCategories.find((cat) => cat.id === categoryId)
        if (category) {
          productStore.selectCategory('Main', category)
          if (!category.last) {
            productActions.fetchSubCategories('sub', categoryId)
          }
        }
        break
      case 'Sub':
        category = subCategories.find((cat) => cat.id === categoryId)
        if (category) {
          productStore.selectCategory('Sub', category)
          if (!category.last) {
            productActions.fetchSubCategories('detail', categoryId)
          } else {
            productStore.setCategories('detail', [])
            productStore.setCategories('micro', [])
            productStore.setSelectCategory(category)
            productActions.fetchCategoryTags(categoryId)
          }
        }
        break
      case 'Detail':
        category = detailCategories.find((cat) => cat.id === categoryId)
        if (category) {
          productStore.selectCategory('Detail', category)
          if (!category.last) {
            productActions.fetchSubCategories('micro', categoryId)
          } else {
            productStore.setCategories('micro', [])
            productStore.setSelectCategory(category)
            productActions.fetchCategoryTags(categoryId)
          }
        }
        break
      case 'Micro':
        category = microCategories.find((cat) => cat.id === categoryId)
        if (category) {
          setUnitPriceCategory(false)
          productStore.selectCategory('Micro', category)
          productStore.setSelectCategory(category)
          productActions.fetchCategoryTags(categoryId)
        } else {
          productStore.setSelectCategory(null)
          setUnitPriceCategory(false)
        }
        break
      default:
        break
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <strong>카테고리 선택</strong>
          {isCategoryLoading && <CSpinner size="sm" />}
        </div>
      </CCardHeader>
      <CCardBody>
        {categoryError && (
          <CAlert color="danger" className="d-flex align-items-center mb-4">
            <CIcon icon={cilWarning} className="flex-shrink-0 me-2" />
            <div>
              <div>
                <strong>카테고리 조회 불가</strong>
              </div>
              <p className="mb-2">{categoryError}</p>
            </div>
          </CAlert>
        )}
        <CRow className="mb-3 align-items-start gx-3">
          <SearchableCategoryField
            label="대분류"
            id="mainCategory"
            value={selectedMainCategory?.id}
            options={mainCategories}
            onSelect={(categoryId) => handleCategoryChange(categoryId, 'Main')}
            onFocus={() => {
              if (!mainCategories || mainCategories.length === 0) {
                productActions.fetchMainCategories()
              }
            }}
            disabled={isCategoryLoading || categoryError}
          />
          <SearchableCategoryField
            label="중분류"
            id="subCategory"
            value={selectedSubCategory?.id}
            options={subCategories}
            onSelect={(categoryId) => handleCategoryChange(categoryId, 'Sub')}
            disabled={
              isCategoryLoading ||
              !selectedMainCategory ||
              subCategories.length === 0 ||
              categoryError
            }
          />
          <SearchableCategoryField
            label="소분류"
            id="detailCategory"
            value={selectedDetailCategory?.id}
            options={detailCategories}
            onSelect={(categoryId) => handleCategoryChange(categoryId, 'Detail')}
            disabled={
              isCategoryLoading ||
              !selectedSubCategory ||
              detailCategories.length === 0 ||
              categoryError
            }
          />
          <SearchableCategoryField
            label="세분류"
            id="microCategory"
            value={selectedMicroCategory?.id}
            options={microCategories}
            onSelect={(categoryId) => handleCategoryChange(categoryId, 'Micro')}
            disabled={
              isCategoryLoading ||
              !selectedDetailCategory ||
              microCategories.length === 0 ||
              categoryError
            }
          />
        </CRow>
        {selectedCategory && (
          <div className="mt-3 pt-3 border-top">
            <p className="mb-2 fw-semibold">선택된 카테고리:</p>
            <CBadge color="success" className="py-2 px-3 fs-6">
              {selectedMainCategory?.name} &gt; {selectedSubCategory?.name} &gt;{' '}
              {selectedDetailCategory?.name}
              {selectedMicroCategory && ` > ${selectedMicroCategory.name}`}
            </CBadge>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
})

export default CategorySelector
