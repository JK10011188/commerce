import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilChevronTop, cilChevronBottom } from '@coreui/icons'
import ProductImageUploader from './ProductImageUploader'
import ProductOptions from './ProductOptions'
import { useProductStore } from '../../../../stores/useNaverStore'
import { useNaverProductActions } from '../../../../hooks/useNaverProductActions'
const ProductList = () => {
  const { products, setProduct, removeProduct, addProduct, setProducts, setCommonInfo, setMainProduct, mainProduct, isOptionProductMode, setOptionProductMode} = useProductStore();
  const { makeNewProduct } = useNaverProductActions();
  const [closedProducts, setClosedProducts] = useState([]);
  const [closedGroups, setClosedGroups] = useState([]); // 옵션 그룹별 토글 상태
  const [optionProductName, setOptionProductName] = useState('');
  const [optionName, setOptionName] = useState('');
  const [optionValuesInput, setOptionValuesInput] = useState('');
  const [optionNameFormat, setOptionNameFormat] = useState('value-name'); // value-name | name-value | value-only
  const defaultOptionPrices = {
    1: { regularPrice: '', discountRate: '23', price: '' },
    2: { regularPrice: '', discountRate: '23', price: '' },
    3: { regularPrice: '', discountRate: '23', price: '' },
    4: { regularPrice: '', discountRate: '23', price: '' },
    5: { regularPrice: '', discountRate: '23', price: '' },
  };
  const [optionPrices, setOptionPrices] = useState(defaultOptionPrices);
  const countVariants = [1, 2, 3, 4, 5]; // 1개~5개 변형 공통 사용

  useEffect(() => {
    if(isOptionProductMode) return;
    if(mainProduct?.name){
      products.forEach((product, index) => {
        if(product.id !== mainProduct?.id){
          setProduct({...product, name: `${mainProduct?.name} ${index + 1}개`});
        }
      });
    }
  }, [mainProduct]);

  useEffect(() => {
    if(products.length > 1){
      setMainProduct(products[0]);
    }
  }, [products]);

  // 옵션 상품 모드 전환 시 초기화: 기존 상품 제거, 옵션 입력으로만 생성
  useEffect(() => {
    if (isOptionProductMode) {
      setProducts([]);
      setMainProduct(null);
      setClosedProducts([]);
      setClosedGroups([]);
      setOptionPrices(defaultOptionPrices);
    } else {
      // 옵션 모드 해제 시에도 비워서 상위(ProductRegister) 초기화 로직이 5개를 재생성하게 함
      setProducts([]);
      setMainProduct(null);
      setClosedProducts([]);
      setClosedGroups([]);
      setOptionPrices(defaultOptionPrices);
    }
  }, [isOptionProductMode]);

  const handleToggleProduct = (productId) => {
    setClosedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 옵션 그룹별 토글 핸들러
  const handleToggleGroup = (groupKey) => {
    setClosedGroups(prev => 
      prev.includes(groupKey) 
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  // 옵션 그룹별로 상품 분류 (옵션 모드일 때만 사용)
  const getGroupedProducts = () => {
    if (!isOptionProductMode || products.length === 0) {
      return [];
    }

    const groupMap = {};
    products.forEach((product) => {
      const groupKey = product.options?.[0]?.values?.[0]?.value || '기타';
      if (!groupMap[groupKey]) {
        groupMap[groupKey] = [];
      }
      groupMap[groupKey].push(product);
    });

    return Object.entries(groupMap).map(([key, products]) => ({
      key,
      products,
    }));
  };

  const handleProductChange = (productId, e) => {
    const { name, value } = e.target;
    const product = products.find(p => p.id === productId);
    let updatedProduct;

    if(name === 'regularPrice'){
      const salePrice = Math.round(value * (1 - product.discountRate / 100) / 100) * 100;
      updatedProduct = { ...product, price: salePrice.toString(), regularPrice: value.toString() };
    } else if(name === 'discountRate'){
      const regularPrice = Math.round(product.price / (1 - value / 100) / 100) * 100;
      updatedProduct = { ...product, regularPrice: regularPrice.toString(), discountRate: value.toString() };
    } else if(name === 'price'){
      const regularPrice = Math.round(value / (1 - product.discountRate / 100) / 100) * 100;
      updatedProduct = { ...product, regularPrice: regularPrice.toString(), price: value.toString() };
    } else {
      updatedProduct = { ...product, [name]: value };
    }

    // 첫 번째 상품의 상품명이 변경될 때
    if (productId === products[0]?.id && name === 'name') {
      const firstWord = value.split(' ')[0];
      setCommonInfo({
        brand: firstWord,
        manufacture: firstWord
      });
    }

    // 상품 상태 업데이트
    setProduct(updatedProduct);
  };

  // 숫자 입력 필드에서 스크롤 이벤트 방지
  const preventScrollOnNumberInput = (e) => {
    e.target.blur();
  }

  // 옵션 상품 가격(1~5개) 일괄 입력 핸들러 (기본 23%, 수정 가능)
  const handleOptionPriceChange = (count, name, value) => {
    setOptionPrices((prev) => {
      const current = prev[count] || { regularPrice: '', discountRate: '23', price: '' };
      let updated = { ...current };
      if (name === 'regularPrice') {
        const discount = parseFloat(current.discountRate || '0');
        const salePrice = value === ''
          ? ''
          : Math.round((Number(value || 0) * (1 - discount / 100)) / 100) * 100;
        updated = { ...current, regularPrice: value, price: salePrice !== '' ? salePrice.toString() : '' };
      } else if (name === 'discountRate') {
        const discount = parseFloat(value || '0');
        const salePrice = current.regularPrice !== ''
          ? Math.round((Number(current.regularPrice) * (1 - discount / 100)) / 100) * 100
          : current.price;
        const regular = current.price !== ''
          ? Math.round(Number(current.price) / (1 - discount / 100) / 100) * 100
          : current.regularPrice;
        updated = { 
          ...current, 
          discountRate: value, 
          regularPrice: regular !== '' ? regular.toString() : '', 
          price: salePrice !== '' ? salePrice.toString() : '' 
        };
      } else if (name === 'price') {
        const discount = parseFloat(current.discountRate || '0');
        const regular = value === ''
          ? ''
          : Math.round(Number(value || 0) / (1 - discount / 100) / 100) * 100;
        updated = { ...current, price: value, regularPrice: regular !== '' ? regular.toString() : '' };
      }
      return { ...prev, [count]: updated };
    });
  };

  const handleRemoveProduct = (productId) => {
    if (products.length <= 1) return;
    removeProduct(productId);
  };

  const handleAddProduct = () => {
    const newProduct = makeNewProduct();
    addProduct(newProduct);
  };

  const handleGenerateOptionProducts = () => {
    const baseName = optionProductName.trim();
    const optName = optionName.trim();
    const optionValues = optionValuesInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v);

    // 모든 상품의 옵션을 모아 새 옵션을 제외한 기존 옵션 목록을 유지
    const baseOptions = products
      .flatMap((p) => p.options || [])
      .filter((opt) => opt?.name && opt.name !== optName);

    if (!baseName || !optName || optionValues.length === 0) {
      alert('상품명, 옵션명, 옵션값(쉼표 구분)을 모두 입력하세요.');
      return;
    }

    const generatedProducts = optionValues.flatMap((_, idx) => {
      const shift = optionValues.length > 0 ? idx % optionValues.length : 0;
      const rotated = [
        ...optionValues.slice(shift),
        ...optionValues.slice(0, shift),
      ];
      const orderedValues = rotated.map((v) => ({
        id: crypto.randomUUID(),
        value: v,
      }));
      const firstOptionValue = orderedValues[0]?.value || '';

      return countVariants.map((cnt) => {
        const suffix = cnt > 1 ? ` ${cnt}개` : '';
      const optionNameWithCount = cnt > 1 ? `${optName}(${cnt}개)` : optName;
      const nameWithOption = (() => {
        switch (optionNameFormat) {
          case 'name-value':
            return `${baseName} ${optName} ${firstOptionValue}${suffix}`;
          case 'value-only':
            return `${baseName} ${firstOptionValue}${suffix}`;
          case 'value-name':
          default:
            return `${baseName} ${firstOptionValue} ${optName}${suffix}`;
        }
      })();

        const product = makeNewProduct();
        const priceInfo = optionPrices?.[cnt] || { discountRate: '23' };
        return {
          ...product,
          name: nameWithOption,
          regularPrice: priceInfo.regularPrice ?? product.regularPrice,
          discountRate: priceInfo.discountRate ?? '23',
          price: priceInfo.price ?? product.price,
          options: [
            {
              id: crypto.randomUUID(),
              name: optionNameWithCount,
              values: orderedValues,
            },
            ...baseOptions,
          ],
        };
      });
    });

    setProducts(generatedProducts);
    setMainProduct(generatedProducts[0]);
    // 그룹 토글 상태 초기화 (모든 그룹을 열린 상태로)
    setClosedGroups([]);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center bg-success bg-opacity-25">
        <strong>상품 정보</strong>
        <div className="d-flex align-items-center gap-3">
          <CFormCheck
            id="optionProductMode"
            label="옵션 상품 등록"
            checked={isOptionProductMode}
            onChange={(e) => setOptionProductMode(e.target.checked)}
          />
          <CButton color="primary" size="sm" onClick={handleAddProduct}>
            <CIcon icon={cilPlus} className="me-2" />
            상품 추가
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        {isOptionProductMode && (
          <div className="mb-4 border rounded p-3 bg-light">
            <CRow className="g-3 align-items-end">
              <CCol md={4}>
                <CFormLabel>상품명</CFormLabel>
                <CFormInput
                  value={optionProductName}
                  onChange={(e) => setOptionProductName(e.target.value)}
                  placeholder="예) 기본 상품명"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>옵션명</CFormLabel>
                <CFormInput
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  placeholder="예) 옵션"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>옵션값 (쉼표로 구분)</CFormLabel>
                <CFormInput
                  value={optionValuesInput}
                  onChange={(e) => setOptionValuesInput(e.target.value)}
                  placeholder="예) 빨강, 파랑, 노랑"
                />
              </CCol>
            </CRow>
            <CRow className="g-3 align-items-end mt-2">
              <CCol md={6} lg={4}>
                <CFormLabel>상품명 생성 형식</CFormLabel>
                <CFormSelect
                  value={optionNameFormat}
                  onChange={(e) => setOptionNameFormat(e.target.value)}
                >
                  <option value="value-name">상품명 + 옵션값 + 옵션명</option>
                  <option value="name-value">상품명 + 옵션명 + 옵션값</option>
                  <option value="value-only">상품명 + 옵션값</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="g-2 mt-3">
              <CCol xs={12}>
                <div className="fw-bold mb-2">옵션 상품 가격 (1~5개 변형 일괄 적용, 할인율 23% 고정)</div>
              </CCol>
              {countVariants.map((cnt) => (
                <CCol xs={12} key={`option-price-${cnt}`}>
                  <CRow className="g-2 align-items-end">
                    <CCol xs={12} sm={2}>
                      <CFormLabel className="mb-0">{cnt}개 가격 입력</CFormLabel>
                    </CCol>
                    <CCol xs={12} sm={4} md={3} lg={3}>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          value={optionPrices[cnt]?.regularPrice || ''}
                          onChange={(e) => handleOptionPriceChange(cnt, 'regularPrice', e.target.value)}
                          onKeyDown={(e) => {
                            if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                              e.preventDefault();
                            }
                          }}
                          onWheel={preventScrollOnNumberInput}
                          placeholder="정상가"
                        />
                        <CInputGroupText>원</CInputGroupText>
                      </CInputGroup>
                    </CCol>
                    <CCol xs={6} sm={2} md={2} lg={2}>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          value={optionPrices[cnt]?.discountRate || ''}
                          onChange={(e) => handleOptionPriceChange(cnt, 'discountRate', e.target.value)}
                          onKeyDown={(e) => {
                            if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                              e.preventDefault();
                            }
                          }}
                          onWheel={preventScrollOnNumberInput}
                          placeholder="할인율"
                        />
                        <CInputGroupText>%</CInputGroupText>
                      </CInputGroup>
                    </CCol>
                    <CCol xs={12} sm={4} md={3} lg={3}>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          value={optionPrices[cnt]?.price || ''}
                          onChange={(e) => handleOptionPriceChange(cnt, 'price', e.target.value)}
                          onKeyDown={(e) => {
                            if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                              e.preventDefault();
                            }
                          }}
                          onWheel={preventScrollOnNumberInput}
                          placeholder="판매가"
                        />
                        <CInputGroupText>원</CInputGroupText>
                      </CInputGroup>
                    </CCol>
                  </CRow>
                </CCol>
              ))}
            </CRow>
            <CRow className="mt-3">
              <CCol className="d-flex justify-content-end">
                <CButton color="primary" onClick={handleGenerateOptionProducts}>
                  생성
                </CButton>
              </CCol>
            </CRow>
          </div>
        )}
        {isOptionProductMode ? (
          // 옵션 모드: 그룹별 토글로 표시
          getGroupedProducts().map((group, groupIndex) => {
            const isGroupClosed = closedGroups.includes(group.key);
            return (
              <CCard key={group.key} className="mb-3">
                <CCardHeader className="bg-primary bg-opacity-25 border-bottom d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <span className="fw-bold">옵션 그룹: {group.key} ({group.products.length}개 상품)</span>
                  </div>
                  <CButton
                    color="primary"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleGroup(group.key)}
                    className="p-2"
                  >
                    <CIcon icon={isGroupClosed ? cilChevronBottom : cilChevronTop} />
                  </CButton>
                </CCardHeader>
                {!isGroupClosed && (
                  <CCardBody>
                    {group.products.map((product, productIndex) => {
                      const globalIndex = products.findIndex(p => p.id === product.id);
                      return (
                        <CCard key={product.id} className="mb-3">
                          <CCardHeader className="bg-success bg-opacity-25 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <span className="fw-bold">상품 {globalIndex + 1} : {product.name ? product.name : ''}</span>
                              {product.name && product.price > 0 && (
                                <CBadge color="info" className="ms-2">
                                  {new Intl.NumberFormat('ko-KR').format(product.price)}원
                                </CBadge>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              <CButton
                                color="primary"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleProduct(product.id)}
                                className="p-2"
                              >
                                <CIcon icon={closedProducts.includes(product.id) ? cilChevronBottom : cilChevronTop} />
                              </CButton>
                            </div>
                          </CCardHeader>
                          {!closedProducts.includes(product.id) && (
                            <CCardBody>
                <CRow className="mb-3">
                  <CFormLabel htmlFor={`name-${product.id}`} className="col-sm-2 col-form-label">상품명</CFormLabel>
                  <CCol sm={10}>
                    <CFormInput
                      type="text"
                      id={`name-${product.id}`}
                      name="name"
                      value={product.name || ''}
                      onChange={(e) => handleProductChange(product.id, e)}
                      placeholder="상품명을 입력하세요(최대 100자)"
                      maxLength={100}
                    />
                    {mainProduct?.options.length > 0 && mainProduct?.price > 0 && (
                      <div className="mt-2 text-muted small">
                        추가상품: '곧 세일 끝 하나 더!' - {
                          mainProduct.options[0]?.values.length > 1 
                            ? `'${mainProduct.options[0].values.map(v => v.value).join(', ')}'`
                            : `'${mainProduct.options[0]?.name} ${mainProduct.options[0]?.values[0]?.value}'`
                        } ({new Intl.NumberFormat('ko-KR').format(mainProduct.price)}원)
                      </div>
                    )}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CFormLabel className="col-sm-2 col-form-label">가격 정보</CFormLabel>
                  <CCol sm={10}>
                    <CRow className="g-3">
                      <CCol sm={4}>
                        <CFormLabel htmlFor={`regularPrice-${product.id}`}>정상가</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="text"
                            id={`regularPrice-${product.id}`}
                            name="regularPrice"
                            value={product.regularPrice ? product.regularPrice : ''}
                            onChange={(e) => handleProductChange(product.id, e)}
                            onKeyDown={(e) => {
                              if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                e.preventDefault();
                              }
                            }}
                            onWheel={preventScrollOnNumberInput}
                            placeholder="정상가 입력"
                          />
                          <CInputGroupText>원</CInputGroupText>
                        </CInputGroup>
                      </CCol>
                      <CCol sm={4}>
                        <CFormLabel htmlFor={`discountRate-${product.id}`}>할인율</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="text"
                            id={`discountRate-${product.id}`}
                            name="discountRate"
                            value={product.discountRate}
                            onChange={(e) => handleProductChange(product.id, e)}
                            onKeyDown={(e) => {
                              if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                e.preventDefault();
                              }
                            }}
                            onWheel={preventScrollOnNumberInput}
                            placeholder="할인율 입력"
                          />
                          <CInputGroupText>%</CInputGroupText>
                        </CInputGroup>
                      </CCol>
                      <CCol sm={4}>
                        <CFormLabel htmlFor={`price-${product.id}`}>판매가</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="text"
                            id={`price-${product.id}`}
                            name="price"
                            value={product.price ? product.price : ''}
                            onChange={(e) => handleProductChange(product.id, e)}
                            onKeyDown={(e) => {
                              if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                e.preventDefault();
                              }
                            }}
                            onWheel={preventScrollOnNumberInput}
                            placeholder="판매가 입력"
                          />
                          <CInputGroupText>원</CInputGroupText>
                        </CInputGroup>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
                {/* 상품 이미지 업로드 영역 */}
                <ProductImageUploader productId={product.id} />
                {/* 상품 옵션 영역: 옵션 모드에서도 기존 UI를 그대로 표시 (읽기전용) */}
                <ProductOptions productId={product.id} index={globalIndex} readOnly={isOptionProductMode} />
                            </CCardBody>
                          )}
                        </CCard>
                      );
                    })}
                  </CCardBody>
                )}
              </CCard>
            );
          })
        ) : (
          // 일반 모드: 기존처럼 개별 상품으로 표시
          products.map((product, index) => (
            <CCard key={product.id} className="mb-3">
              <CCardHeader className="bg-success bg-opacity-25 border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="fw-bold">상품 {index + 1} : {product.name ? product.name : ''}</span>
                  {product.name && product.price > 0 && (
                    <CBadge color="info" className="ms-2">
                      {new Intl.NumberFormat('ko-KR').format(product.price)}원
                    </CBadge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {products.length > 1 && (
                    <CButton
                      color="danger"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2"
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  )}
                  <CButton
                    color="primary"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleProduct(product.id)}
                    className="p-2"
                  >
                    <CIcon icon={closedProducts.includes(product.id) ? cilChevronBottom : cilChevronTop} />
                  </CButton>
                </div>
              </CCardHeader>
              {!closedProducts.includes(product.id) && (
                <CCardBody>
                  <CRow className="mb-3">
                    <CFormLabel htmlFor={`name-${product.id}`} className="col-sm-2 col-form-label">상품명</CFormLabel>
                    <CCol sm={10}>
                      <CFormInput
                        type="text"
                        id={`name-${product.id}`}
                        name="name"
                        value={product.name || ''}
                        onChange={(e) => handleProductChange(product.id, e)}
                        placeholder="상품명을 입력하세요(최대 100자)"
                        maxLength={100}
                      />
                      {mainProduct?.options.length > 0 && mainProduct?.price > 0 && (
                        <div className="mt-2 text-muted small">
                          추가상품: '곧 세일 끝 하나 더!' - {
                            mainProduct.options[0]?.values.length > 1 
                              ? `'${mainProduct.options[0].values.map(v => v.value).join(', ')}'`
                              : `'${mainProduct.options[0]?.name} ${mainProduct.options[0]?.values[0]?.value}'`
                          } ({new Intl.NumberFormat('ko-KR').format(mainProduct.price)}원)
                        </div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CFormLabel className="col-sm-2 col-form-label">가격 정보</CFormLabel>
                    <CCol sm={10}>
                      <CRow className="g-3">
                        <CCol sm={4}>
                          <CFormLabel htmlFor={`regularPrice-${product.id}`}>정상가</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              type="text"
                              id={`regularPrice-${product.id}`}
                              name="regularPrice"
                              value={product.regularPrice ? product.regularPrice : ''}
                              onChange={(e) => handleProductChange(product.id, e)}
                              onKeyDown={(e) => {
                                if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                  e.preventDefault();
                                }
                              }}
                              onWheel={preventScrollOnNumberInput}
                              placeholder="정상가 입력"
                            />
                            <CInputGroupText>원</CInputGroupText>
                          </CInputGroup>
                        </CCol>
                        <CCol sm={4}>
                          <CFormLabel htmlFor={`discountRate-${product.id}`}>할인율</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              type="text"
                              id={`discountRate-${product.id}`}
                              name="discountRate"
                              value={product.discountRate}
                              onChange={(e) => handleProductChange(product.id, e)}
                              onKeyDown={(e) => {
                                if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                  e.preventDefault();
                                }
                              }}
                              onWheel={preventScrollOnNumberInput}
                              placeholder="할인율 입력"
                            />
                            <CInputGroupText>%</CInputGroupText>
                          </CInputGroup>
                        </CCol>
                        <CCol sm={4}>
                          <CFormLabel htmlFor={`price-${product.id}`}>판매가</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              type="text"
                              id={`price-${product.id}`}
                              name="price"
                              value={product.price ? product.price : ''}
                              onChange={(e) => handleProductChange(product.id, e)}
                              onKeyDown={(e) => {
                                if (!/[\d\b]/.test(e.key) && e.key !== 'Backspace') {
                                  e.preventDefault();
                                }
                              }}
                              onWheel={preventScrollOnNumberInput}
                              placeholder="판매가 입력"
                            />
                            <CInputGroupText>원</CInputGroupText>
                          </CInputGroup>
                        </CCol>
                      </CRow>
                    </CCol>
                  </CRow>
                  {/* 상품 이미지 업로드 영역 */}
                  <ProductImageUploader productId={product.id} />
                  {/* 상품 옵션 영역 */}
                  <ProductOptions productId={product.id} index={index} readOnly={false} />
                </CCardBody>
              )}
            </CCard>
          ))
        )}
      </CCardBody>
    </CCard>
  );
};

export default ProductList; 