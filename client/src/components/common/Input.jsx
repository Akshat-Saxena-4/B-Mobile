const Input = ({
  label,
  error,
  as = 'input',
  options = [],
  className = '',
  ...props
}) => {
  const Component = as;

  return (
    <label className={`field ${className}`.trim()}>
      {label ? <span className="field-label">{label}</span> : null}
      {as === 'select' ? (
        <select className="field-input" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Component className="field-input" {...props} />
      )}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
};

export default Input;

