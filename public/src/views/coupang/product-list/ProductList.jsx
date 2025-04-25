import React, { useState, useEffect } from 'react'
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
  CInputGroup,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useAccountStore } from '../../../stores/useAccountStore'
import productService from '../../../services/productService'

const ProductList = () => {
  const { selectedAccount } = useAccountStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [nextToken, setNextToken] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [fetchSize, setFetchSize] = useState(20)
  const [allProducts, setAllProducts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const fetchProducts = async (page = 1, searchName = '', token = null) => {
    if (!selectedAccount?.accName) {
      setError('계정을 선택해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = {
        accName: selectedAccount.accName,
        page: page,
        maxPerPage: fetchSize,
      }

      if (token) {
        params.nextToken = token
      }

      if (searchName) {
        params.prodname = searchName
      }

      const response = await productService.getCoupangProducts(params)
      
      if (response.result === 'success') {
        const newProducts = response.data || []
        setAllProducts(prev => {
          // 첫 페이지인 경우 이전 데이터 초기화
          if (page === 1) {
            return newProducts
          }
          // 다음 페이지인 경우 기존 데이터에 추가
          return [...prev, ...newProducts]
        })
        
        setNextToken(response.data.nextToken)
        setHasMore(!!response.data.nextToken)
        
        // 현재 페이지에 해당하는 상품만 표시
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        setProducts(allProducts.slice(startIndex, endIndex))
        
        // 총 페이지 수 계산 (현재 가져온 모든 상품 기준)
        const totalItems = allProducts.length + newProducts.length
        // 최대 2페이지까지만 표시 (20개 상품을 10개씩 페이징)
        setTotalPages(Math.min(2, Math.ceil(totalItems / pageSize)) || 1)
      } else {
        setError(response.message || '상품 목록 조회에 실패했습니다.')
      }
    } catch (err) {
      console.error('상품 목록 조회 중 오류:', err)
      setError(err.message || '상품 목록 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 첫 페이지 로드 시 상품 가져오기
    if (currentPage === 1) {
      fetchProducts(1, searchTerm)
    } else {
      // 다음 페이지로 이동 시 현재 페이지에 해당하는 상품만 표시
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      setProducts(allProducts.slice(startIndex, endIndex))
      
      // 다음 페이지에 필요한 데이터가 없고, 더 가져올 수 있는 경우
      if (endIndex > allProducts.length && hasMore) {
        fetchProducts(Math.ceil(allProducts.length / fetchSize) + 1, searchTerm, nextToken)
      }
    }
  }, [currentPage, selectedAccount])

  const handleSearch = () => {
    setCurrentPage(1)
    setAllProducts([])
    setNextToken(null)
    setHasMore(true)
    fetchProducts(1, searchTerm)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDelete = async (sellerProductId) => {
    if (!selectedAccount?.accName) {
      setDeleteError('계정을 선택해주세요.')
      return
    }

    try {
      setDeleteLoading(true)
      setDeleteError(null)
      setDeleteSuccess(false)

      const response = await productService.deleteCoupangProduct({
        accName: selectedAccount.accName,
        sellerProductId: sellerProductId
      })

      if (response.result === 'success') {
        setDeleteSuccess(true)
        // 삭제 성공 후 상품 목록 새로고침
        fetchProducts(1, searchTerm)
      } else {
        setDeleteError(response.message || '상품 삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('상품 삭제 중 오류:', err)
      setDeleteError(err.message || '상품 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString, includeTime = false) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
    
    return `${year}-${month}-${day}`
  }

  // 페이지 번호 생성 함수
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    
    // 항상 1페이지부터 시작하도록 수정
    let startPage = 1
    let endPage = Math.min(totalPages, maxVisiblePages)
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    
    return pageNumbers
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>쿠팡 상품 목록</strong>
        <div className="d-flex gap-2">
          <CInputGroup>
            <CFormInput
              placeholder="상품명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <CButton color="primary" onClick={handleSearch}>
              검색
            </CButton>
          </CInputGroup>
        </div>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {deleteSuccess && (
          <CAlert color="success" className="mb-4" dismissible onClose={() => setDeleteSuccess(false)}>
            상품이 성공적으로 삭제되었습니다.
          </CAlert>
        )}

        {deleteError && (
          <CAlert color="danger" className="mb-4" dismissible onClose={() => setDeleteError(null)}>
            {deleteError}
          </CAlert>
        )}

        {loading && currentPage === 1 ? (
          <div className="text-center p-5">
            <CSpinner />
            <p className="mt-3">상품 목록을 불러오는 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-5">
            <p>등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">상품번호</CTableHeaderCell>
                  <CTableHeaderCell scope="col">상품명</CTableHeaderCell>
                  <CTableHeaderCell scope="col">브랜드</CTableHeaderCell>
                  <CTableHeaderCell scope="col">가격</CTableHeaderCell>
                  <CTableHeaderCell scope="col">배송비</CTableHeaderCell>
                  <CTableHeaderCell scope="col">상태</CTableHeaderCell>
                  <CTableHeaderCell scope="col">등록일</CTableHeaderCell>
                  <CTableHeaderCell scope="col">판매기간</CTableHeaderCell>
                  <CTableHeaderCell scope="col">작업</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {products.map((product) => (
                  <CTableRow key={product.sellerProductId}>
                    <CTableHeaderCell scope="row">{product.sellerProductId}</CTableHeaderCell>
                    <CTableDataCell>{product.sellerProductName}</CTableDataCell>
                    <CTableDataCell>{product.brand}</CTableDataCell>
                    <CTableDataCell>{formatPrice(product.salePrice)}</CTableDataCell>
                    <CTableDataCell>{formatPrice(product.deliveryCharge)}</CTableDataCell>
                    <CTableDataCell>
                      <span className={`badge ${product.statusName === '승인완료' ? 'bg-success' : 'bg-warning'}`}>
                        {product.statusName}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{formatDate(product.createdAt, true)}</CTableDataCell>
                    <CTableDataCell>
                      {formatDate(product.saleStartedAt)} ~ {formatDate(product.saleEndedAt)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        color="danger" 
                        size="sm" 
                        onClick={() => handleDelete(product.sellerProductId)}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? <CSpinner size="sm" /> : '삭제'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <span className="text-muted">
                    총 {allProducts.length}개 중 {(currentPage - 1) * pageSize + 1}~{Math.min(currentPage * pageSize, allProducts.length)}개 표시
                  </span>
                </div>
                <CPagination>
                  <CPaginationItem 
                    aria-label="Previous" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </CPaginationItem>
                  
                  {getPageNumbers().map((page) => (
                    <CPaginationItem 
                      key={page}
                      active={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}
                  
                  <CPaginationItem 
                    aria-label="Next" 
                    disabled={currentPage === totalPages && !hasMore}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
            
            {loading && currentPage > 1 && (
              <div className="text-center mt-3">
                <CSpinner size="sm" />
                <span className="ms-2">추가 데이터를 불러오는 중...</span>
              </div>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProductList 