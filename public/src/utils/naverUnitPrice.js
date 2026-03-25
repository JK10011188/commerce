export const UNIT_PRICE_INDICATION_UNITS = [
  'g',
  'kg',
  'ml',
  'L',
  'cm',
  'm',
  '개',
  '개입',
  '매',
  '매입',
  '정',
  '캡슐',
  '구미',
  '포',
  '구',
];

export const createDefaultUnitCapacityInfo = () => ({
  unitPriceYn: false,
  totalCapacityValue: '',
  unitCapacity: '',
  indicationUnit: '',
});

export const normalizeUnitCapacityInfo = (info) => ({
  ...createDefaultUnitCapacityInfo(),
  ...(info || {}),
  unitPriceYn: info?.unitPriceYn === true,
  totalCapacityValue: info?.totalCapacityValue ?? '',
  unitCapacity: info?.unitCapacity ?? '',
  indicationUnit: info?.indicationUnit ?? '',
});

export const sanitizeUnitCapacityValue = (value) =>
  String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 3);

export const sanitizeTotalCapacityValue = (value) => {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '');
  if (!cleaned) {
    return '';
  }

  const [integerPart = '', ...decimalParts] = cleaned.split('.');
  if (decimalParts.length === 0) {
    return integerPart;
  }

  const normalizedIntegerPart = integerPart || '0';
  const decimalPart = decimalParts.join('').slice(0, 3);

  if (cleaned.endsWith('.') && decimalPart === '') {
    return `${normalizedIntegerPart}.`;
  }

  return decimalPart ? `${normalizedIntegerPart}.${decimalPart}` : normalizedIntegerPart;
};

export const formatTotalCapacityValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return numericValue.toFixed(3).replace(/\.?0+$/, '');
};

export const extractPackageCount = (product) => {
  const candidates = [
    product?.name,
    ...(product?.options || []).flatMap((option) => [
      option?.name,
      ...(option?.values || []).map((value) => value?.value),
    ]),
  ].filter(Boolean);

  for (const text of candidates) {
    const matchedCount = text.match(/(\d+)\s*개(?:입)?/);
    if (matchedCount) {
      const count = Number(matchedCount[1]);
      if (Number.isInteger(count) && count > 0) {
        return count;
      }
    }
  }

  return 1;
};
