import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useAccountActions } from './hooks/useAccountActions'

import { CSpinner } from '@coreui/react'
import './scss/style.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// AccountProvider 내부에서 동작하는 컴포넌트
const App = () => {
  const { fetchAccounts } = useAccountActions();
  
  // 계정 변경 이벤트 리스너
  useEffect(() => {
    fetchAccounts();
    const handleAccountChange = (event) => {
      console.log('App: 계정 변경 이벤트 감지', event.detail?.accName);
    };
    
    window.addEventListener('account-changed', handleAccountChange);
    
    return () => {
      window.removeEventListener('account-changed', handleAccountChange);
    };
  }, []);

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App
