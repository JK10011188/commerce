import { useProductStore } from '../stores/useNaverStore';
import { useAccountStore } from '../stores/useAccountStore';
import productService from '../services/productService';
import debounce from 'lodash.debounce';

const createErrorMessage = (operation, error, isCategory = false) => {
  const target = isCategory ? '카테고리' : '상품'
  const baseMessage = `${target} ${operation} 중 오류가 발생했습니다.`
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return `${baseMessage} 잘못된 요청입니다.`
      case 401:
        return `${baseMessage} 인증이 필요합니다.`
      case 403:
        return `${baseMessage} 권한이 없습니다.`
      case 404:
        return `${baseMessage} 요청한 리소스를 찾을 수 없습니다.`
      case 500:
        return `${baseMessage} 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`
      default:
        return `${baseMessage} ${error.message}`
    }
  }
  return `${baseMessage} ${error.message}`
}

export const useNaverProductActions = () => {
  const store = useProductStore();
  const { selectedAccount } = useAccountStore();

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    store.setProductError(error.message || '알 수 없는 오류가 발생했습니다.');
  };

  const handleCategoryError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    store.setCategoryError(error.message || '알 수 없는 오류가 발생했습니다.');
  };

  const validateResponse = (response, context) => {
    if (!response) {
      throw new Error(`${context} 응답이 없습니다.`);
    }
    // 서버에서 500 에러로 반환된 경우
    if (response.error) {
      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : response.error.message || `${context} 요청이 실패했습니다.`;
      throw new Error(errorMsg);
    }
    if (response.result === 'error') {
      throw new Error(response.message || `${context} 요청이 실패했습니다.`);
    }
    return response;
  };

  const fetchMainCategories = async () => {
    if (!selectedAccount?.n_id) {
      store.setCategoryError('네이버 계정 연결 정보가 설정되어 있지 않습니다.');
      return;
    }

    store.setCategoryLoading(true);
    try {
      const res = await productService.get1stCategories({ accName: selectedAccount.accName });
      const validatedRes = validateResponse(res, '메인 카테고리 조회');
      store.setCategories('main', validatedRes);
    } catch (err) {
      handleCategoryError(err, '메인 카테고리 조회');
    } finally {
      store.setCategoryLoading(false);
    }
  };

  const fetchSubCategories = async (level, parentId) => {
    if (!parentId) {
      store.setCategoryError('상위 카테고리 ID가 필요합니다.');
      return;
    }

    store.setCategoryLoading(true);
    try {
      const res = await productService.getSubCategories({ categoryCode: parentId, accName: selectedAccount.accName });
      const validatedRes = validateResponse(res, `${level} 카테고리 조회`);
      store.setCategories(level, validatedRes);
    } catch (err) {
      handleCategoryError(err, `${level} 카테고리 조회`);
    } finally {
      store.setCategoryLoading(false);
    }
  };

  const fetchTagRestrictions = async (tags) => {
    try {
      const res = await productService.getTagRestrictions({accName: selectedAccount.accName, tags: tags});
      const validatedRes = validateResponse(res, '태그 제한 조회');
      return validatedRes[0];
    } catch (err) {
      handleError(err, '태그 제한 조회');
    }
  };

  const fetchCategoryTags = async (categoryId) => {
    if (!categoryId) {
      store.setCategoryError('카테고리 ID가 필요합니다.');
      return;
    }

    try {
      store.setTags([]);
      const res = await productService.getCategoryTags({categoryCode : categoryId});
      const validatedRes = validateResponse(res, '태그 조회');
      if(validatedRes.keywords && validatedRes.keywords.length > 0) {
        const newTags = validatedRes.keywords.split(',').map(tag => tag.trim()).filter(tag => tag);
        store.setTags(newTags);
      }
    } catch (err) {
      handleError(err, '태그 조회');
    }
  };

  const fetchProductAttributes = async (categoryId) => {
    if (!categoryId) {
      store.setCategoryError('카테고리 ID가 필요합니다.');
      return;
    }

    try {
      store.setProductAttributes([]);
      store.setSelectedProductAttributes([]);
      const res = await productService.getProductAttributes({accName: selectedAccount.accName, categoryCode : categoryId});
      const validatedRes = validateResponse(res, '상품 속성 조회');
      store.setProductAttributes(validatedRes);
    } catch (err) {
      handleError(err, '상품 속성 조회');
    }
  };

  const fetchTagSuggestions = debounce(async (query) => {
    if (!query) {
      store.setTagSuggestions([]);
      store.setTagSuggestionsLoading(false);
      return;
    }

    try {
      store.setTagSuggestions([]);
      store.setTagSuggestionsLoading(true);
      const res = await productService.getTagSuggestions({accName: selectedAccount.accName, keyword: query});
      const validatedRes = validateResponse(res, '태그 제안 조회');
      store.setTagSuggestions(validatedRes);
    } catch (err) {
      handleError(err, '태그 제안 조회');
      store.setTagSuggestions([]);
    } finally {
      store.setTagSuggestionsLoading(false);
    }
  }, 500);

  const fetchProductProvidedNotice = async (query) => {
    if (!query) {
      store.setProductProvidedNotice([]);
      store.setProductProvidedNoticeLoading(false);
      return;
    }

    try {
      store.setProductProvidedNotice([]);
      store.setProductProvidedNoticeLoading(true);
      const res = await productService.getProductProvidedNotice({accName: selectedAccount.accName, categoryId: query});
      const validatedRes = validateResponse(res, '상품 제공 고시 조회');
      store.setProductProvidedNotice(validatedRes);
    } catch (err) {
      handleError(err, '태그 제안 조회');
      store.setProductProvidedNotice([]);
    } finally {
      store.setProductProvidedNoticeLoading(false);
    }
  };

  const registerProduct = async (progressHandler) => {
    try {
      store.setLoading(true)

      // 이름이 있는 상품들만 필터링
      const validProducts = store.products.filter(product => product.name && product.price > 0);
      if (validProducts.length === 0) {
        throw new Error('등록할 상품이 없습니다.');
      }

      // 이미지 변환 함수
      const convertImageToBase64 = async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });
      };

      // 상세 이미지 변환 (1회)
      const convertedDetailImages = await Promise.all(
        (store.detailImages || []).map(async (img) => {
          if (img.file instanceof File) {
            const base64Data = await convertImageToBase64(img.file);
            return { ...img, file: base64Data };
          }
          return img;
        })
      );

      // 첫 번째 상품의 대표 이미지를 제외한 나머지 이미지들 (공유용)
      const baseAdditionalImages = validProducts[0]?.additionalImages
        ?.filter(img => !img.isMain)
        ?.map(img => ({
          ...img,
          id: crypto.randomUUID() // 새로운 ID 생성
        })) || [];

      // 상품 이미지 변환 및 공유 이미지 적용
      const productsWithBase64Images = await Promise.all(validProducts.map(async (product) => {
        const mainImage = product.additionalImages?.find(img => img.isMain) || null;
        const mergedImages = mainImage ? [mainImage, ...baseAdditionalImages] : baseAdditionalImages;
        const convertedImages = await Promise.all(
          (mergedImages || []).map(async (img) => {
            if (img.file instanceof File) {
              const base64Data = await convertImageToBase64(img.file);
              return { ...img, file: base64Data };
            }
            return img;
          })
        );
        return { ...product, additionalImages: convertedImages };
      }));

      // 옵션 상품 모드 여부에 따라 처리 분기
      if (store.isOptionProductMode) {
        // 옵션값 그룹별로 묶기 (첫 옵션의 첫 값으로 그룹), 순서를 유지
        const groupMap = {};
        const keyOrder = [];
        productsWithBase64Images.forEach((product, idx) => {
          const key = product.options?.[0]?.values?.[0]?.value ?? `group-${idx}`;
          if (!groupMap[key]) {
            groupMap[key] = [];
            keyOrder.push(key);
          }
          groupMap[key].push(product);
        });

        const results = [];

        for (let i = 0; i < keyOrder.length; i++) {
          const key = keyOrder[i];
          const groupProducts = groupMap[key];
          const groupLabel = key; // 옵션값을 라벨로 사용

          // 진행 알림
          progressHandler?.onGroupStart?.({
            current: i + 1,
            total: keyOrder.length,
            label: groupLabel,
          });

          const productData = {
            products: groupProducts,
            commonInfo: store.commonInfo,
            selectedProductAttributes: store.selectedProductAttributes,
            asInfo: store.asInfo,
            deliveryInfo: store.deliveryInfo,
            tags: store.tags,
            detailImages: convertedDetailImages.map(image => image.file),
            category: store.selectedCategory,
            providedNotice: store.selectedProductProvidedNotice,
            mainProduct: {
              ...groupProducts[0],
              // 메인 상품 이미지는 전체 첫 상품의 이미지 기준으로 통일
              additionalImages: productsWithBase64Images[0]?.additionalImages || [],
            },
          }

          try {
            const res = await productService.registerProduct({accName: selectedAccount.accName, productData});
            
            // 서버에서 500 에러로 반환된 경우
            if (res.error) {
              const serverError = typeof res.error === 'string' 
                ? res.error 
                : res.error.message || JSON.stringify(res.error);
              
              console.error(`[옵션 상품 등록 실패 - 서버 에러] 그룹: ${groupLabel}`, {
                groupLabel,
                serverResponse: res,
                error: serverError,
                productCount: groupProducts.length,
                productNames: groupProducts.map(p => p.name)
              });
              
              const errorResult = {
                product: groupProducts[0],
                error: serverError
              };
              results.push(errorResult);
              
              progressHandler?.onGroupComplete?.({
                label: groupLabel,
                success: false,
                error: serverError
              });
              continue;
            }
            
            const validatedRes = validateResponse(res, '상품 등록');
            
            // 서버 응답이 배열인 경우 (여러 상품 등록 결과)
            if (Array.isArray(validatedRes)) {
              results.push(...validatedRes);
              
              // 배열 내에 에러가 있는지 확인
              const hasError = validatedRes.some(r => r.error);
              if (hasError) {
                const errorItems = validatedRes.filter(r => r.error);
                const errorMessages = errorItems.map(r => {
                  const errMsg = typeof r.error === 'string' ? r.error : JSON.stringify(r.error);
                  return errMsg;
                }).join('; ');
                
                console.error(`[옵션 상품 등록 실패 - 상품별 에러] 그룹: ${groupLabel}`, {
                  groupLabel,
                  errors: errorItems,
                  errorMessages
                });
                
                progressHandler?.onGroupComplete?.({
                  label: groupLabel,
                  success: false,
                  error: errorMessages
                });
              } else {
                console.log(`[옵션 상품 등록 성공] 그룹: ${groupLabel}`, {
                  groupLabel,
                  productCount: validatedRes.length
                });
                
                progressHandler?.onGroupComplete?.({
                  label: groupLabel,
                  success: true,
                  error: null
                });
              }
            } else {
              // 단일 결과
              results.push(validatedRes);
              const hasError = validatedRes.error;
              
              if (hasError) {
                const errMsg = typeof hasError === 'string' ? hasError : JSON.stringify(hasError);
                console.error(`[옵션 상품 등록 실패] 그룹: ${groupLabel}`, {
                  groupLabel,
                  error: errMsg,
                  result: validatedRes
                });
              } else {
                console.log(`[옵션 상품 등록 성공] 그룹: ${groupLabel}`, {
                  groupLabel
                });
              }
              
              progressHandler?.onGroupComplete?.({
                label: groupLabel,
                success: !hasError,
                error: hasError ? (typeof hasError === 'string' ? hasError : JSON.stringify(hasError)) : null
              });
            }
          } catch (error) {
            // validateResponse에서 throw된 에러 또는 네트워크 에러
            const errorMessage = error.message || error.toString();
            
            console.error(`[옵션 상품 등록 실패 - 예외 발생] 그룹: ${groupLabel}`, {
              groupLabel,
              error: errorMessage,
              errorStack: error.stack,
              productCount: groupProducts.length,
              productNames: groupProducts.map(p => p.name)
            });
            
            const errorResult = {
              product: groupProducts[0],
              error: errorMessage
            };
            results.push(errorResult);
            
            progressHandler?.onGroupComplete?.({
              label: groupLabel,
              success: false,
              error: errorMessage
            });
          }
        }

        store.resetState();
        return results;
      } else {
        // 기존(비 옵션 상품) 단일 요청 처리 (진행 표시 없음)
        const productData = {
          products: productsWithBase64Images,
          commonInfo: store.commonInfo,
          selectedProductAttributes: store.selectedProductAttributes,
          asInfo: store.asInfo,
          deliveryInfo: store.deliveryInfo,
          tags: store.tags,
          detailImages: convertedDetailImages.map(image => image.file),
          category: store.selectedCategory,
          providedNotice: store.selectedProductProvidedNotice,
          mainProduct: store.mainProduct || productsWithBase64Images[0],
        }

        const res = await productService.registerProduct({accName: selectedAccount.accName, productData});
        const validatedRes = validateResponse(res, '상품 등록');
        if (validatedRes) {
          store.resetState();
        }
        return validatedRes;
      }
    } catch (err) { 
      const errorMessage = createErrorMessage('등록', err);
      handleError(err, '상품 등록');
      return { result: 'error', message: errorMessage };
    } finally {
      store.setLoading(false);
    }
  }

  const makeNewProduct = () => {
    return {
      id: crypto.randomUUID(),
      name: '',
      regularPrice: 0,
      discountRate: 23,
      price: 0,
      mainImage: null,
      additionalImages: [],
      options: [] 
    }
  }

  return {
    fetchMainCategories,
    fetchSubCategories,
    fetchTagSuggestions,
    fetchCategoryTags,
    fetchTagRestrictions,
    fetchProductAttributes,
    fetchProductProvidedNotice,
    registerProduct,
    makeNewProduct,
    ...store,
  };
} 