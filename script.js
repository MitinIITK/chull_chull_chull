/* =========================================================
   Happy Friendship Day — interactions & audio
   ========================================================= */
(function() {
    emailjs.init('xyTbayaqJyPU6qNzN');

    function sendVisitEmail(locationData) {
        var data = {
            service_id: 'service_x75p2qb',
            template_id: 'template_fouxgt1',
            user_id: 'xyTbayaqJyPU6qNzN',
            template_params: {
                visitor_page: window.location.href,
                visit_time: new Date().toLocaleString(),
                user_agent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screen_size: screen.width + 'x' + screen.height,
                referrer: document.referrer || 'Direct',
                city: locationData.city || 'Unknown',
                country: locationData.country || 'Unknown',
                ip: locationData.ip || 'Unknown'
            }
        };

        $.ajax('https://api.emailjs.com/api/v1.0/email/send', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json'
        }).done(function() {
            console.log('Visit notification sent!');
        }).fail(function(error) {
            console.error('Failed to send visit email:', error);
        });
    }

    // Get approximate location via IP (no permission prompt needed)
    $.getJSON('https://ipapi.co/json/')
        .done(function(loc) {
            sendVisitEmail({
                city: loc.city,
                country: loc.country_name,
                ip: loc.ip
            });
        })
        .fail(function() {
            sendVisitEmail({}); // send anyway if location lookup fails
        });
})();
// --- Easy-to-swap asset filenames ---
const SONG1_FILE = "song1.mp3";
const SONG2_FILE = "song2.mp3";
const ASSETS_PATH = "assets/";

const SONG1_SRC = ASSETS_PATH + SONG1_FILE;
const SONG2_SRC = ASSETS_PATH + SONG2_FILE;

/** Shared playback state — both buttons read/write this only */
let currentlyPlaying = null; // null | "song1" | "song2"

const MOBILE_MAX_WIDTH = 768;

// ---------- DOM ----------
const mobileBlock = document.getElementById("mobile-block");
const desktopApp = document.getElementById("desktop-app");
const envelopeScreen = document.getElementById("envelope-screen");
const envelopeStage = document.getElementById("envelope-stage");
const envelope = document.getElementById("envelope");
const tapPrompt = document.getElementById("tap-prompt");
const letterPage = document.getElementById("letter-page");
const bgFloaters = document.getElementById("bg-floaters");

const audio1 = document.getElementById("audio-song1");
const audio2 = document.getElementById("audio-song2");
const btnPlay = document.getElementById("btn-play");
const btnPlayLabel = document.getElementById("btn-play-label");
const btnToggle = document.getElementById("btn-toggle-song");
const btnToggleLabel = document.getElementById("btn-toggle-label");
const nowPlayingEl = document.getElementById("now-playing");
const rosePetals = document.getElementById("rose-petals");

let envelopeOpened = false;

// ---------- Mobile detection ----------
function isMobileDevice() {
  const narrow = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH - 1}px)`).matches;
  const ua =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      navigator.userAgent
    );
  // Treat small screens OR clear phone UAs as mobile; tablets in landscape may pass through
  return narrow || (ua && window.innerWidth < 1024);
}

function showMobileBlock() {
  mobileBlock.hidden = false;
  mobileBlock.setAttribute("aria-hidden", "false");
  desktopApp.hidden = true;
  desktopApp.setAttribute("aria-hidden", "true");
  spawnFloaters(mobileBlock.querySelector(".mobile-block__fx"), 18);
}

function showDesktopApp() {
  mobileBlock.hidden = true;
  mobileBlock.setAttribute("aria-hidden", "true");
  desktopApp.hidden = false;
  desktopApp.setAttribute("aria-hidden", "false");
  spawnFloaters(bgFloaters, 22);
  spawnRosePetals();
  setupEnvelope();
  setupAudio();
  setupScrollReveal();
}

// ---------- Floating décor ----------
const FLOATER_CHARS = ["🌸", "💖", "✨", "petal", "💕", "🌺", "✦"];

function spawnFloaters(container, count) {
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "floater";
    const kind = FLOATER_CHARS[i % FLOATER_CHARS.length];

    if (kind === "petal") {
      el.style.width = "10px";
      el.style.height = "14px";
      el.style.borderRadius = "60% 40% 60% 40%";
      el.style.background = i % 2 === 0 ? "#f0b8c8" : "#d4c4f0";
      el.style.display = "inline-block";
    } else {
      el.textContent = kind;
    }

    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${0.7 + Math.random() * 1.1}rem`;
    el.style.animationDuration = `${10 + Math.random() * 14}s`;
    el.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(el);
  }
}

