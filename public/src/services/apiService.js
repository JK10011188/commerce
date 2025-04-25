import {
  createApiUrl,
  createRequestOptions,
  logApiCall,
  API_TIMEOUT
} from '../config/apiConfig';

/**
 * API 호출 오류 클래스
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API 요청 타임아웃 처리 함수
 * @param {Promise} promise - API 요청 프로미스
 * @param {number} timeout - 타임아웃 시간 (밀리초)
 * @returns {Promise} 타임아웃 처리된 프로미스
 */
const withTimeout = (promise, timeout = API_TIMEOUT) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new ApiError('요청 시간이 초과되었습니다.', 408)), timeout)
    )
  ]);
};

/**
 * 기본 API 호출 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const apiRequest = async (endpoint, options = {}) => {
  const { ...requestOptions } = options;
  
  try {
    // API URL 생성
    const url = createApiUrl(endpoint);
    
    // 요청 옵션 생성
    const finalOptions = createRequestOptions({
      ...requestOptions,
      headers: {
        ...requestOptions.headers
      }
    });
    
    // API 호출 로깅
    logApiCall(finalOptions.method || 'GET', url, finalOptions.body);
    
    // API 요청 전송 (타임아웃 처리)
    const response = await withTimeout(fetch(url, finalOptions));
    
    // 응답 처리
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = null;
      }
      
      throw new ApiError(
        errorData?.message || `API 요청 실패: ${response.status}`,
        response.status,
        errorData
      );
    }
    
    // 204 No Content 응답 처리
    if (response.status === 204) {
      return { success: true };
    }
    
    // JSON 응답 파싱
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('JSON 파싱 오류:', e);
      return { success: true };
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API 요청 오류:', error);
    throw new ApiError(error.message || '알 수 없는 오류가 발생했습니다.', 500);
  }
};

/**
 * GET 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options
  });
};

/**
 * POST 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * PUT 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * PATCH 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const patch = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * DELETE 요청 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options
  });
};

/**
 * 파일 업로드 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {FormData} formData - 폼 데이터
 * @param {Object} options - 요청 옵션
 * @returns {Promise} API 응답 프로미스
 */
export const uploadFile = (endpoint, formData, options = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    headers: {
      // Content-Type은 FormData에서 자동으로 설정됨
      ...options.headers
    },
    body: formData,
    ...options
  });
};

/**
 * API 서비스 객체
 */
export const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile
};

export default apiService; 