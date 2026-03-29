import { useSelector } from 'react-redux';

export const useCart = () => {
  const { items, wishlist, isLoading, error } = useSelector((state) => state.cart);

  const itemsTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shippingFee = itemsTotal > 999 ? 0 : items.length ? 99 : 0;
  const taxAmount = itemsTotal * 0.12;
  const summary = {
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    itemsTotal,
    shippingFee,
    taxAmount,
    grandTotal: itemsTotal + shippingFee + taxAmount,
  };

  return {
    items,
    wishlist,
    isLoading,
    error,
    summary,
  };
};
