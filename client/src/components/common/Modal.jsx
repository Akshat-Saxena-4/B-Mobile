const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Editor</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

