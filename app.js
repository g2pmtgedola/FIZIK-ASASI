/**
 * FizikAsasi UiTM - Interactive Physics Engine & Learning Logic
 * Specially created for Amal (UiTM Dengkil Foundation in Science)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Render KaTeX Math
  renderMath();

  // Initialize tabs
  switchTab('ch7');

  // Initialize Simulators
  initRotationalSim();
  initArchimedesSim();
  initThermalSim();
  initSHMSim();

  // Initialize Calculator tool
  updateCalcTool();
});

// ==========================================
// KATEX MATH RENDERING
// ==========================================
function renderMath() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }
}

// ==========================================
// DUAL-VIEW MODE SWITCHER (WINDOWS vs PHONE/TABLET)
// ==========================================
let currentViewMode = 'windows';

function setViewMode(mode) {
  currentViewMode = mode;
  const wrapper = document.getElementById('device-wrapper');
  const viewport = document.getElementById('app-viewport');
  const statusBar = document.getElementById('device-statusbar');
  const homeBar = document.getElementById('device-home-bar');
  const notch = document.getElementById('device-notch');
  const btnOrient = document.getElementById('btn-orientation');
  const mobileDock = document.getElementById('mobile-bottom-dock');

  // Update button active styling
  const btns = ['windows', 'tablet', 'phone'];
  btns.forEach(b => {
    const btnEl = document.getElementById(`btn-view-${b}`);
    if (btnEl) {
      if (b === mode) {
        btnEl.className = 'view-btn px-3 py-1 rounded-md text-xs font-medium text-white bg-sky-500 flex items-center gap-1.5 transition shadow';
      } else {
        btnEl.className = 'view-btn px-3 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition';
      }
    }
  });

  // Reset frame classes
  viewport.classList.remove('device-frame-phone', 'device-frame-tablet', 'max-w-7xl');
  wrapper.classList.remove('device-mode-active');

  if (mode === 'windows') {
    viewport.classList.add('max-w-7xl');
    statusBar.classList.add('hidden');
    homeBar.classList.add('hidden');
    btnOrient.classList.add('hidden');
    mobileDock.classList.add('md:hidden');
  } else if (mode === 'tablet') {
    wrapper.classList.add('device-mode-active');
    viewport.classList.add('device-frame-tablet');
    statusBar.classList.remove('hidden');
    homeBar.classList.remove('hidden');
    notch.classList.add('hidden');
    btnOrient.classList.remove('hidden');
    mobileDock.classList.remove('md:hidden');
  } else if (mode === 'phone') {
    wrapper.classList.add('device-mode-active');
    viewport.classList.add('device-frame-phone');
    statusBar.classList.remove('hidden');
    homeBar.classList.remove('hidden');
    notch.classList.remove('hidden');
    btnOrient.classList.remove('hidden');
    mobileDock.classList.remove('md:hidden');
  }

  // Trigger resize event so canvases adapt perfectly
  window.dispatchEvent(new Event('resize'));
  setTimeout(() => {
    renderMath();
  }, 100);
}

function toggleOrientation() {
  const viewport = document.getElementById('app-viewport');
  if (currentViewMode === 'phone') {
    if (viewport.style.maxWidth === '700px') {
      viewport.style.maxWidth = '410px';
    } else {
      viewport.style.maxWidth = '700px';
    }
  } else if (currentViewMode === 'tablet') {
    if (viewport.style.maxWidth === '1000px') {
      viewport.style.maxWidth = '780px';
    } else {
      viewport.style.maxWidth = '1000px';
    }
  }
  window.dispatchEvent(new Event('resize'));
}

// Update mobile clock
function updateMobileClock() {
  const clock = document.getElementById('device-clock');
  if (clock) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${hrs}:${mins}`;
  }
}
setInterval(updateMobileClock, 1000);
updateMobileClock();

// ==========================================
// NAVIGATION & TABS
// ==========================================
function switchTab(tabId) {
  // Hide all chapter tabs explicitly
  const tabs = document.querySelectorAll('.chapter-tab');
  tabs.forEach(tab => {
    tab.classList.add('hidden');
    tab.style.display = 'none';
  });

  // Show the target selected tab explicitly
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    targetTab.style.display = 'block';
  }

  // Update top nav button highlights
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update bottom mobile dock highlights
  const dockBtns = document.querySelectorAll('.dock-btn');
  dockBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Scroll smoothly to start of content
  window.scrollTo({ top: 120, behavior: 'smooth' });

  // Re-trigger layout or render math if needed
  setTimeout(() => {
    renderMath();
    window.dispatchEvent(new Event('resize'));
  }, 50);
}

// Toggle worked example accordion
function toggleExample(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);
  if (el) {
    el.classList.toggle('hidden');
    if (icon) {
      icon.classList.toggle('rotate-180');
    }
  }
}

// ==========================================
// SIMULATOR 1: ROTATIONAL MOTION (CH 7)
// ==========================================
let rotRunning = true;
let rotAngle = 0;
let rotLastTime = 0;

function initRotationalSim() {
  const canvas = document.getElementById('canvas-rotational');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio || 340;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sliderOmega = document.getElementById('slider-omega');
  const sliderRadius = document.getElementById('slider-radius');
  const valOmega = document.getElementById('val-omega');
  const valRadius = document.getElementById('val-radius');

  const btnPlay = document.getElementById('sim-ch7-playpause');
  const btnReset = document.getElementById('sim-ch7-reset');

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      rotRunning = !rotRunning;
      btnPlay.innerHTML = rotRunning 
        ? '<i data-lucide="pause" class="w-4 h-4"></i> Pause' 
        : '<i data-lucide="play" class="w-4 h-4"></i> Main';
      if (window.lucide) lucide.createIcons();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      rotAngle = 0;
    });
  }

  function updateParams() {
    const omega = parseFloat(sliderOmega.value);
    const r2 = parseFloat(sliderRadius.value);
    const r1 = r2 * 0.5; // Klyde at half radius

    valOmega.textContent = `${omega.toFixed(2)} rad/s`;
    valRadius.textContent = `${r2.toFixed(2)} m`;

    const v2 = r2 * omega;
    const ac2 = r2 * omega * omega;
    const T = (2 * Math.PI) / omega;
    const f = omega / (2 * Math.PI);

    document.getElementById('calc-v').textContent = `${v2.toFixed(2)} m/s`;
    document.getElementById('calc-ac').textContent = `${ac2.toFixed(2)} m/s²`;
    document.getElementById('calc-t').textContent = `${T.toFixed(2)} s`;
    document.getElementById('calc-f').textContent = `${f.toFixed(2)} rev/s`;
  }

  if (sliderOmega) sliderOmega.addEventListener('input', updateParams);
  if (sliderRadius) sliderRadius.addEventListener('input', updateParams);
  updateParams();

  function animate(timestamp) {
    if (!rotLastTime) rotLastTime = timestamp;
    const dt = (timestamp - rotLastTime) / 1000;
    rotLastTime = timestamp;

    const omega = parseFloat(sliderOmega.value);
    const r2Norm = parseFloat(sliderRadius.value); // 0.8 to 2.0

    if (rotRunning) {
      rotAngle += omega * dt;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const centerX = w * 0.45;
    const centerY = h * 0.5;
    const maxPixelRadius = Math.min(w, h) * 0.40;
    const pixelScale = maxPixelRadius / 2.0;

    const pR2 = r2Norm * pixelScale;
    const pR1 = pR2 * 0.5;

    // Draw Turntable base
    const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, pR2 + 15);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pR2 + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Turntable grooves
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let r = 20; r < pR2; r += 20) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Reference Line (Fixed 0 angle)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + pR2 + 20, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating radius line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(rotAngle) * pR2, centerY - Math.sin(rotAngle) * pR2);
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Point 1: Klyde (r1)
    const klydeX = centerX + Math.cos(rotAngle) * pR1;
    const klydeY = centerY - Math.sin(rotAngle) * pR1;
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(klydeX, klydeY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Point 2: Bonnie (r2)
    const bonnieX = centerX + Math.cos(rotAngle) * pR2;
    const bonnieY = centerY - Math.sin(rotAngle) * pR2;
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(bonnieX, bonnieY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tangential Velocity Vectors (v)
    const vScale = 15;
    // Bonnie Velocity Vector (pink)
    const v2_len = (r2Norm * omega) * vScale;
    const v2_dirX = -Math.sin(rotAngle);
    const v2_dirY = -Math.cos(rotAngle);
    drawVector(ctx, bonnieX, bonnieY, bonnieX + v2_dirX * v2_len, bonnieY + v2_dirY * v2_len, '#ec4899', 'v (Bonnie)');

    // Klyde Velocity Vector (green)
    const v1_len = ((r2Norm * 0.5) * omega) * vScale;
    drawVector(ctx, klydeX, klydeY, klydeX + v2_dirX * v1_len, klydeY + v2_dirY * v1_len, '#10b981', 'v (Klyde)');

    // Centripetal Acceleration Vector (ac) towards center
    const ac_len = Math.min(pR2 * 0.7, (r2Norm * omega * omega) * 4);
    drawVector(ctx, bonnieX, bonnieY, bonnieX - Math.cos(rotAngle) * ac_len, bonnieY + Math.sin(rotAngle) * ac_len, '#f59e0b', 'ac (Memusat)');

    // Text labels on canvas
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`θ = ${(rotAngle % (2 * Math.PI)).toFixed(2)} rad (${((rotAngle % (2 * Math.PI)) * 180 / Math.PI).toFixed(0)}°)`, centerX + 10, centerY - pR2 - 15);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function drawVector(ctx, x1, y1, x2, y2, color, label) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowhead
  const headLen = 8;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(label, x2 + 6, y2 + 4);
  }
  ctx.restore();
}

// ==========================================
// SIMULATOR 2: ARCHIMEDES & BUOYANCY (CH 9)
// ==========================================
function initArchimedesSim() {
  const canvas = document.getElementById('canvas-archimedes');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio || 340;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sliderRhoObj = document.getElementById('slider-rho-obj');
  const sliderVolObj = document.getElementById('slider-vol-obj');
  const valRho = document.getElementById('val-rho-obj');
  const valVol = document.getElementById('val-vol-obj');

  const rhoFluid = 1000; // Water density
  const g = 9.80;

  function updateArchimedes() {
    const rhoObj = parseFloat(sliderRhoObj.value);
    const volObj = parseFloat(sliderVolObj.value);

    valRho.textContent = `${rhoObj} kg/m³`;
    valVol.textContent = `${volObj.toFixed(3)} m³`;

    const mass = rhoObj * volObj;
    const realWeight = mass * g;

    let subFraction = 0;
    let fb = 0;
    let apparentWeight = 0;
    let statusText = '';

    if (rhoObj < rhoFluid) {
      subFraction = rhoObj / rhoFluid;
      fb = realWeight;
      apparentWeight = 0;
      statusText = `Terapung (${(subFraction * 100).toFixed(0)}% tenggelam)`;
    } else {
      subFraction = 1.0;
      fb = rhoFluid * volObj * g;
      apparentWeight = realWeight - fb;
      statusText = rhoObj === rhoFluid ? 'Keseimbangan Neutral (Melayang)' : 'Tenggelam Sepenuhnya ke Dasar';
    }

    document.getElementById('calc-weight').textContent = `${realWeight.toFixed(2)} N`;
    document.getElementById('calc-fb').textContent = `${fb.toFixed(2)} N`;
    document.getElementById('calc-apparent').textContent = `${apparentWeight.toFixed(2)} N`;
    document.getElementById('calc-status').textContent = statusText;

    drawBeaker(subFraction, rhoObj, realWeight, fb);
  }

  function drawBeaker(subFraction, rhoObj, weight, fb) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const beakerX = w * 0.25;
    const beakerY = h * 0.25;
    const beakerW = w * 0.5;
    const beakerH = h * 0.65;
    const waterLevelY = beakerY + beakerH * 0.35;

    // Draw Beaker
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(beakerX, beakerY, beakerW, beakerH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    // Water fill
    const waterGrad = ctx.createLinearGradient(0, waterLevelY, 0, beakerY + beakerH);
    waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
    waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.7)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(beakerX + 2, waterLevelY, beakerW - 4, (beakerY + beakerH) - waterLevelY - 2);

    // Water surface line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beakerX, waterLevelY);
    ctx.lineTo(beakerX + beakerW, waterLevelY);
    ctx.stroke();

    // Object Block
    const blockW = 90;
    const blockH = 70;
    const blockX = beakerX + beakerW / 2 - blockW / 2;

    let blockY;
    if (subFraction < 1.0) {
      blockY = waterLevelY - blockH * (1 - subFraction);
    } else {
      blockY = beakerY + beakerH - blockH - 5;
    }

    // Draw Block
    ctx.fillStyle = rhoObj < rhoFluid ? '#d97706' : '#64748b';
    ctx.fillRect(blockX, blockY, blockW, blockH);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, blockW, blockH);

    // Text on block
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${rhoObj} kg/m³`, blockX + blockW / 2, blockY + blockH / 2 + 4);

    // Force Arrows
    const arrowX = blockX + blockW / 2;
    const arrowCenterY = blockY + blockH / 2;

    // Upward Buoyancy FB
    drawVector(ctx, arrowX, arrowCenterY, arrowX, arrowCenterY - 45, '#2dd4bf', `FB = ${fb.toFixed(1)} N`);

    // Downward Weight W
    drawVector(ctx, arrowX, arrowCenterY, arrowX, arrowCenterY + 45, '#f43f5e', `W = ${weight.toFixed(1)} N`);

    // Water label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Air: 1000 kg/m³', beakerX + 15, waterLevelY + 25);
  }

  if (sliderRhoObj) sliderRhoObj.addEventListener('input', updateArchimedes);
  if (sliderVolObj) sliderVolObj.addEventListener('input', updateArchimedes);
  updateArchimedes();
}

// ==========================================
// SIMULATOR 3: THERMAL PHASE GRAPH (CH 11)
// ==========================================
function initThermalSim() {
  const canvas = document.getElementById('canvas-thermal');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio || 340;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sliderQ = document.getElementById('slider-thermal-q');
  const valQ = document.getElementById('val-thermal-q');
  const phaseName = document.getElementById('thermal-phase-name');
  const tempVal = document.getElementById('thermal-temp-val');
  const formulaName = document.getElementById('thermal-formula-name');

  // Specific heat constants for 1 gram (0.001 kg)
  // Part A: Warming ice (-30 to 0) -> Q = 0.001 * 2090 * 30 = 62.7 J
  // Part B: Melting ice (0°C) -> Q = 0.001 * 3.33e5 = 333 J (Total Q = 395.7 J)
  // Part C: Warming water (0 to 100) -> Q = 0.001 * 4190 * 100 = 419 J (Total Q = 814.7 J)
  // Part D: Boiling water (100°C) -> Q = 0.001 * 2.26e6 = 2260 J (Total Q = 3074.7 J)
  // Part E: Warming steam (100 to 120) -> Q = 0.001 * 2010 * 20 = 40.2 J (Total Q = 3114.9 J)

  function updateThermal() {
    const q = parseFloat(sliderQ.value);
    valQ.textContent = `${q.toFixed(0)} J`;

    let curTemp = 0;
    let phase = '';
    let formula = '';

    if (q <= 62.7) {
      curTemp = -30 + (q / 62.7) * 30;
      phase = 'A: Pemanasan Ais Pepejal (-30°C → 0°C)';
      formula = 'Q = m c_{ice} ΔT';
    } else if (q <= 395.7) {
      curTemp = 0;
      const meltedPct = ((q - 62.7) / 333 * 100).toFixed(0);
      phase = `B: Leburan Ais + Air (0°C) [${meltedPct}% Lebur]`;
      formula = 'Q = m L_f (Haba Pendam Pelakuran)';
    } else if (q <= 814.7) {
      curTemp = 0 + ((q - 395.7) / 419) * 100;
      phase = 'C: Pemanasan Cecair Air (0°C → 100°C)';
      formula = 'Q = m c_{water} ΔT';
    } else if (q <= 3074.7) {
      curTemp = 100;
      const boiledPct = ((q - 814.7) / 2260 * 100).toFixed(0);
      phase = `D: Pendidihan Air + Stim (100°C) [${boiledPct}% Stim]`;
      formula = 'Q = m L_v (Haba Pendam Pengewapan)';
    } else {
      curTemp = 100 + ((q - 3074.7) / 40.2) * 20;
      phase = 'E: Pemanasan Stim / Gas (> 100°C)';
      formula = 'Q = m c_{steam} ΔT';
    }

    phaseName.textContent = phase;
    tempVal.textContent = `${curTemp.toFixed(1)} °C`;
    formulaName.innerHTML = `\\(${formula}\\)`;
    renderMath();

    drawThermalGraph(q, curTemp);
  }

  function drawThermalGraph(currentQ, currentTemp) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 60;
    const padR = 40;
    const padT = 30;
    const padB = 50;

    const graphW = w - padL - padR;
    const graphH = h - padT - padB;

    function mapX(q) {
      return padL + (q / 3115) * graphW;
    }

    function mapY(temp) {
      // Temp from -30 to 120
      return padT + graphH - ((temp - (-30)) / 150) * graphH;
    }

    // Grid Lines & Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Y grid: -30, 0, 30, 60, 90, 100, 120
    const yTemps = [-30, 0, 50, 100, 120];
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';

    yTemps.forEach(t => {
      const y = mapY(t);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + graphW, y);
      ctx.stroke();
      ctx.fillText(`${t}°C`, padL - 8, y + 3);
    });

    // X Labels: 0, 62.7, 396, 815, 3070
    const xPoints = [
      { q: 0, label: '0' },
      { q: 62.7, label: '63J' },
      { q: 395.7, label: '396J' },
      { q: 814.7, label: '815J' },
      { q: 3075, label: '3075J' }
    ];
    ctx.textAlign = 'center';
    xPoints.forEach(p => {
      const x = mapX(p.q);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + graphH);
      ctx.stroke();
      ctx.fillText(p.label, x, padT + graphH + 18);
    });

    // Draw Complete Theoretical Curve
    const keypoints = [
      { q: 0, t: -30 },
      { q: 62.7, t: 0 },
      { q: 395.7, t: 0 },
      { q: 814.7, t: 100 },
      { q: 3074.7, t: 100 },
      { q: 3114.9, t: 120 }
    ];

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mapX(keypoints[0].q), mapY(keypoints[0].t));
    for (let i = 1; i < keypoints.length; i++) {
      ctx.lineTo(mapX(keypoints[i].q), mapY(keypoints[i].t));
    }
    ctx.stroke();

    // Fill area up to current Q
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(mapX(0), mapY(-30));
    for (let i = 0; i < keypoints.length; i++) {
      if (currentQ >= keypoints[i].q) {
        ctx.lineTo(mapX(keypoints[i].q), mapY(keypoints[i].t));
      } else {
        ctx.lineTo(mapX(currentQ), mapY(currentTemp));
        break;
      }
    }
    ctx.lineTo(mapX(currentQ), mapY(-30));
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + graphH);
    areaGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
    areaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    ctx.fillStyle = areaGrad;
    ctx.fill();
    ctx.restore();

    // Active progress line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(mapX(keypoints[0].q), mapY(keypoints[0].t));
    for (let i = 1; i < keypoints.length; i++) {
      if (currentQ >= keypoints[i].q) {
        ctx.lineTo(mapX(keypoints[i].q), mapY(keypoints[i].t));
      } else {
        ctx.lineTo(mapX(currentQ), mapY(currentTemp));
        break;
      }
    }
    ctx.stroke();

    // Indicator Dot
    const curX = mapX(currentQ);
    const curY = mapY(currentTemp);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(curX, curY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label on dot
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`(${currentQ.toFixed(0)} J, ${currentTemp.toFixed(1)}°C)`, curX + 10, curY - 5);
  }

  window.setThermalQ = function(val) {
    sliderQ.value = val;
    updateThermal();
  };

  if (sliderQ) sliderQ.addEventListener('input', updateThermal);
  updateThermal();
}

// ==========================================
// SIMULATOR 4: SHM SPRING OSCILLATOR (CH 13)
// ==========================================
let shmRunning = true;
let shmTime = 0;
let shmLastTime = 0;
let waveHistory = [];

function initSHMSim() {
  const canvas = document.getElementById('canvas-shm');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio || 340;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sliderM = document.getElementById('slider-shm-m');
  const sliderK = document.getElementById('slider-shm-k');
  const sliderA = document.getElementById('slider-shm-a');

  const valM = document.getElementById('val-shm-m');
  const valK = document.getElementById('val-shm-k');
  const valA = document.getElementById('val-shm-a');

  const btnPlay = document.getElementById('sim-ch13-playpause');
  const btnReset = document.getElementById('sim-ch13-reset');

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      shmRunning = !shmRunning;
      btnPlay.innerHTML = shmRunning 
        ? '<i data-lucide="pause" class="w-4 h-4"></i> Pause' 
        : '<i data-lucide="play" class="w-4 h-4"></i> Main';
      if (window.lucide) lucide.createIcons();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      shmTime = 0;
      waveHistory = [];
    });
  }

  function updateSHMParams() {
    const m = parseFloat(sliderM.value);
    const k = parseFloat(sliderK.value);
    const A = parseFloat(sliderA.value);

    valM.textContent = `${m.toFixed(2)} kg`;
    valK.textContent = `${k.toFixed(1)} N/m`;
    valA.textContent = `${A.toFixed(2)} m`;

    const omega = Math.sqrt(k / m);
    const T = (2 * Math.PI) / omega;
    const vmax = omega * A;
    const amax = omega * omega * A;

    document.getElementById('calc-shm-t').textContent = `${T.toFixed(2)} s`;
    document.getElementById('calc-shm-w').textContent = `${omega.toFixed(2)} rad/s`;
    document.getElementById('calc-shm-vmax').textContent = `${vmax.toFixed(2)} m/s`;
    document.getElementById('calc-shm-amax').textContent = `${amax.toFixed(2)} m/s²`;
  }

  if (sliderM) sliderM.addEventListener('input', updateSHMParams);
  if (sliderK) sliderK.addEventListener('input', updateSHMParams);
  if (sliderA) sliderA.addEventListener('input', updateSHMParams);
  updateSHMParams();

  function animate(timestamp) {
    if (!shmLastTime) shmLastTime = timestamp;
    const dt = (timestamp - shmLastTime) / 1000;
    shmLastTime = timestamp;

    const m = parseFloat(sliderM.value);
    const k = parseFloat(sliderK.value);
    const A = parseFloat(sliderA.value);
    const omega = Math.sqrt(k / m);

    if (shmRunning) {
      shmTime += dt;
      // Calculate current position: x(t) = A * cos(omega * t)
      const currentX = A * Math.cos(omega * shmTime);
      waveHistory.unshift(currentX);
      if (waveHistory.length > 250) {
        waveHistory.pop();
      }
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const leftWallX = 40;
    const centerY = h * 0.45;
    const eqX = w * 0.35;
    const scale = 300; // pixels per meter

    const currentX = A * Math.cos(omega * shmTime);
    const currentV = -omega * A * Math.sin(omega * shmTime);
    const currentAcc = -omega * omega * currentX;

    const blockX = eqX + currentX * scale;
    const blockW = 45;
    const blockH = 45;

    // Draw Left Fixed Wall
    ctx.fillStyle = '#475569';
    ctx.fillRect(leftWallX - 15, centerY - 50, 15, 100);
    // Hatch lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let y = centerY - 50; y <= centerY + 50; y += 10) {
      ctx.beginPath();
      ctx.moveTo(leftWallX - 15, y);
      ctx.lineTo(leftWallX, y - 5);
      ctx.stroke();
    }

    // Floor
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftWallX, centerY + blockH / 2);
    ctx.lineTo(w - 20, centerY + blockH / 2);
    ctx.stroke();

    // Equilibrium line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(eqX, centerY - 60);
    ctx.lineTo(eqX, centerY + 60);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('x = 0 (Eq)', eqX, centerY - 65);

    // Amplitude bounds
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('-A', eqX - A * scale, centerY - 65);
    ctx.fillText('+A', eqX + A * scale, centerY - 65);

    // Draw Spring (Zig-zag)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftWallX, centerY);
    const coils = 12;
    const springLen = blockX - leftWallX;
    const coilW = springLen / coils;
    for (let i = 0; i < coils; i++) {
      const cx = leftWallX + (i + 0.5) * coilW;
      const cy = i % 2 === 0 ? centerY - 15 : centerY + 15;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(blockX, centerY);
    ctx.stroke();

    // Draw Mass Block
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(blockX, centerY - blockH / 2, blockW, blockH);
    ctx.strokeStyle = '#ede9fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, centerY - blockH / 2, blockW, blockH);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${m} kg`, blockX + blockW / 2, centerY + 4);

    // Vectors on block
    // Velocity vector (green)
    const vLen = currentV * 40;
    if (Math.abs(vLen) > 2) {
      drawVector(ctx, blockX + blockW / 2, centerY - blockH / 2 - 10, blockX + blockW / 2 + vLen, centerY - blockH / 2 - 10, '#10b981', 'v');
    }

    // Acceleration vector (rose)
    const aLen = (currentAcc / (omega * omega * A)) * 35;
    if (Math.abs(aLen) > 2) {
      drawVector(ctx, blockX + blockW / 2, centerY + blockH / 2 + 15, blockX + blockW / 2 + aLen, centerY + blockH / 2 + 15, '#f43f5e', 'a');
    }

    // Real-Time Sinusoidal Wave Trace
    const waveStartX = eqX + 180;
    if (waveStartX < w - 40) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < waveHistory.length; i++) {
        const hx = waveStartX + i * 1.5;
        const hy = centerY - waveHistory[i] * scale;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
        if (hx > w - 20) break;
      }
      ctx.stroke();

      // Connector line from block to wave
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(blockX + blockW, centerY);
      ctx.lineTo(waveStartX, centerY - currentX * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ==========================================
// QUIZ CHECKER LOGIC & EXPLANATION
// ==========================================
const quizAnswers = {
  ch7_q1: {
    answer: 'B',
    explanation: 'Pada objek tegar yang berputar pada paksi tetap, setiap titik melengkapkan 1 putaran dalam masa yang sama (T sama), jadi halaju sudut ω adalah SAMA bagi kedua-duanya. Laju linear Bonnie lebih laju kerana jejarinya lebih besar (v = rω).'
  },
  ch7_q2: {
    answer: 'B',
    explanation: 'Gunakan formula pecutan memusat: \\(a_c = \\frac{v^2}{r} = \\frac{(2.5\\text{ m/s})^2}{0.45\\text{ m}} = \\frac{6.25}{0.45} = 13.89 \\approx 13.9\\text{ m/s}^2\\).'
  },
  ch7_q3: {
    answer: 'A',
    explanation: 'Gunakan formula daya memusat: \\(F_c = \\frac{mv^2}{r} \\implies r = \\frac{mv^2}{F_c} = \\frac{(500\\text{ kg})(12\\text{ m/s})^2}{9600\\text{ N}} = \\frac{500 \\times 144}{9600} = 7.5\\text{ m}\\).'
  },
  ch9_q1: {
    answer: 'A',
    explanation: 'Daya ke bawah diperlukan = FB - mg. Isipadu sfera \\(V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(0.019\\text{ m})^3 = 2.87 \\times 10^{-5}\\text{ m}^3\\). \\(F_B = (1000)(2.87 \\times 10^{-5})(9.80) = 0.282\\text{ N}\\). Berat \\(mg = (84)(2.87 \\times 10^{-5})(9.80) = 0.024\\text{ N}\\). Maka daya ke bawah = \\(0.282 - 0.024 = 0.258\\text{ N}\\).'
  },
  ch9_q2: {
    answer: 'B',
    explanation: 'Kecerunan graf Stress per Strain dalam zon linear mematuhi Hukum Hooke pepejal: \\(\\text{Kecerunan} = \\frac{\\text{Stress}}{\\text{Strain}} = \\text{Modulus Keanjalan}\\) (Elastic Modulus).'
  },
  ch11_q1: {
    answer: 'A',
    explanation: 'Formula \\(Q = mc\\Delta T \\implies c = \\frac{Q}{m\\Delta T}\\). Dengan input haba Q dan jisim m yang sama, cecair dengan kenaikan suhu \\(\\Delta T\\) yang lebih kecil mesti mempunyai muatan haba tentu c yang lebih besar (sukar panas).'
  },
  ch11_q2: {
    answer: 'A',
    explanation: 'Jumlah tenaga = Panaskan ais (0.040 × 2090 × 10 = 836 J) + Lebur ais (0.040 × 3.33×10^5 = 13,320 J) + Panaskan air (0.040 × 4190 × 100 = 16,760 J) + Didih air (0.040 × 2.26×10^6 = 90,400 J) + Panaskan stim (0.040 × 2010 × 10 = 804 J) = Total \\(\\approx 1.22 \\times 10^5\\text{ J}\\).'
  },
  ch13_q1: {
    answer: 'D',
    explanation: 'Dalam 1 tempoh T, jisim berayun dari +A ke 0 (jarak A), ke -A (jarak A), kembali ke 0 (jarak A), dan kembali ke +A (jarak A). Jumlah jarak yang dilalui = A + A + A + A = 4A.'
  },
  ch13_q2: {
    answer: 'A',
    explanation: 'Frekuensi f ditentukan oleh PUNCA gelombang (tidak berubah merentasi medium). Kerana medium berbeza, kelajuan gelombang v berubah, mengakibatkan panjang gelombang \\(\\lambda\\) turut berubah mengikut \\(v = f\\lambda\\).'
  }
};

let userScores = {};

function checkQuiz(ch) {
  const container = document.getElementById(`quiz-${ch}-container`);
  if (!container) return;

  const items = container.querySelectorAll('.quiz-item');
  let chScore = 0;
  let chTotal = items.length;

  items.forEach(item => {
    const qid = item.getAttribute('data-qid');
    const selected = item.querySelector(`input[name="${qid}"]:checked`);
    const feedbackBox = item.querySelector('.quiz-feedback');
    const options = item.querySelectorAll('.quiz-option');

    // Reset styles
    options.forEach(opt => {
      opt.classList.remove('correct', 'wrong');
    });

    if (!selected) {
      feedbackBox.className = 'quiz-feedback mt-3 p-3 rounded-lg text-xs leading-relaxed bg-amber-950/60 text-amber-300 border border-amber-800/60 block';
      feedbackBox.innerHTML = '⚠️ Sila pilih satu jawapan terlebih dahulu.';
      return;
    }

    const userVal = selected.value;
    const qData = quizAnswers[qid];

    if (userVal === qData.answer) {
      chScore++;
      userScores[qid] = true;
      selected.closest('.quiz-option').classList.add('correct');
      feedbackBox.className = 'quiz-feedback mt-3 p-3 rounded-lg text-xs leading-relaxed bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 block';
      feedbackBox.innerHTML = `✅ <strong>Tahniah Amal, Tepat!</strong><br>${qData.explanation}`;
    } else {
      userScores[qid] = false;
      selected.closest('.quiz-option').classList.add('wrong');
      // Highlight correct answer
      options.forEach(opt => {
        const inp = opt.querySelector('input');
        if (inp && inp.value === qData.answer) {
          opt.classList.add('correct');
        }
      });
      feedbackBox.className = 'quiz-feedback mt-3 p-3 rounded-lg text-xs leading-relaxed bg-rose-950/60 text-rose-300 border border-rose-800/60 block';
      feedbackBox.innerHTML = `❌ <strong>Kurang Tepat. Jawapan sebenar ialah (${qData.answer}).</strong><br>${qData.explanation}`;
    }
  });

  updateTotalScoreBadge();
  renderMath();
}

function updateTotalScoreBadge() {
  const totalQuestions = Object.keys(quizAnswers).length;
  const correctCount = Object.values(userScores).filter(v => v === true).length;
  const badge = document.getElementById('total-score-badge');
  if (badge) {
    badge.textContent = `${correctCount} / ${totalQuestions}`;
  }
}

// ==========================================
// FORMULA QUICK CALCULATOR TOOL
// ==========================================
function openFormulaModal() {
  const modal = document.getElementById('calculator-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeFormulaModal() {
  const modal = document.getElementById('calculator-modal');
  if (modal) modal.classList.add('hidden');
}

function updateCalcTool() {
  const sel = document.getElementById('calc-tool-select').value;
  const inputsBox = document.getElementById('calc-dynamic-inputs');
  const resultBox = document.getElementById('calc-result-box');
  resultBox.classList.add('hidden');

  let html = '';
  switch (sel) {
    case 'shm_period':
      html = `
        <div>
          <label class="block text-slate-400">Jisim Beban, m (kg):</label>
          <input id="ci-m" type="number" step="0.01" value="0.5" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Pemalar Spring, k (N/m):</label>
          <input id="ci-k" type="number" step="0.1" value="20" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
    case 'pendulum_period':
      html = `
        <div>
          <label class="block text-slate-400">Panjang Tali Bandul, L (m):</label>
          <input id="ci-l" type="number" step="0.01" value="0.627" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Pecutan Graviti, g (m/s²):</label>
          <input id="ci-g" type="number" step="0.01" value="9.80" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
    case 'centripetal':
      html = `
        <div>
          <label class="block text-slate-400">Jisim, m (kg):</label>
          <input id="ci-m" type="number" step="0.1" value="500" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Laju, v (m/s):</label>
          <input id="ci-v" type="number" step="0.1" value="12" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Jejari, r (m):</label>
          <input id="ci-r" type="number" step="0.1" value="7.5" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
    case 'heat_mc':
      html = `
        <div>
          <label class="block text-slate-400">Jisim, m (kg):</label>
          <input id="ci-m" type="number" step="0.01" value="1.57" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Muatan Haba Tentu, c (J/kg·°C):</label>
          <input id="ci-c" type="number" step="1" value="448" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Perubahan Suhu, ΔT (°C):</label>
          <input id="ci-dt" type="number" step="0.1" value="355" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
    case 'string_wave':
      html = `
        <div>
          <label class="block text-slate-400">Daya Tegangan, F (N):</label>
          <input id="ci-f" type="number" step="0.1" value="19.6" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Ketumpatan Linear, μ (kg/m):</label>
          <input id="ci-mu" type="number" step="0.0001" value="0.005" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
    case 'young_modulus':
      html = `
        <div>
          <label class="block text-slate-400">Daya, F (N):</label>
          <input id="ci-f" type="number" step="10" value="60000" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Panjang Asal, L₀ (m):</label>
          <input id="ci-l" type="number" step="0.1" value="4.0" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Young Modulus, Y (Pa):</label>
          <input id="ci-y" type="number" step="1e9" value="200000000000" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
        <div>
          <label class="block text-slate-400">Luas Keratan Rentas, A (m²):</label>
          <input id="ci-a" type="number" step="0.0001" value="0.008" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2">
        </div>
      `;
      break;
  }
  inputsBox.innerHTML = html;
}

function executeCalc() {
  const sel = document.getElementById('calc-tool-select').value;
  const resultBox = document.getElementById('calc-result-box');
  const resultVal = document.getElementById('calc-result-val');

  let res = '';
  if (sel === 'shm_period') {
    const m = parseFloat(document.getElementById('ci-m').value);
    const k = parseFloat(document.getElementById('ci-k').value);
    const T = 2 * Math.PI * Math.sqrt(m / k);
    res = `T = ${T.toFixed(4)} saat (s)`;
  } else if (sel === 'pendulum_period') {
    const L = parseFloat(document.getElementById('ci-l').value);
    const g = parseFloat(document.getElementById('ci-g').value);
    const T = 2 * Math.PI * Math.sqrt(L / g);
    res = `T = ${T.toFixed(4)} saat (s)`;
  } else if (sel === 'centripetal') {
    const m = parseFloat(document.getElementById('ci-m').value);
    const v = parseFloat(document.getElementById('ci-v').value);
    const r = parseFloat(document.getElementById('ci-r').value);
    const fc = (m * v * v) / r;
    res = `Fc = ${fc.toFixed(2)} N`;
  } else if (sel === 'heat_mc') {
    const m = parseFloat(document.getElementById('ci-m').value);
    const c = parseFloat(document.getElementById('ci-c').value);
    const dt = parseFloat(document.getElementById('ci-dt').value);
    const q = m * c * dt;
    res = `Q = ${q.toLocaleString()} Joules (${(q / 1000).toFixed(2)} kJ)`;
  } else if (sel === 'string_wave') {
    const F = parseFloat(document.getElementById('ci-f').value);
    const mu = parseFloat(document.getElementById('ci-mu').value);
    const v = Math.sqrt(F / mu);
    res = `v = ${v.toFixed(2)} m/s`;
  } else if (sel === 'young_modulus') {
    const F = parseFloat(document.getElementById('ci-f').value);
    const L = parseFloat(document.getElementById('ci-l').value);
    const Y = parseFloat(document.getElementById('ci-y').value);
    const A = parseFloat(document.getElementById('ci-a').value);
    const dL = (F * L) / (Y * A);
    res = `ΔL = ${dL.toExponential(3)} m (${(dL * 1000).toFixed(3)} mm)`;
  }

  resultVal.textContent = res;
  resultBox.classList.remove('hidden');
}
