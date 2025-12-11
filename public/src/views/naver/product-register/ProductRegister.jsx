import React, { useEffect, memo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CContainer,
  CForm,
  CAlert,
  CSpinner,
  CProgress
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilCheckCircle, cilX } from '@coreui/icons'
import CategorySelector from './components/CategorySelector'
import BasicInfoCard from './components/BasicInfoCard'
import TagsCard from './components/TagsCard'
import Products from './components/Products'
import ProductAttributesCard from './components/ProductAttributesCard'
import DetailImageUploader from './components/DetailImageUploader'
import PreviewModal from './components/PreviewModal'
import '../../style/css/ProductRegister.css'
// Zustand 방식으로 변경: Provider 필요 없음
import { useNaverProductActions } from '../../../hooks/useNaverProductActions'
import { useProductStore } from '../../../stores/useNaverStore'

const ProductRegisterForm = memo(() => {
  const {
    previewModal,
    selectedDetailImage,
    setPreviewModal,
    removeDetailImage,
    registerProduct,
    loading,
    makeNewProduct,
    addProduct
  } = useNaverProductActions();

  const { resetState, products, selectedCategory, detailImages, tags, setMainProduct, isOptionProductMode } = useProductStore();
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ 
    current: 0, 
    total: 0, 
    label: '',
    groupResults: [] // { label: '옵션값', status: 'success' | 'error' | 'pending', error: '에러메시지' }
  });
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [dataPreview, setDataPreview] = useState('');

  useEffect(() => {
    resetState();
  }, []);

  // 초기 상품 5개 설정
  useEffect(() => {
    if (products.length === 0 && !isOptionProductMode) {
      for(let i = 0; i < 5; i++){
        const newProduct = makeNewProduct();
        addProduct(newProduct);
      }
      setMainProduct(products[0]);
    }
  }, [products.length, isOptionProductMode]);

  // ESC 키로 모달 닫기 및 DEL 키로 상세 이미지 삭제 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewModal) {
        setPreviewModal(false);
      }
      if (e.key === 'Delete' && selectedDetailImage) {
        removeDetailImage(selectedDetailImage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModal, selectedDetailImage, setPreviewModal, removeDetailImage]);

  const showPreviewModal = () => {
    setPreviewModal(true);
  };

  const validateForm = () => {
    // 카테고리 체크
    if (!selectedCategory || !selectedCategory.id) {
      setValidationError('카테고리를 선택해주세요.');
      document.querySelector('.validation-error')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }

    // 태그 없을때
    if (!tags || tags.length === 0) {
      setValidationError('태그를 입력해주세요.');
      document.querySelector('.validation-error')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }

    // 상품이 있는데 상품명이 없을때 또는 상품 가격이 없을때
    if (products && products.length > 0 && !products.some(product => product.name?.trim())) {
      setValidationError('상품명과 상품명을 입력해주세요.');
      document.querySelector('.validation-error')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }

    // 상세 이미지 체크
    if (!detailImages || detailImages.length === 0) {
      setValidationError('최소 1개의 상세 이미지를 추가해주세요.');
      document.querySelector('.validation-error')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    }

    setValidationError('');
    return true;
  };

  // 알림 제거 함수
  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // 알림 추가 함수
  const addNotification = (notification) => {
    const index = notifications.length;
    setNotifications(prev => [...prev, notification]);
    
    // 알림이 추가된 후 해당 위치로 스크롤
    setTimeout(() => {
      const alerts = document.querySelectorAll('.notification-alert');
      if (alerts[index]) {
        alerts[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    // 성공 메시지만 3초 후 자동 제거
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(index);
      }, 3000);
    }
  };

  const removeAllNotifications = () => {
    setNotifications([]);
  };

  const handleReset = () => {
    resetState();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setNotifications([]);
      if (isOptionProductMode) {
        setShowProgress(true);
        setProgressInfo({ current: 0, total: 0, label: '', groupResults: [] });
      }
      try {
        // 옵션 상품 모드일 때는 먼저 데이터 포맷 미리보기 팝업만 노출
        if (isOptionProductMode) {
          const summarizeImage = (img) => {
            if (!img) return null;
            const fileStr = typeof img.file === 'string'
              ? `${img.file.slice(0, 30)}...`
              : '<File>';
            return {
              id: img.id,
              isMain: img.isMain,
              file: fileStr,
            };
          };

          const groupMap = {};
          const keyOrder = [];
          products.forEach((p, idx) => {
            const key = p.options?.[0]?.values?.[0]?.value ?? `group-${idx}`;
            if (!groupMap[key]) {
              groupMap[key] = [];
              keyOrder.push(key);
            }
            groupMap[key].push(p);
          });

          const payloadPreview = keyOrder.map((key, idx) => {
            const groupProducts = groupMap[key];
            return {
              groupKey: `${idx + 1}`,
              mainProduct: {
                name: groupProducts[0]?.name,
                options: groupProducts[0]?.options,
                additionalImages: (groupProducts[0]?.additionalImages || []).map(summarizeImage),
              },
              products: groupProducts.map((p) => ({
                name: p.name,
                regularPrice: p.regularPrice,
                price: p.price,
                discountRate: p.discountRate,
                options: p.options,
                additionalImages: (p.additionalImages || []).map(summarizeImage),
              })),
              detailImages: (detailImages || []).map(summarizeImage),
            }
          });

          setDataPreview(JSON.stringify(payloadPreview, null, 2));
          setShowDataPreview(true);
          return; // 실제 등록은 일시 중지
        }

        const handler = undefined; // 일반 모드: 진행 콜백 없음
        const results = await registerProduct(handler);

        if(results && results.length > 0) {
          results.forEach(result => {
            if (result.error) {
              addNotification({
                type: 'error',
                message: `${result.product.name} 상품 등록 실패 : ${result.error}`
              });
            } else {
              addNotification({
                type: 'success',
                message: `${result.product.name} 상품이 등록되었습니다.`
              });
            }
          });

          // 모든 상품이 성공적으로 등록된 경우 상태 초기화
          if (results.every(result => !result.error)) {
            resetState();
          }
        } else if(results){
          addNotification({
            type: 'error',
            message: results.error
          });
        }
      } catch (error) {
        addNotification({
          type: 'error',
          message: error.message
        });
      } finally {
        setIsSubmitting(false);
        setShowProgress(false);
      }
    }
  };

  return (
    <CForm onSubmit={handleSubmit} onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    }}>
      <CCard className="mb-4">
      <CCardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
        <strong>상품 등록</strong>
        <div className="d-flex gap-2">
          <CButton color="secondary" onClick={handleReset}>
            초기화
          </CButton>
          <CButton 
              color="primary" 
              onClick={showPreviewModal}
              disabled={isSubmitting || loading}
            >
            <CIcon icon={cilSearch} className="me-2" />
              미리보기
            </CButton>
          <CButton 
              color="primary" 
              type="submit"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  등록 중...
                </>
              ) : (
                '상품등록'
              )}
            </CButton>
        </div>
      </CCardHeader>
        <CCardBody>
          {validationError && (
            <CAlert color="danger" className="mb-4 validation-error">
              {validationError}
            </CAlert>
          )}
          
          {notifications.map((notification, index) => (
            <CAlert 
              key={index}
              color={notification.type === 'success' ? 'success' : 'danger'} 
              className="mb-4 notification-alert"
              dismissible={notification.type === 'error'}
              onDismiss={() => removeNotification(index)}
            >
              {notification.message}
            </CAlert>
          ))}
          {notifications.length > 0 && (
            <div className="text-end mb-4">
              <CButton 
                color="link" 
                size="sm" 
                onClick={removeAllNotifications}
              >
                모두 닫기
              </CButton>
            </div>
          )}
          
          {/* 카테고리 선택 섹션 */}
          <CategorySelector />
                   
          {/* 상품 속성 */}
          <ProductAttributesCard />
          
          {/* 태그 설정 */}
          <TagsCard />

          {/* 상세 설명 이미지 업로더 */}
          <DetailImageUploader />

          {/* 기본 정보 */}
          <BasicInfoCard />
          
          {/* 상품 정보 */}
          <Products />
          
        </CCardBody>
      </CCard>
      {/* 미리보기 모달 */}
      <PreviewModal />

      {/* 등록 진행 모달 */}
      <CModal visible={showProgress} backdrop="static" keyboard={false} alignment="center">
        <CModalHeader>
          <CModalTitle>옵션 상품 등록 진행</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* 프로그레스바 */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">진행 상황</span>
              <span>{progressInfo.current} / {progressInfo.total || 0} 그룹</span>
            </div>
            <CProgress 
              value={progressInfo.total > 0 ? (progressInfo.current / progressInfo.total) * 100 : 0}
              color="primary"
              className="mb-2"
            />
            {progressInfo.label && progressInfo.groupResults.find(r => r.label === progressInfo.label)?.status === 'pending' && (
              <div className="text-muted small">
                <CSpinner size="sm" className="me-2" />
                현재 처리 중: {progressInfo.label}
              </div>
            )}
          </div>

          {/* 그룹별 결과 목록 */}
          <div className="border-top pt-3">
            <div className="fw-bold mb-3">그룹별 등록 결과</div>
            {(!progressInfo.groupResults || progressInfo.groupResults.length === 0) ? (
              <div className="text-muted text-center py-3">등록 대기 중...</div>
            ) : (
              <div className="list-group">
                {progressInfo.groupResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="d-flex align-items-center justify-content-between p-2 border-bottom"
                  >
                    <div className="d-flex align-items-center">
                      {result.status === 'success' && (
                        <CIcon icon={cilCheckCircle} className="text-success me-2" size="lg" />
                      )}
                      {result.status === 'error' && (
                        <CIcon icon={cilX} className="text-danger me-2" size="lg" />
                      )}
                      {result.status === 'pending' && (
                        <CSpinner size="sm" className="me-2" />
                      )}
                      <span className="fw-medium">{result.label}</span>
                    </div>
                    {result.status === 'error' && result.error && (
                      <div className="text-danger small ms-3" style={{ maxWidth: '60%', wordBreak: 'break-word' }}>
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CModalBody>
        {progressInfo.current === progressInfo.total && progressInfo.total > 0 && (
          <CModalFooter>
            <CButton 
              color="primary" 
              onClick={() => {
                setShowProgress(false);
                setIsSubmitting(false);
              }}
            >
              닫기
            </CButton>
          </CModalFooter>
        )}
      </CModal>

      {/* 데이터 포맷 미리보기 모달 (옵션 상품 등록 모드) */}
      <CModal visible={showDataPreview} onClose={() => setShowDataPreview(false)} size="lg" scrollable>
        <CModalHeader>
          <CModalTitle>옵션 상품 등록 요청 포맷 (미리보기)</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f9fa', padding: '12px', borderRadius: '4px' }}>
{dataPreview}
          </pre>
          <div className="text-muted small mt-2">
            실제 등록은 이 미리보기 확인 후 진행됩니다.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => {
            setShowDataPreview(false);
            setIsSubmitting(false);
          }}>
            취소
          </CButton>
          <CButton 
            color="primary" 
            onClick={async () => {
              // 미리보기 팝업 닫기
              setShowDataPreview(false);
              
              // 프로그레스바 팝업으로 전환
              setShowProgress(true);
              setProgressInfo({ 
                current: 0, 
                total: 0, 
                label: '',
                groupResults: []
              });
              
              try {
                // 진행 콜백 핸들러
                const progressHandler = {
                  onGroupStart: ({ current, total, label }) => {
                    setProgressInfo(prev => {
                      const newGroupResults = [...(prev.groupResults || [])];
                      // 새 그룹 시작 시 pending 상태로 추가
                      if (!newGroupResults.find(r => r.label === label)) {
                        newGroupResults.push({ label, status: 'pending', error: null });
                      }
                      return {
                        ...prev,
                        current,
                        total,
                        label,
                        groupResults: newGroupResults
                      };
                    });
                  },
                  onGroupComplete: ({ label, success, error }) => {
                    console.log(`[옵션 상품 등록] 그룹 완료:`, { label, success, error });
                    setProgressInfo(prev => {
                      const currentGroupResults = prev.groupResults || [];
                      const newGroupResults = currentGroupResults.map(r => 
                        r.label === label 
                          ? { label, status: success ? 'success' : 'error', error: error || null }
                          : r
                      );
                      return {
                        ...prev,
                        groupResults: newGroupResults
                      };
                    });
                  }
                };
                
                const results = await registerProduct(progressHandler);
                
                if(results && results.length > 0) {
                  results.forEach((result, idx) => {
                    const groupLabel = result.product?.options?.[0]?.values?.[0]?.value || `그룹 ${idx + 1}`;
                    
                    if (result.error) {
                      // 서버에서 받은 에러 메시지 파싱
                      let errorMessage = '';
                      if (typeof result.error === 'string') {
                        errorMessage = result.error;
                      } else if (result.error?.message) {
                        errorMessage = result.error.message;
                      } else if (result.error?.error) {
                        errorMessage = typeof result.error.error === 'string' 
                          ? result.error.error 
                          : JSON.stringify(result.error.error);
                      } else {
                        errorMessage = JSON.stringify(result.error);
                      }
                      
                      console.error(`[옵션 상품 등록 실패] 그룹: ${groupLabel}`, {
                        groupLabel,
                        product: result.product?.name,
                        serverError: result.error,
                        parsedErrorMessage: errorMessage,
                        fullResult: result
                      });
                      
                      addNotification({
                        type: 'error',
                        message: `${result.product?.name || groupLabel} 등록 실패: ${errorMessage}`
                      });
                    } else {
                      console.log(`[옵션 상품 등록 성공] 그룹: ${groupLabel}`, {
                        groupLabel,
                        product: result.product?.name,
                        result: result
                      });
                      
                      addNotification({
                        type: 'success',
                        message: `${result.product?.name || groupLabel} 등록 완료`
                      });
                    }
                  });
                  
                  if (results.every(result => !result.error)) {
                    resetState();
                  }
                } else if(results){
                  const errorMessage = results.error || '등록 중 오류가 발생했습니다.';
                  console.error('[옵션 상품 등록 실패]', results);
                  addNotification({
                    type: 'error',
                    message: errorMessage
                  });
                }
              } catch (error) {
                console.error('[옵션 상품 등록 예외 발생]', error);
                addNotification({
                  type: 'error',
                  message: error.message || '등록 중 오류가 발생했습니다.'
                });
              } finally {
                setIsSubmitting(false);
                // 모든 그룹이 완료되면 프로그레스바는 유지 (닫기 버튼으로 닫을 수 있음)
              }
            }}
            disabled={isSubmitting}
          >
            확인 및 등록
          </CButton>
        </CModalFooter>
      </CModal>
    </CForm>
  );
});

ProductRegisterForm.displayName = 'ProductRegisterForm';

const ProductRegister = memo(() => {
  return (
    <CContainer fluid>
      <ProductRegisterForm />
    </CContainer>
  );
});

ProductRegister.displayName = 'ProductRegister';

export default ProductRegister;
