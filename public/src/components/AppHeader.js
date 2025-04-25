import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  CContainer, 
  CHeader, 
  CHeaderNav, 
  CHeaderToggler, 
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
  CAvatar,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilChevronLeft, 
  cilChevronRight, 
  cilSettings,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'

// Context → Zustand로 변경
import { useAccountStore } from '../stores/useAccountStore'
import { useSidebarStore } from '../stores/useSidebarStore'

const AppHeader = () => {
  const headerRef = useRef()
  const { sidebarShow, toggleSidebar } = useSidebarStore();

  const { accounts, selectedAccount, isLoading , setSelectedAccount} = useAccountStore();

  // 계정 변경 핸들러
  const handleAccountChange = (account) => {
    console.log('헤더에서 계정을 변경합니다:', account.accName);
    setSelectedAccount(account);
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    if(!selectedAccount) {
      handleAccountChange(accounts[0]);
    }

    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
      <CHeaderToggler
        onClick={() => toggleSidebar(!sidebarShow)}
      >
        {sidebarShow ? <CIcon icon={cilChevronLeft} size="lg" /> : <CIcon icon={cilChevronRight} size="lg" />}
      </CHeaderToggler>
        <CHeaderNav className="ms-auto">
          {/* 계정 선택 드롭다운 */}
          <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
              <div className="d-flex align-items-center">
                {isLoading ? (
                  <CSpinner size="sm" color="primary" />
                ) : selectedAccount ? (
                  <>
                    <CAvatar 
                      color="primary" 
                      size="md" 
                      className="me-2"
                    >
                      {selectedAccount.accName ? selectedAccount.accName.charAt(0).toUpperCase() : '?'}
                    </CAvatar>
                    <div className="d-none d-md-block">
                      <div className="fw-semibold">{selectedAccount.accName}</div>
                    </div>
                  </>
                ) : (
                  <div className="d-flex align-items-center">
                    <CAvatar color="light" size="md" className="me-2">?</CAvatar>
                    <div className="d-none d-md-block">
                      <div className="fw-semibold">계정 선택</div>
                    </div>
                  </div>
                )}
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem header className="bg-light fw-semibold py-2">계정 선택</CDropdownItem>
              
              {isLoading ? (
                <div className="text-center py-3">
                  <CSpinner size="sm" color="primary" />
                  <div className="mt-2 text-medium-emphasis">로딩 중...</div>
                </div>
              ) : accounts.length === 0 ? (
                <CDropdownItem disabled>
                  <div className="text-medium-emphasis">등록된 계정이 없습니다</div>
                </CDropdownItem>
              ) : (
                accounts.map(account => (
                  <CDropdownItem 
                    key={account.accName}
                    active={selectedAccount?.accName === account.accName}
                    onClick={() => handleAccountChange(account)}
                  >
                    <div className="d-flex align-items-center">
                      <CAvatar 
                        color="primary" 
                        size="sm" 
                        className="me-2"
                      >
                        {account.accName ? account.accName.charAt(0).toUpperCase() : '?'}
                      </CAvatar>
                      <div>
                        {account.accName}
                      </div>
                    </div>
                  </CDropdownItem>
                ))
              )}
              
              <CDropdownDivider />
              <CDropdownItem href="/#/setting/account">
                <CIcon icon={cilSettings} className="me-2" />
                계정 관리
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
