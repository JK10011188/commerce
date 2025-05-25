import React, { useEffect, memo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CForm,
  CAlert,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
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

  const { resetState, products, selectedCategory, detailImages, tags, setMainProduct } = useProductStore();
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    resetState();
  }, []);

  // 초기 상품 5개 설정
  useEffect(() => {
    if (products.length === 0) {
      for(let i = 0; i < 5; i++){
        const newProduct = makeNewProduct();
        addProduct(newProduct);
      }
      setMainProduct(products[0]);
    }
  }, [products.length]);

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
      try {
        const results = await registerProduct();

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
