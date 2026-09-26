/**
 * 咖啡机 —— 独立资产。
 * - 低柜（0.55×0.45，h≈0.8）+ 台面；
 * - 不锈钢机身：冲煮头 + 双出水嘴、按钮阵列（含发光指示）、滴水盘格栅、杯架与叠放纸杯；
 * - 金属材质写实（metal() 依赖 PMREM 环境反射），面板深色嵌件。
 * 位置：(7.4, 1.2)，正面朝 +Z（入口方向）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const CX = 7.4, CZ = 1.2;        // 柜体中心
const CAB_W = 0.55, CAB_D = 0.45, CAB_H = 0.8;

export function createCoffeeMachine() {
  const group = new THREE.Group();
  group.name = 'coffeeMachine';

  const cabMat = toon('#f2f3f0');      // 柜体暖白
  const slabMat = toon('#e6e4dc');     // 台面
  const steel = metal(0xb8bec6, 0.32, 0.9);   // 不锈钢机身
  const darkPanel = toon('#3a4048');    // 深色面板嵌件
  const trayMat = metal(0x8d949b, 0.45, 0.75);

  // —— 低柜 ——
  const cab = new THREE.Mesh(new THREE.BoxGeometry(CAB_W - 0.03, CAB_H - 0.12, CAB_D - 0.03), cabMat);
  cab.position.set(CX, FLOOR_Y + (CAB_H - 0.12) / 2 + 0.12, CZ);
  group.add(cab);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(CAB_W, 0.12, CAB_D), toon('#5d636b'));
  kick.position.set(CX, FLOOR_Y + 0.06, CZ);
  group.add(kick);

  // 柜门缝（竖向）+ 拉手
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, CAB_H - 0.24, 0.012), toon('#c9ccd0'));
  seam.position.set(CX, FLOOR_Y + CAB_H / 2, CZ + CAB_D / 2 - 0.006);
  group.add(seam);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), metal(0x9aa1a8, 0.35, 0.85));
  handle.position.set(CX - 0.07, FLOOR_Y + CAB_H - 0.22, CZ + CAB_D / 2 + 0.01);
  group.add(handle);

  // —— 台面（微出挑）——
  const slab = new THREE.Mesh(new THREE.BoxGeometry(CAB_W + 0.06, 0.045, CAB_D + 0.06), slabMat);
  slab.position.set(CX, FLOOR_Y + CAB_H - 0.022, CZ);
  group.add(slab);

  // —— 咖啡机机身（不锈钢，朝 +Z）——
  const M_W = 0.34, M_D = 0.26, M_H = 0.3;
  const mBaseY = FLOOR_Y + CAB_H;          // 台面顶
  const mz = CZ - 0.05;                     // 机身略靠后

  const body = new THREE.Mesh(new THREE.BoxGeometry(M_W, M_H, M_D), steel);
  body.position.set(CX, mBaseY + M_H / 2, mz);
  group.add(body);

  // 顶部深色嵌件（水箱盖）
  const topInset = new THREE.Mesh(new THREE.BoxGeometry(M_W - 0.06, 0.03, M_D - 0.08), darkPanel);
  topInset.position.set(CX, mBaseY + M_H + 0.012, mz);
  group.add(topInset);

  // 正面深色面板（按钮区）
  const face = new THREE.Mesh(new THREE.BoxGeometry(M_W - 0.08, 0.14, 0.02), darkPanel);
  face.position.set(CX, mBaseY + M_H - 0.13, mz + M_D / 2 - 0.005);
  group.add(face);

  // 按钮阵列（小圆柱，含发光指示）
  const btnMat = toon('#c8ccd2');
  const ledBtnMat = toon('#ffffff', { emissive: '#ffd9a0', emissiveIntensity: 1.4 });
  for (let i = 0; i < 5; i++) {
    const bx = CX - 0.1 + i * 0.05;
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 10), i === 0 ? ledBtnMat : btnMat);
    btn.rotation.x = Math.PI / 2; // 轴朝 +Z
    btn.position.set(bx, mBaseY + M_H - 0.13, mz + M_D / 2 + 0.006);
    group.add(btn);
  }

  // —— 冲煮头（正面中部凸出块体）+ 双出水嘴 ——
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.07), steel);
  head.position.set(CX, mBaseY + M_H - 0.32, mz + M_D / 2 + 0.02);
  group.add(head);

  for (const dx of [-0.035, 0.035]) {
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.045, 10), metal(0x6d747c, 0.4, 0.8));
    spout.position.set(CX + dx, mBaseY + M_H - 0.395, mz + M_D / 2 + 0.03);
    group.add(spout);
  }

  // —— 滴水盘（金属格栅）——
  const tray = new THREE.Mesh(new THREE.BoxGeometry(M_W - 0.1, 0.02, 0.1), trayMat);
  tray.position.set(CX, mBaseY + 0.01, mz + M_D / 2 - 0.03);
  group.add(tray);
  const grid = new THREE.Mesh(new THREE.BoxGeometry(M_W - 0.16, 0.008, 0.07), toon('#4c5158'));
  grid.position.set(CX, mBaseY + 0.022, mz + M_D / 2 - 0.03);
  group.add(grid);

  // —— 叠放纸杯 ×2（滴水盘旁）——
  for (let i = 0; i < 2; i++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.05, 14), toon('#f7f5ef'));
    cup.position.set(CX + 0.11, mBaseY + 0.045 + i * 0.048, mz + M_D / 2 - 0.03);
    group.add(cup);
  }

  return group;
}
