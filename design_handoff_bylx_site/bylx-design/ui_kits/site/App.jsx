/* App.jsx — orchestrates the bylx.dev kit:
   - Hero diorama with all interactions
   - Gallery modal (image gallery) — opened by instax
   - Contact modal — opened by phone
   - MP3 expanded player — opened by mp3 hotspot
   - Start menu + fullscreen monitor mode
   - Projects section below the hero (real project cards)
*/

const PROJECTS = [
  {
    title: 'dark-28',
    sub: 'Lisbon Tram 28 — dark-tourism web concept',
    desc: 'A heritage web app that turns Lisbon\'s Tram 28 route into an interactive dark-tourism experience.',
    href: 'https://github.com/alinelx/dark-28',
    stack: ['HTML', 'CSS', 'JS', 'UX'],
  },
  {
    title: 'bora viajar',
    sub: 'AI travel planner — portfolio project',
    desc: 'Destination + budget + style → personalized AI itinerary. Built to practice UX thinking and frontend delivery end-to-end.',
    href: 'https://github.com/alinelx/bora-viajar',
    stack: ['React', 'AI', 'UX'],
  },
  {
    title: 'bylx.dev',
    sub: 'This portfolio',
    desc: 'A pixel-art cyber-café diorama as a home page. The site you\'re on.',
    href: 'https://github.com/alinelx/bylx',
    stack: ['HTML', 'CSS', 'JS'],
  },
];

const GALLERY_IMAGES = [
  { src: '../../assets/hero/japan_poster.png',     caption: 'nihon.bmp', tall: true },
  { src: '../../assets/hero/cristo_redentor.png',  caption: 'Cristo Redentor — Rio' },
  { src: '../../assets/hero/torre_belem.png',      caption: 'Torre de Belém — Lisboa' },
  { src: '../../assets/hero/pao_de_acucar.png',    caption: 'Pão de Açúcar — Rio' },
  { src: '../../assets/hero/ponte_25abril.png',    caption: 'Ponte 25 de Abril — Lisboa' },
  { src: '../../assets/particles/sakura1.png',     caption: 'sakura' },
  { src: '../../assets/particles/sakura2.png',     caption: 'sakura' },
  { src: '../../assets/particles/sakura3.png',     caption: 'sakura' },
];

function App() {
  const [galleryOpen, setGalleryOpen]   = React.useState(false);
  const [contactOpen, setContactOpen]   = React.useState(false);
  const [mp3Open,     setMp3Open]       = React.useState(false);
  const [startOpen,   setStartOpen]     = React.useState(false);
  const [fullscreen,  setFullscreen]    = React.useState(false);
  const [hintShown,   setHintShown]     = React.useState(false);
  const [screenOff,   setScreenOff]     = React.useState(false);

  // Esc / F11 to exit fullscreen
  React.useEffect(() => {
    function onKey(e) {
      if (!fullscreen) return;
      if (e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault();
        setFullscreen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // Close start menu on outside click
  React.useEffect(() => {
    if (!startOpen) return;
    function onDown(e) {
      if (!e.target.closest('.bylx-start-menu') && !e.target.closest('.bylx-start-btn')) {
        setStartOpen(false);
      }
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [startOpen]);

  function activateFullscreen() {
    setStartOpen(false);
    setFullscreen(true);
    setHintShown(true);
    // auto-hide hint after a few seconds
    setTimeout(() => setHintShown(false), 4200);
  }

  return (
    <>
      <BylxPixelCursor/>

      <BylxHeroDiorama
        onInstaxClick={() => setGalleryOpen(true)}
        onPhoneClick={() => setContactOpen(true)}
        onMp3Click={() => setMp3Open(true)}
        onStartClick={() => setStartOpen((v) => !v)}
        onMonitorPowerClick={() => setScreenOff((v) => !v)}
        screenOff={screenOff}
      >
        <BylxInfoCard
          eyebrow="FRONT-END DEVELOPER IN PROGRESS"
          headline="Designing playful, useful web experiences"
          body="I'm Aline, a software engineering student building creative front-end projects with HTML, CSS, JavaScript and React."
          cta={{ label: 'VIEW PROJECTS', href: '#projects' }}
        />
      </BylxHeroDiorama>

      {/* Start menu — fixed to viewport so it doesn't depend on artboard transforms */}
      {startOpen && (
        <div className="bylx-start-menu" role="menu">
          <h4>Start</h4>
          <ul>
            <li>
              <button type="button" onClick={activateFullscreen}>
                Fullscreen monitor
                <span className="meta">enter cinema mode</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => { setStartOpen(false); setMp3Open(true); }}>
                Play music
                <span className="meta">opens MP3 player</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => { setStartOpen(false); setScreenOff((v) => !v); }}>
                {screenOff ? 'Turn monitor on' : 'Turn monitor off'}
                <span className="meta">toggles power</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => { setStartOpen(false); setContactOpen(true); }}>
                Send a message
                <span className="meta">contact aline</span>
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Projects section below the hero — real project cards */}
      <section className="bylx-section" id="projects">
        <p className="bylx-eyebrow">Selected work</p>
        <h2>Projects</h2>
        <p>Three things I've shipped (or am shipping). Click a card for the repo.</p>
        <div className="bylx-projects-grid">
          {PROJECTS.map((p) => (
            <a key={p.title} className="bylx-project-card" href={p.href} target="_blank" rel="noreferrer">
              <p className="bylx-project-sub">{p.sub}</p>
              <h3 className="bylx-project-title">{p.title}</h3>
              <p className="bylx-project-desc">{p.desc}</p>
              <ul className="bylx-project-stack">
                {p.stack.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </a>
          ))}
        </div>
      </section>

      {/* Gallery modal — image collection (instax) */}
      <BylxModal open={galleryOpen} onClose={() => setGalleryOpen(false)} title="Gallery">
        <p style={{ margin: '0 0 .8rem', fontSize: '.95rem' }}>
          A scratch pad of pixel-art studies — Rio, Lisboa, Tokyo, and the things in between.
        </p>
        <div className="bylx-gallery-grid">
          {GALLERY_IMAGES.map((g, i) => (
            <figure key={i} className={`bylx-gallery-cell ${g.tall ? 'is-tall' : ''}`}>
              <img src={g.src} alt={g.caption}/>
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </BylxModal>

      {/* Contact modal */}
      <BylxModal open={contactOpen} onClose={() => setContactOpen(false)} title="Contact">
        <BylxContactForm/>
      </BylxModal>

      {/* MP3 expanded player */}
      <BylxMp3Player visible={mp3Open} onClose={() => setMp3Open(false)}/>

      {/* Fullscreen monitor mode */}
      {fullscreen && (
        <div className="bylx-fullscreen-mode" role="dialog" aria-label="Fullscreen monitor">
          <div className="bylx-fullscreen-screen">
            {hintShown && (
              <div className="bylx-fullscreen-hint">
                Press <kbd>F11</kbd> or <kbd>Esc</kbd> to return
              </div>
            )}
          </div>
        </div>
      )}
      {/* Sakura cursor trail + burst on click */}
      <BylxSakuraCursor/>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
