import { create } from 'zustand'

const initialState = {
  basicInfo: {
    brand: '',
    manufacturer: '',
    origin: '',
    warranty: '',
  },
  categories: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  },
  selectedCategories: {
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  },
  lastCategory: '',
  tags: [],
  productNotices: [],
  selectedProductNotice: '',
  categoryOptions: [],
  shippingDays: '1',
  detailImages: [],
  detailImageDragActive: false,
  sampleImages: [],
  sampleImageDragActive: false,
  products: [
    {
      id: 1,
      name: '',
      displayName: '',
      optionName: '',
      optionValue: '',
      optionValueUnit: '',
      quantity: '',
      quantityUnit: '',
      regularPrice: '',
      discountPrice: '',
      isExpanded: true,
      additionalImages: []
    },
    {
      id: 2,
      name: '',
      displayName: '',
      optionName: '',
      optionValue: '',
      optionValueUnit: '',
      quantity: '',
      quantityUnit: '',
      regularPrice: '',
      discountPrice: '',
      isExpanded: true,
      additionalImages: []
    },
    {
      id: 3,
      name: '',
      displayName: '',
      optionName: '',
      optionValue: '',
      optionValueUnit: '',
      quantity: '',
      quantityUnit: '',
      regularPrice: '',
      discountPrice: '',
      isExpanded: true,
      additionalImages: []
    },
    {
      id: 4,
      name: '',
      displayName: '',
      optionName: '',
      optionValue: '',
      optionValueUnit: '',
      quantity: '',
      quantityUnit: '',
      regularPrice: '',
      discountPrice: '',
      isExpanded: true,
      additionalImages: []
    },
    {
      id: 5,
      name: '',
      displayName: '',
      optionName: '',
      optionValue: '',
      optionValueUnit: '',
      quantity: '',
      quantityUnit: '',
      regularPrice: '',
      discountPrice: '',
      isExpanded: true,
      additionalImages: []
    }
  ],
  loading: false,
  error: null,
  categoryMetas: [],
  productOptions: [],
  attributes: [],
  selectedAttributes: [],
  checkboxStates: {},
}

const useCoupangStore = create((set) => ({
  ...initialState,

  // 상태 업데이트 액션
  setBasicInfo: (field, value) =>
    set((state) => ({
      basicInfo: {
        ...state.basicInfo,
        [field]: value,
      },
    })),

  setCategories: (level, categories) =>
    set((state) => ({
      categories: {
        ...state.categories,
        [level]: categories,
      },
    })),

  setProducts: (products) => set({ products }),

  setSelectedCategories: (level, category) =>
    set((state) => ({
      selectedCategories: {
        ...state.selectedCategories,
        [level]: category,
      },
    })),

  setSelectedAttributes: (attributes) => {
    console.log('setSelectedAttributes 호출됨:', attributes);
    set((state) => {
      console.log('이전 상태:', state.selectedAttributes);
      return { selectedAttributes: attributes };
    });
  },

  setCategoryMetas: (metas) =>
    set((state) => ({
      categoryMetas: metas,
    })),

  resetCategories: () =>
    set((state) => ({
      categories: initialState.categories,
      selectedCategories: initialState.selectedCategories,
      lastCategory: initialState.lastCategory,
    })),

  setTags: (tags) => set({ tags }),

  setProductNotices: (value) => set({ productNotices: value }),
  
  setProductOptions: (value) => set({ productOptions: value }),

  setSelectedProductNotice: (value) => set({ selectedProductNotice: value }),

  setShippingDays: (value) => set({ shippingDays: value }),

  setDetailImages: (images) => set({ detailImages: images }),
  setDetailImageDragActive: (isActive) => set({ detailImageDragActive: isActive }),
  setSampleImages: (images) => set({ sampleImages: images }),
  setSampleImageDragActive: (isActive) => set({ sampleImageDragActive: isActive }),

  setLastCategory: (category) => set({ lastCategory: category }),

  removeDetailImage: (index) =>
    set((state) => ({
      detailImages: state.detailImages.filter((_, i) => i !== index),
    })),

  addProduct: () =>
    set((state) => ({
      products: [
        ...state.products,
        {

          id: state.products.length + 1,
          name: state.products[0]?.name? state.products[0]?.name + ' ' + Number(state.products.length+1) + '개' : '',
          displayName: state.products[0]?.name? state.products[0]?.name + ' ' + Number(state.products.length+1) + '개' : '',
          optionName: state.products[0]?.optionName,
          optionValue: state.products[0]?.optionValue,
          optionValueUnit: state.products[0]?.optionValueUnit,
          quantity: state.products[0]?.quantity? state.products.length + 1 : '',
          quantityUnit: state.products[0]?.quantityUnit,
          regularPrice: '',
          discountPrice: '',
          isExpanded: true,
          additionalImages: []
        },
      ],
    })),

  updateProduct: (productId, field, value) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? { ...product, [field]: value }
          : product
      ),
    })),

  removeProduct: (productId) =>
    set((state) => {
      // 상품 필터링
      const filteredProducts = state.products.filter((product) => product.id !== productId);
      
      // ID 재정의 (1부터 순차적으로)
      const reorderedProducts = filteredProducts.map((product, index) => ({
        ...product,
        id: index + 1
      }));
      
      return {
        products: reorderedProducts,
      };
    }),

  // UI 상태 액션
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // 초기화 액션
  resetStore: () => {
    // 상태 초기화
    set(initialState);
  },

  // 옵션 데이터 설정
  setAttributes: (attributes) => set({ attributes }),

}))

export default useCoupangStore 