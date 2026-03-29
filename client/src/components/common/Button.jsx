const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  ...props
}) => (
  <button
    type={type}
    className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-block' : ''} ${className}`.trim()}
    {...props}
  >
    {children}
  </button>
);

export default Button;

