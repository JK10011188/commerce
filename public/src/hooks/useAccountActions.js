import { useAccountStore } from '../stores/useAccountStore';
import accountService from '../services/accountService';

/**
 * @typedef {Object} Account
 * @property {number} id - 계정 ID
 * @property {string} name - 계정 이름
 * @property {string} status - 계정 상태 (active | inactive)
 */

/**
 * 에러 메시지 생성
 * @param {string} operation - 작업 종류
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적인 에러 메시지
 */
const createErrorMessage = (operation, error) => {
  const baseMessage = `계정 ${operation} 중 오류가 발생했습니다.`
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return `${baseMessage} 잘못된 요청입니다.`
      case 401:
        return `${baseMessage} 인증이 필요합니다.`
      case 403:
        return `${baseMessage} 권한이 없습니다.`
      case 404:
        return `${baseMessage} 요청한 리소스를 찾을 수 없습니다.`
      case 500:
        return `${baseMessage} 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`
      default:
        return `${baseMessage} ${error.message}`
    }
  }
  return `${baseMessage} ${error.message}`
}

/**
 * 계정 관련 액션을 위한 커스텀 훅
 * @returns {Object} 계정 관련 액션 함수들
 */
export function useAccountActions() {
  const { setAccounts, setLoading, setError, setSelectedAccount, setConnectionTestResult } = useAccountStore();

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    setError(error.message || '알 수 없는 오류가 발생했습니다.');
  };

  const validateResponse = (response, context) => {
    if (!response) {
      throw new Error(`${context} 응답이 없습니다.`);
    }
    if (response.result === 'error') {
      throw new Error(response.message || `${context} 요청이 실패했습니다.`);
    }
    return response;
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountService.getAccounts();
      const validatedRes = validateResponse(res, '계정 목록 조회');
      setAccounts(validatedRes.accounts);
      
      const savedAccount = localStorage.getItem('selectedAccount');
      if (savedAccount) {
        try {
          const parsed = JSON.parse(savedAccount);
          const lastAccount = validatedRes.accounts.find((acc) => acc.accName === parsed.accName);
          if (lastAccount) {
            setSelectedAccount(lastAccount);
          } else {
            setSelectedAccount(validatedRes.accounts[0]);
          }
        } catch (error) {
          console.error('저장된 계정 정보 복원 중 오류:', error);
          setSelectedAccount(validatedRes.accounts[0]);
        }
      }
    } catch (err) {
      const errorMessage = createErrorMessage('조회', err);
      handleError(err, '계정 목록 조회');
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (data) => {
    try {
      setLoading(true);
      if (!data.accName) {
        handleError('계정 이름을 입력해주세요.', '계정 추가');
        throw err;
      }
      const res = await accountService.addAccount(data);
      validateResponse(res, '계정 추가');
      await fetchAccounts();
    } catch (err) {
      handleError(err, '계정 추가');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (data) => {
    try {
      setLoading(true);
      const res = await accountService.updateAccount(data);
      validateResponse(res, '계정 수정');
      await fetchAccounts();
    } catch (err) {
      handleError(err, '계정 수정');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accName) => {
    try {
      setLoading(true);
      const res = await accountService.deleteAccount(accName);
      validateResponse(res, '계정 삭제');
      await fetchAccounts();
    } catch (err) {
      handleError(err, '계정 삭제');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (id) => {
    try {
      setLoading(true);
      const res = await accountService.testConnection(id);
      const validatedRes = validateResponse(res, '연결 테스트');
      setConnectionTestResult(validatedRes);
      return validatedRes;
    } catch (err) {
      const errorMessage = createErrorMessage('연결 테스트', err);
      handleError(err, '연결 테스트');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    fetchAccounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    testConnection 
  };
}
