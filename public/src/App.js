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
  
  useEffect(() => {
    fetchAccounts();
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
