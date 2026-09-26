/**
 * 储物柜 —— 独立资产。
 * - 3×4 金属小柜（西墙南侧空档，z∈[1.0,2.5]）；
 * - 每门：通风孔阵列 + 锁孔/把手细节（程序纹理），逐门微差做旧。
 * 基准：室内地面顶面 y=0.15（FLOOR_Y）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const X_WALL = 2.18;      // 西墙内表面
const DEPTH = 0.45;       // 柜深（X）
const Z_A = 1.0, Z_B = 2.5; // 沿墙范围
const COLS = 3, ROWS = 4;
const HT = 1.8;           // 柜高

/** 柜门纹理：浅灰金属底 + 下部通风孔阵列 + 右上锁孔/把手 */
function doorTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 160;
  const ctx = c.getContext('2d');

  // 金属底（轻微明暗不均）
  ctx.fillStyle = '#c3c8cd';
  ctx.fillRect(0, 0, 128, 160);
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 128, y = Math.random() * 160;
    const v = 170 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgba(${v},${v + 3},${v + 8},0.25)`;
    ctx.fillRect(x, y, 2, 2);
  }

  // 通风孔阵列（下部，6×3 圆孔）
  ctx.fillStyle = 'rgba(74,80,88,0.9)';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      ctx.beginPath();
      ctx.arc(24 + col * 15, 118 + row * 13, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 锁孔（右上：圆孔 + 竖槽）+ 把手条
  ctx.fillStyle = 'rgba(58,64,72,0.95)';
  ctx.beginPath();
  ctx.arc(104, 34, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(102, 38, 4, 12);
  ctx.fillStyle = 'rgba(96,103,112,0.9)';
  ctx.fillRect(96, 58, 20, 7); // 把手

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createStorageLockers() {
  const group = new THREE.Group();
  group.name = 'storageLockers';

  const frameMat = metal(0x8d949b, 0.5, 0.7);
  const W = Z_B - Z_A;                 // 1.5（Z）
  const cellW = W / COLS;               // 0.5
  const cellH = (HT - 0.12) / ROWS;    // 每格高（含顶板余量）

  // —— 柜体框架：背板 + 侧板 + 层板/立柱 ——
  const backMat = toon('#aeb4ba');
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.03, HT, W), backMat);
  back.position.set(X_WALL + 0.015, FLOOR_Y + HT / 2, (Z_A + Z_B) / 2);
  group.add(back);

  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, HT, 0.03), frameMat);
    side.position.set(X_WALL + DEPTH / 2, FLOOR_Y + HT / 2, s === -1 ? Z_A : Z_B);
    group.add(side);
  }

  // —— 柜门 ×12（3 列 × 4 行，程序纹理逐门微差）——
  const doorGeo = new THREE.BoxGeometry(0.025, cellH - 0.03, cellW - 0.03);
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const door = new THREE.Mesh(doorGeo, toon('#ffffff', { map: doorTexture(611 + col * 13 + row) }));
      const zc = Z_A + cellW / 2 + col * cellW;
      const yc = FLOOR_Y + HT - 0.06 - (row + 0.5) * cellH; // 自顶向下排布
      door.position.set(X_WALL + DEPTH - 0.01, yc, zc);
      group.add(door);
    }
  }

  // —— 层板/立柱（门后结构，透过缝隙可见）——
  for (let row = 0; row <= ROWS; row++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(DEPTH - 0.04, 0.03, W), frameMat);
    shelf.position.set(X_WALL + DEPTH / 2, FLOOR_Y + HT - 0.06 - row * cellH, (Z_A + Z_B) / 2);
    group.add(shelf);
  }

  // —— 顶板 + 底座 ——
  const top = new THREE.Mesh(new THREE.BoxGeometry(DEPTH + 0.04, 0.05, W + 0.06), frameMat);
  top.position.set(X_WALL + DEPTH / 2, FLOOR_Y + HT + 0.025, (Z_A + Z_B) / 2);
  group.add(top);

  const base = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, 0.06, W), toon('#3a4048'));
  base.position.set(X_WALL + DEPTH / 2, FLOOR_Y + 0.03, (Z_A + Z_B) / 2);
  group.add(base);

  return group;
}
