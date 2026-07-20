import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCloseButton,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CImage,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilChevronLeft, cilChevronRight, cilSearch, cilTrash } from '@coreui/icons'
import productService from '../../../services/productService'
import { useAccountStore } from '../../../stores/useAccountStore'
import { useProductStore } from '../../../stores/useNaverStore'
import CategorySelector from '../product-register/components/CategorySelector'
import ProductAttributesCard from '../product-register/components/ProductAttributesCard'
import TagsCard from '../product-register/components/TagsCard'
import DetailImageUploader from '../product-register/components/DetailImageUploader'
import BasicInfoCard from '../product-register/components/BasicInfoCard'
import ProductImageUploader from '../product-register/components/ProductImageUploader'
import '../../style/css/ProductRegister.css'

const defaultSizeForm = {
  productName: '',
  regularPrice: '',
  discountRate: '23',
  price: '',
}

const defaultManualSizeForm = {
  useInterval: true,
  values: 'FREE, XS, S, M, L, XL',
  startSize: '220',
  endSize: '280',
  interval: '10',
}

const getOptionCombinationKey = (colorId, sizeId) => `${colorId}:${sizeId}`
const MAX_OPTION_COMBINATIONS = 500
// 네이버 간편옵션 사용 중에는 별도 사이즈 참고 패널을 노출하지 않는다.
const SHOW_SIZE_REFERENCE = false
const defaultRegistrationProgress = {
  status: 'waiting',
  completed: 0,
  total: 0,
  success: 0,
  failed: 0,
  currentOptionLabel: '',
  message: '',
}

const buildRegistrationOptionLabel = (combination, withoutColor) => {
  if (withoutColor) return String(combination.size || '').trim()

  return [combination.color, combination.size]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ')
}

const buildRegistrationProductName = (baseProductName, combination, withoutColor) =>
  [baseProductName, buildRegistrationOptionLabel(combination, withoutColor)]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.contents)) return payload.contents
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.sizeTypes)) return payload.sizeTypes
  if (Array.isArray(payload?.list)) return payload.list
  return []
}

const getSizeTypeId = (item) =>
  item?.sizeTypeNo ?? item?.sizeTypeId ?? item?.id ?? item?.no ?? item?.typeNo ?? ''

const getSizeTypeName = (item) =>
  item?.name ?? item?.sizeTypeName ?? item?.typeName ?? item?.label ?? `타입 ${getSizeTypeId(item)}`

const getMeasurementTypeLabel = (value) => {
  if (value === 'SECTION') return '단면'
  if (value === 'ROUND') return '둘레'
  return value || '-'
}

const formatCurrency = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString('ko-KR')}원` : '-'
}

const getProductAttributePreviewValues = (attribute) => {
  const values = Array.isArray(attribute?.values) ? attribute.values : []
  const unit = attribute?.representativeUnitCodeName || ''
  const getValue = (valueSeq) => values.find((value) => String(value.attributeValueSeq) === String(valueSeq))

  if (attribute?.attributeClassificationType === 'MULTI_SELECT') {
    return (attribute.selectedValues || [])
      .map((valueSeq) => getValue(valueSeq)?.minAttributeValue)
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => `${value}${unit}`)
  }

  if (attribute?.attributeClassificationType === 'RANGE') {
    const selectedValue = attribute.selectedValue || {}
    const range = getValue(selectedValue.rangeValue)
    const rangeLabel = range
      ? `${range.minAttributeValue ?? ''}${unit} ~ ${range.maxAttributeValue ?? ''}${unit}`
      : ''
    const realValueLabel = selectedValue.attributeRealValue !== undefined && selectedValue.attributeRealValue !== ''
      ? `실제값 ${selectedValue.attributeRealValue}${unit}`
      : ''
    return [rangeLabel, realValueLabel].filter(Boolean)
  }

  const selected = getValue(attribute?.selectedValue)
  if (selected?.minAttributeValue !== undefined) return [`${selected.minAttributeValue}${unit}`]
  if (attribute?.selectedValue !== undefined && attribute.selectedValue !== '') {
    return [`${attribute.selectedValue}${unit}`]
  }
  return []
}

const parseManualSizeLabels = (value) =>
  value
    .split(/[\n,]/)
    .map((label) => label.trim())
    .filter(Boolean)

const parseNumericSizeLabel = (label) => {
  const match = String(label).trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null

  return {
    number: Number(match[1]),
    numberText: match[1],
    suffix: match[2].trim(),
  }
}

const getMeasurementValue = (label) => parseNumericSizeLabel(label)?.numberText || ''

const getDecimalPlaces = (value) => {
  const decimal = String(value).split('.')[1]
  return decimal ? decimal.length : 0
}

const formatScaledSize = (value, decimalPlaces) =>
  value.toFixed(decimalPlaces).includes('.')
    ? value.toFixed(decimalPlaces).replace(/\.?0+$/, '')
    : value.toFixed(decimalPlaces)

const createIntervalSizeItems = ({ startSize, endSize, interval }) => {
  const start = Number(startSize)
  const end = Number(endSize)
  const step = Number(interval)

  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step)) {
    return { error: '간격 적용할 시작 사이즈, 종료 사이즈, 간격을 입력해주세요.' }
  }

  if (step <= 0) {
    return { error: '사이즈 간격은 0보다 크게 입력해주세요.' }
  }

  const decimalPlaces = Math.max(
    getDecimalPlaces(startSize),
    getDecimalPlaces(endSize),
    getDecimalPlaces(interval),
  )
  const factor = 10 ** decimalPlaces
  const startUnits = Math.round(start * factor)
  const endUnits = Math.round(end * factor)
  const stepUnits = Math.round(step * factor)

  if (stepUnits <= 0) {
    return { error: '사이즈 간격은 0보다 크게 입력해주세요.' }
  }

  const direction = endUnits >= startUnits ? 1 : -1
  const signedStep = stepUnits * direction
  const items = []

  for (
    let current = startUnits, guard = 0;
    direction > 0 ? current <= endUnits : current >= endUnits;
    current += signedStep, guard += 1
  ) {
    if (guard >= 500) {
      return { error: '사이즈는 한 번에 500개까지만 생성할 수 있습니다.' }
    }

    const sizeLabel = formatScaledSize(current / factor, decimalPlaces)
    items.push({
      label: sizeLabel,
      measurementValue: sizeLabel,
    })
  }

  return { items }
}

const normalizeNaverSizeReferenceRows = (payload) =>
  normalizeList(payload)
    .map((item, index) => ({
      key: String(getSizeTypeId(item) || index),
      name: getSizeTypeName(item),
      unit: item?.sizeUnitType || '-',
      measurementType: getMeasurementTypeLabel(item?.sizeMeasurementType),
      valueTypes: Array.isArray(item?.sizeValueTypes)
        ? [...item.sizeValueTypes].sort((a, b) => Number(a.exposureOrder || 0) - Number(b.exposureOrder || 0))
        : [],
    }))
    .filter((item) => item.name)

const normalizeColorCode = (value) => {
  const colorCode = String(value || '').trim()
  if (/^#[0-9a-f]{6}$/i.test(colorCode)) return colorCode
  if (/^[0-9a-f]{6}$/i.test(colorCode)) return `#${colorCode}`
  return ''
}

