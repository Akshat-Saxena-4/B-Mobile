const STATUS_SUMMARY_MAP = {
  PLACED: { label: 'Pending', tone: 'pending' },
  CONFIRMED: { label: 'Pending', tone: 'pending' },
  PACKED: { label: 'Ongoing', tone: 'ongoing' },
  SHIPPED: { label: 'Ongoing', tone: 'ongoing' },
  OUT_FOR_DELIVERY: { label: 'Ongoing', tone: 'ongoing' },
  DELIVERED: { label: 'Completed', tone: 'completed' },
  CANCELLED: { label: 'Cancelled', tone: 'cancelled' },
};

export const formatOrderStatusLabel = (status = '') =>
  status
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getOrderStatusPresentation = (status) => {
  if (STATUS_SUMMARY_MAP[status]) {
    return STATUS_SUMMARY_MAP[status];
  }

  return {
    label: formatOrderStatusLabel(status) || 'Pending',
    tone: 'pending',
  };
};
