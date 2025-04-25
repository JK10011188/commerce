import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * 제품 관리 API 서비스
 */
export const productService = {
  /**
   * 쿠팡 카테고리 가져오기
   * @returns {Promise} 
   */
  getCoupangCategories: (data) => {
    return apiService.post(API_ENDPOINTS.COUPANG.SEARCH_CATEGORIES, data);
  },

  getCategoryMetas: (data) => {
    return apiService.post(API_ENDPOINTS.COUPANG.SEARCH_CATEGORY_METAS, data);
  },

  registerCoupangProduct: (data) => {
    return apiService.post(API_ENDPOINTS.COUPANG.REGISTER_PRODUCT, data);
  },

  deleteCoupangProduct: (data) => {
    return apiService.post(API_ENDPOINTS.COUPANG.DELETE_PRODUCT, data);
  },

  getCoupangProducts: (data) => {
    return apiService.post(API_ENDPOINTS.COUPANG.SEARCH_PRODUCTS, data);
  },

  /**
   * 1차 카테고리 가져오기
   * @returns {Promise} 1차 카테고리 목록
   */
  get1stCategories: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_1ST_CATEGORIES, data);
  },

  /**
   * 2차 카테고리 가져오기
   * @returns {Promise} 2차 카테고리 목록
   */
  getSubCategories: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_SUB_CATEGORIES, data);
  },

  /**
   * 카테고리 태그 가져오기
   * @returns {Promise} 카테고리 태그 목록
   */
  getCategoryTags: (data) => {
    return apiService.post(API_ENDPOINTS.PRODUCT.SEARCH_CATEGORY_TAGS, data);  
  },

  /**
   * 태그 추천 가져오기
   * @returns {Promise} 태그 추천 목록
   */
  getTagSuggestions: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_TAG_SUGGESTIONS, data);  
  },

  /**
   * 태그 제한사항 가져오기
   * @returns {Promise} 태그 제한사항 목록
   */
  getTagRestrictions: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_TAG_RESTRICTIONS, data);  
  },
  
  /**
   * 상품 속성 가져오기
   * @returns {Promise} 상품 속성 목록
   */
  getProductAttributes: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_PRODUCT_ATTRIBUTES, data);  
  },

  /**
   * 상품정보제공고시 가져오기
   * @returns {Promise} 상품정보제공고시 목록
   */
  getProductProvidedNotice: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.SEARCH_PRODUCT_PROVIDED_NOTICE, data);  
  },

  /**
   * 상품 등록
   * @param {Object} data - 상품 데이터
   * @returns {Promise} 등록 결과
   */
  registerProduct: (data) => {
    return apiService.post(API_ENDPOINTS.NAVER.REGISTER_PRODUCT, data);  
  },
};

export default productService; 