const normalizeStandardColorOptions = (payload) => {
  const groups = Array.isArray(payload?.standardOptionGroups)
    ? payload.standardOptionGroups
    : []
  const seen = new Set()

  return groups
    .filter((group) => {
      const groupName = String(group?.groupName || '').toLowerCase()
      return groupName.includes('색상') || groupName.includes('컬러') || groupName.includes('color')
    })
    .flatMap((group) => Array.isArray(group?.standardOptionAttributes) ? group.standardOptionAttributes : [])
    .map((attribute) => ({
      key: String(attribute?.attributeValueId ?? `${attribute?.attributeId}-${attribute?.attributeValueName}`),
      label: String(attribute?.attributeValueName || '').trim(),
      colorCode: normalizeColorCode(attribute?.attributeColorCode),
    }))
    .filter((option) => {
      const key = option.label.toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const SizeRegister = () => {
  const { selectedAccount } = useAccountStore()
  const {
    resetState,
    selectedCategory,
    tags,
    detailImages,
    commonInfo,
    selectedProductAttributes,
    asInfo,
    deliveryInfo,
    selectedProductProvidedNotice,
  } = useProductStore()

  const loadedSizeTypesAccountRef = useRef(null)
  const submitLockRef = useRef(false)
  const [form, setForm] = useState(defaultSizeForm)
  const [productImages, setProductImages] = useState([])
  const [withoutColor, setWithoutColor] = useState(false)
  const [colorRows, setColorRows] = useState([])
  const [manualColorValues, setManualColorValues] = useState('')
  const [standardColorOptions, setStandardColorOptions] = useState([])
  const [customColorOptions, setCustomColorOptions] = useState([])
  const [sizeRows, setSizeRows] = useState([])
  const [disabledCombinationKeys, setDisabledCombinationKeys] = useState(new Set())
  const [sizeReferenceRows, setSizeReferenceRows] = useState([])
  const [isFetchingSizeTypes, setIsFetchingSizeTypes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [resultAlert, setResultAlert] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [manualSizeForm, setManualSizeForm] = useState(defaultManualSizeForm)
  const [showProgress, setShowProgress] = useState(false)
  const [registrationProgress, setRegistrationProgress] = useState(defaultRegistrationProgress)
  const [showSizeReferencePanel, setShowSizeReferencePanel] = useState(false)

  useEffect(() => {
    resetState()
    return () => {
      productImages.forEach((image) => {
        if (image.preview) URL.revokeObjectURL(image.preview)
      })
    }
  }, [])

  const activeSizeRows = useMemo(
    () => sizeRows.filter((row) => row.usable),
    [sizeRows],
  )
  const canConfigureSizes = withoutColor || colorRows.length > 0
  const availableColorOptions = useMemo(() => {
    const seen = new Set()

    return [...standardColorOptions, ...customColorOptions].filter((option) => {
      const key = option.label.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [customColorOptions, standardColorOptions])

  const activeOptionCombinations = useMemo(() => {
    if (withoutColor) {
      return activeSizeRows.map((size) => ({
        id: size.id,
        colorId: null,
        sizeId: size.id,
        color: '',
        size: size.label,
      }))
    }

    return colorRows.flatMap((color) =>
      activeSizeRows
        .filter((size) => !disabledCombinationKeys.has(getOptionCombinationKey(color.id, size.id)))
        .map((size) => ({
          id: getOptionCombinationKey(color.id, size.id),
          colorId: color.id,
          sizeId: size.id,
          color: color.label,
          size: size.label,
        })),
    )
  }, [activeSizeRows, colorRows, disabledCombinationKeys, withoutColor])

  const previewProducts = useMemo(
    () =>
      activeOptionCombinations.map((combination) => ({
        id: combination.id,
        color: combination.color,
        size: combination.size,
        productName: buildRegistrationProductName(
          form.productName.trim(),
          combination,
          withoutColor,
        ),
        regularPrice: Number(form.regularPrice || 0),
        salePrice: Number(form.price || 0),
      })),
    [activeOptionCombinations, form.productName, form.price, form.regularPrice, withoutColor],
  )
  const orderedProductImages = useMemo(
    () => [...productImages].sort((a, b) => a.order - b.order),
    [productImages],
  )
  const orderedDetailImages = useMemo(
    () => [...(detailImages || [])].sort((a, b) => a.order - b.order),
    [detailImages],
  )
  const registrationProgressPercent = registrationProgress.total > 0
    ? Math.min(100, Math.round((registrationProgress.completed / registrationProgress.total) * 100))
    : 0

  const handleFormChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      const discountRate = Number(name === 'discountRate' ? value : next.discountRate || 0)

      if (name === 'regularPrice') {
        next.price = value
          ? String(Math.round((Number(value) * (1 - discountRate / 100)) / 100) * 100)
          : ''
      } else if (name === 'price') {
        next.regularPrice = value && discountRate < 100
          ? String(Math.round((Number(value) / (1 - discountRate / 100)) / 100) * 100)
          : next.regularPrice
      } else if (name === 'discountRate') {
        if (next.regularPrice) {
          next.price = String(Math.round((Number(next.regularPrice) * (1 - discountRate / 100)) / 100) * 100)
        } else if (next.price && discountRate < 100) {
          next.regularPrice = String(Math.round((Number(next.price) / (1 - discountRate / 100)) / 100) * 100)
        }
      }

      return next
    })
  }

  const updateSizeRow = (rowId, field, value) => {
    setSizeRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    )
  }

  const removeSizeRow = (rowId) => {
    setSizeRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const appendColorRows = (items, duplicateMessage = '입력한 색상이 이미 모두 등록되어 있습니다.') => {
    const existingLabels = new Set(colorRows.map((row) => String(row.label).trim().toLowerCase()))
    const newLabels = new Set()
    const newRows = items
      .filter((item) => {
        const key = String(item.label).trim().toLowerCase()
        if (existingLabels.has(key) || newLabels.has(key)) return false
        newLabels.add(key)
        return true
      })
      .map((item) => ({
        id: crypto.randomUUID(),
        label: String(item.label).trim(),
        colorCode: item.colorCode || '',
      }))

    if (newRows.length === 0) {
      setValidationError(duplicateMessage)
      return false
    }

    setColorRows((prev) => [...prev, ...newRows])
    setValidationError('')
    return true
  }

  const applyManualColorItems = () => {
    const labels = parseManualSizeLabels(manualColorValues)
    if (labels.length === 0) {
      setValidationError('색상을 입력해주세요.')
      return
    }

    const manualOptions = labels.map((label) => ({
      key: `custom-${label.toLowerCase()}`,
      label,
      colorCode: '',
    }))

    setCustomColorOptions((prev) => {
      const existingLabels = new Set(prev.map((option) => option.label.toLowerCase()))
      const newOptions = manualOptions.filter((option) => !existingLabels.has(option.label.toLowerCase()))
      return [...prev, ...newOptions]
    })

    if (appendColorRows(manualOptions)) {
      setManualColorValues('')
    }
  }

  const handleWithoutColorChange = (event) => {
    const checked = event.target.checked
    setWithoutColor(checked)

    if (checked) {
      setColorRows([])
      setManualColorValues('')
      setDisabledCombinationKeys(new Set())
      setValidationError('')
    }
  }

  const toggleStandardColor = (option) => {
    const normalizedLabel = option.label.toLowerCase()
    const selectedRow = colorRows.find((row) => row.label.toLowerCase() === normalizedLabel)

    if (selectedRow) {
      removeColorRow(selectedRow.id)
      setValidationError('')
      return
    }

    appendColorRows([option])
  }

  const updateColorRow = (rowId, value) => {
    setColorRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, label: value, colorCode: '' } : row)),
    )
  }

  const removeColorRow = (rowId) => {
    setColorRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const toggleOptionCombination = (colorId, sizeId) => {
    const key = getOptionCombinationKey(colorId, sizeId)
    setDisabledCombinationKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAllSizesForColor = (colorId, enabled) => {
    setDisabledCombinationKeys((prev) => {
      const next = new Set(prev)
      activeSizeRows.forEach((size) => {
        const key = getOptionCombinationKey(colorId, size.id)
        if (enabled) next.delete(key)
        else next.add(key)
      })
      return next
    })
  }

  const appendSizeRows = (items, duplicateMessage = '이미 등록된 사이즈입니다.') => {
    const nextRows = items.map((item) => ({
      id: crypto.randomUUID(),
      value: item.label,
      label: item.label,
      measurementValue: item.measurementValue || getMeasurementValue(item.label),
      usable: true,
    }))

    const existingLabels = new Set(sizeRows.map((row) => String(row.label).trim().toLowerCase()))
    const newLabels = new Set()
    const uniqueRows = nextRows.filter((row) => {
      const key = String(row.label).trim().toLowerCase()
      if (existingLabels.has(key) || newLabels.has(key)) return false
      newLabels.add(key)
      return true
    })

    if (uniqueRows.length === 0) {
      setValidationError(duplicateMessage)
      return false
    }

    setSizeRows((prev) => [...prev, ...uniqueRows])
    setValidationError('')
    return true
  }

  const applyManualSizeItems = () => {
    const quickSizeItems = manualSizeForm.useInterval
      ? createIntervalSizeItems(manualSizeForm)
      : {
          items: parseManualSizeLabels(manualSizeForm.values).map((label) => ({
            label,
            measurementValue: getMeasurementValue(label),
          })),
        }

    if (quickSizeItems.error) {
      setValidationError(quickSizeItems.error)
      return
    }

    if (!quickSizeItems.items || quickSizeItems.items.length === 0) {
      setValidationError('간편 입력할 사이즈를 입력해주세요.')
      return
    }

    appendSizeRows(quickSizeItems.items)
  }

  const convertImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
    })

  const fetchAllSizeValues = async ({ showMessage = true } = {}) => {
    if (!selectedAccount?.accName) {
      setValidationError('네이버 계정을 먼저 선택해주세요.')
      return
    }

    setIsFetchingSizeTypes(true)
    try {
      const response = await productService.getNaverAllSizeValues({ accName: selectedAccount.accName })
      const referenceRows = normalizeNaverSizeReferenceRows(response?.sizeTypes ?? response)

      setSizeReferenceRows(referenceRows)
      loadedSizeTypesAccountRef.current = selectedAccount.accName

      if (referenceRows.length === 0) {
        setResultAlert({ type: 'warning', message: '조회된 사이즈 참고 데이터가 없습니다.' })
      } else if (showMessage) {
        setResultAlert({
          type: 'info',
          message: `전체 사이즈 타입 ${referenceRows.length}개를 불러왔습니다.`,
        })
      }
    } catch (error) {
      setResultAlert({ type: 'danger', message: error.message || '전체 사이즈 참고표 조회 중 오류가 발생했습니다.' })
    } finally {
      setIsFetchingSizeTypes(false)
    }
  }

  useEffect(() => {
    if (!SHOW_SIZE_REFERENCE) return

    if (!selectedAccount?.accName) {
      setSizeReferenceRows([])
      loadedSizeTypesAccountRef.current = null
      return
    }
    if (loadedSizeTypesAccountRef.current === selectedAccount.accName && sizeReferenceRows.length > 0) return

    fetchAllSizeValues({ showMessage: false })
  }, [selectedAccount?.accName])

  useEffect(() => {
    let cancelled = false

    if (!selectedAccount?.accName || !selectedCategory?.id) {
      setStandardColorOptions([])
      return undefined
    }

    productService.getNaverStandardOptions({
      accName: selectedAccount.accName,
      categoryId: selectedCategory.id,
    }).then((response) => {
      if (!cancelled) setStandardColorOptions(normalizeStandardColorOptions(response))
    }).catch(() => {
      if (!cancelled) setStandardColorOptions([])
    })

    return () => {
      cancelled = true
    }
  }, [selectedAccount?.accName, selectedCategory?.id])

  const validateForm = () => {
    if (!selectedAccount?.n_id) return '네이버 계정을 먼저 선택해주세요.'
    if (!selectedCategory?.id) return '카테고리를 선택해주세요.'
    if (!selectedProductProvidedNotice?.productInfoProvidedNoticeType) return '상품정보제공고시 상품군을 선택해주세요.'
    if (!tags || tags.length === 0) return '태그를 입력해주세요.'
    if (!detailImages || detailImages.length === 0) return '상세 설명 이미지를 1개 이상 업로드해주세요.'
    if (!productImages || productImages.length === 0) return '상품 이미지를 1개 이상 업로드해주세요.'
    if (!form.productName.trim()) return '상품명을 입력해주세요.'
    if (!Number(form.regularPrice) || !Number(form.price)) return '정상가와 판매가를 입력해주세요.'
    if (!withoutColor && colorRows.length === 0) return '색상을 선택하거나 색상 없음을 체크해주세요.'
    if (activeSizeRows.length === 0) return '등록할 사이즈를 1개 이상 생성해주세요.'
    if (!withoutColor && colorRows.some((row) => !String(row.label).trim())) return '색상을 입력해주세요.'
    if (activeSizeRows.some((row) => !String(row.label).trim())) return '사이즈를 입력해주세요.'
    if (activeOptionCombinations.length === 0) {
      return withoutColor
        ? '등록할 사이즈를 1개 이상 선택해주세요.'
        : '등록할 색상/사이즈 조합을 1개 이상 선택해주세요.'
    }
    if (activeOptionCombinations.length > MAX_OPTION_COMBINATIONS) {
      return `옵션은 최대 ${MAX_OPTION_COMBINATIONS}개까지 등록할 수 있습니다.`
    }

    if (!withoutColor) {
      const colorWithoutSize = colorRows.find(
        (color) => !activeOptionCombinations.some((combination) => combination.colorId === color.id),
      )
      if (colorWithoutSize) return `${colorWithoutSize.label} 색상에 등록할 사이즈를 1개 이상 선택해주세요.`
    }

    const overLengthProductName = activeOptionCombinations
      .map((combination) =>
        buildRegistrationProductName(form.productName.trim(), combination, withoutColor),
      )
      .find((productName) => productName.length > 100)
    if (overLengthProductName) return `상품명이 100자를 초과합니다: ${overLengthProductName}`

    if (!withoutColor) {
      const colorLabels = colorRows.map((row) => String(row.label).trim())
      const duplicateColor = colorLabels.find((label, index) => colorLabels.indexOf(label) !== index)
      if (duplicateColor) return `중복된 색상 옵션이 있습니다: ${duplicateColor}`
    }

    const sizeLabels = activeSizeRows.map((row) => String(row.label).trim())
    const duplicateSize = sizeLabels.find((label, index) => sizeLabels.indexOf(label) !== index)
    if (duplicateSize) return `중복된 사이즈 옵션이 있습니다: ${duplicateSize}`

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitLockRef.current) return

    const error = validateForm()
    if (error) {
      setValidationError(error)
      document.querySelector('.validation-error')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setValidationError('')
    setResultAlert(null)
    submitLockRef.current = true
    setIsSubmitting(true)
    setShowProgress(true)
    const registrationRequestId = crypto.randomUUID()
    let progressTimer = null
    let shouldPollProgress = true
    let progressRequestPending = false
    setRegistrationProgress({
      ...defaultRegistrationProgress,
      status: 'preparing',
      total: activeOptionCombinations.length,
    })

    try {
      const convertedProductImages = await Promise.all(
        [...productImages]
          .sort((a, b) => a.order - b.order)
          .map(async (image) => ({
            ...image,
            file: image.file instanceof File ? await convertImageToBase64(image.file) : image.file,
          })),
      )

      const convertedDetailImages = await Promise.all(
        detailImages.map(async (image) =>
          image.file instanceof File ? await convertImageToBase64(image.file) : image.file,
        ),
      )

      const productData = {
        product: {
          name: form.productName.trim(),
          regularPrice: form.regularPrice,
          discountRate: form.discountRate,
          price: form.price,
          additionalImages: convertedProductImages,
        },
        sizeOption: {
          sizes: activeSizeRows.map((row) => ({
            label: row.label,
            value: row.value,
            measurementValue: row.measurementValue,
            usable: row.usable,
          })),
        },
        colorOption: {
          withoutColor,
          colors: withoutColor ? [] : colorRows.map((row) => ({ label: row.label })),
        },
        optionCombinations: activeOptionCombinations.map((combination) => ({
          color: combination.color,
          size: combination.size,
        })),
        commonInfo,
        selectedProductAttributes,
        asInfo,
        deliveryInfo,
        tags,
        detailImages: convertedDetailImages,
        category: selectedCategory,
        providedNotice: selectedProductProvidedNotice,
      }

      const pollProgress = async () => {
        if (progressRequestPending) return
        progressRequestPending = true
        try {
          const progress = await productService.getSizeRegistrationProgress({
            accName: selectedAccount.accName,
            registrationRequestId,
          })
          if (shouldPollProgress && progress?.status && progress.status !== 'waiting') {
            setRegistrationProgress((prev) => ({ ...prev, ...progress }))
          }
        } catch (progressError) {
          // The registration response remains authoritative if an individual poll fails.
        } finally {
          progressRequestPending = false
        }
      }

      progressTimer = window.setInterval(pollProgress, 800)

      const response = await productService.registerSizeProduct({
        accName: selectedAccount.accName,
        registrationRequestId,
        productData,
      })
      shouldPollProgress = false
      if (progressTimer) window.clearInterval(progressTimer)

      if (response?.error || response?.result === 'error') {
        throw new Error(response.error?.message || response.message || response.error || '상품 등록에 실패했습니다.')
      }

      setRegistrationProgress({
        status: response.result === 'partial' ? 'completed-with-errors' : 'completed',
        completed: response.optionCount || activeOptionCombinations.length,
        total: response.optionCount || activeOptionCombinations.length,
        success: response.registeredCount || 0,
        failed: response.failedCount || 0,
        currentOptionLabel: '',
        message: response.message || '',
      })

      if (response?.result === 'partial') {
        setResultAlert({
          type: 'warning',
          message: response.message || '상품 등록 후 일부 사이즈 옵션 처리에 실패했습니다.',
        })
      } else {
        setResultAlert({
          type: 'success',
          message: response?.message || `옵션별 상품 ${activeOptionCombinations.length}개 등록이 완료되었습니다.`,
        })
      }
    } catch (submitError) {
      shouldPollProgress = false
      if (progressTimer) window.clearInterval(progressTimer)
      const errorData = submitError?.data
      setRegistrationProgress((prev) => ({
        ...prev,
        status: 'error',
        completed: errorData?.optionCount || prev.completed,
        success: errorData?.registeredCount || prev.success,
        failed: errorData?.failedCount || prev.failed,
        currentOptionLabel: '',
        message: submitError.message || '상품 등록 중 오류가 발생했습니다.',
      }))
      setResultAlert({ type: 'danger', message: submitError.message || '상품 등록 중 오류가 발생했습니다.' })
    } finally {
      shouldPollProgress = false
      if (progressTimer) window.clearInterval(progressTimer)
      submitLockRef.current = false
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (!form.productName.trim()) {
      setValidationError('상품명을 입력하면 미리보기를 볼 수 있습니다.')
      return
    }

    if ((!withoutColor && colorRows.length === 0) || activeSizeRows.length === 0 || activeOptionCombinations.length === 0) {
      setValidationError(withoutColor
        ? '사이즈를 입력해주세요.'
        : '색상과 사이즈를 입력하고 등록할 조합을 선택해주세요.')
      return
    }

    setValidationError('')
    setShowPreview(true)
  }

  const handleReset = () => {
    resetState()
    productImages.forEach((image) => {
      if (image.preview) URL.revokeObjectURL(image.preview)
    })
    setProductImages([])
    setWithoutColor(false)
    setColorRows([])
    setManualColorValues('')
    setCustomColorOptions([])
    setSizeRows([])
    setDisabledCombinationKeys(new Set())
    setForm(defaultSizeForm)
    setShowPreview(false)
    setShowSizeReferencePanel(false)
    setShowProgress(false)
    setRegistrationProgress(defaultRegistrationProgress)
    setManualSizeForm(defaultManualSizeForm)
    setValidationError('')
    setResultAlert(null)
  }

  return (
    <CContainer fluid>
      <CForm onSubmit={handleSubmit} onKeyDown={(event) => {
        if (event.key === 'Enter') event.preventDefault()
      }}>
        <CCard className="mb-4">
          <CCardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
            <strong>상품등록-사이즈</strong>
            <div className="d-flex gap-2">
              <CButton color="secondary" onClick={handleReset} disabled={isSubmitting}>
                초기화
              </CButton>
              <CButton color="primary" onClick={handlePreview} disabled={isSubmitting}>
                <CIcon icon={cilSearch} className="me-2" />
                미리보기
              </CButton>
              <CButton color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    등록 중...
                  </>
                ) : (
                  '상품등록'
                )}
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {validationError && (
              <CAlert color="danger" className="mb-4 validation-error">
                {validationError}
              </CAlert>
            )}
            {resultAlert && (
              <CAlert color={resultAlert.type} className="mb-4">
                {resultAlert.message}
              </CAlert>
            )}

            <CategorySelector />
            <ProductAttributesCard />
            <TagsCard />
            <DetailImageUploader />
            <BasicInfoCard />

            <CCard className="mb-4">
              <CCardHeader>
                <strong>상품 기본 정보</strong>
              </CCardHeader>
              <CCardBody>
                <CRow className="g-3">
                  <CCol xs={12}>
                    <CFormLabel>상품명</CFormLabel>
                    <CFormInput
                      value={form.productName}
                      onChange={(event) => handleFormChange('productName', event.target.value)}
                      placeholder="예) 러닝화"
                      maxLength={100}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>정상가</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={form.regularPrice}
                        onChange={(event) => handlePriceChange('regularPrice', event.target.value.replace(/\D/g, ''))}
                        placeholder="정상가"
                      />
                      <CInputGroupText>원</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>할인율</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={form.discountRate}
                        onChange={(event) => handlePriceChange('discountRate', event.target.value.replace(/\D/g, ''))}
                        placeholder="할인율"
                      />
                      <CInputGroupText>%</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>판매가</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={form.price}
                        onChange={(event) => handlePriceChange('price', event.target.value.replace(/\D/g, ''))}
                        placeholder="판매가"
                      />
                      <CInputGroupText>원</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            <ProductImageUploader
              images={productImages}
              setImages={setProductImages}
              allowMultiple
            />

            <CCard className="mb-4">
              <CCardHeader>
                <strong>색상/사이즈 간편옵션 입력</strong>
              </CCardHeader>
              <CCardBody>
                <div className="border-bottom pb-4">
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                    <strong>1. 색상</strong>
                    <CFormCheck
                      id="without-color"
                      label="색상 없음"
                      checked={withoutColor}
                      onChange={handleWithoutColorChange}
                    />
                  </div>

                  {withoutColor ? (
                    <CAlert color="secondary" className="mb-0">
                      색상 옵션 없이 사이즈만 등록합니다.
                    </CAlert>
                  ) : (
                    <>
                      <CRow className="g-2 align-items-end">
                        <CCol md={9}>
                          <CFormInput
                            value={manualColorValues}
                            onChange={(event) => setManualColorValues(event.target.value)}
                            placeholder="예) 블랙, 화이트, 네이비"
                          />
                        </CCol>
                        <CCol md={3}>
                          <CButton color="primary" className="w-100" onClick={applyManualColorItems}>
                            추가
                          </CButton>
                        </CCol>
                      </CRow>

                      {availableColorOptions.length > 0 && (
                        <div className="mt-3">
                          <CFormLabel>간편옵션 색상</CFormLabel>
                          <div
                            className="d-flex flex-wrap gap-2 border p-2"
                            style={{ maxHeight: 190, overflowY: 'auto' }}
                          >
                            {availableColorOptions.map((option) => {
                              const selected = colorRows.some(
                                (row) => row.label.toLowerCase() === option.label.toLowerCase(),
                              )

                              return (
                                <CButton
                                  key={option.key}
                                  color={selected ? 'primary' : 'secondary'}
                                  variant={selected ? undefined : 'outline'}
                                  size="sm"
                                  className="d-flex align-items-center gap-2"
                                  style={selected ? { boxShadow: '0 0 0 2px rgba(13, 110, 253, 0.3)' } : undefined}
                                  onClick={() => toggleStandardColor(option)}
                                  aria-pressed={selected}
                                  aria-label={`${option.label} 색상 ${selected ? '선택 해제' : '선택'}`}
                                >
                                  {selected && <CIcon icon={cilCheckCircle} size="sm" aria-hidden="true" />}
                                  {option.colorCode && (
                                    <span
                                      aria-hidden="true"
                                      style={{
                                        width: 16,
                                        height: 16,
                                        flex: '0 0 16px',
                                        backgroundColor: option.colorCode,
                                        border: '1px solid #adb5bd',
                                      }}
                                    />
                                  )}
                                  {option.label}
                                </CButton>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                    <strong>2. 사이즈</strong>
                    {canConfigureSizes && (
                        <CFormCheck
                          id="quick-size-use-interval-inline"
                          label="범위/간격"
                          checked={manualSizeForm.useInterval}
                          onChange={(event) =>
                            setManualSizeForm((prev) => ({ ...prev, useInterval: event.target.checked }))
                          }
                        />
                    )}
                  </div>

                  {!canConfigureSizes ? (
                    <CAlert color="info" className="mb-0">
                      색상을 선택하거나 색상 없음을 체크하면 사이즈를 입력할 수 있습니다.
                    </CAlert>
                  ) : (
                    <>
                      {manualSizeForm.useInterval ? (
                        <CRow className="g-2">
                          <CCol xs={4}>
                            <CFormLabel>시작</CFormLabel>
                            <CFormInput
                              value={manualSizeForm.startSize}
                              onChange={(event) =>
                                setManualSizeForm((prev) => ({
                                  ...prev,
                                  startSize: event.target.value.replace(/[^0-9.]/g, ''),
                                }))
                              }
                              placeholder="220"
                            />
                          </CCol>
                          <CCol xs={4}>
                            <CFormLabel>종료</CFormLabel>
                            <CFormInput
                              value={manualSizeForm.endSize}
                              onChange={(event) =>
                                setManualSizeForm((prev) => ({
                                  ...prev,
                                  endSize: event.target.value.replace(/[^0-9.]/g, ''),
                                }))
                              }
                              placeholder="280"
                            />
                          </CCol>
                          <CCol xs={4}>
                            <CFormLabel>간격</CFormLabel>
                            <CFormInput
                              value={manualSizeForm.interval}
                              onChange={(event) =>
                                setManualSizeForm((prev) => ({
                                  ...prev,
                                  interval: event.target.value.replace(/[^0-9.]/g, ''),
                                }))
                              }
                              placeholder="10"
                            />
                          </CCol>
                        </CRow>
                      ) : (
                        <div>
                          <CFormLabel>사이즈 값</CFormLabel>
                          <CFormInput
                            value={manualSizeForm.values}
                            onChange={(event) => setManualSizeForm((prev) => ({ ...prev, values: event.target.value }))}
                            placeholder="예) FREE, XS, S, M, L, XL"
                          />
                        </div>
                      )}

                      <div className="d-flex justify-content-end mt-3">
                        <CButton color="primary" onClick={applyManualSizeItems}>
                          사이즈 적용
                        </CButton>
                      </div>
                    </>
                  )}
                </div>
              </CCardBody>
            </CCard>

            <CCard className="mb-4">
              <CCardHeader>
                <strong>{withoutColor ? '사이즈 옵션' : '색상별 사이즈 조합'}</strong>
              </CCardHeader>
              <CCardBody>
                {sizeRows.length === 0 || (!withoutColor && colorRows.length === 0) ? (
                  <CAlert color="info" className="mb-0">
                    {withoutColor
                      ? '사이즈를 입력하면 등록할 옵션이 표시됩니다.'
                      : '색상과 사이즈를 입력하면 조합 선택 표가 표시됩니다.'}
                  </CAlert>
                ) : withoutColor ? (
                  <>
                    <CTable responsive bordered hover className="align-middle">
                      <CTableHead className="table-light">
                        <CTableRow>
                          <CTableHeaderCell width="90" className="text-center">등록</CTableHeaderCell>
                          <CTableHeaderCell>사이즈</CTableHeaderCell>
                          <CTableHeaderCell width="70" aria-label="삭제" />
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {sizeRows.map((size) => (
                          <CTableRow key={size.id}>
                            <CTableDataCell className="text-center">
                              <CFormCheck
                                className="d-inline-block"
                                checked={size.usable}
                                onChange={(event) => updateSizeRow(size.id, 'usable', event.target.checked)}
                                aria-label={`${size.label} 등록 여부`}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                size="sm"
                                value={size.label}
                                onChange={(event) => updateSizeRow(size.id, 'label', event.target.value)}
                                aria-label="사이즈 옵션명"
                              />
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CButton
                                color="danger"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSizeRow(size.id)}
                                aria-label={`${size.label} 삭제`}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                    <div
                      className={`text-end ${
                        activeOptionCombinations.length > MAX_OPTION_COMBINATIONS ? 'text-danger' : 'text-muted'
                      }`}
                    >
                      등록 상품 {activeOptionCombinations.length} / {MAX_OPTION_COMBINATIONS}개
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2 text-muted">체크된 조합마다 네이버 상품이 1개씩 등록됩니다.</div>
                    <CTable responsive bordered hover className="align-middle">
                      <CTableHead className="table-light">
                        <CTableRow>
                          <CTableHeaderCell style={{ minWidth: 190 }}>색상</CTableHeaderCell>
                          {activeSizeRows.map((size) => (
                            <CTableHeaderCell key={size.id} className="text-center" style={{ minWidth: 110 }}>
                              <div className="d-flex align-items-center justify-content-center gap-1">
                                <CFormInput
                                  size="sm"
                                  value={size.label}
                                  onChange={(event) => updateSizeRow(size.id, 'label', event.target.value)}
                                  aria-label="사이즈 옵션명"
                                />
                                <CButton
                                  color="danger"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSizeRow(size.id)}
                                  aria-label={`${size.label} 삭제`}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </div>
                            </CTableHeaderCell>
                          ))}
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {colorRows.map((color) => {
                          const allSizesEnabled = activeSizeRows.every(
                            (size) => !disabledCombinationKeys.has(getOptionCombinationKey(color.id, size.id)),
                          )

                          return (
                            <CTableRow key={color.id}>
                              <CTableDataCell>
                                <div className="d-flex align-items-center gap-2">
                                  <CFormCheck
                                    checked={allSizesEnabled}
                                    onChange={(event) => toggleAllSizesForColor(color.id, event.target.checked)}
                                    aria-label={`${color.label} 전체 사이즈 선택`}
                                  />
                                  {color.colorCode && (
                                    <span
                                      aria-hidden="true"
                                      style={{
                                        width: 18,
                                        height: 18,
                                        flex: '0 0 18px',
                                        backgroundColor: color.colorCode,
                                        border: '1px solid #adb5bd',
                                      }}
                                    />
                                  )}
                                  <CFormInput
                                    size="sm"
                                    value={color.label}
                                    onChange={(event) => updateColorRow(color.id, event.target.value)}
                                    aria-label="색상 옵션명"
                                  />
                                  <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeColorRow(color.id)}
                                    aria-label={`${color.label} 삭제`}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </div>
                              </CTableDataCell>
                              {activeSizeRows.map((size) => (
                                <CTableDataCell key={size.id} className="text-center">
                                  <CFormCheck
                                    className="d-inline-block"
                                    checked={!disabledCombinationKeys.has(getOptionCombinationKey(color.id, size.id))}
                                    onChange={() => toggleOptionCombination(color.id, size.id)}
                                    aria-label={`${color.label} ${size.label}`}
                                  />
                                </CTableDataCell>
                              ))}
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                    <div
                      className={`text-end ${
                        activeOptionCombinations.length > MAX_OPTION_COMBINATIONS ? 'text-danger' : 'text-muted'
                      }`}
                    >
                      등록 상품 {activeOptionCombinations.length} / {MAX_OPTION_COMBINATIONS}개
                    </div>
                  </>
                )}
              </CCardBody>
            </CCard>
          </CCardBody>
        </CCard>
      </CForm>

      <CModal visible={showPreview} onClose={() => setShowPreview(false)} size="xl" alignment="center">
        <CModalHeader>
          <CModalTitle>상품 등록 미리보기</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3 mb-4">
            <CCol md={4}>
              <div className="border rounded p-3 h-100">
                <div className="text-muted mb-1">카테고리</div>
                <strong>{selectedCategory?.name || '-'}</strong>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="border rounded p-3 h-100">
                <div className="text-muted mb-1">등록 예정 상품</div>
                <strong>옵션별 상품 {previewProducts.length}개</strong>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="border rounded p-3 h-100">
                <div className="text-muted mb-1">상품 이미지</div>
                <strong>{orderedProductImages.length}개</strong>
              </div>
            </CCol>
          </CRow>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>상품 이미지</strong>
              <span className="text-muted">{orderedProductImages.length}개</span>
            </div>
            {orderedProductImages.length > 0 ? (
              <div className="d-flex flex-wrap align-items-start gap-3">
                {orderedProductImages.map((image, index) => (
                  <div
                    key={image.id}
                    style={{ width: index === 0 ? 180 : 128, flex: index === 0 ? '0 0 180px' : '0 0 128px' }}
                  >
                    <div className="position-relative" style={{ aspectRatio: '1 / 1' }}>
                      <CImage
                        rounded
                        thumbnail
                        src={image.preview}
                        alt={`상품 이미지 ${index + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'contain', backgroundColor: '#fff' }}
                      />
                      <CBadge color={index === 0 ? 'primary' : 'secondary'} className="position-absolute top-0 start-0 m-2">
                        {index === 0 ? '대표' : `이미지 ${index + 1}`}
                      </CBadge>
                    </div>
                    <div className="small text-truncate mt-1" title={image.name}>{image.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <CAlert color="info" className="mb-0">등록된 상품 이미지가 없습니다.</CAlert>
            )}
          </div>

          <CTable responsive hover>
            <CTableHead className="table-light">
              <CTableRow>
                <CTableHeaderCell width="70">번호</CTableHeaderCell>
                <CTableHeaderCell>상품명</CTableHeaderCell>
                <CTableHeaderCell width="140">색상 옵션</CTableHeaderCell>
                <CTableHeaderCell width="140">사이즈 옵션</CTableHeaderCell>
                <CTableHeaderCell width="120">정상가</CTableHeaderCell>
                <CTableHeaderCell width="120">판매가</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {previewProducts.map((product, index) => (
                <CTableRow key={product.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{product.productName}</CTableDataCell>
                  <CTableDataCell>{product.color || '없음'}</CTableDataCell>
                  <CTableDataCell>{product.size}</CTableDataCell>
                  <CTableDataCell>{formatCurrency(product.regularPrice)}</CTableDataCell>
                  <CTableDataCell>{formatCurrency(product.salePrice)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>상품 속성</strong>
              <span className="text-muted">{selectedProductAttributes?.length || 0}개</span>
            </div>
            {selectedProductAttributes?.length > 0 ? (
              <CTable responsive bordered size="sm" className="mb-0 align-middle">
                <CTableHead className="table-light">
                  <CTableRow>
                    <CTableHeaderCell width="35%">속성명</CTableHeaderCell>
                    <CTableHeaderCell>선택값</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {selectedProductAttributes.map((attribute) => {
                    const previewValues = getProductAttributePreviewValues(attribute)
                    return (
                      <CTableRow key={attribute.attributeSeq}>
                        <CTableDataCell className="fw-semibold">{attribute.attributeName}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex flex-wrap gap-1">
                            {previewValues.length > 0
                              ? previewValues.map((value) => (
                                  <CBadge color="info" key={value}>{value}</CBadge>
                                ))
                              : '-'}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            ) : (
              <CAlert color="secondary" className="mb-0">선택된 상품 속성이 없습니다.</CAlert>
            )}
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>태그</strong>
              <span className="text-muted">{tags?.length || 0}개</span>
            </div>
            {tags?.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <CBadge color="secondary" key={`${tag}-${index}`}>{tag}</CBadge>
                ))}
              </div>
            ) : (
              <CAlert color="secondary" className="mb-0">등록된 태그가 없습니다.</CAlert>
            )}
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>상세 설명 이미지</strong>
              <span className="text-muted">{orderedDetailImages.length}개</span>
            </div>
            {orderedDetailImages.length > 0 ? (
              <div className="d-flex flex-column align-items-center gap-3">
                {orderedDetailImages.map((image, index) => (
                  <div key={image.id || index} className="w-100 border rounded p-2">
                    <div className="small text-muted mb-2">
                      {index + 1}. {image.name || `상세 설명 이미지 ${index + 1}`}
                    </div>
                    <CImage
                      src={image.preview}
                      alt={`상세 설명 이미지 ${index + 1}`}
                      className="d-block mx-auto"
                      style={{ width: '100%', maxWidth: 760, height: 'auto' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <CAlert color="secondary" className="mb-0">등록된 상세 설명 이미지가 없습니다.</CAlert>
            )}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPreview(false)}>
            닫기
          </CButton>
          <CButton color="primary" onClick={() => setShowPreview(false)}>
            확인
          </CButton>
        </CModalFooter>
      </CModal>

      {/* 간편옵션 사용 중에는 사이즈 참고 UI를 숨긴다. */}
      {SHOW_SIZE_REFERENCE && (
        <>
          {!showSizeReferencePanel && (
            <CButton
              color="secondary"
              className="position-fixed end-0 top-50 translate-middle-y d-flex flex-column align-items-center gap-2 px-2 py-3"
              style={{ zIndex: 1039, borderRadius: '6px 0 0 6px' }}
              onClick={() => setShowSizeReferencePanel(true)}
              aria-label="사이즈 참고표 열기"
              title="사이즈 참고표 열기"
            >
              <CIcon icon={cilChevronLeft} />
              <span style={{ writingMode: 'vertical-rl' }}>사이즈 참고</span>
            </CButton>
          )}

          <COffcanvas
            placement="end"
            visible={showSizeReferencePanel}
            onHide={() => setShowSizeReferencePanel(false)}
            backdrop={false}
            scroll
            style={{ '--cui-offcanvas-width': 'min(720px, 100vw)', overflow: 'visible' }}
          >
            <CButton
              color="secondary"
              className="position-absolute top-50 translate-middle-y px-2 py-3"
              style={{ left: -41, zIndex: 1, borderRadius: '6px 0 0 6px' }}
              onClick={() => setShowSizeReferencePanel(false)}
              aria-label="사이즈 참고표 접기"
              title="사이즈 참고표 접기"
            >
              <CIcon icon={cilChevronRight} />
            </CButton>
            <COffcanvasHeader className="border-bottom">
              <COffcanvasTitle>사이즈 참고표</COffcanvasTitle>
              <CCloseButton onClick={() => setShowSizeReferencePanel(false)} />
            </COffcanvasHeader>
            <COffcanvasBody>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <CBadge color="secondary">전체 사이즈 타입 {sizeReferenceRows.length}개</CBadge>
                </div>
                <div>
                  <CButton
                    color="secondary"
                    variant="outline"
                    onClick={() => fetchAllSizeValues({ showMessage: true })}
                    disabled={isFetchingSizeTypes}
                  >
                    {isFetchingSizeTypes ? <CSpinner size="sm" className="me-2" /> : null}
                    참고 데이터 새로고침
                  </CButton>
                </div>
              </div>

              {sizeReferenceRows.length === 0 ? (
                <CAlert color="info" className="mb-0">
                  계정 선택 후 네이버 전체 사이즈 참고표가 자동으로 표시됩니다.
                </CAlert>
              ) : (
                <div>
                  <CTable responsive hover className="mb-0 align-middle">
                    <CTableHead className="table-light position-sticky top-0">
                      <CTableRow>
                        <CTableHeaderCell width="240">사이즈 타입</CTableHeaderCell>
                        <CTableHeaderCell width="100">단위</CTableHeaderCell>
                        <CTableHeaderCell width="120">측정 방식</CTableHeaderCell>
                        <CTableHeaderCell>측정 항목</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {sizeReferenceRows.map((item) => (
                        <CTableRow key={item.key}>
                          <CTableDataCell className="fw-semibold">{item.name}</CTableDataCell>
                          <CTableDataCell>{item.unit}</CTableDataCell>
                          <CTableDataCell>{item.measurementType}</CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex flex-wrap gap-1">
                              {item.valueTypes.length > 0
                                ? item.valueTypes.map((valueType) => (
                                    <CBadge color="secondary" key={valueType.id || valueType.name}>
                                      {valueType.name}
                                    </CBadge>
                                  ))
                                : '-'}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </COffcanvasBody>
          </COffcanvas>
        </>
      )}

      <CModal visible={showProgress} backdrop="static" keyboard={false} alignment="center">
        <CModalHeader>
          <CModalTitle>옵션별 상품 등록 진행</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>진행률</strong>
            <span>{registrationProgress.completed} / {registrationProgress.total}개</span>
          </div>
          <CProgress
            value={registrationProgressPercent}
            color={registrationProgress.failed > 0 ? 'warning' : 'primary'}
            className="mb-3"
          />

          <div className="d-flex justify-content-between gap-3 mb-3">
            <span className="text-success">성공 {registrationProgress.success}개</span>
            <span className={registrationProgress.failed > 0 ? 'text-danger' : 'text-muted'}>
              실패 {registrationProgress.failed}개
            </span>
          </div>

          <div className="d-flex align-items-center">
            {isSubmitting && <CSpinner size="sm" className="me-2" />}
            <span>
              {registrationProgress.status === 'preparing' && '등록 데이터를 준비하고 있습니다.'}
              {registrationProgress.status === 'uploading-images' && '상품 이미지와 상세 이미지를 업로드하고 있습니다.'}
              {registrationProgress.status === 'registering' && (
                registrationProgress.currentOptionLabel
                  ? `현재 등록 중: ${registrationProgress.currentOptionLabel}`
                  : '옵션별 상품을 순차 등록하고 있습니다.'
              )}
              {registrationProgress.status === 'completed' && '모든 옵션별 상품 등록이 완료되었습니다.'}
              {registrationProgress.status === 'completed-with-errors' && '등록이 완료되었지만 일부 상품이 실패했습니다.'}
              {registrationProgress.status === 'error' && (registrationProgress.message || '상품 등록에 실패했습니다.')}
            </span>
          </div>
        </CModalBody>
        {!isSubmitting && (
          <CModalFooter>
            <CButton color="primary" onClick={() => setShowProgress(false)}>
              닫기
            </CButton>
          </CModalFooter>
        )}
      </CModal>
    </CContainer>
  )
}

export default SizeRegister
