import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 상품 관리를 위한 Zustand 스토어
 * @type {import('zustand').Store<ProductState>}
 */
export const useProductStore = create(
  persist(
    (set, get) => ({
      // 카테고리 관련 상태
      mainCategories: [],
      subCategories: [],
      detailCategories: [],
      microCategories: [],
      selectedMainCategory: null,
      selectedSubCategory: null,
      selectedDetailCategory: null,
      selectedMicroCategory: null,
      selectedCategory: null,
      isCategoryLoading: false,
      categoryError: null,  
      productError: null,
      isTagSuggestionsLoading: false,
      isProductProvidedNoticeLoading: false,
      productProvidedNotice: [],
      selectedProductProvidedNotice: null,
      mainProduct: null,
      // 태그 관련 상태
      tags: [],
      tagInput: '',
      tagSuggestions: [],

      // 상품 정보
      products: [],
      commonInfo: {
        brand: '',
        manufacture: '',
      },
      productAttributes: [],
      selectedProductAttributes: [],
      asInfo: {},
      deliveryInfo: {},

      // 상세 이미지, 모달, 아코디언 등
      detailImages: [],
      detailImageDragActive: false,
      previewModal: false,

      collapsedProducts: new Set(), // 닫힌 상품 ID를 저장하는 Set

      // Setter 함수들
      setCategories: (level, data) => {
        set({ [`${level}Categories`]: data });
      },
      selectCategory: (level, category) => {
        set({ [`selected${level}Category`]: category });
      },
      setSelectCategory: (category) => {
        set({ selectedCategory: category });
      },
      setCategoryLoading: (loading) => set({ isCategoryLoading: loading }),
      setTagSuggestionsLoading: (loading) => set({ isTagSuggestionsLoading: loading }),
      setProductProvidedNoticeLoading: (loading) => set({ isProductProvidedNoticeLoading: loading }),
      setCategoryError: (error) => set({ categoryError: error }),
      setProductError: (error) => set({ productError: error }),
      setMainProduct: (product) => set({ mainProduct: product }),
      resetCategories: () => {
        set({
          mainCategories: [],
          subCategories: [],
          detailCategories: [],
          microCategories: [],
          selectedMainCategory: null,
          selectedSubCategory: null,
          selectedDetailCategory: null,
          selectedMicroCategory: null,
          selectedCategory: null,
          categoryError: null,
          productError: null,
          tags: [],
          tagInput: '',
          tagSuggestions: [],
          productAttributes: [],
          selectedProductAttributes: [],
        });
      },

      setTags: (tags) => {
        set({ tags });
      },
      setTagInput: (input) => set({ tagInput: input }),
      setTagSuggestions: (suggestions) => {
        set({ tagSuggestions: suggestions});
      },

      setProducts: (products) => {
        set({ products });
      },
      setSelectedProduct: (product) => {
        set({ selectedProduct: product });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      addProduct: (product) => {
        set((state) => ({ products: [...state.products, product] }));
      },
      setProduct: (product) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === product.id ? product : p
          ),
          selectedProduct:
            state.selectedProduct?.id === product.id ? product : state.selectedProduct,
        }));
      },
      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          selectedProduct:
            state.selectedProduct?.id === id ? null : state.selectedProduct,
        }));
      },

      setSelectedProductProvidedNotice: (notice) => {
        set({ selectedProductProvidedNotice: notice });
      },

      setCommonInfo: (info) => {
        set((state) => ({
          commonInfo: { ...state.commonInfo, ...info }
        }));
      },
      setProductProvidedNotice: (notice) => {
        set({ productProvidedNotice: notice });
      },
      setProductAttributes: (attributes) => {
        set({ productAttributes: attributes });
      },
      setSelectedProductAttributes: (attributes) => { 
        set({ selectedProductAttributes: attributes });
      },
      setAsInfo: (asInfo) => {
        set({ asInfo });
      },
      setDeliveryInfo: (deliveryInfo) => {
        set({ deliveryInfo });
      },

      setDetailImages: (images) => {
        set({ detailImages: images });
      },
      setDetailImageDragActive: (active) => set({ detailImageDragActive: active }),
      setPreviewModal: (value) => set({ previewModal: value }),

      // 상품 토글 상태 변경
      toggleProductCollapse: (productId) => {
        set((state) => {
          const newCollapsedProducts = new Set(state.collapsedProducts)
          if (newCollapsedProducts.has(productId)) {
            newCollapsedProducts.delete(productId)
          } else {
            newCollapsedProducts.add(productId)
          }
          return { collapsedProducts: newCollapsedProducts }
        })
      },

      // 상품이 닫혀있는지 확인
      isProductCollapsed: (productId) => {
        return get().collapsedProducts.has(productId)
      },

      // 상태 저장
      saveState: () => {
        const state = get();
        localStorage.setItem('productState', JSON.stringify(state));
      },

      // 전체 상태 초기화
      resetState: () => {
        set({
          mainCategories: [],
          subCategories: [],
          detailCategories: [],
          microCategories: [],
          selectedMainCategory: null,
          selectedSubCategory: null,
          selectedDetailCategory: null,
          selectedMicroCategory: null,
          selectedCategory: null,
          isCategoryLoading: false,
          isTagSuggestionsLoading: false,
          isProductProvidedNoticeLoading: false,
          productProvidedNotice: [],
          selectedProductProvidedNotice: null,
          categoryError: null,
          tags: [],
          tagInput: '',
          tagSuggestions: [],
          products: [],
          mainProduct: null,
          commonInfo: {
            brand: '',
            manufacture: '',
          },
          productAttributes: [],
          selectedProductAttributes: [],
          asInfo: {asNumber: '070-7954-3996', asDescription: '톡톡으로 문의주세요'},
          deliveryInfo: {
            deliveryType: "DELIVERY",
            deliveryAttributeType: "TODAY", // 오늘출발 값 true면 "TODAY", 아니면 NORMAL
            deliveryCompany: "CJGLS", // 대한통운
            deliveryFee: {
              deliveryFeeType: "PAID", // 유료배송
              baseFee: 3500, // 배송비 3500원
              deliveryFeePayType: "PREPAID", // 선불
              deliveryFeeByArea: {
                // 지역별 배송비
                deliveryAreaType: "AREA_3", // 3권역
                area2extraFee: 4000, // 제주 3500
                area3extraFee: 4000, // 제주 외 도서산간 4000
              },
            },
            claimDeliveryInfo: {
              returnDeliveryFee: 4000, // 반품, 교환 배송비 8500
              exchangeDeliveryFee: 8500,
            },
          },
          detailImages: [],
          detailImageDragActive: false,
          previewModal: false,
          collapsedProducts: new Set(),
        });
        localStorage.removeItem('productState');
      },
    }),
    {
      name: 'product-storage',
    }
  )
);
