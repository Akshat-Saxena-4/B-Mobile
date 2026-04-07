/**
 * B-mobile brand mark: smartphone silhouette with monogram for the storefront header.
 */
const BMobileLogo = ({ className = '' }) => (
  <span className={`brand-logo-icon ${className}`.trim()} aria-hidden="true">
    <svg
      className="brand-logo-svg"
      viewBox="0 0 40 52"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
    >
      <defs>
        <linearGradient id="bmobileBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2b6bff" />
          <stop offset="100%" stopColor="#012d7a" />
        </linearGradient>
      </defs>
      <rect x="7" y="2" width="26" height="48" rx="8" fill="url(#bmobileBrandGrad)" />
      <rect x="10" y="6" width="20" height="38" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="15" y="4" width="10" height="3" rx="1.5" fill="rgba(0,0,0,0.2)" />
      <text
        x="20"
        y="33"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
      >
        B
      </text>
      <circle cx="20" cy="44" r="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  </span>
);

export default BMobileLogo;
