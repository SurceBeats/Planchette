import React, { useRef, useEffect, useCallback } from "react";

const DURATION = 2000;

// Every effect receives (ctx, w, h, progress, s) where:
//   w, h = CSS pixel dimensions of the board
//   s    = scale factor (1.0 at ~500px tall, ~0.5 on small mobile)

// --- Effect 1: Smoke Wisps ---
function smokeWisps(ctx, w, h, progress, s) {
  const count = 25;
  for (let i = 0; i < count; i++) {
    const seed = i / count;
    const life = progress * 1.4 - seed * 0.5;
    if (life < 0 || life > 1) continue;

    const x = w * (0.2 + seed * 0.6) + Math.sin(life * Math.PI * 3 + seed * 20) * 40 * s;
    const y = h * (1.0 - life * 0.9);
    const alpha = Math.sin(life * Math.PI) * 0.35;
    const radius = (8 + life * 25) * s;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(251, 191, 36, ${alpha})`);
    grad.addColorStop(0.5, `rgba(217, 119, 6, ${alpha * 0.4})`);
    grad.addColorStop(1, "rgba(217, 119, 6, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Effect 2: Static / Interference ---
function staticInterference(ctx, w, h, progress, s) {
  const intensity = Math.sin(progress * Math.PI);

  const cellSize = Math.max(2, Math.round(3 * s));
  const cols = Math.ceil(w / cellSize);
  const rows = Math.ceil(h / cellSize);
  const threshold = 0.92 * (1 - intensity * 0.5);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > threshold) {
        const v = Math.random() * 180;
        const a = intensity * 0.3 * Math.random();
        ctx.fillStyle = `rgba(${Math.floor(v * 0.9)}, ${Math.floor(v * 0.7)}, ${Math.floor(v * 0.3)}, ${a})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  const scanCount = 5 + Math.floor(intensity * 10);
  for (let i = 0; i < scanCount; i++) {
    const sy = Math.random() * h;
    const sh = (1 + Math.random() * 3) * s;
    ctx.fillStyle = `rgba(251, 191, 36, ${intensity * 0.12 * Math.random()})`;
    ctx.fillRect(0, sy, w, sh);
  }

  const bars = Math.floor(intensity * 4);
  for (let b = 0; b < bars; b++) {
    const by = Math.random() * h;
    const bh = (2 + Math.random() * 8) * s;
    ctx.fillStyle = `rgba(217, 119, 6, ${intensity * 0.08})`;
    ctx.fillRect(0, by, w, bh);
  }
}

// --- Effect 3: Shadow Figure ---
let _shadowSeed = 0.5;
function shadowFigureInit() {
  _shadowSeed = 0.2 + Math.random() * 0.6;
}
function shadowFigure(ctx, w, h, progress, s) {
  const cx = w * _shadowSeed;
  const cy = h * 0.45;

  const fade = progress < 0.25 ? progress / 0.25 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
  const alpha = fade * 0.5;

  const headR = Math.min(w, h) * 0.09;

  const mistGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, headR * 6);
  mistGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.3})`);
  mistGrad.addColorStop(0.6, `rgba(0, 0, 0, ${alpha * 0.1})`);
  mistGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, headR * 6, 0, Math.PI * 2);
  ctx.fill();

  const headGrad = ctx.createRadialGradient(cx, cy - headR * 1.5, 0, cx, cy - headR * 1.5, headR * 2.2);
  headGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  headGrad.addColorStop(0.7, `rgba(0, 0, 0, ${alpha * 0.4})`);
  headGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - headR * 1.5, headR * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createRadialGradient(cx, cy + headR, 0, cx, cy + headR, headR * 4);
  bodyGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.9})`);
  bodyGrad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.35})`);
  bodyGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR, headR * 3.5, headR * 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (fade > 0.2) {
    const eyeFade = Math.min((fade - 0.2) / 0.3, 1);
    const pulse = 0.6 + 0.4 * Math.sin(progress * Math.PI * 8);
    const flicker = Math.random() > 0.1 ? 1 : 0.2;
    const eyeAlpha = eyeFade * 0.7 * pulse * flicker;

    const eyeSpacing = headR * 0.45;
    const eyeY = cy - headR * 1.6;
    const eyeR = Math.max(3, 6 * s);

    [cx - eyeSpacing, cx + eyeSpacing].forEach((ex) => {
      const outerGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeR * 4);
      outerGlow.addColorStop(0, `rgba(251, 191, 36, ${eyeAlpha * 0.35})`);
      outerGlow.addColorStop(0.5, `rgba(217, 119, 6, ${eyeAlpha * 0.1})`);
      outerGlow.addColorStop(1, "rgba(217, 119, 6, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeR * 4, 0, Math.PI * 2);
      ctx.fill();

      const coreGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeR);
      coreGlow.addColorStop(0, `rgba(255, 251, 235, ${eyeAlpha * 0.9})`);
      coreGlow.addColorStop(0.4, `rgba(251, 191, 36, ${eyeAlpha * 0.6})`);
      coreGlow.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// --- Effect 4: Spirit Orbs ---
function spiritOrbs(ctx, w, h, progress, s) {
  const orbCount = 4;
  const saved = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < orbCount; i++) {
    const seed = i * 137.508;
    const t = progress;
    const x = w * (0.15 + (i / orbCount) * 0.7) + Math.sin(t * Math.PI * 2 + seed) * w * 0.08;
    const y = h * (0.3 + Math.sin(t * Math.PI + seed * 0.7) * 0.25);
    const alpha = Math.sin(t * Math.PI) * 0.5;
    const radius = (15 + Math.sin(t * Math.PI * 3 + seed) * 5) * s;

    const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    outerGrad.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.2})`);
    outerGrad.addColorStop(0.5, `rgba(217, 119, 6, ${alpha * 0.05})`);
    outerGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    innerGrad.addColorStop(0, `rgba(255, 251, 235, ${alpha * 0.7})`);
    innerGrad.addColorStop(0.4, `rgba(251, 191, 36, ${alpha * 0.4})`);
    innerGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = saved;
}

