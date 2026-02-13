const canvas = document.getElementById("sceneCanvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const messageLayer = document.getElementById("messageLayer");
const newYearMessage = document.getElementById("newYearMessage");
const rabbitReward = document.getElementById("rabbitReward");
const bgm = document.getElementById("bgm");
const volumeSlider = document.getElementById("volumeSlider");

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = 0;
let hudTimer = 0;
let fireworksCooldown = 1.2;
let nextTetDate = null;
let secondsToTet = Infinity;
let celebrationUntil = 0;
let celebrationTriggered = false;
let celebrationNextSweepAt = 0;
let celebrationSweepDirection = 1;
let celebrationModeEnabled = false;
let newYearMessageUntil = 0;
let bgmStarted = false;
let bgmVolume = 0.45;
let bgmTrackIndex = -1;
let rabbitRewardTimer = 0;

const petals = [];
const bursts = [];
const fireworks = [];
const sparks = [];
const explosionFlashes = [];
const duckSwimmers = [];
const cornerRabbits = [];

const MAX_PETALS = 300;
const BASE_FALL = 8;
const TIME_ZONE = 7;
const FIREWORK_GRAVITY = 210;
const CELEBRATION_SWEEP_INTERVAL_MS = 4000;
const NEW_YEAR_MESSAGE_DURATION_MS = 10 * 60 * 1000;
const DEFAULT_FIREWORK_COLORS = [
  "#ffd2e8",
  "#ffc5e2",
  "#fff0a8",
  "#c8f0ff",
  "#ff9cc8",
  "#ffe4a6",
  "#b4f6ff",
  "#d4ffb8",
  "#cdbdff",
  "#ffb1a8",
];
const DEFAULT_FIREWORK_ACCENTS = ["#ffffff", "#fff7cf", "#ffe6f5", "#dff9ff", "#ffd5a2", "#c5ffef"];
const EVENT_CLICK_FIREWORK_COLORS = ["#ff2d2d", "#ffd400", "#ff8a1f", "#8f52ff", "#29d65f", "#ff72cc", "#ffffff"];
const EVENT_CLICK_FIREWORK_ACCENTS = ["#ffffff", "#ff2d2d", "#ffd400", "#ff8a1f", "#8f52ff", "#29d65f", "#ff72cc"];
const DUCK_MAX_COUNT = 6;
const RABBIT_MAX_COUNT = 5;
const RABBIT_MARGIN = 10;
const RABBIT_SPAWN_ATTEMPTS = 44;
const RABBIT_SPAWN_X_SPREAD = 106;
const RABBIT_SPAWN_Y_MIN = -34;
const RABBIT_SPAWN_Y_MAX = 14;
const CRITTER_LIFE_MIN_SEC = 25;
const CRITTER_LIFE_MAX_SEC = 35;
const BGM_TRACKS = Array.from({ length: 10 }, (_, i) => `sound${i + 1}.mp3`);
const RABBIT_SEEK_TARGET_HITS = 5;
const RABBIT_SEEK_DURATION_MS = 10 * 1000;
const RABBIT_REWARD_DURATION_MS = 4200;
const NEW_YEAR_TEXT_LINES = [
  "Anh không giỏi nói điều ngọt ngào nhưng tình iu của anh luôn là thật.",
  "Chúc bé iu của anh năm mới thật nhiều niềm vui, luôn xinh đẹp, khỏe mạnh và cười nhiều hơn mỗi ngày 💕🌸",
  "Năm mới thì ngoan ngoãn hơn một chút, bớt giận dỗi vô lý lại (mà nếu có giận thì cũng phải giận chơi chơi thui 😌) 💕🌸",
  "Chúc bé luôn gặp điều may mắn, làm gì cũng thuận lợi, và luôn luôn có anh ở bên cạnh để thương, để chiều, để dỗ dành 💕🌸",
  "Năm nay mình yêu nhau nhiều hơn năm cũ nha 💕🌸",
  "Chúc mừng năm mới bé iu 🎆❤️💕🌸",
];
const LOVE_TEXTS = [
  "Chồng yêu bé",
  "Thương bé nhiều lắm",
  "Bé là điều đáng yêu nhất",
  "Mình bên nhau mãi nhé",
  "Ngủ ngon nhé, công chúa",
  "Hôm nay bé xinh quá",
  "Cho bé một cái ôm",
  "Anh luôn yêu bé",
  "Cảm ơn bé đã đến",
  "Yêu bé hơn hôm qua",
  "Bé là người anh thương nhất",
  "Cả ngày chỉ muốn ở cạnh bé",
  "Bé cười là anh thấy bình yên",
  "Mỗi ngày bên bé đều là quà",
  "Anh nhớ bé thật nhiều",
  "Bé là mặt trời nhỏ của anh",
  "Mình nắm tay nhau thật lâu nhé",
  "Anh thương bé vô điều kiện",
  "Bé ơi, mình hạnh phúc nhé",
  "Chúc bé luôn vui và xinh",
  "Anh mê bé từ ánh nhìn đầu tiên",
  "Có bé là có cả thế giới",
  "Bé ngoan của anh đây rồi",
  "Yêu bé hơn cả hôm nay",
  "Cảm ơn bé vì đã yêu anh",
  "Bé là điều kỳ diệu ngọt ngào",
];
const rabbitHideSeek = {
  active: false,
  hits: 0,
  endAt: 0,
};

const bgImage = new Image();
bgImage.src = "mount-fuji-cherry-blossom-scenery-anime-art.jpg";
let bgLoaded = false;
bgImage.onload = () => {
  bgLoaded = true;
};

const petalSprite1 = new Image();
petalSprite1.src = "canh hoa 1.png";
const petalSprite2 = new Image();
petalSprite2.src = "canh hoa 2.png";
const PETAL_SPRITES = [petalSprite1, petalSprite2];

const branchOverlay = new Image();
branchOverlay.src = "cành hoa.png";

const duckSprite = new Image();
duckSprite.src = "vit.png";
let duckSpriteLoaded = false;
duckSprite.onload = () => {
  duckSpriteLoaded = true;
};

const rabbitSprite = new Image();
rabbitSprite.src = "tho.png";
let rabbitSpriteLoaded = false;
rabbitSprite.onload = () => {
  rabbitSpriteLoaded = true;
};

const wind = {
  x: 0,
  y: 0,
  target: 0,
  targetY: 0,
  gust: 0,
  gustY: 0,
  timer: 0,
  current: 0,
  currentY: 0,
};

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function playBgm() {
  if (!bgm) {
    return;
  }
  bgm.volume = bgmVolume;
  const p = bgm.play();
  if (p && typeof p.then === "function") {
    p.then(() => {
      bgmStarted = true;
    }).catch(() => {});
  } else {
    bgmStarted = true;
  }
}

function pickRandomBgmIndex(avoidCurrent = true) {
  if (BGM_TRACKS.length <= 0) {
    return -1;
  }
  if (!avoidCurrent || BGM_TRACKS.length === 1 || bgmTrackIndex < 0) {
    return Math.floor(random(0, BGM_TRACKS.length));
  }
  let idx = bgmTrackIndex;
  for (let i = 0; i < 8 && idx === bgmTrackIndex; i++) {
    idx = Math.floor(random(0, BGM_TRACKS.length));
  }
  if (idx === bgmTrackIndex) {
    idx = (bgmTrackIndex + 1) % BGM_TRACKS.length;
  }
  return idx;
}

function setBgmTrackByIndex(index, autoPlay = false) {
  if (!bgm || index < 0 || index >= BGM_TRACKS.length) {
    return;
  }
  const nextSrc = BGM_TRACKS[index];
  bgmTrackIndex = index;
  if (bgm.getAttribute("src") !== nextSrc) {
    bgm.setAttribute("src", nextSrc);
    bgm.load();
  }
  if (autoPlay || bgmStarted || (!bgm.paused && !bgm.ended)) {
    playBgm();
  }
}

function randomizeBgmTrack(autoPlay = false, avoidCurrent = true) {
  const idx = pickRandomBgmIndex(avoidCurrent);
  if (idx >= 0) {
    setBgmTrackByIndex(idx, autoPlay);
  }
}

function showFloatingText(text, x, y, durationMs = 1600) {
  if (!messageLayer) {
    return;
  }
  const node = document.createElement("div");
  node.className = "petal-message";
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  messageLayer.appendChild(node);
  setTimeout(() => {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }, Math.max(700, durationMs));
}

function resetRabbitHideSeek() {
  rabbitHideSeek.active = false;
  rabbitHideSeek.hits = 0;
  rabbitHideSeek.endAt = 0;
}

function showRabbitReward() {
  if (!rabbitReward) {
    return;
  }
  rabbitReward.classList.remove("visible");
  void rabbitReward.offsetWidth;
  rabbitReward.classList.add("visible");
  if (rabbitRewardTimer) {
    clearTimeout(rabbitRewardTimer);
  }
  rabbitRewardTimer = setTimeout(() => {
    rabbitReward.classList.remove("visible");
    rabbitRewardTimer = 0;
  }, RABBIT_REWARD_DURATION_MS);
}

function rgbaFromHex(hex, alpha) {
  if (typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(255,255,255,${alpha})`;
  }
  let h = hex.slice(1).trim();
  if (h.length === 3) {
    h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  if (h.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }
  const n = Number.parseInt(h, 16);
  if (!Number.isFinite(n)) {
    return `rgba(255,255,255,${alpha})`;
  }
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function getRabbitRatio() {
  if (rabbitSpriteLoaded && rabbitSprite.naturalHeight > 0) {
    return rabbitSprite.naturalWidth / rabbitSprite.naturalHeight;
  }
  return 1;
}

function getRabbitBounds(side, size, offsetX, offsetY) {
  const drawH = size;
  const drawW = drawH * getRabbitRatio();
  const x = side === "left" ? RABBIT_MARGIN + offsetX : width - RABBIT_MARGIN - drawW + offsetX;
  const y = height - RABBIT_MARGIN - drawH + offsetY;
  return { x, y, w: drawW, h: drawH };
}

function rectsOverlap(a, b, padding = 0) {
  return !(
    a.x + a.w + padding <= b.x ||
    b.x + b.w + padding <= a.x ||
    a.y + a.h + padding <= b.y ||
    b.y + b.h + padding <= a.y
  );
}

function rabbitHasOverlap(bounds, padding = 8, ignoreRabbit = null) {
  for (let i = 0; i < cornerRabbits.length; i++) {
    const r = cornerRabbits[i];
    if (r === ignoreRabbit) {
      continue;
    }
    const other = getRabbitBounds(r.side, r.size, r.offsetX, r.offsetY);
    if (rectsOverlap(bounds, other, padding)) {
      return true;
    }
  }
  return false;
}

function triggerRabbitSeekReward() {
  const cx = width * 0.5;
  const cy = height * 0.38;
  const leftX = width * 0.22;
  const rightX = width * 0.78;
  showRabbitReward();
  showFloatingText("Thưởng thỏ!", cx, Math.max(40, cy - 56), 1900);

  const sideConfigs = [
    { x: leftX, launchMin: width * 0.03, launchMax: width * 0.24, txMin: leftX - 84, txMax: leftX + 120 },
    { x: rightX, launchMin: width * 0.76, launchMax: width * 0.97, txMin: rightX - 120, txMax: rightX + 84 },
  ];
  for (let s = 0; s < sideConfigs.length; s++) {
    const cfg = sideConfigs[s];
    spawnBurst(cfg.x, cy + random(-16, 14), random(420, 560), 1.55);
    const shots = 5 + Math.floor(random(0, 3));
    for (let i = 0; i < shots; i++) {
      spawnFirework(
        random(cfg.txMin, cfg.txMax),
        cy + random(-30, 24),
        random(1.9, 2.8),
        random(cfg.launchMin, cfg.launchMax),
        i * 0.04,
        EVENT_CLICK_FIREWORK_COLORS,
        EVENT_CLICK_FIREWORK_ACCENTS
      );
    }
  }
}

function handleRabbitHideSeekClick(x, y) {
  const now = performance.now();
  if (!rabbitHideSeek.active || now >= rabbitHideSeek.endAt) {
    rabbitHideSeek.active = true;
    rabbitHideSeek.hits = 0;
    rabbitHideSeek.endAt = now + RABBIT_SEEK_DURATION_MS;
  }

  rabbitHideSeek.hits += 1;
  const remainSec = Math.max(0, Math.ceil((rabbitHideSeek.endAt - now) / 1000));

  if (rabbitHideSeek.hits >= RABBIT_SEEK_TARGET_HITS) {
    triggerRabbitSeekReward();
    resetRabbitHideSeek();
    return;
  }

  showFloatingText(`${rabbitHideSeek.hits}/${RABBIT_SEEK_TARGET_HITS} • ${remainSec}s`, x, y, 1150);
}

function updateRabbitHideSeek(nowMs) {
  if (rabbitHideSeek.active && nowMs >= rabbitHideSeek.endAt) {
    resetRabbitHideSeek();
  }
}

function spawnDuckSwimmer() {
  const laneMin = width * 0.3;
  const laneMax = width * 0.7;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const size = random(44, 62);
  const speed = random(18, 30) * dir;
  const y = random(height * 0.72, height * 0.94);
  const ratio = duckSpriteLoaded && duckSprite.naturalHeight > 0 ? duckSprite.naturalWidth / duckSprite.naturalHeight : 1.26;
  const drawW = size * ratio;
  const xMin = laneMin;
  const xMax = Math.max(xMin + 4, laneMax - drawW);
  duckSwimmers.push({
    x: random(xMin, xMax),
    y,
    size,
    speed,
    dir,
    face: dir,
    targetFace: dir,
    turnTimer: random(6.8, 12.4),
    laneMin,
    laneMax,
    life: random(CRITTER_LIFE_MIN_SEC, CRITTER_LIFE_MAX_SEC),
    age: 0,
    phase: random(0, Math.PI * 2),
    hitX: 0,
    hitY: 0,
    hitW: 0,
    hitH: 0,
  });
  if (duckSwimmers.length > DUCK_MAX_COUNT) {
    duckSwimmers.splice(0, duckSwimmers.length - DUCK_MAX_COUNT);
  }
}

function spawnCornerRabbit() {
  for (let attempt = 0; attempt < RABBIT_SPAWN_ATTEMPTS; attempt++) {
    const side = Math.random() > 0.5 ? "left" : "right";
    const size = random(44, 62);
    const offsetY = random(RABBIT_SPAWN_Y_MIN, RABBIT_SPAWN_Y_MAX);
    const offsetX = side === "left" ? random(-8, RABBIT_SPAWN_X_SPREAD) : random(-RABBIT_SPAWN_X_SPREAD, 8);
    const bounds = getRabbitBounds(side, size, offsetX, offsetY);
    if (rabbitHasOverlap(bounds, 8)) {
      continue;
    }
    cornerRabbits.push({
      side,
      size,
      life: random(CRITTER_LIFE_MIN_SEC, CRITTER_LIFE_MAX_SEC),
      age: 0,
      phase: random(0, Math.PI * 2),
      tiltAmp: random(0.06, 0.16),
      tiltSpeed: random(1.8, 2.8),
      offsetY,
      offsetX,
      face: side === "left" ? 1 : -1,
      hitX: 0,
      hitY: 0,
      hitW: 0,
      hitH: 0,
    });
    if (cornerRabbits.length > RABBIT_MAX_COUNT) {
      cornerRabbits.splice(0, cornerRabbits.length - RABBIT_MAX_COUNT);
    }
    return true;
  }
  return false;
}

function refillRabbits(targetCount = RABBIT_MAX_COUNT) {
  let rabbitFillGuard = 0;
  while (cornerRabbits.length < targetCount && rabbitFillGuard < RABBIT_MAX_COUNT * 3) {
    if (!spawnCornerRabbit()) {
      break;
    }
    rabbitFillGuard += 1;
  }
}

function updateCritters(dt) {
  const laneMin = width * 0.3;
  const laneMax = width * 0.7;
  const duckRatio = duckSpriteLoaded && duckSprite.naturalHeight > 0 ? duckSprite.naturalWidth / duckSprite.naturalHeight : 1.26;

  for (let i = duckSwimmers.length - 1; i >= 0; i--) {
    const d = duckSwimmers[i];
    d.age += dt;
    if (d.age >= d.life) {
      duckSwimmers.splice(i, 1);
      continue;
    }
    d.laneMin = laneMin;
    d.laneMax = laneMax;
    d.turnTimer -= dt;
    if (d.turnTimer <= 0) {
      d.speed = -d.speed;
      d.dir = d.speed >= 0 ? 1 : -1;
      d.targetFace = d.dir;
      d.turnTimer = random(6.6, 12.8);
    }
    d.x += d.speed * dt;
    const drawW = d.size * duckRatio;
    if (d.x < d.laneMin) {
      d.x = d.laneMin;
      d.speed = Math.abs(d.speed);
      d.dir = 1;
      d.targetFace = 1;
      d.turnTimer = random(7.2, 13.6);
    } else if (d.x + drawW > d.laneMax) {
      d.x = d.laneMax - drawW;
      d.speed = -Math.abs(d.speed);
      d.dir = -1;
      d.targetFace = -1;
      d.turnTimer = random(7.2, 13.6);
    }
    const faceBlend = 1 - Math.exp(-dt * 6.2);
    d.face += (d.targetFace - d.face) * faceBlend;
  }

  while (duckSwimmers.length < DUCK_MAX_COUNT) {
    spawnDuckSwimmer();
  }

  for (let i = cornerRabbits.length - 1; i >= 0; i--) {
    const r = cornerRabbits[i];
    r.age += dt;
    if (r.age >= r.life) {
      cornerRabbits.splice(i, 1);
    }
  }

  refillRabbits(RABBIT_MAX_COUNT);
}

function drawCritters(timeSec) {
  if (duckSwimmers.length <= 0 && cornerRabbits.length <= 0) {
    return;
  }

  ctx.save();

  for (let i = 0; i < duckSwimmers.length; i++) {
    const d = duckSwimmers[i];
    const alpha = Math.min(1, d.age / 0.9) * 0.96;
    const bob = Math.sin(timeSec * 1.9 + d.phase) * (d.size * 0.07);
    const drawH = d.size;
    const ratio = duckSpriteLoaded && duckSprite.naturalHeight > 0 ? duckSprite.naturalWidth / duckSprite.naturalHeight : 1.26;
    const drawW = drawH * ratio;
    const x = d.x;
    const y = d.y + bob;
    d.hitX = x;
    d.hitY = y;
    d.hitW = drawW;
    d.hitH = drawH;

    ctx.globalAlpha = alpha * 0.24;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.ellipse(x + drawW * 0.46, y + drawH * 0.88, drawW * 0.34, drawH * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(28, 14, 45, 0.28)";
    ctx.shadowBlur = 8;
    if (duckSpriteLoaded) {
      const tilt = Math.sin(timeSec * 1.45 + d.phase) * 0.035 + Math.sin(timeSec * 0.77 + d.phase * 0.6) * 0.02;
      const rawFace = Number.isFinite(d.face) ? d.face : d.dir;
      const faceSign = rawFace >= 0 ? 1 : -1;
      const faceScale = faceSign * Math.max(0.14, Math.abs(rawFace));
      ctx.save();
      ctx.translate(x + drawW * 0.5, y + drawH * 0.56);
      ctx.scale(faceScale, 1);
      ctx.rotate(tilt);
      ctx.drawImage(duckSprite, -drawW * 0.5, -drawH * 0.56, drawW, drawH);
      ctx.restore();
    } else {
      ctx.font = `${Math.round(d.size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText("🦆", x, y);
    }
  }

  for (let i = 0; i < cornerRabbits.length; i++) {
    const r = cornerRabbits[i];
    const alpha = Math.min(1, r.age / 0.8) * 0.97;
    const baseBounds = getRabbitBounds(r.side, r.size, r.offsetX, r.offsetY);
    const drawW = baseBounds.w;
    const drawH = baseBounds.h;
    const x = baseBounds.x;
    const baseY = baseBounds.y;
    const y = baseY + Math.sin(timeSec * 2.2 + r.phase) * 2.2;
    r.hitX = x;
    r.hitY = y;
    r.hitW = drawW;
    r.hitH = drawH;

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(26, 12, 38, 0.3)";
    ctx.shadowBlur = 7;
    if (rabbitSpriteLoaded) {
      const tilt = Math.sin(timeSec * r.tiltSpeed + r.phase) * r.tiltAmp;
      ctx.save();
      ctx.translate(x + drawW * 0.5, y + drawH * 0.54);
      ctx.rotate(tilt);
      ctx.scale(r.face, 1);
      ctx.drawImage(rabbitSprite, -drawW * 0.5, -drawH * 0.54, drawW, drawH);
      ctx.restore();
    } else {
      ctx.font = `${Math.round(r.size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText("🐰", x, y);
    }
  }

  ctx.restore();
}

function randomPetalX() {
  const r = Math.random();
  if (r < 0.44) {
    return random(-90, width * 0.32);
  }
  if (r < 0.88) {
    return random(width * 0.68, width + 90);
  }
  return random(width * 0.32, width * 0.68);
}

function spawnPetal(x = randomPetalX(), y = random(-height, 0)) {
  petals.push({
    x,
    y,
    vx: random(-20, 20),
    vy: random(24, 58),
    rot: random(0, Math.PI * 2),
    spin: random(-1.25, 1.25),
    spinDrift: random(-0.55, 0.55),
    size: random(8.5, 18),
    sway: random(0, Math.PI * 2),
    color: Math.random() > 0.5 ? "#ffd9ea" : "#ffc4dc",
    alpha: random(0.72, 0.95),
    sprite: Math.random() > 0.5 ? 0 : 1,
  });
}

function spawnBurst(x, y, force = random(260, 380), life = 1.2) {
  bursts.push({ x, y, force, life, age: 0 });
}

function spawnFirework(
  x = random(width * 0.2, width * 0.84),
  y = random(height * 0.11, height * 0.36),
  scale = 1,
  launchX = x + random(-Math.max(80, width * 0.12), Math.max(80, width * 0.12)),
  launchDelay = 0,
  colorPalette = DEFAULT_FIREWORK_COLORS,
  accentPalette = DEFAULT_FIREWORK_ACCENTS
) {
  const sourcePalette = Array.isArray(colorPalette) && colorPalette.length > 0 ? colorPalette : DEFAULT_FIREWORK_COLORS;
  const sourceAccents = Array.isArray(accentPalette) && accentPalette.length > 0 ? accentPalette : DEFAULT_FIREWORK_ACCENTS;
  const color = sourcePalette[Math.floor(random(0, sourcePalette.length))];
  const startY = height + random(20, 120);
  const travelTime = random(1.9, 2.5);
  const vx = (x - launchX) / travelTime;
  const vy = (y - startY - 0.5 * FIREWORK_GRAVITY * travelTime * travelTime) / travelTime;
  const curveAmp = random(-28, 28) * (0.8 + scale * 0.2);
  const curveFreq = random(1.1, 2.4);
  const curvePhase = random(0, Math.PI * 2);

  fireworks.push({
    x: launchX,
    y: startY,
    tx: x,
    ty: y,
    vx,
    vy,
    curveAmp,
    curveFreq,
    curvePhase,
    travelTime,
    life: travelTime + random(0.45, 0.9),
    age: 0,
    color,
    accentPalette: sourceAccents,
    scale,
    delay: Math.max(0, launchDelay),
  });
}

function explodeFirework(f) {
  const count = Math.floor((34 + random(0, 16)) * f.scale);
  const speedMin = 72 * f.scale;
  const speedMax = 185 * f.scale;
  const accentPalette = Array.isArray(f.accentPalette) && f.accentPalette.length > 0 ? f.accentPalette : DEFAULT_FIREWORK_ACCENTS;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + random(-0.16, 0.16);
    const speed = random(speedMin, speedMax);
    sparks.push({
      x: f.x,
      y: f.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(0.8, 1.8) * (0.95 + f.scale * 0.15),
      age: 0,
      size: random(1.6, 3.6) * (0.9 + f.scale * 0.25),
      color: Math.random() > 0.45 ? f.color : accentPalette[Math.floor(random(0, accentPalette.length))],
    });
  }

  const flashLayers = Math.random() > 0.72 ? 2 : 1;
  for (let i = 0; i < flashLayers; i++) {
    explosionFlashes.push({
      x: f.x + random(-8, 8),
      y: f.y + random(-8, 8),
      color: Math.random() > 0.5 ? f.color : accentPalette[Math.floor(random(0, accentPalette.length))],
      radius: random(120, 210) * f.scale * (i === 0 ? 1 : 0.7),
      life: random(0.42, 0.82) * (i === 0 ? 1 : 0.88),
      age: 0,
      intensity: random(0.62, 0.96),
    });
  }
  if (explosionFlashes.length > 180) {
    explosionFlashes.splice(0, explosionFlashes.length - 180);
  }
}

function triggerMidnightShow() {
  const now = performance.now();
  celebrationModeEnabled = true;
  celebrationUntil = now + NEW_YEAR_MESSAGE_DURATION_MS;
  celebrationNextSweepAt = now + 260;
  celebrationSweepDirection = 1;
  showNewYearMessage(NEW_YEAR_MESSAGE_DURATION_MS);
}

function spawnCelebrationSweep(direction) {
  const count = Math.floor(random(9, 12));
  const leftX = width * 0.1;
  const rightX = width * 0.9;
  const baseY = random(height * 0.2, height * 0.38);
  const launchSpread = Math.max(130, width * 0.18);
  const stepDelay = 0.11;

  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const flowT = direction > 0 ? t : 1 - t;
    const x = leftX + (rightX - leftX) * flowT + random(-12, 12);
    const y = baseY + Math.sin(t * Math.PI) * random(-height * 0.015, height * 0.025) + random(-8, 8);
    const burstCount = 4 + Math.floor(random(0, 3));
    spawnBurst(x, y, random(320, 460), 1.35);
    for (let j = 0; j < burstCount; j++) {
      const launchX = x + random(-launchSpread, launchSpread);
      spawnFirework(
        x + random(-12, 12),
        y + random(-10, 10),
        random(1.7, 2.6),
        launchX,
        i * stepDelay + j * 0.015,
        EVENT_CLICK_FIREWORK_COLORS,
        EVENT_CLICK_FIREWORK_ACCENTS
      );
    }
  }
}

function initNewYearMessage() {
  if (!newYearMessage) {
    return;
  }
  newYearMessage.innerHTML = "";
  for (let i = 0; i < NEW_YEAR_TEXT_LINES.length; i++) {
    const p = document.createElement("p");
    p.textContent = NEW_YEAR_TEXT_LINES[i];
    newYearMessage.appendChild(p);
  }
}

function hideNewYearMessage() {
  newYearMessageUntil = 0;
  if (newYearMessage) {
    newYearMessage.classList.remove("visible");
  }
}

function showNewYearMessage(durationMs) {
  if (!newYearMessage) {
    return;
  }
  newYearMessageUntil = performance.now() + Math.max(1000, durationMs || NEW_YEAR_MESSAGE_DURATION_MS);
  newYearMessage.classList.add("visible");
}

function updateNewYearMessageVisibility(nowMs) {
  if (newYearMessageUntil > 0 && nowMs >= newYearMessageUntil) {
    hideNewYearMessage();
  }
}

function setCelebrationMode(enabled) {
  if (!enabled) {
    celebrationModeEnabled = false;
    celebrationUntil = 0;
    celebrationNextSweepAt = 0;
    fireworks.length = 0;
    sparks.length = 0;
    bursts.length = 0;
    explosionFlashes.length = 0;
    hideNewYearMessage();
    return;
  }
  celebrationModeEnabled = true;
  triggerMidnightShow();
}

function isTypingTarget(target) {
  if (!target) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function setupPetals() {
  petals.length = 0;
  const count = Math.min(MAX_PETALS, Math.max(140, Math.floor(width * 0.16)));
  for (let i = 0; i < count; i++) {
    spawnPetal();
  }
}

function updateWind(dt, timeSec) {
  wind.timer -= dt;
  if (wind.timer <= 0) {
    wind.target = random(-22, 22);
    wind.targetY = random(-2.2, 2.6);
    wind.gust = random(-8, 8);
    wind.gustY = random(-1.8, 2.2);
    wind.timer = random(2.4, 5.8);
  }

  const blend = 1 - Math.exp(-dt * 1.6);
  wind.x += (wind.target - wind.x) * blend;
  wind.y += (wind.targetY - wind.y) * blend;
  wind.gust *= 1 - Math.min(1, dt * 0.5);
  wind.gustY *= 1 - Math.min(1, dt * 0.55);

  const wave = Math.sin(timeSec * 0.43) * 8 + Math.sin(timeSec * 1.14) * 3.5 + Math.cos(timeSec * 0.21) * 2.4;
  const waveY = Math.sin(timeSec * 0.66) * 1.8 + Math.cos(timeSec * 0.29) * 0.9;
  wind.current = wind.x + wind.gust + wave;
  wind.currentY = wind.y + wind.gustY + waveY;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  setupPetals();
}

function drawImageCover(img) {
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  let drawW = width;
  let drawH = height;
  let offsetX = 0;
  let offsetY = 0;
  if (imgRatio > canvasRatio) {
    drawW = height * imgRatio;
    drawH = height;
    offsetX = (width - drawW) * 0.5;
  } else {
    drawW = width;
    drawH = width / imgRatio;
    offsetY = (height - drawH) * 0.5;
  }
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function drawBackground(time) {
  if (bgLoaded) {
    drawImageCover(bgImage);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#cbe8ff");
    sky.addColorStop(0.52, "#f8d9ec");
    sky.addColorStop(1, "#efaacd");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, "rgba(26, 24, 42, 0.16)");
  overlay.addColorStop(0.65, "rgba(55, 32, 58, 0.08)");
  overlay.addColorStop(1, "rgba(77, 40, 74, 0.14)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 12; i++) {
    const bx = ((i * 163 + time * 8) % (width + 220)) - 110;
    const by = 26 + (i % 4) * 54 + Math.sin(time * 0.35 + i) * 12;
    const r = 30 + (i % 4) * 8;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
    g.addColorStop(0, "rgba(255,255,255,0.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSideVignette(eventBoost = 0) {
  const boost = Math.max(0, Math.min(1, eventBoost));
  const sideShade = ctx.createRadialGradient(width * 0.5, height * 0.58, width * 0.1, width * 0.5, height * 0.58, width * 0.74);
  sideShade.addColorStop(0, "rgba(0,0,0,0)");
  sideShade.addColorStop(0.45, `rgba(16, 8, 24, ${0.16 + boost * 0.14})`);
  sideShade.addColorStop(0.74, `rgba(16, 8, 24, ${0.34 + boost * 0.18})`);
  sideShade.addColorStop(1, `rgba(16, 8, 24, ${0.52 + boost * 0.18})`);
  ctx.fillStyle = sideShade;
  ctx.fillRect(0, 0, width, height);

  if (boost > 0) {
    const sideAlpha = 0.26 + boost * 0.32;
    const leftMask = ctx.createLinearGradient(0, 0, width * 0.34, 0);
    leftMask.addColorStop(0, `rgba(8, 4, 14, ${sideAlpha})`);
    leftMask.addColorStop(0.62, `rgba(8, 4, 14, ${sideAlpha * 0.35})`);
    leftMask.addColorStop(1, "rgba(8, 4, 14, 0)");
    ctx.fillStyle = leftMask;
    ctx.fillRect(0, 0, width * 0.36, height);

    const rightMask = ctx.createLinearGradient(width, 0, width * 0.66, 0);
    rightMask.addColorStop(0, `rgba(8, 4, 14, ${sideAlpha})`);
    rightMask.addColorStop(0.62, `rgba(8, 4, 14, ${sideAlpha * 0.35})`);
    rightMask.addColorStop(1, "rgba(8, 4, 14, 0)");
    ctx.fillStyle = rightMask;
    ctx.fillRect(width * 0.64, 0, width * 0.36, height);
  }
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const fadeStartY = height * 0.7;
  const fadeRange = Math.max(120, height * 0.3);
  const fadeBottom = Math.max(0, Math.min(1, (height - p.y) / fadeRange));
  const finalAlpha = p.alpha * (p.y > fadeStartY ? fadeBottom : 1);
  ctx.globalAlpha = finalAlpha;
  const sprite = PETAL_SPRITES[p.sprite];
  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    const w = p.size * 2.7;
    const h = p.size * 2.7;
    ctx.drawImage(sprite, -w * 0.5, -h * 0.5, w, h);
  } else {
    const petalGrad = ctx.createRadialGradient(0, -p.size * 0.2, p.size * 0.1, 0, 0, p.size * 1.2);
    petalGrad.addColorStop(0, "#fff8fd");
    petalGrad.addColorStop(0.42, p.color);
    petalGrad.addColorStop(1, "#f3a9c6");
    ctx.fillStyle = petalGrad;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.92, -p.size * 0.58, p.size * 0.98, p.size * 0.62, 0, p.size * 1.06);
    ctx.bezierCurveTo(-p.size * 0.98, p.size * 0.62, -p.size * 0.92, -p.size * 0.58, 0, -p.size);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBranchOverlay() {
  if (!branchOverlay.complete || branchOverlay.naturalWidth <= 0) {
    return;
  }

  const imgW = branchOverlay.naturalWidth;
  const imgH = branchOverlay.naturalHeight;
  const baseH = Math.max(height * 0.49, 205);
  const leftScale = (baseH / imgH) * 1.03;
  const rightScale = (baseH / imgH) * 0.95;
  const leftW = imgW * leftScale;
  const leftH = imgH * leftScale;
  const rightW = imgW * rightScale;
  const rightH = imgH * rightScale;
  const top = -height * 0.02;

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.translate(0, top);
  ctx.rotate(0.075);
  ctx.drawImage(branchOverlay, -leftW * 0.22, 0, leftW, leftH);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.translate(width, top + 4);
  ctx.scale(-1, 1);
  ctx.rotate(0.085);
  ctx.drawImage(branchOverlay, -rightW * 0.22, 0, rightW, rightH);
  ctx.restore();
}

function drawFireworks() {
  for (let i = 0; i < fireworks.length; i++) {
    const f = fireworks[i];
    const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 18 * f.scale);
    halo.addColorStop(0, "rgba(255,255,255,0.42)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 18 * f.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2.6 * f.scale, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i];
    const alpha = 1 - s.age / s.life;
    const twinkle = 0.78 + Math.sin((s.age / s.life) * 24) * 0.22;
    const a = Math.max(0, Math.min(1, alpha * twinkle));
    ctx.fillStyle = `${s.color}${Math.floor(a * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * (0.9 + twinkle * 0.25), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${a * 0.22})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExplosionLighting() {
  if (explosionFlashes.length <= 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < explosionFlashes.length; i++) {
    const e = explosionFlashes[i];
    const t = Math.max(0, Math.min(1, e.age / e.life));
    const fade = Math.pow(1 - t, 0.72);
    const radius = e.radius * (0.86 + t * 0.4);
    const coreA = Math.max(0, Math.min(1, 0.3 * fade * e.intensity));
    const midA = Math.max(0, Math.min(1, 0.19 * fade * e.intensity));
    const rimA = Math.max(0, Math.min(1, 0.08 * fade * e.intensity));

    const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radius);
    glow.addColorStop(0, `rgba(255,255,255,${coreA})`);
    glow.addColorStop(0.24, rgbaFromHex(e.color, midA));
    glow.addColorStop(0.62, rgbaFromHex(e.color, rimA));
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function updateBursts(dt) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].age += dt;
    if (bursts[i].age >= bursts[i].life) {
      bursts.splice(i, 1);
    }
  }
}

function updateFireworks(dt, nowMs) {
  if (celebrationModeEnabled && nowMs >= celebrationUntil) {
    celebrationModeEnabled = false;
    celebrationUntil = 0;
    celebrationNextSweepAt = 0;
    hideNewYearMessage();
  }

  const eventActive = celebrationModeEnabled && nowMs < celebrationUntil;

  if (eventActive) {
    if (nowMs >= celebrationNextSweepAt) {
      spawnCelebrationSweep(celebrationSweepDirection);
      celebrationSweepDirection *= -1;
      celebrationNextSweepAt = nowMs + CELEBRATION_SWEEP_INTERVAL_MS;
    }
  } else if (secondsToTet <= 10) {
    fireworksCooldown -= dt * 2.1;
    if (fireworksCooldown <= 0) {
      spawnFirework(random(width * 0.12, width * 0.88), random(height * 0.12, height * 0.42), random(1.3, 2.1));
      fireworksCooldown = random(0.25, 0.6);
    }
  } else {
    fireworksCooldown -= dt;
    if (fireworksCooldown <= 0) {
      spawnFirework(random(width * 0.12, width * 0.88), random(height * 0.12, height * 0.42), random(0.9, 1.4));
      fireworksCooldown = random(1.0, 2.2);
    }
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
    if (f.delay > 0) {
      f.delay -= dt;
      continue;
    }
    f.age += dt;
    if (Math.random() < 0.72) {
      sparks.push({
        x: f.x + random(-2.2, 2.2),
        y: f.y + random(2, 10),
        vx: random(-18, 18),
        vy: random(28, 66),
        life: random(0.24, 0.42),
        age: 0,
        size: random(0.9, 1.7) * f.scale,
        color: Math.random() > 0.5 ? "#ffe6a8" : "#ffd4f0",
      });
    }
    const curveVX = Math.sin(f.age * f.curveFreq + f.curvePhase) * f.curveAmp;
    f.x += (f.vx + curveVX) * dt;
    f.y += f.vy * dt;
    f.vy += FIREWORK_GRAVITY * dt;
    const dx = f.tx - f.x;
    const dy = f.ty - f.y;
    const closeEnough = dx * dx + dy * dy < 20 * 20;
    if (f.age >= f.travelTime || closeEnough) {
      f.x = f.tx;
      f.y = f.ty;
      explodeFirework(f);
      fireworks.splice(i, 1);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.age += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= 0.985;
    s.vy = s.vy * 0.985 + 40 * dt;
    if (s.age >= s.life) {
      sparks.splice(i, 1);
    }
  }

  for (let i = explosionFlashes.length - 1; i >= 0; i--) {
    const e = explosionFlashes[i];
    e.age += dt;
    if (e.age >= e.life) {
      explosionFlashes.splice(i, 1);
    }
  }
}

function updatePetals(dt, timeSec) {
  const vortexA = {
    x: width * (0.24 + Math.sin(timeSec * 0.31) * 0.12),
    y: height * (0.48 + Math.cos(timeSec * 0.37) * 0.14),
    force: 950,
  };
  const vortexB = {
    x: width * (0.76 + Math.cos(timeSec * 0.28) * 0.11),
    y: height * (0.42 + Math.sin(timeSec * 0.33) * 0.13),
    force: -900,
  };

  for (let i = 0; i < petals.length; i++) {
    const p = petals[i];
    p.sway += dt * (1.8 + p.size * 0.03);
    const localFlow =
      Math.sin(p.y * 0.016 + timeSec * 1.9 + p.sway) * 6 +
      Math.cos(p.x * 0.011 - timeSec * 1.35) * 4;
    const localLift =
      Math.cos(p.x * 0.014 + timeSec * 1.25) * 1.9 +
      Math.sin(p.y * 0.013 - timeSec * 1.05 + p.sway * 0.8) * 1.2;
    let ax = wind.current + localFlow;
    let ay = BASE_FALL + wind.currentY + localLift;

    ay -= Math.min(2.2, Math.abs(wind.current) * 0.07);

    const vortices = [vortexA, vortexB];
    for (let v = 0; v < vortices.length; v++) {
      const c = vortices[v];
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const distSq = dx * dx + dy * dy + 2200;
      const turn = c.force / distSq;
      ax += -dy * turn;
      ay += dx * turn;
    }

    for (let j = 0; j < bursts.length; j++) {
      const b = bursts[j];
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const distSq = dx * dx + dy * dy + 45;
      const phase = 1 - b.age / b.life;
      const swirl = (b.force * phase) / distSq;
      ax += -dy * swirl;
      ay += dx * swirl;
    }

    p.vx += ax * dt;
    p.vy += ay * dt;
    p.vx *= 0.985;
    p.vy *= 0.991;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const spinForce = p.spin + p.spinDrift * Math.sin(timeSec * 2.2 + p.sway) + p.vx * 0.006;
    p.rot += spinForce * dt;

    if (p.y > height + 44 || p.x > width + 80 || p.x < -100) {
      p.x = randomPetalX();
      p.y = random(-140, -16);
      p.vx = random(-20, 18);
      p.vy = random(14, 38);
      p.size = random(8.5, 18);
      p.spinDrift = random(-0.55, 0.55);
      p.alpha = random(0.72, 0.95);
      p.color = Math.random() > 0.5 ? "#ffd9ea" : "#ffc4dc";
      p.sprite = Math.random() > 0.5 ? 0 : 1;
    }
  }
}

function showLoveMessage(x, y) {
  const text = LOVE_TEXTS[Math.floor(random(0, LOVE_TEXTS.length))];
  showFloatingText(text, x, y, 2200);
}

function findPetalAt(x, y) {
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    const dx = p.x - x;
    const dy = p.y - y;
    const hit = p.size * 1.35;
    if (dx * dx + dy * dy <= hit * hit) {
      return i;
    }
  }
  return -1;
}

function findCritterAt(x, y) {
  for (let i = cornerRabbits.length - 1; i >= 0; i--) {
    const r = cornerRabbits[i];
    if (!Number.isFinite(r.hitX) || !Number.isFinite(r.hitY) || !Number.isFinite(r.hitW) || !Number.isFinite(r.hitH)) {
      continue;
    }
    if (x >= r.hitX && x <= r.hitX + r.hitW && y >= r.hitY && y <= r.hitY + r.hitH) {
      return { type: "rabbit", index: i };
    }
  }

  for (let i = duckSwimmers.length - 1; i >= 0; i--) {
    const d = duckSwimmers[i];
    if (!Number.isFinite(d.hitX) || !Number.isFinite(d.hitY) || !Number.isFinite(d.hitW) || !Number.isFinite(d.hitH)) {
      continue;
    }
    if (x >= d.hitX && x <= d.hitX + d.hitW && y >= d.hitY && y <= d.hitY + d.hitH) {
      return { type: "duck", index: i };
    }
  }

  return null;
}

function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function newMoon(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let c1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  c1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  c1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  c1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  c1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  c1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  c1 += 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltaT;
  if (T < -11) {
    deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return jd1 + c1 - deltaT;
}

function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L *= dr;
  L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return L;
}

function getNewMoonDay(k, timeZone) {
  return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

function getSunLongitude(dayNumber, timeZone) {
  return Math.floor((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 6);
}

function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  let last = arc;
  do {
    i += 1;
    last = arc;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

function convertSolar2Lunar(dd, mm, yy, timeZone) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

function getNextTetDate(baseDate) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  for (let i = 0; i < 800; i++) {
    const candidate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const lunar = convertSolar2Lunar(candidate.getDate(), candidate.getMonth() + 1, candidate.getFullYear(), TIME_ZONE);
    if (lunar[0] === 1 && lunar[1] === 1 && lunar[3] === 0 && candidate.getTime() > baseDate.getTime()) {
      return candidate;
    }
    d.setDate(d.getDate() + 1);
  }
  return new Date(baseDate.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
}

function updateLunarCountdown() {
  const now = new Date();
  if (!nextTetDate || now.getTime() >= nextTetDate.getTime()) {
    nextTetDate = getNextTetDate(now);
    celebrationTriggered = false;
  }

  const ms = nextTetDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  secondsToTet = totalSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  countdown.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (!celebrationTriggered && totalSeconds <= 1) {
    celebrationTriggered = true;
    triggerMidnightShow();
  }
}

function frame(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0.016);
  const timeSec = now * 0.001;
  const eventActive = celebrationModeEnabled && now < celebrationUntil;
  lastTime = now;
  hudTimer += dt;

  updateBursts(dt);
  updateWind(dt, timeSec);
  updateCritters(dt);
  updatePetals(dt, timeSec);
  updateFireworks(dt, now);
  updateNewYearMessageVisibility(now);
  updateRabbitHideSeek(now);
  drawBackground(timeSec);
  for (let i = 0; i < petals.length; i++) {
    drawPetal(petals[i]);
  }
  drawFireworks();
  drawBranchOverlay();
  drawSideVignette(eventActive ? 1 : 0);
  drawExplosionLighting();
  drawCritters(timeSec);

  if (hudTimer >= 1) {
    hudTimer = 0;
    updateLunarCountdown();
  }

  requestAnimationFrame(frame);
}

function handleTap(x, y) {
  if (!bgmStarted && bgm) {
    if (bgmTrackIndex < 0) {
      randomizeBgmTrack(false, false);
    }
    playBgm();
  }

  const critterHit = findCritterAt(x, y);
  if (critterHit) {
    if (critterHit.type === "duck") {
      duckSwimmers.splice(critterHit.index, 1);
      if (duckSwimmers.length < DUCK_MAX_COUNT) {
        spawnDuckSwimmer();
      }
      randomizeBgmTrack(true, true);
    } else {
      if (critterHit.index >= 0 && critterHit.index < cornerRabbits.length) {
        cornerRabbits.splice(critterHit.index, 1);
        handleRabbitHideSeekClick(x, y);
        refillRabbits(RABBIT_MAX_COUNT);
      }
    }
  } else {
    const hitIndex = findPetalAt(x, y);
    if (hitIndex >= 0) {
      petals.splice(hitIndex, 1);
      showLoveMessage(x, y);
    }
  }

  spawnBurst(x, y, random(320, 460), 1.35);

  const burstCount = 4 + Math.floor(random(0, 3));
  for (let i = 0; i < burstCount; i++) {
    spawnFirework(
      x + random(-12, 12),
      y + random(-10, 10),
      random(1.7, 2.6),
      random(x - Math.max(120, width * 0.18), x + Math.max(120, width * 0.18)),
      0,
      EVENT_CLICK_FIREWORK_COLORS,
      EVENT_CLICK_FIREWORK_ACCENTS
    );
  }
}

canvas.addEventListener("click", (event) => {
  handleTap(event.clientX, event.clientY);
});

canvas.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length > 0) {
      const t = event.touches[0];
      handleTap(t.clientX, t.clientY);
    }
    event.preventDefault();
  },
  { passive: false }
);

if (volumeSlider && bgm) {
  if (bgmTrackIndex < 0) {
    randomizeBgmTrack(false, false);
  }
  bgm.volume = bgmVolume;
  volumeSlider.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    bgmVolume = Math.max(0, Math.min(1, value));
    bgm.volume = bgmVolume;
  });
}

window.addEventListener("keydown", (event) => {
  if (event.repeat || isTypingTarget(event.target)) {
    return;
  }
  if (event.code === "Minus" || event.code === "NumpadSubtract" || event.key === "-") {
    setCelebrationMode(!celebrationModeEnabled);
  }
});

window.addEventListener("resize", resize);

initNewYearMessage();
resize();
updateLunarCountdown();
requestAnimationFrame(frame);
