import apiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * 계정 관리 API 서비스
 */
export const accountService = {
  /**
   * 모든 계정 목록 가져오기
   * @returns {Promise} 계정 목록
   */
  getAccounts: () => {
    return apiService.get(API_ENDPOINTS.ACCOUNT.SEARCH_ACCOUNTS);
  },
  
  /**
   * 새 계정 생성하기
   * @param {Object} accountData - 계정 데이터
   * @returns {Promise} 생성된 계정 정보
   */
  addAccount: (accountData) => {
    return apiService.post(API_ENDPOINTS.ACCOUNT.ADD_ACCOUNT, accountData);
  },
  
  /**
   * 계정 정보 업데이트
   * @param {Object} accountData - 업데이트할 계정 데이터
   * @returns {Promise} 업데이트된 계정 정보
   */
  updateAccount: (accountData) => {
    return apiService.put(API_ENDPOINTS.ACCOUNT.UPDATE_ACCOUNT, accountData);
  },
  
  /**
   * 계정 삭제하기
   * @param {number|string} id - 계정 ID
   * @returns {Promise} 삭제 결과
   */
  deleteAccount: (accName) => {
    return apiService.delete(API_ENDPOINTS.ACCOUNT.DELETE_ACCOUNT(accName));
  },
  
  /**
   * 계정 활성화/비활성화 토글
   * @param {number|string} id - 계정 ID
   * @returns {Promise} 업데이트된 계정 상태
   */
  toggleAccountStatus: (id) => {
    return apiService.patch(API_ENDPOINTS.ACCOUNT.TOGGLE_STATUS(id));
  },
  
  /**
   * API 연결 테스트
   * @param {string} platform - API 플랫폼 ("coupang" 또는 "naver")
   * @param {Object} credentials - API 인증 정보
   * @returns {Promise} 테스트 결과
   */
  testConnection: (platform, credentials) => {
    const endpoint = 
      platform === 'coupang' 
        ? API_ENDPOINTS.COUPANG.TEST_CONNECTION 
        : API_ENDPOINTS.NAVER.TEST_CONNECTION;
        
    return apiService.post(endpoint, credentials);
  }
};

export default accountService; 