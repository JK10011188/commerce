import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CButton,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalculator } from '@coreui/icons'

const MarginCalculator = () => {
  // 네이버 상품 상태 (5행 고정)
  const [naverProducts, setNaverProducts] = useState([
    { 
      id: 1, 
      supplyPrice: '', // 공급가
      commission: '', // 수수료
      shippingFee: '', // 택배비
      margin: 0, // 마진 (자동 계산)
      marginRate: 0, // 마진률 (자동 계산)
      sellingPrice: 0, // 판매가 (자동 계산)
      actualShippingFee: 0, // 실제 택배비 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 2, 
      supplyPrice: '', 
      commission: '', 
      shippingFee: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      actualShippingFee: 0, // 실제 택배비 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 3, 
      supplyPrice: '', 
      commission: '', 
      shippingFee: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      actualShippingFee: 0, // 실제 택배비 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 4, 
      supplyPrice: '', 
      commission: '', 
      shippingFee: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      actualShippingFee: 0, // 실제 택배비 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 5, 
      supplyPrice: '', 
      commission: '', 
      shippingFee: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      actualShippingFee: 0, // 실제 택배비 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    }
  ])

  // 쿠팡 상품 상태 (5행 고정)
  const [coupangProducts, setCoupangProducts] = useState([
    { 
      id: 1, 
      supplyPrice: '', // 공급가
      commission: '', // 수수료
      margin: 0, // 마진 (자동 계산)
      marginRate: 0, // 마진률 (자동 계산)
      sellingPrice: 0, // 판매가 (자동 계산)
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 2, 
      supplyPrice: '', 
      commission: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 3, 
      supplyPrice: '', 
      commission: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 4, 
      supplyPrice: '', 
      commission: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      settlementPrice: 0, // 정산가 (자동 계산)
    },
    { 
      id: 5, 
      supplyPrice: '', 
      commission: '', 
      margin: 0, 
      marginRate: 0, 
      sellingPrice: 0, 
      settlementPrice: 0, // 정산가 (자동 계산)
    }
  ])
  
  const [error, setError] = useState('')

  // 숫자 입력 필드에서 스크롤 이벤트 방지
  const preventScrollOnNumberInput = (e) => {
    e.target.blur()
  }

  const handleInputChange = (e, id, field, updateFunction) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // 숫자만 남도록 정규식 처리
    updateFunction(id, field, value);
  };

  // 네이버 상품 정보 업데이트 함수
  const updateNaverProduct = (id, field, value) => {
    if(field === 'supplyPrice'){
      setCoupangProducts(coupangProducts.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      ))
    }
    // 1번 상품의 수수료나 택배비가 변경되면 다른 상품들도 업데이트
    if ((field === 'commission' || field === 'shippingFee') && id === 1) {
      setNaverProducts(naverProducts.map(product => 
        product.id === id 
          ? { ...product, [field]: value } 
          : { ...product, [field]: value }
      ))
    } else {
      // 다른 필드나 다른 상품은 일반적인 업데이트
      setNaverProducts(naverProducts.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      ))
    }
  }

  // 쿠팡 상품 정보 업데이트 함수
  const updateCoupangProduct = (id, field, value) => {
    // 1번 상품의 수수료가 변경되면 다른 상품들도 업데이트
    if (field === 'commission' && id === 1) {
      setCoupangProducts(coupangProducts.map(product => 
        product.id === id 
          ? { ...product, [field]: value } 
          : { ...product, [field]: value }
      ))
    } else {
      // 다른 필드나 다른 상품은 일반적인 업데이트
      setCoupangProducts(coupangProducts.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      ))
    }
  }

  // 네이버 상품 자동 계산 함수
  const calculateNaverProduct = (product) => {
    // 공급가, 수수료, 택배비가 모두 입력된 경우에만 계산
    if (product.supplyPrice && product.commission && product.shippingFee) {
      const supplyPrice = parseFloat(product.supplyPrice);
      const commissionRate = parseFloat(product.commission) / 100; // 수수료를 퍼센트에서 소수로 변환
      const shippingFee = parseFloat(product.shippingFee);
      
      if (isNaN(supplyPrice) || isNaN(commissionRate) || isNaN(shippingFee)) {
        return product; // 숫자가 아닌 경우 계산하지 않음
      }
      
      // 실제 택배비 계산 (입력값의 97%)
      const actualShippingFee = shippingFee * 0.97
      
      // 판매가를 100원씩 증가시키면서 마진과 마진율 계산
      let sellingPrice = supplyPrice // 초기 판매가는 공급가로 설정
      let margin = 0
      let marginRate = 0
      let settlementPrice = 0 // 정산가
      
      // 최대 1000번 반복 (무한 루프 방지)
      for (let i = 0; i < 1000; i++) {
        // 정산가 계산: (판매가 + 택배비) * (1 - 수수료율)
        settlementPrice = sellingPrice * (1 - commissionRate) + actualShippingFee
        
        // 마진 계산: 정산가 - 공급가
        margin = settlementPrice - supplyPrice
        
        // 마진율 계산: (마진 / 정산가) * 100
        marginRate = (margin / settlementPrice) * 100
        
        // 마진이 4000원 이상이고 마진율이 10% 이상이면 반복 중단
        if (margin >= 4000 && marginRate >= 10) {
          break
        }
        
        // 판매가 100원 증가
        sellingPrice += 100
      }

      // 판매가를 100원 단위로 올림
      sellingPrice = Math.ceil(sellingPrice / 1000) * 1000
      
      // 최종 정산가 다시 계산
      settlementPrice = (sellingPrice + actualShippingFee) * (1 - commissionRate)
      
      // 최종 마진과 마진율 다시 계산
      margin = settlementPrice - supplyPrice
      marginRate = (margin / settlementPrice) * 100
      
      return {
        ...product,
        margin,
        marginRate,
        sellingPrice,
        actualShippingFee, // 실제 택배비
        settlementPrice // 정산가
      }
    }
    return product
  }

  // 쿠팡 상품 자동 계산 함수
  const calculateCoupangProduct = (product) => {
    // 공급가, 수수료가 모두 입력된 경우에만 계산
    if (product.supplyPrice && product.commission) {
      const supplyPrice = parseFloat(product.supplyPrice);
      const commissionRate = parseFloat(product.commission) / 100; // 수수료를 퍼센트에서 소수로 변환
      
      if (isNaN(supplyPrice) || isNaN(commissionRate)) {
        return product; // 숫자가 아닌 경우 계산하지 않음
      }
      
      // 판매가를 100원씩 증가시키면서 마진과 마진율 계산
      let sellingPrice = supplyPrice // 초기 판매가는 공급가로 설정
      let margin = 0
      let marginRate = 0
      let settlementPrice = 0 // 정산가
      
      // 최대 1000번 반복 (무한 루프 방지)
      for (let i = 0; i < 1000; i++) {
        // 정산가 계산: 판매가 * (1 - 수수료율)
        settlementPrice = sellingPrice * (1 - commissionRate)
        
        // 마진 계산: 정산가 - 공급가
        margin = settlementPrice - supplyPrice
        
        // 마진율 계산: (마진 / 정산가) * 100
        marginRate = (margin / settlementPrice) * 100
        
        // 마진이 4000원 이상이고 마진율이 10% 이상이면 반복 중단
        if (margin >= 4000 && marginRate >= 10) {
          break
        }
        
        // 판매가 100원 증가
        sellingPrice += 100
      }

      // 판매가를 100원 단위로 올림
      sellingPrice = Math.ceil(sellingPrice / 1000) * 1000
      
      // 최종 정산가 다시 계산
      settlementPrice = sellingPrice * (1 - commissionRate)
      
      // 최종 마진과 마진율 다시 계산
      margin = settlementPrice - supplyPrice
      marginRate = (margin / settlementPrice) * 100
      
      return {
        ...product,
        margin,
        marginRate,
        sellingPrice,
        settlementPrice // 정산가
      }
    }
    return product
  }

  // 네이버 상품 자동 계산 효과
  useEffect(() => {
    setNaverProducts(naverProducts.map(product => calculateNaverProduct(product)))
  }, [naverProducts.map(p => `${p.supplyPrice}-${p.commission}-${p.shippingFee}`).join(',')])

  // 쿠팡 상품 자동 계산 효과
  useEffect(() => {
    setCoupangProducts(coupangProducts.map(product => calculateCoupangProduct(product)))
  }, [coupangProducts.map(p => `${p.supplyPrice}-${p.commission}`).join(',')])

  // 초기화 함수
  const resetCalculator = () => {
    // 네이버 상품 초기화
    setNaverProducts(naverProducts.map(product => ({
      ...product,
      supplyPrice: '',
      commission: '',
      shippingFee: '',
      margin: 0,
      marginRate: 0,
      sellingPrice: 0,
      actualShippingFee: 0,
      settlementPrice: 0
    })))
    
    // 쿠팡 상품 초기화
    setCoupangProducts(coupangProducts.map(product => ({
      ...product,
      supplyPrice: '',
      commission: '',
      margin: 0,
      marginRate: 0,
      sellingPrice: 0,
      settlementPrice: 0
    })))
    
    setError('')
  }

  // 네이버 상품 행 렌더링 함수
  const renderNaverProductRow = (product) => {
    return (
      <CTableRow key={product.id}>
        <CTableDataCell>{product.id}</CTableDataCell>
        <CTableDataCell>
          <CInputGroup size="sm">
            <CFormInput
              type="text"
              value={product.supplyPrice}
              onChange={(e) => handleInputChange(e, product.id, 'supplyPrice', updateNaverProduct)}
              onWheel={preventScrollOnNumberInput}
              placeholder="공급가"
            />
            <CInputGroupText>원</CInputGroupText>
          </CInputGroup>
        </CTableDataCell>
        <CTableDataCell>
          <CInputGroup size="sm">
            <CFormInput
              type="text"
              value={product.commission}
              onChange={(e) => handleInputChange(e, product.id, 'commission', updateNaverProduct)}
              onWheel={preventScrollOnNumberInput}
              placeholder="수수료"
              disabled={product.id !== 1} // 1번 상품만 수수료 입력 가능
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CTableDataCell>
        <CTableDataCell>
          <CInputGroup size="sm">
            <CFormInput
              type="text"
              value={product.shippingFee}
              onChange={(e) => handleInputChange(e, product.id, 'shippingFee', updateNaverProduct)}
              onWheel={preventScrollOnNumberInput}
              placeholder="택배비"
              disabled={product.id !== 1} // 1번 상품만 택배비 입력 가능
            />
            <CInputGroupText>원</CInputGroupText>
          </CInputGroup>
        </CTableDataCell>
        <CTableDataCell>
          {product.actualShippingFee > 0 ? product.actualShippingFee.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          {product.margin > 0 ? product.margin.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          {product.marginRate > 0 ? product.marginRate.toFixed(2) : '-'} %
        </CTableDataCell>
        <CTableDataCell>
          {product.settlementPrice > 0 ? product.settlementPrice.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          {product.sellingPrice > 0 ? product.sellingPrice.toLocaleString() : '-'} 원
        </CTableDataCell>
        {product.id === 1 && (
          <CTableDataCell rowSpan={5}>
            <table>
                <tbody>
                {naverProducts.map(p => <tr><td>{p.sellingPrice > 0 ? p.sellingPrice : '-'}</td></tr>   
                )}
                </tbody>
            </table>
          </CTableDataCell>
        )}
      </CTableRow>
    )
  }

  // 쿠팡 상품 행 렌더링 함수
  const renderCoupangProductRow = (product) => {
    return (
      <CTableRow key={product.id}>
        <CTableDataCell>{product.id}</CTableDataCell>
        <CTableDataCell>
          {product.supplyPrice > 0 ? product.supplyPrice.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          <CInputGroup size="sm">
            <CFormInput
              type="text"
              value={product.commission}
              onChange={(e) => handleInputChange(e, product.id, 'commission', updateCoupangProduct)}
              onWheel={preventScrollOnNumberInput}
              placeholder="수수료"
              disabled={product.id !== 1} // 1번 상품만 수수료 입력 가능
            />
            <CInputGroupText>%</CInputGroupText>
          </CInputGroup>
        </CTableDataCell>
        <CTableDataCell>
          {product.margin > 0 ? product.margin.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          {product.marginRate > 0 ? product.marginRate.toFixed(2) : '-'} %
        </CTableDataCell>
        <CTableDataCell>
          {product.settlementPrice > 0 ? product.settlementPrice.toLocaleString() : '-'} 원
        </CTableDataCell>
        <CTableDataCell>
          {product.sellingPrice > 0 ? product.sellingPrice.toLocaleString() : '-'} 원
        </CTableDataCell>
        {product.id === 1 && (
          <CTableDataCell rowSpan={5}>
            <table>
                <tbody>
                {coupangProducts.map(p => <tr><td>{p.sellingPrice > 0 ? p.sellingPrice : '-'}</td></tr>
                )}
                </tbody>
            </table>
          </CTableDataCell>
        )}
      </CTableRow>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>마진 계산기</strong>
        <div>
          <CButton 
            color="secondary" 
            size="sm"
            onClick={resetCalculator}
          >
            초기화
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <CCard className="mb-4">
          <CCardHeader className="bg-success text-white">
            <strong>네이버</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive className="table-fixed">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '5%' }}>#</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>공급가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>수수료</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>택배비</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>실제 택배비</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>마진</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>마진률</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>정산가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>판매가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {naverProducts.map(product => renderNaverProductRow(product))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader className="bg-danger text-white">
            <strong>쿠팡</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive className="table-fixed">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '5%' }}>#</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>공급가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>수수료</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>마진</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>마진률</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>정산가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>판매가</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {coupangProducts.map(product => renderCoupangProductRow(product))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default MarginCalculator 