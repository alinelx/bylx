/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx mp3 player */

const TRACKS = [
  "assets/mp3/9jackjack8-japanese-trap-beat-272645.mp3",
  "assets/mp3/23843807-analog-dreams-synthwave-9497.mp3",
  "assets/mp3/32256300-expectation-420244.mp3",
  "assets/mp3/bfcmusic-lofi-lo-fi-511230.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-1-437929.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-3-437933.mp3",
  "assets/mp3/bounce-bay-records-traditional-japanese-4-437934.mp3",
  "assets/mp3/hitslab-japan-japanese-music-502006.mp3",
  "assets/mp3/itswatr-watr-fluid-10149.mp3",
  "assets/mp3/mondamusic-lofi-lofi-girl-lofi-chill-512853.mp3",
  "assets/mp3/monume-cyberpunk-519219.mp3",
  "assets/mp3/monume-cyberpunk-music-519215.mp3",
  "assets/mp3/sonican-lo-fi-music-loop-sentimental-jazzy-love-473154.mp3",
  "assets/mp3/tavccitypop-labyrinth-of-dreams-442228.mp3",
  "assets/mp3/tavccitypop-neon-dreams-489483.mp3",
  "assets/mp3/tavccitypop-stardust-rhapsody-442232.mp3",
  "assets/mp3/vibehorn-lofi-beat-lo-fi-music-512500.mp3",
];

function initDrag(handle, container) {
  let dragging = false;
  let startX, startY, initLeft, initBottom;

  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging  = true;
    startX    = e.clientX;
    startY    = e.clientY;
    const rect = container.getBoundingClientRect();
    initLeft   = rect.left;
    initBottom = window.innerHeight - rect.bottom;
    // Switch from right/bottom anchors to left/bottom so we can drag
    container.style.right = "auto";
    container.style.top   = "auto";
    container.style.left  = `${initLeft}px`;
    container.style.bottom = `${initBottom}px`;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx      = e.clientX - startX;
    const dy      = e.clientY - startY;
    const newLeft = Math.max(0, Math.min(window.innerWidth  - container.offsetWidth,  initLeft   + dx));
    const newBot  = Math.max(0, Math.min(window.innerHeight - container.offsetHeight, initBottom - dy));
    container.style.left   = `${newLeft}px`;
    container.style.bottom = `${newBot}px`;
  });

  handle.addEventListener("pointerup",     () => { dragging = false; });
  handle.addEventListener("pointercancel", () => { dragging = false; });
}

export function initAudio() {
  const audio         = new Audio();
  const mp3Hotspot    = document.querySelector(".hotspot-mp3");
  const mp3Controls   = document.querySelector(".mp3-controls");
  const trackTitle    = document.querySelector("[data-track-title]");
  const marqueeWindow = document.querySelector(".mp3-marquee-window");
  const dragHandle    = document.querySelector("[data-mp3-drag]");

  audio.volume = 0.35;
  let currentIndex = -1;

  if (dragHandle && mp3Controls) initDrag(dragHandle, mp3Controls);

  function getTrackName(path) {
    return path.split("/").pop().replace(".mp3", "").replaceAll("-", " ");
  }

  let marqueeRaf = null;
  function updateMarquee() {
    if (!marqueeWindow || !trackTitle) return;
    marqueeWindow.classList.remove("is-scrolling");
    marqueeWindow.style.removeProperty("--mq-shift");
    const overflow = trackTitle.scrollWidth - marqueeWindow.clientWidth;
    if (overflow > 4) {
      marqueeWindow.style.setProperty("--mq-shift", `${overflow + 8}px`);
      marqueeWindow.classList.add("is-scrolling");
    }
  }

  function setTrackTitle(path) {
    if (!trackTitle) return;
    trackTitle.textContent = path ? getTrackName(path) : "None";
    requestAnimationFrame(updateMarquee);
  }

  function playTrack(index) {
    if (!TRACKS.length) return;
    currentIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
    const track  = TRACKS[currentIndex];
    audio.src    = track;
    audio.play().catch(() => {});
    setTrackTitle(track);
    if (mp3Controls) mp3Controls.classList.add("is-visible");
  }

  function playRandomTrack() {
    if (!TRACKS.length) return;
    let next = Math.floor(Math.random() * TRACKS.length);
    if (TRACKS.length > 1 && next === currentIndex) next = (next + 1) % TRACKS.length;
    playTrack(next);
  }

  function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    if (mp3Controls) mp3Controls.classList.remove("is-visible");
  }

  if (mp3Hotspot) {
    mp3Hotspot.addEventListener("click", () => {
      if (!audio.paused)  audio.pause();
      else if (audio.src) audio.play().catch(() => {});
      else                playRandomTrack();
    });
  }

  const playBtn  = document.querySelector('[data-audio-action="play"]');
  const pauseBtn = document.querySelector('[data-audio-action="pause"]');

  function setButtonState(playing) {
    if (mp3Hotspot) mp3Hotspot.classList.toggle("is-playing", playing);
    if (playBtn)  playBtn.classList.toggle("is-active",  !playing);
    if (pauseBtn) pauseBtn.classList.toggle("is-active",  playing);
  }

  audio.addEventListener("play",  () => setButtonState(true));
  audio.addEventListener("pause", () => setButtonState(false));
  audio.addEventListener("ended", playRandomTrack);

  document.querySelectorAll("[data-audio-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.audioAction;
      if      (action === "play")        { audio.src ? audio.play().catch(() => {}) : playRandomTrack(); }
      else if (action === "pause")       { audio.pause(); }
      else if (action === "stop")        { stopAudio(); }
      else if (action === "next")        { playTrack(currentIndex + 1); }
      else if (action === "prev")        { playTrack(currentIndex - 1); }
      else if (action === "volume-down") { audio.volume = Math.max(0, audio.volume - 0.1); }
      else if (action === "volume-up")   { audio.volume = Math.min(1, audio.volume + 0.1); }
    });
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateMarquee, 120);
  });
}
