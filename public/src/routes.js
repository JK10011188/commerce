import React from 'react'

// Cupang
const CupangProductList = React.lazy(() => import('./views/coupang/product-list/ProductList'))
const CupangProductRegister = React.lazy(
  () => import('./views/coupang/product-register/ProductRegister'),
)
// Naver
// const NaverProductList = React.lazy(() => import('./views/naver/product-list/ProductList'))
const NaverProductRegister = React.lazy(
  () => import('./views/naver/product-register/ProductRegister'),
)

// Image
const ImageConvert = React.lazy(() => import('./views/image/convert/ImageConvert'))

// Margin
const MarginCalculator = React.lazy(() => import('./views/margin/calculator/MarginCalculator'))

// Setting
const Account = React.lazy(() => import('./views/setting/account/Account'))

const routes = [
  { path: '/', exact: true, name: '계정관리'},
  { path: '/coupang', name: '쿠팡', element: CupangProductRegister, exact: true },
  { path: '/coupang/product-list', name: '상품목록', element: CupangProductList },
  { path: '/coupang/product-register', name: '상품등록', element: CupangProductRegister },
  { path: '/naver', name: '네이버', element: NaverProductRegister, exact: true },
  // { path: '/naver/product-list', name: '상품목록', element: NaverProductList },
  { path: '/naver/product-register', name: '상품등록', element: NaverProductRegister },
  { path: '/image', name: '이미지', element: ImageConvert, exact: true },
  { path: '/image/convert', name: '이미지합성', element: ImageConvert },
  { path: '/margin', name: '마진', element: MarginCalculator, exact: true },
  { path: '/margin/calculator', name: '마진 계산기', element: MarginCalculator },
  { path: '/setting', name: '설정', element: Account, exact: true },
  { path: '/setting/account', name: '계정관리', element: Account },
]

export default routes
