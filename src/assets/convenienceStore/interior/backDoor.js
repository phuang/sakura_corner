/**
 * 后场门 —— 独立资产。
 * - 北墙 x∈[5.0,6.0] 空档（便当陈列与关东煮柜台之间）；
 * - 钢制后门：金属门框 + 钢板门扇 + 横向推杆（双支撑）+ 观察窗（玻璃）；
 * - 铰链板 ×3、底部踢脚护板细节。
 * 基准：室内地面顶面 y=0.15（FLOOR_Y）。
 */

import * as THREE from 'three';
import { toon, metal, glass } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const Z_WALL = -4.32;   // 北墙内表面
const X_A = 5.0, X_B = 6.0; // 门洞范围（与两侧陈列柜衔接）
const DOOR_W = 0.92, DOOR_H = 2.1;

export function createBackDoor() {
  const group = new THREE.Group();
  group.name = 'backDoor';

  const frameMat = metal(0x6d737b, 0.5, 0.7);
  const steelMat = toon('#c8ccd2');   // 钢板门扇（浅灰金属感）
  const darkMat = toon('#4a5058');

  const cx = (X_A + X_B) / 2;         // 5.5
  const doorZ = Z_WALL + 0.035;       // 门扇贴墙内退

  // —— 金属门框（四面）——
  for (const s of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.08, DOOR_H + 0.08, 0.1), frameMat);
    jamb.position.set(cx + s * (DOOR_W / 2 + 0.04), FLOOR_Y + (DOOR_H + 0.08) / 2 - 0.04, Z_WALL + 0.05);
    group.add(jamb);
  }
  const head = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.16, 0.08, 0.1), frameMat);
  head.position.set(cx, FLOOR_Y + DOOR_H + 0.04, Z_WALL + 0.05);
  group.add(head);

  // —— 钢板门扇 ——
  const door = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.02, DOOR_H - 0.02, 0.05), steelMat);
  door.position.set(cx, FLOOR_Y + (DOOR_H - 0.02) / 2, doorZ);
  group.add(door);

  // —— 观察窗（上部，玻璃 + 金属压框）——
  const winW = 0.34, winH = 0.3;
  const winY = FLOOR_Y + DOOR_H - 0.55;
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.08, winH + 0.08, 0.02), frameMat);
  winFrame.position.set(cx, winY, doorZ + 0.03);
  group.add(winFrame);
  const winGlass = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.015), glass({ tint: 0xcfe4ec, opacity: 0.3 }));
  winGlass.position.set(cx, winY, doorZ + 0.032);
  group.add(winGlass);

  // —— 横向推杆（双支撑，中部）——
  const barMat = metal(0x9aa1a8, 0.35, 0.85);
  const barY = FLOOR_Y + 1.0;
  const pushBar = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.24, 0.06, 0.04), barMat);
  pushBar.position.set(cx, barY, doorZ + 0.05);
  group.add(pushBar);
  for (const s of [-1, 1]) {
    const support = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.04), barMat);
    support.position.set(cx + s * (DOOR_W / 2 - 0.2), barY - 0.13, doorZ + 0.05);
    group.add(support);
  }

  // —— 铰链板 ×3（西侧）——
  for (let i = 0; i < 3; i++) {
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.02), darkMat);
    hinge.position.set(cx - DOOR_W / 2 + 0.02, FLOOR_Y + 0.35 + i * 0.75, doorZ + 0.03);
    group.add(hinge);
  }

  // —— 底部踢脚护板（金属压条）——
  const kick = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.06, 0.18, 0.015), frameMat);
  kick.position.set(cx, FLOOR_Y + 0.09, doorZ + 0.032);
  group.add(kick);

  // —— 门把手（推杆下方小锁具）——
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.03), darkMat);
  lock.position.set(cx + DOOR_W / 2 - 0.14, barY - 0.28, doorZ + 0.045);
  group.add(lock);

  return group;
}
