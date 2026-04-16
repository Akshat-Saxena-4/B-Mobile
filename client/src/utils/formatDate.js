const FALLBACK = '--';

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return FALLBACK;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    ...options,
  }).format(date);
};

export const formatDateTime = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return FALLBACK;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
};

export const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);

  if (startLabel === FALLBACK && endLabel === FALLBACK) {
    return FALLBACK;
  }

  return `${startLabel} - ${endLabel}`;
};

