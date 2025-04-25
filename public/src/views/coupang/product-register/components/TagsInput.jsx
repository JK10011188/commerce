import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CBadge,
} from '@coreui/react'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import useCoupangStore from '../../../../stores/useCoupangStore'
import { useEffect } from 'react'
import { useCoupangProductActions } from '../../../../hooks/useCoupangProductActions'

const TagsInput = () => {
  const { tags, setTags, lastCategory } = useCoupangStore()
  const { fetchCoupangTags } = useCoupangProductActions()

  useEffect(() => {
    if(lastCategory){
      fetchCoupangTags(lastCategory.displayItemCategoryCode)
    }
  }, [lastCategory])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = e.target.value.trim()
      if (value && !tags.includes(value)) {
        setTags([...tags, value])
        e.target.value = ''
      }
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>태그</strong>
      </CCardHeader>
      <CCardBody>
        <CFormInput
          type="text"
          placeholder="태그를 입력하고 Enter 또는 쉼표(,)를 눌러주세요"
          onKeyDown={handleKeyDown}
        />
        <div className="selected-tags">
          {tags?.length > 0 && (
            tags.map((tag, index) => (
              <CBadge key={index} color="info" className="me-2 mb-2 selected-tag">
                {tag}
                <span className="tag-remove" onClick={() => removeTag(tag)}>
                  <CIcon icon={cilTrash} size="sm" />
                </span>
              </CBadge>
            ))
          )}
        </div>
        <small className="text-muted mt-2">
          {tags.length}/10
        </small>
      </CCardBody>
    </CCard>
  )
}

export default TagsInput 