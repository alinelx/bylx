/* SakuraCursor.jsx — pixel sakura petals as a cursor trail.
   Single petal drops every ~70ms while moving; a burst of 10 fires on every mousedown.
   Particles auto-clean from state when their CSS animation completes. */

const SAKURA_TRAIL_INTERVAL = 70;  // ms between trail particles
const SAKURA_BURST_COUNT    = 12;
const SAKURA_MAX            = 90;  // hard cap to keep the DOM tame

function SakuraCursor() {
  const [particles, setParticles] = React.useState([]);
  const idRef = React.useRef(0);
  const lastTrailRef = React.useRef(0);

  React.useEffect(() => {
    function add(items) {
      setParticles((prev) => {
        const merged = prev.concat(items);
        // Drop oldest if we go over the cap
        return merged.length > SAKURA_MAX ? merged.slice(merged.length - SAKURA_MAX) : merged;
      });
      // Schedule removal once each animation ends
      items.forEach((it) => {
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== it.id));
        }, it.duration + 80);
      });
    }

    function spawn(x, y, count, kind) {
      const items = [];
      for (let i = 0; i < count; i++) {
        const id = ++idRef.current;
        const variant = ((id - 1) % 4) + 1;

        let angle, power;
        if (kind === 'burst') {
          // Radial out from the click point, with a touch of jitter.
          angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
          power = 70 + Math.random() * 70;
        } else {
          // Trail: small drift mostly downward.
          angle = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
          power = 10 + Math.random() * 20;
        }
        const gravity = kind === 'burst' ? 50 : 90;
        const dx = Math.cos(angle) * power;
        const dy = Math.sin(angle) * power + gravity;

        items.push({
          id,
          x, y,
          dx, dy,
          size: 14 + Math.random() * (kind === 'burst' ? 16 : 10),
          spin: -240 + Math.random() * 480,
          variant,
          duration: kind === 'burst'
            ? 1200 + Math.random() * 700
            : 1500 + Math.random() * 800,
        });
      }
      add(items);
    }

    function onMove(e) {
      const now = performance.now();
      if (now - lastTrailRef.current < SAKURA_TRAIL_INTERVAL) return;
      lastTrailRef.current = now;
      spawn(e.clientX, e.clientY, 1, 'trail');
    }

    function onDown(e) {
      // Ignore right-click and modifier clicks
      if (e.button !== 0) return;
      spawn(e.clientX, e.clientY, SAKURA_BURST_COUNT, 'burst');
    }

    function onTouch(e) {
      const t = e.touches[0];
      if (t) spawn(t.clientX, t.clientY, SAKURA_BURST_COUNT, 'burst');
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);

  return (
    <div className="bylx-sakura-cursor" aria-hidden="true">
      {particles.map((p) => (
        <img
          key={p.id}
          src={`../../assets/particles/sakura${p.variant}.png`}
          className="bylx-sakura-bit"
          alt=""
          style={{
            left: `${p.x}px`,
            top:  `${p.y}px`,
            width: `${p.size}px`,
            '--dx':   `${p.dx}px`,
            '--dy':   `${p.dy}px`,
            '--spin': `${p.spin}deg`,
            animationDuration: `${p.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

window.BylxSakuraCursor = SakuraCursor;
