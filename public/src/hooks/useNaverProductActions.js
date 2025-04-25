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

  const registerProduct = async () => {
    try {
      store.setLoading(true)

      // 이름이 있는 상품들만 필터링
      debugger;
      const validProducts = store.products.filter(product => product.name && product.price > 0);
      
      // 첫 번째 상품의 대표 이미지를 제외한 나머지 이미지들
      const additionalImages = validProducts[0]?.additionalImages
        ?.filter(img => !img.isMain)
        ?.map(img => ({
          ...img,
          id: crypto.randomUUID() // 새로운 ID 생성
        })) || [];

      // 나머지 상품들의 이미지 설정
      const updatedProducts = validProducts.map((product, index) => {
        if (index === 0) return product; // 첫 번째 상품은 그대로 유지
        
        // 대표 이미지만 유지하고 나머지 이미지 추가
        const mainImage = product.additionalImages?.find(img => img.isMain) || null;
        return {
          ...product,
          additionalImages: mainImage ? [mainImage, ...additionalImages] : additionalImages
        };
      });

      // 이미지 변환 함수
      const convertImageToBase64 = async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });
      };

      // 상품 이미지 변환
      const productsWithBase64Images = await Promise.all(updatedProducts.map(async (product) => {
        const convertedImages = await Promise.all(
          (product.additionalImages || []).map(async (img) => {
            if (img.file instanceof File) {
              const base64Data = await convertImageToBase64(img.file);
              return { ...img, file: base64Data };
            }
            return img;
          })
        );
        return { ...product, additionalImages: convertedImages };
      }));

      // 상세 이미지 변환
      const convertedDetailImages = await Promise.all(
        (store.detailImages || []).map(async (img) => {
          if (img.file instanceof File) {
            const base64Data = await convertImageToBase64(img.file);
            return { ...img, file: base64Data };
          }
          return img;
        })
      );

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
        mainProduct: store.mainProduct,
      }

      const res = await productService.registerProduct({accName: selectedAccount.accName, productData: productData});
      const validatedRes = validateResponse(res, '상품 등록');
      
      if (validatedRes) {
        store.resetState();
      }
      return validatedRes;
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