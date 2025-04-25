import useCoupangStore from '../stores/useCoupangStore';
import { useAccountStore } from '../stores/useAccountStore';
import productService from '../services/productService';


export const useCoupangProductActions = () => {
  const store = useCoupangStore();
  const { selectedAccount } = useAccountStore();

  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    store.setError(error.message || '알 수 없는 오류가 발생했습니다.');
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

  const fetchCoupangCategories = async (code) => {
    try {
        if(!selectedAccount.cp_id){
            throw new Error('쿠팡 계정 정보가 없습니다.');
        }
        const res = await productService.getCoupangCategories({accName: selectedAccount.accName, displayCategoryCode : code});
        const validatedRes = validateResponse(res, '쿠팡 카테고리 조회');
        return validatedRes;
    } catch (err) {
        handleError(err, '쿠팡 카테고리 조회 실패');
    }
  }

  const fetchCoupangCategoryMetas = async (code) => {
    try {
      const res = await productService.getCategoryMetas({accName: selectedAccount.accName, lastCategoryKey : code});
      const validatedRes = validateResponse(res, '쿠팡 카테고리 메타 조회');
      
      if (validatedRes?.code === 'SUCCESS') {
        const { noticeCategories, attributes } = validatedRes.data;
        
        // 상품정보제공고시 데이터 가공
        const notices = noticeCategories.map(category => ({
          name: category.noticeCategoryName,
          details: category.noticeCategoryDetailNames.map(detail => ({
            name: detail.noticeCategoryDetailName,
            required: detail.required === 'MANDATORY'
          }))
        }));

        store.setProductNotices(notices);

        // 옵션 데이터 가공 
        const options = attributes.filter(attr => (attr.required === 'MANDATORY'));

        store.setAttributes(options);
      }
      return validatedRes;
    } catch (err) {
      handleError(err, '쿠팡 카테고리 메타 조회 실패');
    }
  }
  
  const fetchCoupangTags = async (code) => {
    try {
      const res = await productService.getCategoryTags({categoryCode : code});
      const validatedRes = validateResponse(res, '쿠팡 태그 조회');
      if(validatedRes?.result === 'success'){
        store.setTags(validatedRes.keywords?.split(',') || []);
      }
    } catch (err) {
      handleError(err, '쿠팡 태그 조회 실패');
    }
  }

  const validateProduct = async () => {
    try {
      // 기본 정보 검증
      if (!store.basicInfo.brand || !store.basicInfo.manufacturer) {
        throw new Error('기본 정보를 모두 입력해주세요.');
      }

      // 상품 목록 검증
      if (store.products.length === 0) {
        throw new Error('최소 1개의 상품을 등록해주세요.');
      }

      // 상품 목록 검증
      if (!store.selectedProductNotice) {
        throw new Error('상품정보제공고시를 선택해주세요.');
      }

      for (const product of store.products) {
        if (!product.displayName || !product.name) {
          throw new Error('모든 상품의 이름을 입력해주세요.');
        }

        if (!product.discountPrice) {
          throw new Error('모든 상품의 가격 정보를 입력해주세요.');
        }

        if (!product.additionalImages) {
          throw new Error('모든 상품의 대표 이미지를 업로드해주세요.');
        }
      }

      return true;
    } catch (err) {
      handleError(err, '상품 검증 실패');
      return false;
    }
  }

  const registerCoupangProduct = async () => {

    // 여기에서 상품 재정의
    store.products.map(product => {
      product.optionValue = product.optionValue + product.optionValueUnit;
      product.quantity =product.quantity + product.quantityUnit;
    })

    const convertImageToBase64 = async (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });
    };
  
    // 상품 이미지 변환
    const productsWithBase64Images = await Promise.all(store.products.map(async (product) => {
      const convertedImages = await Promise.all(
        (product.additionalImages || []).map(async (img) => {
          if (img.file instanceof File) {
            const base64Data = await convertImageToBase64(img.file);
            return { file: base64Data };
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
          return { file: base64Data };
        }
        return img;
      })
    );

    // 샘플 증여 상품 이미지 변환
    const convertedSampleImages = await Promise.all(
      (store.sampleImages || []).map(async (img) => {
        if (img.file instanceof File) {
          const base64Data = await convertImageToBase64(img.file);
          return { file: base64Data };
        }
        return img;
      })
    );

    try {
      if(!selectedAccount.cp_id){
        throw new Error('쿠팡 계정 정보가 없습니다.');
      }
      // 첫번쨰 상품의 모든 이미지
      const addtionalImages = productsWithBase64Images[0].additionalImages.filter((img, index) => index != 0);

      // 상품 데이터 준비
      const productData = {
        basicInfo: store.basicInfo,
        products: productsWithBase64Images.map((product, index) => {
          if(index != 0){
            return {
              ...product,
              additionalImages: [...product.additionalImages, ...addtionalImages]
            }
          }
          return product;
        }),
        selectedAttributes: store.attributes.filter(attr => attr.required === 'MANDATORY' && attr.dataType !== 'NUMBER'),
        lastCategory: store.lastCategory,
        tags: store.tags,
        productNotices: store.selectedProductNotice,
        shippingInfo: store.shippingDays,
        descImageFiles: convertedDetailImages,
        sampleImageFiles: convertedSampleImages,
      };

      // 데이터 구성
      const data = {
        accName: selectedAccount.accName,
        productData: productData,
      };

      // API 호출
      const res = await productService.registerCoupangProduct(data);

      const validatedRes = validateResponse(res, '쿠팡 상품 등록');
      
      return validatedRes;

    } catch (err) {
      handleError(err, '쿠팡 상품 등록 실패');
      return {
        response : {
          code: 'ERROR',
          message: err.message || '상품 등록 중 오류가 발생했습니다.'
        }
      };
    }
  }

  const deleteCoupangProduct = async (productIds) => {
    try {
      const data = {
        accName: selectedAccount.accName,
        selectedProducts: productIds
      };
      const res = await productService.deleteCoupangProduct(data);
      const validatedRes = validateResponse(res, '쿠팡 상품 삭제');
      return validatedRes;
    } catch (err) {
      handleError(err, '쿠팡 상품 삭제 실패');
    }
  }

  return {
    fetchCoupangCategories,
    fetchCoupangTags,
    fetchCoupangCategoryMetas,
    registerCoupangProduct,
    validateProduct,
    deleteCoupangProduct,
    ...store,
  };
} 