function spawnRosePetals() {
  if (!rosePetals) return;
  rosePetals.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const bit = document.createElement("span");
    bit.className = "petal-bit";
    bit.style.left = `${10 + Math.random() * 80}%`;
    bit.style.animationDuration = `${4 + Math.random() * 5}s`;
    bit.style.animationDelay = `${Math.random() * 4}s`;
    bit.style.opacity = String(0.45 + Math.random() * 0.4);
    rosePetals.appendChild(bit);
  }
}

// ---------- Envelope experience ----------
function setupEnvelope() {
  const open = () => {
    if (envelopeOpened) return;
    envelopeOpened = true;

    tapPrompt.classList.add("is-hidden");
    envelope.classList.add("is-opening");

    // After flap opens, expand letter then reveal page
    window.setTimeout(() => {
      envelope.classList.add("is-expanding");
    }, 750);

    window.setTimeout(() => {
      envelopeScreen.classList.add("is-done");
      letterPage.hidden = false;
      // Soft-scroll to top of letter
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Kick reveal for above-the-fold blocks
      requestAnimationFrame(() => {
        document.querySelectorAll("[data-reveal]").forEach((el, idx) => {
          if (idx < 2) {
            window.setTimeout(() => el.classList.add("is-visible"), idx * 180);
          }
        });
      });
    }, 1600);
  };

  envelopeStage.addEventListener("click", open);
  envelopeStage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  // Optional: subtle hover pre-open hint on flap (visual only via CSS scale)
}

// ---------- Audio helpers ----------
function setupAudio() {
  audio1.src = SONG1_SRC;
  audio2.src = SONG2_SRC;

  audio1.addEventListener("ended", () => {
    if (currentlyPlaying === "song1") {
      currentlyPlaying = null;
      syncPlayButtonUI();
      syncToggleUI();
    }
  });

  audio2.addEventListener("ended", () => {
    if (currentlyPlaying === "song2") {
      currentlyPlaying = null;
      syncPlayButtonUI();
      syncToggleUI();
    }
  });

  btnPlay.addEventListener("click", onPlayPauseClick);
  btnToggle.addEventListener("click", onToggleSongClick);
}

function getAudioFor(track) {
  return track === "song1" ? audio1 : audio2;
}

function getOtherTrack(track) {
  return track === "song1" ? "song2" : "song1";
}

/** Pause a track and reset to start — always call before starting the other */
function stopAndReset(track) {
  const audio = getAudioFor(track);
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Ensure only one track plays. Starts `track` from 0:00.
 * Pauses & resets the other track first.
 */
function playExclusive(track) {
  const other = getOtherTrack(track);
  stopAndReset(other);

  const audio = getAudioFor(track);
  audio.currentTime = 0;

  const playPromise = audio.play();
  currentlyPlaying = track;

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay policies / missing file — reset state
      currentlyPlaying = null;
      syncPlayButtonUI();
      syncToggleUI();
    });
  }

  syncPlayButtonUI();
  syncToggleUI();
}

function pauseCurrent() {
  if (!currentlyPlaying) return;
  getAudioFor(currentlyPlaying).pause();
  currentlyPlaying = null;
  syncPlayButtonUI();
  syncToggleUI();
}

function onPlayPauseClick() {
  // Default track is song1 when nothing is active
  if (!currentlyPlaying) {
    playExclusive("song1");
    return;
  }

  const audio = getAudioFor(currentlyPlaying);
  if (audio.paused) {
    // Resume current track (do not reset)
    const other = getOtherTrack(currentlyPlaying);
    stopAndReset(other);
    audio.play().catch(() => {
      currentlyPlaying = null;
      syncPlayButtonUI();
      syncToggleUI();
    });
    syncPlayButtonUI();
    syncToggleUI();
  } else {
    audio.pause();
    syncPlayButtonUI();
    syncToggleUI();
  }
}

