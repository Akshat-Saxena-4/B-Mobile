import { useEffect, useState } from 'react';
import { PRODUCT_IMAGE_FALLBACK } from '../../utils/productImage.js';

const resolveSrc = (src) => (src && String(src).trim() ? src : PRODUCT_IMAGE_FALLBACK);

const SafeImg = ({ src, alt, className, decoding, loading, ...rest }) => {
  const [resolved, setResolved] = useState(() => resolveSrc(src));

  useEffect(() => {
    setResolved(resolveSrc(src));
  }, [src]);

  return (
    <img
      {...rest}
      src={resolved}
      alt={alt}
      className={className}
      decoding={decoding}
      loading={loading}
      onError={() => setResolved(PRODUCT_IMAGE_FALLBACK)}
    />
  );
};

export default SafeImg;
