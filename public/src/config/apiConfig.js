// API URL 및 공통 설정을 관리하는 설정 파일

/**
 * 환경 변수에 안전하게 접근하기 위한 헬퍼 함수
 * @param {string} key - 환경 변수 키
 * @param {*} defaultValue - 기본값
 * @returns {*} 환경 변수 값 또는 기본값
 */
const getEnv = (key, defaultValue) => {
  // window._env_는 런타임 환경 변수를 위한 객체 (없으면 빈 객체 사용)
  const runtimeEnv = window._env_ || {};
  
  // process.env가 존재하면 그것을 사용, 없으면 빈 객체 사용
  const processEnv = typeof process !== 'undefined' && process.env 
    ? process.env 
    : {};
    
  // 우선순위: 런타임 환경 변수 > process.env > 기본값
  return runtimeEnv[key] || processEnv[key] || defaultValue;
};

/**
 * 애플리케이션 환경 설정
 * - development: 개발 환경
 * - production: 프로덕션 환경
 */
export const APP_ENV = getEnv('NODE_ENV', 'development');

/**
 * 환경별 API 기본 URL 설정
 */
const API_BASE_URLS = {
  // development: 'http://127.0.0.1:5001/commerse-interface/asia-northeast3/app',
  // production: 'http://127.0.0.1:5001/commerse-interface/asia-northeast3/app',
  development: 'https://asia-northeast3-commerse-interface.cloudfunctions.net/app',
  production: 'https://asia-northeast3-commerse-interface.cloudfunctions.net/app',
};

/**
 * API 기본 URL
 * 환경변수 REACT_APP_API_BASE_URL이 설정되어 있으면 해당 값을 사용하고,
 * 없으면 현재 환경에 맞는 기본 URL을 사용
 */
export const API_BASE_URL = getEnv('REACT_APP_API_BASE_URL', API_BASE_URLS[APP_ENV]);

/**
 * API 버전
 * 만약 API 버전을 URL에 포함시키는 경우 사용 (예: /api/v1)
 */
export const API_VERSION = getEnv('REACT_APP_API_VERSION', '');

/**
 * API 엔드포인트 설정
 * 각 기능별 엔드포인트를 객체로 관리
 */
export const API_ENDPOINTS = {

  // 계정 관리
  ACCOUNT: {
    SEARCH_ACCOUNTS: '/searchAccounts',
    ADD_ACCOUNT: '/addAccount',
    UPDATE_ACCOUNT: '/updateAccount',
    DELETE_ACCOUNT: (accName) => `/deleteAccount?accName=${accName}`,
  },
  
  // 제품 관리
  PRODUCT: {
    SEARCH_CATEGORY_TAGS: '/getKeywords',
  },
  
  // 쿠팡 통합
  COUPANG: {
    SEARCH_CATEGORIES: '/CPsearchCategory',
    SEARCH_CATEGORY_METAS: '/CPsearchCategoryMeta',
    REGISTER_PRODUCT: '/CPaddProducts',
    DELETE_PRODUCT: '/CPdeleteProducts',
    SEARCH_PRODUCTS: '/CPsearchProd',
  },
  
  // 네이버 통합
  NAVER: {
    SEARCH_1ST_CATEGORIES: '/NsearchRootCategory',
    SEARCH_SUB_CATEGORIES: '/NsearchCategory',
    SEARCH_CATEGORY_DETAIL: '/NsearchCategoryDetail',
    SEARCH_TAG_SUGGESTIONS: '/getRecommendTags',
    SEARCH_TAG_RESTRICTIONS: '/getTagRestrictions',
    SEARCH_PRODUCT_ATTRIBUTES: '/NsearchAttribute',
    SEARCH_PRODUCT_PROVIDED_NOTICE: '/getProductProvidedNotice',
    REGISTER_PRODUCT: '/NaddProducts',
  }
};

/**
 * API 기본 헤더
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * API 타임아웃 설정 (밀리초)
 */
export const API_TIMEOUT = 300000;

/**
 * API URL 생성 함수
 * @param {string} endpoint - API 엔드포인트
 * @returns {string} 완전한 API URL
 */
export const createApiUrl = (endpoint) => {
  // 이미 완전한 URL이면 그대로 반환
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // 버전이 있는 경우와 없는 경우 처리
  if (API_VERSION) {
    return `${API_BASE_URL}/${API_VERSION}${endpoint}`;
  }
  
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * API 요청 옵션 생성 함수
 * @param {Object} options - 요청 옵션
 * @returns {Object} 완성된 요청 옵션
 */
export const createRequestOptions = (options = {}) => {
  const { headers, ...restOptions } = options;
  
  return {
    headers: {
      ...API_HEADERS,
      ...headers
    },
    timeout: API_TIMEOUT,
    ...restOptions
  };
};

/**
 * 환경별 로깅 수준 설정
 */
export const API_LOGGING = {
  development: true,
  production: false
}[APP_ENV];

/**
 * API 호출 디버그 로그 함수
 */
export const logApiCall = (method, url, data) => {
  if (API_LOGGING) {
    // console.log(`🌐 API ${method} ${url}`, data || '');
  }
};

export default {
  API_BASE_URL,
  API_VERSION,
  API_ENDPOINTS,
  API_HEADERS,
  API_TIMEOUT,
  createApiUrl,
  createRequestOptions,
  logApiCall
}; 