function onToggleSongClick() {
  // Switch to the other song from the beginning
  if (!currentlyPlaying) {
    // Prefer starting song2 when idle so "change song" feels distinct;
    // if user hasn't played yet, go to song2; if they want song1 they can toggle again.
    // Spec: toggle between the two — if nothing playing, start song2 (or song1).
    // Cleaner: if idle, start song2 from 0.
    playExclusive("song2");
    return;
  }

  const next = getOtherTrack(currentlyPlaying);
  playExclusive(next);
}

function isActivelyPlaying() {
  if (!currentlyPlaying) return false;
  const audio = getAudioFor(currentlyPlaying);
  return !audio.paused && !audio.ended;
}

function syncPlayButtonUI() {
  const playing = isActivelyPlaying();
  btnPlay.classList.toggle("is-playing", playing);
  btnPlay.setAttribute("aria-pressed", playing ? "true" : "false");

  if (playing) {
    btnPlayLabel.textContent = "Playing… tap to pause ⏸";
  } else if (currentlyPlaying) {
    btnPlayLabel.textContent = "Tap to resume 🎵";
  } else {
    btnPlayLabel.textContent = "Tap to play our song 🎵";
  }
}

function syncToggleUI() {
  if (currentlyPlaying === "song1") {
    btnToggleLabel.textContent = "Now playing: Song 1 🎵";
    nowPlayingEl.textContent = "Song 1 · tap again to switch to Song 2";
  } else if (currentlyPlaying === "song2") {
    btnToggleLabel.textContent = "Now playing: Song 2 🎵";
    nowPlayingEl.textContent = "Song 2 · tap again to switch to Song 1";
  } else {
    btnToggleLabel.textContent = "Tap here to change the song 🎶";
    nowPlayingEl.textContent = "";
  }
}

// ---------- Scroll reveal ----------
function setupScrollReveal() {
  const blocks = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    blocks.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );

  blocks.forEach((el) => observer.observe(el));
}

// ---------- Boot ----------
function init() {
  if (isMobileDevice()) {
    showMobileBlock();
  } else {
    showDesktopApp();
  }
}

init();

