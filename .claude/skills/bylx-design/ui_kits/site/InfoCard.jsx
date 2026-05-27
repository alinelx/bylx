/* InfoCard.jsx — the chunky cyan-bordered hero info card */

function InfoCard({ eyebrow, headline, body, cta, children }) {
  return (
    <section className="bylx-info-card" style={infoCardStyles.panel}>
      {eyebrow && <p className="eyebrow" style={infoCardStyles.eyebrow}>{eyebrow}</p>}
      {headline && <h1 style={infoCardStyles.h1}>{headline}</h1>}
      {body && <p style={infoCardStyles.body}>{body}</p>}
      {cta && (
        <BylxButton variant="primary" as="a" href={cta.href}>{cta.label}</BylxButton>
      )}
      {children}
    </section>
  );
}

const infoCardStyles = {
  panel: {
    position: 'relative',
    width: 'min(30rem, 32vw)',
    padding: '0.7rem 0.85rem 0.95rem',
    color: 'var(--bylx-text)',
    background: 'rgba(9, 5, 27, 0.78)',
    border: '7px solid var(--bylx-cyan)',
    boxShadow: '7px 7px 0 var(--bylx-pink)',
    textShadow: '1px 1px 0 rgba(9, 5, 27, 0.88), 0 0 10px rgba(9, 5, 27, 0.7)',
    animation: 'bylx-copy-panel-breathe 4.8s steps(2, end) infinite',
  },
  eyebrow: {
    margin: '0 0 0.5rem',
    color: 'var(--bylx-cyan)',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '0.7rem',
    lineHeight: 1.55,
    letterSpacing: 0,
    textTransform: 'uppercase',
    WebkitFontSmoothing: 'none',
  },
  h1: {
    maxWidth: '14ch',
    margin: 0,
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
    fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)',
    fontWeight: 500,
    lineHeight: 0.96,
    letterSpacing: 0,
    overflowWrap: 'break-word',
  },
  body: {
    maxWidth: '27rem',
    margin: '0.55rem 0 0.85rem',
    color: 'var(--bylx-text)',
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
    fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
    lineHeight: 1.16,
  },
};

window.BylxInfoCard = InfoCard;
