/**
 * 车站候车亭 —— 独立资产。
 * - 平顶雨棚（前缘收口）+ 钢立柱 ×2；
 * - 木长椅（板条 + 金属腿，木纹纹理）；
 * - 时刻表牌（立杆 + 抽象信息面板）；
 * - 站名牌（悬挂于雨棚前缘，色块标识无文字）。
 * 位于站台 B1 区块（x≤-1，避让小巷），平台顶面 y=0.45。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { woodPlankTexture, posterTexture } from '../../core/textures.js';

const TOP_Y = 0.45; // 站台顶面

export function createShelter() {
  const group = new THREE.Group();
  group.name = 'shelter';

  // —— 雨棚（平顶 + 前缘收口）——
  const canopyMat = toon('#c9d0d4');
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.13, 2.9), canopyMat);
  canopy.position.set(-3.5, TOP_Y + 2.62, -4.0);
  canopy.castShadow = true;
  group.add(canopy);

  // 前缘收口条（深灰）
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(4.64, 0.1, 0.08), toon('#8f979d'));
  fascia.position.set(-3.5, TOP_Y + 2.53, -2.6);
  group.add(fascia);

  // —— 钢立柱 ×2（前角）——
  const colGeo = new THREE.CylinderGeometry(0.075, 0.085, 2.55, 14);
  const colMat = metal(0x9aa1a8, 0.42, 0.8);
  for (const x of [-5.7, -1.3]) {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(x, TOP_Y + 1.275, -2.75);
    col.castShadow = true;
    group.add(col);
    // 柱脚底板
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.3), metal(0x8a9198));
    plate.position.set(x, TOP_Y + 0.02, -2.75);
    group.add(plate);
  }

  // —— 木长椅（板条座面 + 金属腿）——
  const bench = new THREE.Group();
  const woodMat = toon('#ffffff', { map: woodPlankTexture(13) });
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.16), woodMat);
    slat.position.set(0, 0.42 + i * 0.001, -0.17 + i * 0.13);
    slat.castShadow = true;
    bench.add(slat);
  }
  // 金属腿 ×2
  const legGeo = new THREE.BoxGeometry(0.06, 0.42, 0.5);
  for (const x of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(legGeo, metal(0x70767d, 0.5, 0.7));
    leg.position.set(x, 0.21, 0);
    bench.add(leg);
  }
  // 扶手横杆
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.7, 10), metal(0x8a9198));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, 0.62, -0.24);
  bench.add(rail);

  bench.position.set(-3.5, TOP_Y, -4.35); // 雨棚下、靠轨道侧
  group.add(bench);

  // —— 时刻表牌（立杆 + 面板，面向街面）——
  const board = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.75, 12), metal(0x8a9198));
  pole.position.y = 0.875;
  board.add(pole);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.25, 0.06), toon('#f4f1ea'));
  frame.position.set(0, 1.35, 0);
  board.add(frame);
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.82, 1.12),
    toon('#ffffff', { map: posterTexture(71, ['#eef4fb', '#fdeef0', '#eaf6ec']) })
  );
  paper.position.set(0, 1.35, 0.035);
  board.add(paper);
  // 边框压条
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.97, 0.08, 0.07), toon('#c26d5e'));
  trim.position.set(0, 1.98, 0);
  board.add(trim);

  board.position.set(-1.65, TOP_Y, -2.55); // 雨棚东南侧（小巷口旁），面向主路 A
  group.add(board);

  // —— 站名牌（悬挂于雨棚前缘，色块标识）——
  const sign = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.07), toon('#fbfaf6'));
  sign.add(panel);
  // 抽象站名色块（无文字）：青绿 + 暖红双条
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), toon('#7fb3a0'));
  bar1.position.set(-0.18, 0.06, 0.04);
  sign.add(bar1);
  const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.02), toon('#cf7d6a'));
  bar2.position.set(0.28, -0.09, 0.04);
  sign.add(bar2);
  // 吊杆 ×2
  const hangerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8);
  for (const x of [-0.35, 0.35]) {
    const h = new THREE.Mesh(hangerGeo, metal(0x7d848b));
    h.position.set(x, 0.36, 0);
    sign.add(h);
  }

  sign.position.set(-3.5, TOP_Y + 2.18, -2.62); // 雨棚前缘下方
  group.add(sign);

  return group;
}
