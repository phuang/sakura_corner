/**
 * 地面导视 —— 独立资产。
 * - 黄色引导线：入口 → 主通道（沿 x≈6.95 纵向）→ 中岛间横向通道（z≈-0.67），连续动线；
 * - 圆形站位标识 ×2（收银台前 / 关东煮柜台前），无文字。
 * 基准：室内地面顶面 y=0.15（FLOOR_Y）。
 */

import * as THREE from 'three';
import { toon } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const LINE_H = 0.012;
const LINE_W = 0.14;

export function createFloorGuide() {
  const group = new THREE.Group();
  group.name = 'floorGuide';

  const yellowMat = toon('#f0c04a'); // 与站台盲道同色系，店内导视黄

  /** 引导线段（沿 X 或 Z） */
  function line(len, x, z, alongX) {
    const geo = new THREE.BoxGeometry(alongX ? len : LINE_W, LINE_H, alongX ? LINE_W : len);
    const m = new THREE.Mesh(geo, yellowMat);
    m.position.set(x, FLOOR_Y + LINE_H / 2 - 0.004, z);
    group.add(m);
  }

  // —— 入口引导段（自动门内侧，x∈[6.95] 纵向：z 2.5 → -0.67）——
  line(3.17, 6.95, (2.5 + -0.67) / 2, false);

  // —— 中岛间横向通道段（z≈-0.67：x 3.2 → 6.95）——
  line(3.75, (3.2 + 6.95) / 2, -0.67, true);

  // —— 圆形站位标识 ×2 ——
  function standSpot(x, z) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, LINE_H, 24), yellowMat);
    disc.position.set(x, FLOOR_Y + LINE_H / 2 - 0.004, z);
    group.add(disc);

    // 内圈压线（深黄环，增强标识感）
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 24), toon('#d9a832'));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, FLOOR_Y + LINE_H - 0.002, z);
    group.add(ring);
  }

  // 收银台前顾客站位（杂志架与收银台之间）
  standSpot(7.45, 2.15);
  // 关东煮柜台前取餐位
  standSpot(6.65, -3.05);

  return group;
}
