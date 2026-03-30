import {
  formatOrderStatusLabel,
  getOrderStatusPresentation,
} from '../../utils/orderStatus.js';

const OrderStatusBadge = ({ status, showDetail = true }) => {
  const { label, tone } = getOrderStatusPresentation(status);
  const detail = formatOrderStatusLabel(status);
  const shouldShowDetail = showDetail && detail && detail !== label;

  return (
    <div className="order-status-stack">
      <span className={`status-pill status-pill-${tone}`}>{label}</span>
      {shouldShowDetail ? <span className="status-detail">{detail}</span> : null}
    </div>
  );
};

export default OrderStatusBadge;
