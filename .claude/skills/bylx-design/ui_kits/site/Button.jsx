/* Button.jsx — Press Start 2P pixel buttons in 4 variants */

function Button({ variant = 'primary', children, onClick, type = 'button', as: As = 'button', href }) {
  const v = buttonStyles[variant] || buttonStyles.primary;
  const props = As === 'a'
    ? { href, onClick }
    : { type, onClick };
  return (
    <As
      className={`bylx-btn bylx-btn-${variant}`}
      {...props}
      style={{ ...buttonStyles.base, ...v }}
    >
      {children}
    </As>
  );
}

const buttonStyles = {
  base: {
    display: 'inline-block',
    padding: '0.55rem 0.75rem',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '0.78rem',
    lineHeight: 1,
    letterSpacing: 0,
    wordSpacing: '0.12rem',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
    WebkitFontSmoothing: 'none',
    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end), filter 80ms steps(2, end)',
  },
  primary: {
    color: 'var(--bylx-cyan)',
    background: 'var(--bylx-pink)',
    border: '2px solid rgba(9, 5, 27, 0.72)',
  },
  secondary: {
    color: 'var(--bylx-bg)',
    background: 'var(--bylx-cyan)',
    border: '2px solid var(--bylx-bg)',
  },
  modal: {
    color: 'var(--bylx-bg)',
    background: 'var(--bylx-pink)',
    border: '3px solid var(--bylx-bg)',
    fontSize: '0.7rem',
  },
  ghost: {
    color: 'var(--bylx-cyan)',
    background: 'transparent',
    border: '3px solid var(--bylx-cyan)',
  },
};

window.BylxButton = Button;
