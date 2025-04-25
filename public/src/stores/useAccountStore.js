import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} Account
 * @property {number} id - 계정 ID
 * @property {string} name - 계정 이름
 * @property {string} status - 계정 상태 (active | inactive)
 */

/**
 * @typedef {Object} AccountState
 * @property {Account[]} accounts - 계정 목록
 * @property {Account|null} selectedAccount - 현재 선택된 계정
 * @property {boolean} isLoading - 로딩 상태
 * @property {string|null} error - 에러 메시지
 */

/**
 * 계정 관리를 위한 Zustand 스토어
 * @type {import('zustand').Store<AccountState>}
 */
export const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccount: null,
      isLoading: false,
      error: null,
      connectionTestResult: null,

      // Setter 함수들
      setAccounts: (accounts) => {
        set({ accounts });
      },

      setSelectedAccount: (account) => {
        // localStorage에서 기존 선택된 계정 제거
        localStorage.removeItem('selectedAccount');
        // 새로운 계정 설정
        set({ selectedAccount: account });
        // 새로운 계정을 localStorage에 저장
        if (account) {
          localStorage.setItem('selectedAccount', JSON.stringify(account));
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setConnectionTestResult: (result) => set({ connectionTestResult: result }),
      clearError: () => set({ error: null }),

      // 상태 초기화
      resetState: () => {
        localStorage.removeItem('selectedAccount');
        set({
          accounts: [],
          selectedAccount: null,
          isLoading: false,
          error: null,
          connectionTestResult: null
        });
      },
    }),
    {
      name: 'account-storage',
      // persist 미들웨어 설정
      partialize: (state) => ({
        accounts: state.accounts,
        selectedAccount: state.selectedAccount,
      }),
      // 저장된 상태를 불러올 때 실행되는 함수
      onRehydrateStorage: () => (state) => {
        if (state) {
          const savedAccount = localStorage.getItem('selectedAccount');
          if (savedAccount) {
            state.selectedAccount = JSON.parse(savedAccount);
          }
        }
      },
    }
  )
);
