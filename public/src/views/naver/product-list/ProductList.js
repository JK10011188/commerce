import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

const ProductList = () => {
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>네이버 상품 목록</strong>
      </CCardHeader>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">상품번호</CTableHeaderCell>
              <CTableHeaderCell scope="col">상품명</CTableHeaderCell>
              <CTableHeaderCell scope="col">가격</CTableHeaderCell>
              <CTableHeaderCell scope="col">재고</CTableHeaderCell>
              <CTableHeaderCell scope="col">상태</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              <CTableHeaderCell scope="row">1</CTableHeaderCell>
              <CTableDataCell>네이버 샘플 상품 1</CTableDataCell>
              <CTableDataCell>15,000원</CTableDataCell>
              <CTableDataCell>80</CTableDataCell>
              <CTableDataCell>판매중</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">2</CTableHeaderCell>
              <CTableDataCell>네이버 샘플 상품 2</CTableDataCell>
              <CTableDataCell>25,000원</CTableDataCell>
              <CTableDataCell>30</CTableDataCell>
              <CTableDataCell>판매중</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default ProductList 