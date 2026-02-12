const canvas = document.getElementById("sceneCanvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const messageLayer = document.getElementById("messageLayer");

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

const petals = [];
const bursts = [];
const fireworks = [];
const sparks = [];

const MAX_PETALS = 300;
const BASE_FALL = 8;
const TIME_ZONE = 7;
const FIREWORK_GRAVITY = 210;
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
  y = random(height * 0.02, height * 0.24),
  scale = 1,
  launchX = x
) {
  const palette = [
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
  const color = palette[Math.floor(random(0, palette.length))];
  const startY = height + random(20, 120);
  const travelTime = random(0.82, 1.18);
  const vx = (x - launchX) / travelTime;
  const vy = (y - startY - 0.5 * FIREWORK_GRAVITY * travelTime * travelTime) / travelTime;

  fireworks.push({
    x: launchX,
    y: startY,
    tx: x,
    ty: y,
    vx,
    vy,
    travelTime,
    life: 1.4,
    age: 0,
    color,
    scale,
  });
}

function explodeFirework(f) {
  const count = Math.floor((34 + random(0, 16)) * f.scale);
  const speedMin = 72 * f.scale;
  const speedMax = 185 * f.scale;
  const accentPalette = ["#ffffff", "#fff7cf", "#ffe6f5", "#dff9ff", "#ffd5a2", "#c5ffef"];
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
}

function triggerMidnightShow() {
  celebrationUntil = performance.now() + 18000;
  for (let i = 0; i < 16; i++) {
    spawnFirework(random(width * 0.1, width * 0.9), random(height * 0.08, height * 0.45), random(1.9, 2.8));
  }
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

function updateBursts(dt) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].age += dt;
    if (bursts[i].age >= bursts[i].life) {
      bursts.splice(i, 1);
    }
  }
}

function updateFireworks(dt, nowMs) {
  if (nowMs < celebrationUntil) {
    fireworksCooldown -= dt * 3.5;
  } else if (secondsToTet <= 10) {
    fireworksCooldown -= dt * 2.1;
  } else {
    fireworksCooldown -= dt;
  }

  if (fireworksCooldown <= 0) {
    const nearTet = secondsToTet <= 10;
    const inShow = nowMs < celebrationUntil;
    const scale = inShow ? random(1.8, 2.8) : nearTet ? random(1.3, 2.1) : random(0.9, 1.4);
    spawnFirework(random(width * 0.12, width * 0.88), random(height * 0.03, height * 0.32), scale);
    fireworksCooldown = inShow ? random(0.08, 0.22) : nearTet ? random(0.25, 0.6) : random(1.0, 2.2);
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
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
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.vy += FIREWORK_GRAVITY * dt;
    const dx = f.tx - f.x;
    const dy = f.ty - f.y;
    const closeEnough = dx * dx + dy * dy < 20 * 20;
    if (f.age >= f.travelTime || closeEnough || f.age > f.life) {
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
  }, 2200);
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
  } else if (!celebrationTriggered && totalSeconds <= 10) {
    triggerMidnightShow();
    celebrationTriggered = true;
  }
}

function frame(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0.016);
  const timeSec = now * 0.001;
  lastTime = now;
  hudTimer += dt;

  updateBursts(dt);
  updateWind(dt, timeSec);
  updatePetals(dt, timeSec);
  updateFireworks(dt, now);
  drawBackground(timeSec);
  for (let i = 0; i < petals.length; i++) {
    drawPetal(petals[i]);
  }
  drawFireworks();
  drawBranchOverlay();

  if (hudTimer >= 1) {
    hudTimer = 0;
    updateLunarCountdown();
  }

  requestAnimationFrame(frame);
}

function handleTap(x, y) {
  const hitIndex = findPetalAt(x, y);
  if (hitIndex >= 0) {
    petals.splice(hitIndex, 1);
    showLoveMessage(x, y);
  }

  spawnBurst(x, y, random(320, 460), 1.35);

  const burstCount = 4 + Math.floor(random(0, 3));
  for (let i = 0; i < burstCount; i++) {
    spawnFirework(
      x + random(-12, 12),
      y + random(-10, 10),
      random(1.7, 2.6),
      random(x - Math.max(120, width * 0.18), x + Math.max(120, width * 0.18))
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

window.addEventListener("resize", resize);

resize();
updateLunarCountdown();
requestAnimationFrame(frame);
