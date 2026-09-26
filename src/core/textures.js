/**
 * 程序化纹理工厂 —— 无外部图片依赖，全部 CanvasTexture。
 * 提供：沥青 / 混凝土 / 树皮 / 瓷砖地面 / 木板 / 抽象海报 / 磨损污渍叠加层。
 * 所有纹理使用固定种子随机数，保证每次加载画面一致。
 */

import * as THREE from 'three';

/** mulberry32 种子随机数 */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}

function toTexture(canvas, repeatX = 1, repeatY = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 8;
  return t;
}

/** 沥青路面：深灰噪点 + 骨料颗粒 + 轮胎磨痕 + 细微裂缝 */
export function asphaltTexture(seed = 7) {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = '#4b4e53';
  ctx.fillRect(0, 0, size, size);
  // 细骨料噪点
  for (let i = 0; i < 26000; i++) {
    const x = r() * size, y = r() * size;
    const v = 58 + Math.floor(r() * 46);
    ctx.fillStyle = `rgba(${v},${v + 2},${v + 6},${0.16 + r() * 0.2})`;
    ctx.fillRect(x, y, 1 + r() * 1.6, 1 + r() * 1.6);
  }
  // 轮胎磨痕（纵向暗带）
  for (let i = 0; i < 5; i++) {
    const x = r() * size;
    const g = ctx.createLinearGradient(x - 26, 0, x + 26, 0);
    g.addColorStop(0, 'rgba(30,31,34,0)');
    g.addColorStop(0.5, `rgba(30,31,34,${0.10 + r() * 0.08})`);
    g.addColorStop(1, 'rgba(30,31,34,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 26, 0, 52, size);
  }
  // 细微裂缝（随机游走折线）
  ctx.strokeStyle = 'rgba(28,29,32,0.5)';
  for (let i = 0; i < 7; i++) {
    let x = r() * size, y = r() * size;
    ctx.lineWidth = 0.6 + r();
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 14 + Math.floor(r() * 20);
    for (let s = 0; s < steps; s++) {
      x += (r() - 0.5) * 26; y += r() * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return toTexture(c, 3, 3);
}

/** 混凝土：浅灰 + 斑驳污渍 + 细颗粒（站台/路缘/墙体） */
export function concreteTexture(seed = 11, base = '#c9c6bd') {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {
    const x = r() * size, y = r() * size;
    const v = r();
    ctx.fillStyle = `rgba(${v > 0.5 ? 245 : 120},${v > 0.5 ? 244 : 118},${v > 0.5 ? 240 : 116},${0.05 + r() * 0.09})`;
    ctx.fillRect(x, y, 1 + r() * 2, 1 + r() * 2);
  }
  // 水渍/风化斑
  for (let i = 0; i < 14; i++) {
    const x = r() * size, y = r() * size, rad = 30 + r() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(120,116,108,${0.05 + r() * 0.07})`);
    g.addColorStop(1, 'rgba(120,116,108,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  return toTexture(c, 2, 2);
}

/** 树皮：纵向波浪纹理 + 皮孔斑点（樱花树干） */
export function barkTexture(seed = 23, base = '#6f5b4a', streak = '#4c3d30') {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // 纵向波浪条纹（樱花树皮特征：细密纵裂）
  for (let i = 0; i < 130; i++) {
    const x0 = r() * size;
    const amp = 2 + r() * 5;
    const freq = 0.008 + r() * 0.012;
    ctx.strokeStyle = `rgba(${r() > 0.5 ? '76,61,48' : '122,103,84'},${0.25 + r() * 0.3})`;
    ctx.lineWidth = 1 + r() * 2.4;
    ctx.beginPath();
    for (let y = 0; y <= size; y += 6) {
      const x = x0 + Math.sin(y * freq * 6.28 + i) * amp;
      if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // 皮孔（横向小点）
  for (let i = 0; i < 420; i++) {
    const x = r() * size, y = r() * size;
    ctx.fillStyle = `rgba(96,78,62,${0.3 + r() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 1.4 + r() * 2.2, 0.8 + r(), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = toTexture(c, 2, 2);
  return t;
}

/** 室内瓷砖地面：浅色方砖 + 砖缝 + 每块亮度微差 */
export function tileFloorTexture(seed = 31) {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  const n = 8, cell = size / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = 236 + Math.floor(r() * 14);
      ctx.fillStyle = `rgb(${v},${v - 2},${v - 8})`;
      ctx.fillRect(i * cell, j * cell, cell, cell);
    }
  }
  // 砖缝
  ctx.strokeStyle = 'rgba(168,170,175,0.9)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell); ctx.stroke();
  }
  // 轻微污渍
  for (let i = 0; i < 10; i++) {
    const x = r() * size, y = r() * size, rad = 20 + r() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(150,148,142,0.06)');
    g.addColorStop(1, 'rgba(150,148,142,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  return toTexture(c, 3, 3);
}

/** 木板：横向板条 + 木纹（长椅/柜台立面） */
export function woodPlankTexture(seed = 41, base = '#a9805b', dark = '#7c5a3d') {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  // 木纹（横向波浪线）
  for (let i = 0; i < 90; i++) {
    const y0 = r() * size;
    ctx.strokeStyle = `rgba(${r() > 0.5 ? '124,90,61' : '178,138,102'},${0.18 + r() * 0.2})`;
    ctx.lineWidth = 0.8 + r() * 1.6;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const y = y0 + Math.sin(x * 0.02 + i * 3.7) * 3 + Math.sin(x * 0.11 + i) * 1.4;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // 板缝（纵向）
  ctx.strokeStyle = `rgba(${dark},0.55)`;
  for (let i = 1; i < 4; i++) {
    const x = (size / 4) * i + (r() - 0.5) * 6;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (r() - 0.5) * 8, size); ctx.stroke();
  }
  // 节疤
  for (let i = 0; i < 6; i++) {
    const x = r() * size, y = r() * size;
    ctx.strokeStyle = 'rgba(110,78,52,0.5)';
    for (let k = 3; k <= 9; k += 2) {
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, k * 1.6, k, 0.4, 0, Math.PI * 2); ctx.stroke();
    }
  }
  return toTexture(c, 1, 1);
}

/** 抽象海报（无文字）：柔和渐变底 + 几何色块，用于灯箱/公告栏 */
export function posterTexture(seed = 53, palette) {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  const cols = palette || ['#ffd9e0', '#fff3d6', '#d8ecff', '#e4f5dd'];
  // 渐变底
  const g = ctx.createLinearGradient(0, 0, size * (0.3 + r() * 0.7), size);
  g.addColorStop(0, cols[Math.floor(r() * cols.length)]);
  g.addColorStop(1, cols[Math.floor(r() * cols.length)]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // 几何色块（圆/弧/条）
  for (let i = 0; i < 5 + Math.floor(r() * 4); i++) {
    const col = cols[Math.floor(r() * cols.length)];
    ctx.globalAlpha = 0.35 + r() * 0.5;
    ctx.fillStyle = col;
    const kind = r();
    if (kind < 0.4) {
      ctx.beginPath();
      ctx.arc(r() * size, r() * size, 18 + r() * 60, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind < 0.7) {
      const x = r() * size, w = 30 + r() * 90;
      ctx.fillRect(x, 0, w, size);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, size * (0.4 + r() * 0.5));
      ctx.quadraticCurveTo(size / 2, size * (r()), size, size * (0.3 + r() * 0.6));
      ctx.lineTo(size, size); ctx.lineTo(0, size);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 磨损污渍叠加纹理（半透明，用于户外道具表面做旧） */
export function grimeOverlay(seed = 67) {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  const r = rng(seed);
  ctx.clearRect(0, 0, size, size);
  // 底部积尘（下重上轻）
  const g = ctx.createLinearGradient(0, size * 0.45, 0, size);
  g.addColorStop(0, 'rgba(96,88,76,0)');
  g.addColorStop(1, `rgba(96,88,76,${0.22 + r() * 0.1})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // 随机污渍点
  for (let i = 0; i < 40; i++) {
    const x = r() * size, y = size * (0.35 + r() * 0.65), rad = 6 + r() * 26;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gg.addColorStop(0, `rgba(84,78,68,${0.10 + r() * 0.14})`);
    gg.addColorStop(1, 'rgba(84,78,68,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
