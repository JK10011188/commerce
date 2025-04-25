import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilInfo } from '@coreui/icons'
import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'
import { useAccountStore } from '../../../../stores/useAccountStore'
import productService from '../../../../services/productService'

const TagsCard = () => {
  const { tags, selectedCategory, setTags, tagSuggestions, isTagSuggestionsLoading, setTagSuggestionsLoading } = useProductStore();
  const { fetchTagSuggestions, fetchTagRestrictions } = useNaverProductActions();
  const { selectedAccount } = useAccountStore();
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);      
  const [isRequesting, setIsRequesting] = useState(false);
  const lastRequestRef = useRef('');

  // 입력값이 변경될 때마다 API 호출
  useEffect(() => {
    const currentInput = tagInput.trim();
    
    // 이전 요청과 동일하거나, 요청 중이면 스킵
    if (currentInput === lastRequestRef.current || isRequesting) {
      return;
    }
    // 2글자 미만이면 스킵
    if (currentInput.length < 2) {
      setShowTagSuggestions(false);
      return;
    }

    try {
      setIsRequesting(true);
      setTagSuggestionsLoading(true);
      lastRequestRef.current = currentInput;
      fetchTagSuggestions(currentInput);
      setShowTagSuggestions(true);
    } catch (error) {
      console.error('태그 추천 요청 실패:', error);
      setShowTagSuggestions(false);
    } finally {
      setIsRequesting(false);
      setTagSuggestionsLoading(false);
    }
  }, [tagInput, fetchTagSuggestions, isRequesting]);

  const handleTagChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
  };

  const handleTagKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        if (!tags.includes(tagInput.trim())) {
          if (tags.length < 10) {
            // 추천 태그를 한 번 더 조회
            setIsRequesting(true);
            setTagSuggestionsLoading(true);
            
            // 디바운스 없이 즉시 호출하기 위해 별도의 함수 사용
            const checkTagInSuggestions = async () => {
              try {
                // 태그 제안 API 직접 호출
                const res = await productService.getTagSuggestions({
                  accName: selectedAccount.accName, 
                  keyword: tagInput.trim()
                });
                
                // 응답에서 태그 제안 목록 추출
                const suggestions = res?.keywords || [];
                
                // 입력한 태그가 제안 목록에 있는지 확인
                const isTagInSuggestions = suggestions.some(
                  suggestion => suggestion.toLowerCase() === tagInput.trim().toLowerCase()
                );
                
                if (isTagInSuggestions) {
                  handleTagSuggestionClick(tagInput.trim());
                } else {
                  alert('사전에 없는 키워드입니다. 추천 태그에서 선택해주세요.');
                }
              } catch (error) {
                console.error('태그 추천 조회 실패:', error);
                alert('태그 추천 조회 중 오류가 발생했습니다.');
              } finally {
                setIsRequesting(false);
                setTagSuggestionsLoading(false);
              }
            };
            
            checkTagInSuggestions();
          } else {
            alert('태그는 최대 10개까지 등록할 수 있습니다.');
          }
        } else {
          alert('이미 추가된 태그입니다.');
        }
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const handleTagSuggestionClick = async (suggestion) => {
    if (tags.length < 10) {
      if (!tags.includes(suggestion)) {
        // 여기에 제한 태그인지 조회하고
        const res = await fetchTagRestrictions(suggestion);
        if (res.restricted) {
          alert('제한된 태그입니다.'); 
          return;
        }
        setTags([...tags, suggestion]);
        setTagInput('');
        setShowTagSuggestions(false);
      } else {
        alert('이미 추가된 태그입니다.');
      }
    } else {
      alert('태그는 최대 10개까지 등록할 수 있습니다.');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 입력 필드 외부 클릭 시 추천 태그 숨기기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.tag-input-container')) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>태그 설정</strong>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol>
            {!selectedCategory ? (
              <CAlert color="info" className="d-flex align-items-center">
                <CIcon icon={cilInfo} className="flex-shrink-0 me-2" />
                <div>
                  <div><strong>카테고리를 먼저 선택해주세요</strong></div>
                  <p className="mb-0">태그를 등록하기 위해서는 카테고리 선택이 필요합니다.</p>
                </div>
              </CAlert>
            ) : (
              <>
                <div className="tag-input-container position-relative">
                  <CInputGroup className="mb-2">
                    <CFormInput 
                      type="text" 
                      id="tagInput" 
                      value={tagInput}
                      onChange={handleTagChange}
                      onKeyUp={handleTagKeyUp}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      placeholder="태그 입력 후 Enter (쉼표로 구분, 최대 10개)"
                      disabled={tags.length >= 10}
                    />
                    <CInputGroupText>
                      {tagInput.length}/10
                    </CInputGroupText>
                  </CInputGroup>
                  {showTagSuggestions && (
                    <div className="tag-suggestions position-absolute w-100 bg-white border rounded-bottom shadow-sm" style={{ zIndex: 1000 }}>
                      {isTagSuggestionsLoading ? (
                        <div className="p-3 text-center">
                          <CSpinner size="sm" />
                        </div>
                      ) : tagSuggestions.length > 0 ? (
                        <ul className="list-unstyled mb-0">
                          {tagSuggestions.map((suggestion, index) => (
                            <li 
                              key={index} 
                              className="tag-suggestion-item p-2 cursor-pointer hover-bg-light"
                              onClick={() => handleTagSuggestionClick(suggestion.text)}
                            >
                              {suggestion.text}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-3 text-muted text-center">
                          {tagInput.length < 2 ? '2글자 이상 입력해주세요' : '추천 태그가 없습니다'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="selected-tags">
                  {tags.length > 0 && (
                    tags.map((tag, index) => (
                      <CBadge key={index} color="info" className="me-2 mb-2 selected-tag">
                        {tag}
                        <span className="tag-remove" onClick={() => handleRemoveTag(tag)}>
                          <CIcon icon={cilTrash} size="sm" />
                        </span>
                      </CBadge>
                    ))
                  )}
                </div>
                <div className="mt-2 text-muted small">
                  <i>태그는 쉼표(,)로 구분하여 입력할 수 있으며, 최대 10개까지 등록 가능합니다.</i>
                </div>
              </>
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default TagsCard;
