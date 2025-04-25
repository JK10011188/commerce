import { React, useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CategorySelector from './components/CategorySelector'
import TagsInput from './components/TagsInput'
import DetailImages from './components/DetailImages'
import BasicInfo from './components/BasicInfo'
import ProductNotice from './components/ProductNotice'
import ShippingInfo from './components/ShippingInfo'
import ProductList from './components/ProductList'
import ProductOptions from './components/ProductOptions'
import { useCoupangProductActions } from '../../../hooks/useCoupangProductActions'  
import useCoupangStore from '../../../stores/useCoupangStore'
import '../../style/css/ProductRegister.css'

const ProductRegister = () => {
  const { 
    loading, 
    error, 
    registerCoupangProduct,
    validateProduct,
    deleteCoupangProduct,
  } = useCoupangProductActions()

  const { resetStore } = useCoupangStore()
  
  const [submitResults, setSubmitResults] = useState([])
  const [showError, setShowError] = useState(true)
  const [showSubmitResults, setShowSubmitResults] = useState(true)
  const [productId, setProductId] = useState('')
  const [deleteResults, setDeleteResults] = useState([])
  const [showDeleteResults, setShowDeleteResults] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitResults([])
      setShowSubmitResults(true)
      
      const isValid = await validateProduct()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      const results = await registerCoupangProduct()
      const newResults = []
      
      if(results?.length > 0){
        results.forEach(res => {
          if(res.response) {
            newResults.push({
              success: res.response.code !== 'ERROR',
              message: res.response.code === 'ERROR' ? res.response.message ? res.response.message :'상품 등록 중 오류가 발생했습니다.' : '상품 등록 성공.'
            })
          } else {
            newResults.push({
              success: false,
              message: '상품 등록 중 오류가 발생했습니다.'
            })
          }
        })
      }
      
      setSubmitResults(newResults)
      
      // 모든 결과가 성공인 경우에만 스토어 초기화
      if (newResults.length > 0 && newResults.every(result => result.success)) {
        resetStore()  
      }
    } catch (err) {
      console.error('상품 등록 중 오류:', err)
      setSubmitResults([{
        success: false,
        message: err.message || '상품 등록 중 오류가 발생했습니다.'
      }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!productId) {
      setDeleteResults([{
        success: false,
        message: '상품 ID를 입력해주세요.'
      }])
      setShowDeleteResults(true)
      return
    }

    try {
      const result = await deleteCoupangProduct(productId)
      setDeleteResults([result])
      setShowDeleteResults(true)
    } catch (err) {
      console.error('상품 삭제 중 오류:', err)
      setDeleteResults([{
        success: false,
        message: err.message || '상품 삭제 중 오류가 발생했습니다.'
      }])
      setShowDeleteResults(true)
    }
  }

  useEffect(() => {
    resetStore();
  }, []);

  return (
    <CCard>
      <CCardHeader className="bg-danger text-white d-flex justify-content-between align-items-center">
        <strong>상품 등록</strong>
        <div className="d-flex gap-2">
          <CButton color="secondary" onClick={handleReset}>
            초기화
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                등록 중...
              </>
            ) : (
              '등록하기'
            )}
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        {error && showError && (
          <CAlert color="danger" className="mb-4 d-flex justify-content-between align-items-center">
            <div>{error}</div>
            <CButton 
              color="link" 
              className="text-danger p-0" 
              onClick={() => setShowError(false)}
            >
              ✕
            </CButton>
          </CAlert>
        )}

        {submitResults.length > 0 && showSubmitResults && (
          <div className="mb-4">
            {submitResults.map((result, index) => (
              <CAlert 
                key={index}
                color={result.success ? "success" : "danger"} 
                className="mb-2 d-flex justify-content-between align-items-center"
              >
                <div>{result.message}</div>
                <CButton 
                  color="link" 
                  className={result.success ? "text-success p-0" : "text-danger p-0"} 
                  onClick={() => {
                    const newResults = [...submitResults];
                    newResults.splice(index, 1);
                    setSubmitResults(newResults);
                    if (newResults.length === 0) {
                      setShowSubmitResults(false);
                    }
                  }}
                >
                  ✕
                </CButton>
              </CAlert>
            ))}
            <div className="text-end">
              <CButton 
                color="link" 
                size="sm" 
                onClick={() => setShowSubmitResults(false)}
              >
                모두 닫기
              </CButton>
            </div>
          </div>
        )}

        {deleteResults.length > 0 && showDeleteResults && (
          <div className="mb-4">
            {deleteResults.map((result, index) => (
              <CAlert 
                key={index}
                color={result.success ? "success" : "danger"} 
                className="mb-2 d-flex justify-content-between align-items-center"
              >
                <div>{result.message}</div>
                <CButton 
                  color="link" 
                  className={result.success ? "text-success p-0" : "text-danger p-0"} 
                  onClick={() => {
                    const newResults = [...deleteResults];
                    newResults.splice(index, 1);
                    setDeleteResults(newResults);
                    if (newResults.length === 0) {
                      setShowDeleteResults(false);
                    }
                  }}
                >
                  ✕
                </CButton>
              </CAlert>
            ))}
            <div className="text-end">
              <CButton 
                color="link" 
                size="sm" 
                onClick={() => setShowDeleteResults(false)}
              >
                모두 닫기
              </CButton>
            </div>
          </div>
        )}

        {/* 임시 삭제 기능 주석 처리
        <div className="mb-4 p-3 border rounded bg-light">
          <h5>임시 삭제 기능</h5>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="상품 ID 입력"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <CButton color="danger" onClick={handleDelete}>
              삭제
            </CButton>
          </div>
        </div>
        */}

        <CategorySelector />
        <TagsInput />
        <DetailImages />
        {/* <BasicInfo /> */}
        <ProductNotice />
        {/* <ProductOptions /> */}
        <ShippingInfo />
        <ProductList />
      </CCardBody>
    </CCard>
  )
}

export default ProductRegister 