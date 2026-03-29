const Loader = ({ fullscreen = false, label = 'Loading' }) => (
  <div className={`loader-wrap ${fullscreen ? 'loader-wrap-fullscreen' : ''}`.trim()}>
    <span className="loader-ring" />
    <p className="muted-text">{label}</p>
  </div>
);

export default Loader;

