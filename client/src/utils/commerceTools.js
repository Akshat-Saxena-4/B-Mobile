export const calculateEmi = ({
  principal = 0,
  months = 12,
  annualRate = 14,
  downPayment = 0,
}) => {
  const financedAmount = Math.max(Number(principal) - Number(downPayment), 0);
  const tenure = Math.max(Number(months) || 1, 1);
  const monthlyRate = Math.max(Number(annualRate), 0) / 1200;

  if (!financedAmount) {
    return {
      financedAmount: 0,
      monthlyInstallment: 0,
      interestPaid: 0,
      totalPayable: 0,
    };
  }

  if (!monthlyRate) {
    const monthlyInstallment = financedAmount / tenure;
    return {
      financedAmount,
      monthlyInstallment,
      interestPaid: 0,
      totalPayable: financedAmount,
    };
  }

  const factor = (1 + monthlyRate) ** tenure;
  const monthlyInstallment = (financedAmount * monthlyRate * factor) / (factor - 1);
  const totalPayable = monthlyInstallment * tenure;

  return {
    financedAmount,
    monthlyInstallment,
    interestPaid: totalPayable - financedAmount,
    totalPayable,
  };
};

export const estimateTradeIn = ({
  productPrice = 0,
  deviceAge = '1',
  condition = 'good',
  category = 'Smartphones',
}) => {
  const ageMultipliers = {
    '0': 0.72,
    '1': 0.58,
    '2': 0.46,
    '3': 0.34,
    '4': 0.24,
  };
  const conditionMultipliers = {
    excellent: 1,
    good: 0.88,
    fair: 0.72,
    rough: 0.54,
  };
  const categoryCaps = {
    Smartphones: 0.78,
    Tablets: 0.7,
    Laptops: 0.74,
  };

  const baseValue = Number(productPrice) * (ageMultipliers[deviceAge] || 0.34);
  const value = baseValue * (conditionMultipliers[condition] || 0.8);
  const capped = Math.min(value, Number(productPrice) * (categoryCaps[category] || 0.7));

  return Math.max(Math.round(capped), 0);
};

export const estimateDeliveryWindow = (postalCode = '') => {
  const clean = String(postalCode).replace(/\D/g, '').slice(0, 6);
  const firstDigit = clean[0];

  if (!clean) {
    return {
      label: 'Enter a PIN code to estimate delivery',
      etaDays: null,
      serviceLevel: 'pending',
    };
  }

  const map = {
    '1': { etaDays: '1-2', label: 'Express metro delivery available', serviceLevel: 'fast' },
    '2': { etaDays: '2-3', label: 'Fast courier lane active', serviceLevel: 'fast' },
    '3': { etaDays: '2-4', label: 'Standard priority dispatch', serviceLevel: 'normal' },
    '4': { etaDays: '3-5', label: 'Regional delivery with insured transit', serviceLevel: 'normal' },
    '5': { etaDays: '3-5', label: 'Regional delivery with setup-ready packaging', serviceLevel: 'normal' },
    '6': { etaDays: '4-6', label: 'Long-route delivery with status alerts', serviceLevel: 'extended' },
    '7': { etaDays: '4-6', label: 'Long-route delivery with status alerts', serviceLevel: 'extended' },
    '8': { etaDays: '5-7', label: 'Extended route, protected packaging included', serviceLevel: 'extended' },
    '9': { etaDays: '5-7', label: 'Extended route, protected packaging included', serviceLevel: 'extended' },
  };

  return map[firstDigit] || {
    etaDays: '3-5',
    label: 'Standard protected delivery available',
    serviceLevel: 'normal',
  };
};

export const getSpecValue = (product, label) =>
  product?.specifications?.find((spec) => spec.label === label)?.value || 'Not listed';