// --- Effect 5: Scratches ---
function scratches(ctx, w, h, progress, s) {
  const scratchCount = 3;
  const drawProgress = Math.min(progress * 1.6, 1);
  const fadeOut = progress > 0.7 ? (1 - progress) / 0.3 : 1;

  for (let i = 0; i < scratchCount; i++) {
    const seed = i * 97.3;
    const startX = w * (0.15 + ((Math.sin(seed) + 1) / 2) * 0.7);
    const startY = h * (0.1 + ((Math.cos(seed * 1.3) + 1) / 2) * 0.3);
    const endX = startX + (Math.sin(seed * 2.1) > 0 ? 1 : -1) * w * (0.15 + Math.abs(Math.sin(seed * 0.7)) * 0.2);
    const endY = startY + h * (0.3 + Math.abs(Math.cos(seed * 1.7)) * 0.25);

    const segments = 12;
    const drawn = Math.floor(segments * drawProgress);
    if (drawn < 1) continue;

    const jitterX = 6 * s;
    const jitterY = 4 * s;

    ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 * fadeOut})`;
    ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.lineCap = "round";
    ctx.shadowColor = `rgba(251, 191, 36, ${0.3 * fadeOut})`;
    ctx.shadowBlur = 6 * s;
    ctx.beginPath();

    for (let j = 0; j <= drawn; j++) {
      const t = j / segments;
      const px = startX + (endX - startX) * t + Math.sin(t * 15 + seed) * jitterX;
      const py = startY + (endY - startY) * t + Math.cos(t * 12 + seed * 1.5) * jitterY;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(217, 119, 6, ${0.25 * fadeOut})`;
    ctx.lineWidth = Math.max(0.5, 0.8 * s);
    ctx.beginPath();
    for (let j = 0; j <= drawn; j++) {
      const t = j / segments;
      const px = startX + (endX - startX) * t + Math.sin(t * 15 + seed) * jitterX + 3 * s;
      const py = startY + (endY - startY) * t + Math.cos(t * 12 + seed * 1.5) * jitterY + 2 * s;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

const EFFECTS = [{ fn: smokeWisps }, { fn: staticInterference }, { fn: shadowFigure, init: shadowFigureInit }, { fn: spiritOrbs }, { fn: scratches }];

export default function PoltergeistCanvas({ trigger }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const activeRef = useRef(false);

  const runEffect = useCallback((effectFn) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    const s = Math.min(cssW, cssH) / 500;

    activeRef.current = true;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, cssW, cssH);
      effectFn(ctx, cssW, cssH, progress, s);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, cssW, cssH);
        activeRef.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (trigger < 1) return;
    if (activeRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }

    const idx = Math.floor(Math.random() * EFFECTS.length);
    const effect = EFFECTS[idx];
    if (effect.init) effect.init();
    runEffect(effect.fn);
  }, [trigger, runEffect]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" style={{ borderRadius: "inherit" }} />;
}
