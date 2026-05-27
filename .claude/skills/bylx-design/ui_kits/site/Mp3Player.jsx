/* Mp3Player.jsx — expanded image-mapped MP3 player, plays real audio.

   When activated:
   - Slides into the bottom-right corner, scales up ~2x
   - LCD area shows the current track name with a marquee scroll
   - Left circular dial = play / pause
   - Selector on top = next track
   - Two buttons below = vol- / vol+
   - Click X to close

   Audio is streamed from raw.githubusercontent.com (CORS-friendly).
*/

const MP3_TRACKS = [
  { name: 'tavccitypop · neon dreams',     file: 'tavccitypop-neon-dreams-489483.mp3' },
  { name: '23843807 · analog dreams',      file: '23843807-analog-dreams-synthwave-9497.mp3' },
  { name: 'monume · cyberpunk',            file: 'monume-cyberpunk-519219.mp3' },
  { name: 'mondamusic · lo-fi girl chill', file: 'mondamusic-lofi-lofi-girl-lofi-chill-512853.mp3' },
  { name: '9jackjack8 · japanese trap',    file: '9jackjack8-japanese-trap-beat-272645.mp3' },
  { name: 'sonican · sentimental jazz',    file: 'sonican-lo-fi-music-loop-sentimental-jazzy-love-473154.mp3' },
  { name: 'tavccitypop · stardust rhapsody', file: 'tavccitypop-stardust-rhapsody-442232.mp3' },
  { name: 'vibehorn · lofi beat',          file: 'vibehorn-lofi-beat-lo-fi-music-512500.mp3' },
];
const TRACK_URL = (file) => `https://raw.githubusercontent.com/alinelx/bylx/main/assets/mp3/${file}`;

function Mp3Player({ visible, onClose }) {
  const audioRef = React.useRef(null);
  const [trackIdx, setTrackIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [vol, setVol] = React.useState(35);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const track = MP3_TRACKS[trackIdx];

  // Load the track when index changes
  React.useEffect(() => {
    if (!visible) return;
    const audio = audioRef.current;
    if (!audio) return;
    setLoading(true);
    setError(null);
    audio.src = TRACK_URL(track.file);
    audio.volume = vol / 100;
    if (playing) {
      audio.play().catch((e) => setError('Press play to start'));
    }
    // eslint-disable-next-line
  }, [trackIdx, visible]);

  // Volume
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol / 100;
  }, [vol]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch((err) => setError('Audio blocked — click again'));
    }
  }
  function next() {
    setTrackIdx((i) => (i + 1) % MP3_TRACKS.length);
    setPlaying(true);
  }
  function prev() {
    setTrackIdx((i) => (i - 1 + MP3_TRACKS.length) % MP3_TRACKS.length);
    setPlaying(true);
  }
  function volUp()   { setVol((v) => Math.min(100, v + 10)); }
  function volDown() { setVol((v) => Math.max(0,   v - 10)); }

  return (
    <aside className={`bylx-mp3 ${visible ? 'is-on' : ''}`} aria-label="Music player" aria-hidden={!visible}>
      <button
        type="button"
        className="bylx-mp3-close"
        aria-label="Close music player"
        onClick={onClose}
      >×</button>

      {/* Status / errors — ABOVE the player frame */}
      {error && <p className="bylx-mp3-status">{error}</p>}
      {loading && !error && <p className="bylx-mp3-status">Loading from github…</p>}

      <div className="bylx-mp3-frame">
        <img className="bylx-mp3-img" src="../../assets/hero/mp3_player.png" alt=""/>

        {/* LCD display overlay */}
        <div className="bylx-mp3-lcd" aria-live="polite">
          <div className="bylx-mp3-lcd-marquee">
            <span>{track.name}</span>
            <span>{track.name}</span>
          </div>
          <div className="bylx-mp3-lcd-meta">
            <span>{String(trackIdx + 1).padStart(2, '0')} / {String(MP3_TRACKS.length).padStart(2, '0')}</span>
            <span>VOL {String(vol).padStart(3, '0')}</span>
            <span>{playing ? '▶' : '■'}</span>
          </div>
        </div>

        {/* IMAGE-MAP CONTROLS — absolutely positioned over the player art */}

        {/* Left circular dial = play/pause */}
        <button
          type="button"
          className="bylx-mp3-hit bylx-mp3-play"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={togglePlay}
        >
          <span className="bylx-mp3-hit-label">{playing ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* Selector on top = single click next, double click previous */}
        <button
          type="button"
          className="bylx-mp3-hit bylx-mp3-select"
          aria-label="Next (double-click for previous)"
          onClick={next}
          onDoubleClick={prev}
        >
          <span className="bylx-mp3-hit-label">CLICK NEXT · DBLCLICK PREV</span>
        </button>

        {/* Vol down (bottom-left of right column) */}
        <button
          type="button"
          className="bylx-mp3-hit bylx-mp3-voldown"
          aria-label="Volume down"
          onClick={volDown}
        >
          <span className="bylx-mp3-hit-label">VOL −</span>
        </button>

        {/* Vol up (bottom-right of right column) */}
        <button
          type="button"
          className="bylx-mp3-hit bylx-mp3-volup"
          aria-label="Volume up"
          onClick={volUp}
        >
          <span className="bylx-mp3-hit-label">VOL +</span>
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => { setPlaying(true); setLoading(false); }}
        onPause={() => setPlaying(false)}
        onEnded={next}
        onCanPlay={() => setLoading(false)}
        onError={() => { setLoading(false); setError('Track failed to load'); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
      />
    </aside>
  );
}

window.BylxMp3Player = Mp3Player;
