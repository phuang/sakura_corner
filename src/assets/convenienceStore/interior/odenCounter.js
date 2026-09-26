/**
 * 关东煮柜台 —— 独立资产。
 * - 北墙 x∈[6.0,7.3]（宽 1.3m），进深 0.55m，h≈1.0；木纹立面 + 品牌色带；
 * - 台面双汤锅：深色陶锅 + 琥珀色汤面；串签食材实例化斜插陈列（萝卜/鸡蛋/魔芋/鱼糕等）；
 * - 蒸汽微动：Sprite 软雾循环上升淡出（无描边，柔和不杂乱）。
 */

import * as THREE from 'three';
import { toon, glass } from '../../../core/materials.js';
import { woodPlankTexture } from '../../../core/textures.js';
import { addUpdater } from '../../../core/animationRegistry.js';

const FLOOR_Y = 0.15;
const X_A = 6.0, X_B = 7.3;      // 宽度范围（北墙）
const W = X_B - X_A;             // 1.3
const DEPTH = 0.55;
const Z_BACK = -4.32;            // 贴北墙内表面
const Z_FRONT = Z_BACK + DEPTH;  // -3.77
const H = 1.0;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 蒸汽软雾贴图（径向渐变白→透明） */
function steamTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.32)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createOdenCounter() {
  const group = new THREE.Group();
  group.name = 'odenCounter';

  const cx = (X_A + X_B) / 2;
  const zc = Z_BACK + DEPTH / 2;

  const bodyMat = toon('#f4f6f8');
  const woodMat = toon('#ffffff', { map: woodPlankTexture(79, '#a9805b', '#7c5a3d') });

  // —— 柜体 + 踢脚 ——
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H - 0.12, DEPTH), bodyMat);
  body.position.set(cx, FLOOR_Y + (H - 0.12) / 2 + 0.12, zc);
  group.add(body);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, DEPTH), toon('#5d636b'));
  kick.position.set(cx, FLOOR_Y + 0.06, zc);
  group.add(kick);

  // —— 顾客侧（+Z）木纹立面 + 品牌色带 ——
  const front = new THREE.Mesh(new THREE.BoxGeometry(W - 0.08, H - 0.24, 0.03), woodMat);
  front.position.set(cx, FLOOR_Y + H / 2, Z_FRONT + 0.005);
  group.add(front);
  const band = new THREE.Mesh(new THREE.BoxGeometry(W - 0.08, 0.07, 0.034), toon('#57ab96'));
  band.position.set(cx, FLOOR_Y + H - 0.26, Z_FRONT + 0.005);
  group.add(band);

  // —— 台面（微出挑）——
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, 0.05, DEPTH + 0.1), toon('#e9ebe6'));
  slab.position.set(cx, FLOOR_Y + H - 0.025, zc);
  group.add(slab);

  // —— 双汤锅（深色陶锅 + 琥珀色汤面）——
  const potMat = toon('#4a443e');
  const brothMat = toon('#8a5a2b', { emissive: '#5a3a16', emissiveIntensity: 0.25 });
  const POTS = [X_A + 0.38, X_B - 0.38]; // 两锅中心 x
  for (const px of POTS) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.16, 24), potMat);
    pot.position.set(px, FLOOR_Y + H + 0.08, zc - 0.03);
    group.add(pot);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 8, 24), potMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(px, FLOOR_Y + H + 0.16, zc - 0.03);
    group.add(rim);
    const broth = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 24), brothMat);
    broth.position.set(px, FLOOR_Y + H + 0.135, zc - 0.03);
    group.add(broth);
  }

  // —— 串签食材（签杆 + 食材块，实例化斜插）——
  const r = rng(467);
  const stickItems = []; // {x,y,z,rotX,rotZ,len}
  const foodItems = [];   // {x,y,z,s,color}

  const FOOD_COLORS = ['#f5efe0', '#e8c15a', '#4a4238', '#f0b7ac', '#f7f5ef', '#d97b6c'];
  for (const px of POTS) {
    for (let i = 0; i < 9; i++) {
      const ang = r() * Math.PI * 2;
      const rad = 0.03 + r() * 0.08; // 锅内偏移半径
      const sx = px + Math.cos(ang) * rad;
      const sz = zc - 0.03 + Math.sin(ang) * rad;
      const tiltX = (r() - 0.5) * 0.7;   // 斜插倾角
      const tiltZ = (r() - 0.5) * 0.7;
      const len = 0.24 + r() * 0.1;
      const baseY = FLOOR_Y + H + 0.13;

      // 签杆（细木签，轴沿 Y 后倾斜）
      stickItems.push({ x: sx, y: baseY + len / 2 - 0.04, z: sz, rotX: tiltX, rotZ: tiltZ, len });

      // 食材块（签杆下端，浸于汤面附近）
      const fs = 0.035 + r() * 0.02;
      foodItems.push({ x: sx - Math.sin(tiltZ) * 0.1, y: baseY - 0.02, z: sz + Math.sin(tiltX) * 0.1, s: fs, color: FOOD_COLORS[Math.floor(r() * FOOD_COLORS.length)] });
    }
  }

  const stickGeo = new THREE.CylinderGeometry(0.005, 0.004, 1, 6);
  const stickMesh = new THREE.InstancedMesh(stickGeo, toon('#c9a878'), stickItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const s = new THREE.Vector3(), p = new THREE.Vector3();
    stickItems.forEach((it, i) => {
      e.set(it.rotX, 0, it.rotZ);
      q.setFromEuler(e);
      p.set(it.x, it.y, it.z); s.set(1, it.len, 1);
      m4.compose(p, q, s);
      stickMesh.setMatrixAt(i, m4);
    });
    stickMesh.instanceMatrix.needsUpdate = true;
  }
  group.add(stickMesh);

  const foodGeo = new THREE.SphereGeometry(1, 10, 8);
  const foodMesh = new THREE.InstancedMesh(foodGeo, toon('#ffffff'), foodItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    foodItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.s * 2, it.s * 1.5, it.s * 2);
      m4.compose(p, q, s);
      foodMesh.setMatrixAt(i, m4);
      col.set(it.color);
      foodMesh.setColorAt(i, col);
    });
    foodMesh.instanceMatrix.needsUpdate = true;
    if (foodMesh.instanceColor) foodMesh.instanceColor.needsUpdate = true;
  }
  group.add(foodMesh);

  // —— 前侧低玻璃挡板（防飞沫，通透）——
  const guard = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.24, 0.015), glass({ tint: 0xdceef5, opacity: 0.13 }));
  guard.position.set(cx, FLOOR_Y + H + 0.17, Z_FRONT + 0.02);
  group.add(guard);

  // —— 蒸汽微动（Sprite 软雾循环）——
  const steamTex = steamTexture();
  const puffs = [];
  for (const px of POTS) {
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.position.set(px + (r() - 0.5) * 0.12, FLOOR_Y + H + 0.2, zc - 0.03 + (r() - 0.5) * 0.1);
      group.add(sp);
      puffs.push({ sp, phase: r(), speed: 0.28 + r() * 0.14, driftX: (r() - 0.5) * 0.3 });
    }
  }

  addUpdater((t) => {
    for (const pf of puffs) {
      const cyc = ((t * pf.speed + pf.phase) % 1);          // 0→1 循环
      const yTop = FLOOR_Y + H + 0.24;
      pf.sp.position.y = yTop + cyc * 0.5;
      const sc = 0.14 + cyc * 0.3;
      pf.sp.scale.set(sc, sc, 1);
      pf.sp.position.x += Math.sin(t * 0.8 + pf.phase * 9) * 0.0006 * (pf.driftX > 0 ? 1 : -1);
      // 淡入 → 淡出（前 25% 渐显，其后渐隐）
      const op = cyc < 0.25 ? cyc / 0.25 : 1 - (cyc - 0.25) / 0.75;
      pf.sp.material.opacity = Math.max(0, op) * 0.3;
    }
  });

  return group;
}
