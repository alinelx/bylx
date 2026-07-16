/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx mp3 player — image-mapped over the player sprite */

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

/* "tavccitypop-neon-dreams-489483.mp3" → "tavccitypop · neon dreams" */
function trackName(path) {
  const parts = path.split("/").pop().replace(".mp3", "").split("-");
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) parts.pop();
  const artist = parts.shift();
  return parts.length ? `${artist} · ${parts.join(" ")}` : artist;
}

export function initAudio() {
  const player     = document.querySelector(".mp3-player");
  const hotspot    = document.querySelector(".hotspot-mp3");

  if (!player) return;

  const closeBtn   = player.querySelector(".mp3-close");
  const status     = player.querySelector("[data-mp3-status]");
  const nameSpans  = player.querySelectorAll("[data-mp3-name]");
  const indexSpan  = player.querySelector("[data-mp3-index]");
  const volSpan    = player.querySelector("[data-mp3-vol]");
  const stateSpan  = player.querySelector("[data-mp3-state]");
  const playBtn    = player.querySelector(".mp3-play");
  const playLabel  = playBtn?.querySelector(".mp3-hit-label");
  const selectBtn  = player.querySelector(".mp3-select");
  const volUpBtn   = player.querySelector(".mp3-volup");
  const volDownBtn = player.querySelector(".mp3-voldown");

  const audio = new Audio();
  audio.preload = "none";

  let index  = -1;
  let volume = 35;
  let loaded = false;
  audio.volume = volume / 100;

  function setStatus(text) {
    if (!status) return;
    status.textContent = text || "";
    status.hidden = !text;
  }

  function updateLcd() {
    const name = index >= 0 ? trackName(TRACKS[index]) : "None";
    nameSpans.forEach((span) => { span.textContent = name; });

    if (indexSpan) {
      indexSpan.textContent = index >= 0
        ? `${String(index + 1).padStart(2, "0")} / ${String(TRACKS.length).padStart(2, "0")}`
        : `-- / ${String(TRACKS.length).padStart(2, "0")}`;
    }

    if (volSpan)   volSpan.textContent = `VOL ${String(volume).padStart(3, "0")}`;
    if (stateSpan) stateSpan.textContent = audio.paused ? "■" : "▶";
  }

  function loadTrack(i) {
    index  = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    loaded = true;
    audio.src = TRACKS[index];
    setStatus("");
    updateLcd();
  }

  function play() {
    if (index < 0) loadTrack(Math.floor(Math.random() * TRACKS.length));
    if (!audio.src) audio.src = TRACKS[index];
    audio.play().catch(() => setStatus("Audio blocked — click again"));
  }

  function next() { loadTrack(index + 1); play(); }

  function prev() {
    /* A freshly opened player displays track 1 with nothing loaded yet —
       going "back" from there should start track 1, not wrap to the last */
    loaded ? loadTrack(index - 1) : loadTrack(Math.max(index, 0));
    play();
  }

  function openPlayer() {
    player.classList.add("is-on");
    if (index < 0) {
      index = 0;
      updateLcd();
    }
  }

  function closePlayer() {
    player.classList.remove("is-on");
  }

  /* desk hotspot + start menu both open the player */
  if (hotspot) hotspot.addEventListener("click", openPlayer);
  document.addEventListener("bylx:mp3-open", openPlayer);
  if (closeBtn) closeBtn.addEventListener("click", closePlayer);

  /* Esc closes the player like every other panel — but it belongs to whatever
     is stacked on top, so defer to an open modal or the fullscreen monitor */
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!player.classList.contains("is-on")) return;
    if (document.querySelector(".modal.is-open")) return;

    const fsMode = document.querySelector(".fullscreen-mode");
    if (fsMode && !fsMode.hidden) return;

    closePlayer();
  });

  /* dial = play/pause */
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      audio.paused ? play() : audio.pause();
    });
  }

  /* selector strip: single click = next, double click = previous */
  if (selectBtn) {
    let clickTimer = null;

    selectBtn.addEventListener("click", () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        prev();
        return;
      }

      clickTimer = setTimeout(() => {
        clickTimer = null;
        next();
      }, 250);
    });
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(100, v));
    audio.volume = volume / 100;
    updateLcd();
  }

  if (volUpBtn)   volUpBtn.addEventListener("click", () => setVolume(volume + 10));
  if (volDownBtn) volDownBtn.addEventListener("click", () => setVolume(volume - 10));

  audio.addEventListener("play", () => {
    player.classList.add("is-playing");
    if (hotspot) hotspot.classList.add("is-playing");
    if (playBtn) playBtn.setAttribute("aria-label", "Pause");
    if (playLabel) playLabel.textContent = "PAUSE";
    setStatus("");
    updateLcd();
  });

  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    if (hotspot) hotspot.classList.remove("is-playing");
    if (playBtn) playBtn.setAttribute("aria-label", "Play");
    if (playLabel) playLabel.textContent = "PLAY";
    updateLcd();
  });

  audio.addEventListener("ended",   next);
  audio.addEventListener("waiting", () => setStatus("Loading…"));
  audio.addEventListener("playing", () => setStatus(""));
  audio.addEventListener("error",   () => setStatus("Track failed to load"));

  updateLcd();
}
