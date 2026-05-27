/* ContactForm.jsx — paper inputs, dark stroke, cyan focus ring */

function ContactForm({ onSubmit }) {
  const [state, setState] = React.useState({ name: '', email: '', message: '' });
  const [sent, setSent] = React.useState(false);

  function set(k) { return (e) => setState((s) => ({ ...s, [k]: e.target.value })); }
  function submit(e) {
    e.preventDefault();
    setSent(true);
    onSubmit && onSubmit(state);
  }

  if (sent) {
    return (
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem' }}>Got it — message sent.</p>
        <p style={{ margin: 0, color: '#444' }}>Aline will reply when she's done debugging.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={contactFormStyles.form}>
      <label style={contactFormStyles.label}>
        <span style={contactFormStyles.tag}>NAME</span>
        <input type="text" value={state.name} onChange={set('name')} style={contactFormStyles.input} autoComplete="name"/>
      </label>
      <label style={contactFormStyles.label}>
        <span style={contactFormStyles.tag}>EMAIL</span>
        <input type="email" value={state.email} onChange={set('email')} style={contactFormStyles.input} autoComplete="email"/>
      </label>
      <label style={contactFormStyles.label}>
        <span style={contactFormStyles.tag}>MESSAGE</span>
        <textarea rows="5" value={state.message} onChange={set('message')} style={{ ...contactFormStyles.input, resize: 'vertical' }}/>
      </label>
      <BylxButton variant="modal" type="submit">SEND</BylxButton>
    </form>
  );
}

const contactFormStyles = {
  form: { display: 'grid', gap: '0.8rem' },
  label: { display: 'grid', gap: '0.25rem' },
  tag: {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '0.55rem',
    color: 'var(--bylx-bg)',
    textTransform: 'uppercase',
    WebkitFontSmoothing: 'none',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '3px solid var(--bylx-bg)',
    background: 'var(--bylx-paper)',
    color: 'var(--bylx-bg)',
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
    fontSize: '1rem',
    outline: 'none',
    borderRadius: 0,
  },
};

window.BylxContactForm = ContactForm;