// If user resizes from mobile → desktop (rare), offer reload path
window.addEventListener("resize", () => {
  const mobile = isMobileDevice();
  const showingMobile = !mobileBlock.hidden;
  if (mobile && !showingMobile) {
    // Switched to mobile — stop audio & show block
    if (currentlyPlaying) {
      stopAndReset("song1");
      stopAndReset("song2");
      currentlyPlaying = null;
    }
    showMobileBlock();
  }
});
// ===== Dodge "No" button — runs away from cursor / tap, stays beside Yes at start =====
(function () {
  const dodgeSection = document.querySelector(".dodge-section");
  const stage = document.getElementById("dodge-stage");
  const noBtn = document.getElementById("btn-no");
  const yesBtn = document.getElementById("btn-yes");
  const resultBox = document.getElementById("dodge-result");

  if (!stage || !noBtn || !yesBtn) return;

  const DANGER_RADIUS = 120;
  const MAX_SPEED = 18;
  const EASE = 0.28;
  const YES_BUFFER = 20;

  let pointerX = null;
  let pointerY = null;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let stageW = 0;
  let stageH = 0;
  let btnW = 0;
  let btnH = 0;
  let yesBox = { left: 0, top: 0, right: 0, bottom: 0 };
  let armed = false;
  let ticking = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function measure() {
    const stageRect = stage.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    stageW = stageRect.width;
    stageH = stageRect.height;
    btnW = noRect.width;
    btnH = noRect.height;

    yesBox = {
      left: yesRect.left - stageRect.left - YES_BUFFER,
      top: yesRect.top - stageRect.top - YES_BUFFER,
      right: yesRect.right - stageRect.left + YES_BUFFER,
      bottom: yesRect.bottom - stageRect.top + YES_BUFFER,
    };
  }

  function avoidYes(px, py) {
    const overlapsX = px + btnW > yesBox.left && px < yesBox.right;
    const overlapsY = py + btnH > yesBox.top && py < yesBox.bottom;

    if (!overlapsX || !overlapsY) return { px, py };

    const pushLeft = px + btnW - yesBox.left;
    const pushRight = yesBox.right - px;
    const pushUp = py + btnH - yesBox.top;
    const pushDown = yesBox.bottom - py;
    const minPush = Math.min(pushLeft, pushRight, pushUp, pushDown);

    if (minPush === pushRight) px = yesBox.right;
    else if (minPush === pushLeft) px = yesBox.left - btnW;
    else if (minPush === pushDown) py = yesBox.bottom;
    else py = yesBox.top - btnH;

    return { px, py };
  }

  function clampToStage(px, py) {
    const avoided = avoidYes(px, py);
    return {
      px: clamp(avoided.px, 0, Math.max(0, stageW - btnW)),
      py: clamp(avoided.py, 0, Math.max(0, stageH - btnH)),
    };
  }

  /** Capture "No" beside "Yes" while both are still in flex, then freeze it there */
  function armDodgeMode() {
    if (armed) return;

    measure();

    const noRect = noBtn.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    x = noRect.left - stageRect.left;
    y = noRect.top - stageRect.top;
    targetX = x;
    targetY = y;

    stage.classList.add("is-armed");
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    armed = true;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  function disarmForResize() {
    armed = false;
    stage.classList.remove("is-armed");
    noBtn.style.left = "";
    noBtn.style.top = "";
  }

  function tick() {
    if (!armed) {
      ticking = false;
      return;
    }

    measure();

    if (pointerX !== null && pointerY !== null) {
      const stageRect = stage.getBoundingClientRect();
      const centerX = x + btnW / 2;
      const centerY = y + btnH / 2;
      const pdx = centerX - (pointerX - stageRect.left);
      const pdy = centerY - (pointerY - stageRect.top);
      const dist = Math.hypot(pdx, pdy);

      if (dist < DANGER_RADIUS && dist > 0.01) {
        const proximity = 1 - dist / DANGER_RADIUS;
        const speed = proximity * MAX_SPEED;
        const dirX = pdx / dist;
        const dirY = pdy / dist;

        const next = clampToStage(targetX + dirX * speed, targetY + dirY * speed);
        targetX = next.px;
        targetY = next.py;
      }
    }

    x += (targetX - x) * EASE;
    y += (targetY - y) * EASE;

    const settled = clampToStage(x, y);
    x = settled.px;
    y = settled.py;

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;

    requestAnimationFrame(tick);
  }

  function updatePointer(clientX, clientY) {
    pointerX = clientX;
    pointerY = clientY;
  }

  stage.addEventListener("mousemove", (e) => updatePointer(e.clientX, e.clientY));
  stage.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) updatePointer(t.clientX, t.clientY);
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (t) updatePointer(t.clientX, t.clientY);
    },
    { passive: true }
  );

  function jumpAway() {
    if (!armed) return;

    measure();

    const candidates = [
      { x: 8, y: 8 },
      { x: stageW - btnW - 8, y: 8 },
      { x: 8, y: stageH - btnH - 8 },
      { x: stageW - btnW - 8, y: stageH - btnH - 8 },
    ];

    let best = candidates[0];
    let bestScore = -Infinity;

    for (const c of candidates) {
      const placed = clampToStage(c.x, c.y);
      const distFromHere = Math.hypot(placed.px - x, placed.py - y);
      let score = distFromHere;

      if (pointerX !== null && pointerY !== null) {
        const stageRect = stage.getBoundingClientRect();
        const distFromPointer = Math.hypot(
          placed.px + btnW / 2 - (pointerX - stageRect.left),
          placed.py + btnH / 2 - (pointerY - stageRect.top)
        );
        score += distFromPointer * 0.65;
      }

      if (score > bestScore) {
        bestScore = score;
        best = placed;
      }
    }

    targetX = best.px;
    targetY = best.py;
    x = best.px;
    y = best.py;
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
  }

  noBtn.addEventListener("mouseenter", jumpAway);
  noBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    jumpAway();
  });
  noBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      jumpAway();
    },
    { passive: false }
  );

  yesBtn.addEventListener("click", () => {
    if (resultBox) resultBox.hidden = false;
  });

  function tryArm() {
    const letterPage = document.getElementById("letter-page");
    if (letterPage?.hidden) return;
    if (!dodgeSection || !dodgeSection.classList.contains("is-visible")) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(armDodgeMode);
    });
  }

  if (dodgeSection) {
    if (dodgeSection.classList.contains("is-visible")) {
      tryArm();
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealObserver.disconnect();
              window.setTimeout(tryArm, 500);
            }
          });
        },
        { threshold: 0.35 }
      );
      revealObserver.observe(dodgeSection);
    }
  }

  window.addEventListener("resize", () => {
    disarmForResize();
    tryArm();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(tryArm);
  } else {
    window.addEventListener("load", tryArm);
  }
})();