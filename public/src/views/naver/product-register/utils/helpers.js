/**
 * 유틸리티 함수 모음
 */

/**
 * 디바운스 함수 - 연속적인 호출에서 마지막 호출만 실행되도록 함
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간(ms)
 * @returns {Function} - 디바운스된 함수
 */
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 가격 포맷팅
 * @param {string|number} price - 포맷팅할 가격
 * @returns {string} - 포맷팅된 가격
 */
export const formatPrice = (price) => {
  if (!price) return '0';
  return new Intl.NumberFormat('ko-KR').format(price);
};

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {number} maxSize - 최대 파일 크기(바이트)
 * @returns {boolean} - 유효한 이미지 파일인지 여부
 */
export const validateImageFile = (file, maxSize = 10 * 1024 * 1024) => {
  // 파일 타입 검사
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      message: '이미지 파일만 업로드 가능합니다.'
    };
  }

  // 파일 크기 검사
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `파일 크기는 ${maxSize / (1024 * 1024)}MB를 초과할 수 없습니다.`
    };
  }

  return {
    valid: true,
    message: '유효한 파일입니다.'
  };
};

/**
 * 이미지 배열을 정렬하여 대표 이미지가 맨 앞에 오도록 함
 * @param {Array} images - 이미지 객체 배열
 * @returns {Array} - 정렬된 이미지 배열
 */
export const sortImagesWithMainFirst = (images) => {
  if (!images || images.length === 0) return [];
  
  const mainImage = images.find(img => img.isMain);
  const otherImages = images.filter(img => !img.isMain);
  
  return mainImage ? [mainImage, ...otherImages] : images;
};

/**
 * 이미지를 프리뷰 URL로 변환
 * @param {File} file - 변환할 이미지 파일
 * @returns {Promise} - 프리뷰 URL이 포함된 Promise
 */
export const getImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * 숫자만 입력 가능하도록 키 이벤트 처리
 * @param {Event} event - 키 이벤트
 */
export const handleNumberKeyDown = (event) => {
  // 숫자, 백스페이스, 탭, 화살표 등만 허용
  const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (
    !(event.key >= '0' && event.key <= '9') && 
    !allowedKeys.includes(event.key)
  ) {
    event.preventDefault();
  }
};

/**
 * 드래그 이벤트 핸들러 생성 (중복 코드 방지)
 * @param {Function} setActive - 드래그 활성화 상태를 설정하는 함수
 * @param {Function} handleFiles - 파일 처리 함수
 * @returns {Object} - 드래그 이벤트 핸들러 객체
 */
export const createDragHandlers = (setActive, handleFiles) => {
  return {
    handleDragEnter: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(true);
    },
    handleDragOver: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    handleDragLeave: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(false);
    },
    handleDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
  };
}; 