import React from 'react'
import { CSidebar, CSidebarBrand, CSidebarHeader, useColorModes } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import navigation from '../_nav'

// Zustand store import
import { useSidebarStore } from '../stores/useSidebarStore'

const AppSidebar = () => {
  const { sidebarShow, sidebarUnfoldable, toggleSidebar } = useSidebarStore();
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')

  return (
    <CSidebar
      className="border-end"
      colorScheme={colorMode === 'dark' ? 'dark' : 'light'}
      position="fixed"
      unfoldable={sidebarUnfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        toggleSidebar(visible);
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" className="d-flex align-items-center">
          <div className="sidebar-brand-text">
            <h5 className="mb-0">상품관리 시스템</h5>
          </div>
        </CSidebarBrand>
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
