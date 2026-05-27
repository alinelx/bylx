/* Modal.jsx — cyan-headed pixel modal. No fade, no blur. */

function Modal({ open, onClose, title, children }) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bylx-modal is-open" style={modalStyles.root} aria-hidden="false">
      <div style={modalStyles.backdrop} onClick={onClose}></div>
      <section style={modalStyles.window} role="dialog" aria-modal="true">
        <header style={modalStyles.header}>
          <h2 style={modalStyles.headerH2}>{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={modalStyles.close}
          >×</button>
        </header>
        <div style={modalStyles.body}>{children}</div>
      </section>
    </div>
  );
}

const modalStyles = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 90000,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(9, 5, 27, 0.76)',
  },
  window: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 'min(520px, calc(100vw - 2rem))',
    maxHeight: 'min(680px, calc(100svh - 2rem))',
    overflow: 'auto',
    transform: 'translate(-50%, -50%)',
    color: 'var(--bylx-bg)',
    background: 'var(--bylx-paper)',
    border: '4px solid var(--bylx-cyan)',
    boxShadow: '8px 8px 0 var(--bylx-pink)',
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.55rem 0.7rem',
    background: 'var(--bylx-cyan)',
    borderBottom: '4px solid var(--bylx-bg)',
    color: 'var(--bylx-bg)',
  },
  headerH2: {
    margin: 0,
    fontSize: '1.4rem',
    lineHeight: 1,
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
    fontWeight: 500,
  },
  close: {
    padding: '0.15rem 0.5rem',
    border: '2px solid var(--bylx-bg)',
    background: 'var(--bylx-pink)',
    color: 'var(--bylx-bg)',
    font: 'inherit',
    fontSize: '1.2rem',
    lineHeight: 1,
    cursor: 'pointer',
  },
  body: {
    padding: '1rem',
  },
};

window.BylxModal = Modal;
