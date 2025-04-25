import React from 'react'
import CIcon from '@coreui/icons-react'
import { cibNintendo, cibProtoIo, cilSatelite, cilUser, cilCalculator } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'Channels',
  },
  {
    component: CNavGroup,
    name: '쿠팡',
    to: '/coupang',
    icon: <CIcon icon={cibProtoIo} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: '상품목록',
      //   to: '/cupang/product-list',
      // },
      {
        component: CNavItem,
        name: '상품등록',
        to: '/coupang/product-register',
      },
    ],
  },
  {
    component: CNavGroup,
    name: '네이버',
    to: '/naver',
    icon: <CIcon icon={cibNintendo} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: '상품목록',
      //   to: '/naver/product-list',
      // },
      {
        component: CNavItem,
        name: '상품등록',
        to: '/naver/product-register',
      },
    ],
  },
  {
    component: CNavItem,
    name: '이미지합성',
    to: '/image/convert',
    icon: <CIcon icon={cilSatelite} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '마진 계산기',
    to: '/margin/calculator',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '계정관리',
    to: '/setting/account',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

export default _nav
