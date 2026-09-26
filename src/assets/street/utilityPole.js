/**
 * 电线杆 ×2 —— 独立资产。
 * - 混凝土杆身（锥度，程序纹理）高 9m；
 * - 双横担（木质）+ 端部/中部瓷绝缘子；
 * - 杆身接线盒 + 顶部压盖细节。
 * 位置：A(-12, +0.6)、B(+10.15, +0.9)；架空电线仅连接 A↔B（见 powerWires.js）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { concreteTexture, woodPlankTexture } from '../../core/textures.js';

export const POLES = [
  { x: -12, z: 0.6 },   // A（西侧）
  { x: 12.2, z: 1.0 },  // B（东侧人行道，靠近路 B 西侧路缘）
];
export const ARM_YS = [8.3, 7.7];    // 双横担高度
export const INS_OFFSET = 1.15;      // 绝缘子自杆心横向偏移（沿横担端部）
export const INS_TOP = 0.17;         // 绝缘子顶面相对横担面的高差

const POLE_H = 9;

function makePole({ x, z }, seed) {
  const g = new THREE.Group();

  // —— 混凝土杆身（锥度）——
  const poleMat = toon('#ffffff', { map: concreteTexture(seed, '#c6c2b8') });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.125, POLE_H, 14), poleMat);
  pole.position.set(x, POLE_H / 2, z);
  pole.castShadow = true;
  g.add(pole);

  // —— 顶部压盖 ——
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.06, 14), toon('#a8a49a'));
  cap.position.set(x, POLE_H + 0.03, z);
  g.add(cap);

  // —— 双横担（木质）+ 端部金属夹板 ——
  const armMat = toon('#ffffff', { map: woodPlankTexture(seed + 12) });
  const clampMat = metal(0x7d848c, 0.5, 0.7);
  for (const ay of ARM_YS) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(INS_OFFSET * 2 + 0.3, 0.11, 0.07), armMat);
    arm.position.set(x, ay, z);
    arm.castShadow = true;
    g.add(arm);
    for (const s of [-1, 1]) {
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.09), clampMat);
      clamp.position.set(x + s * (INS_OFFSET + 0.12), ay, z);
      g.add(clamp);
    }
  }

  // —— 瓷绝缘子（横担两端，双盘叠装）——
  const ceramic = toon('#e8e2d4');
  for (const ay of ARM_YS) {
    for (const s of [-1, 1]) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.1, 10), ceramic);
      stack.position.set(x + s * INS_OFFSET, ay + 0.1 + 0.05, z);
      g.add(stack);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.024, 14), ceramic);
      disc.position.set(x + s * INS_OFFSET, ay + 0.1 + 0.11, z);
      g.add(disc);
    }
  }

  // —— 杆身接线盒（南面朝向街道）——
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.1), metal(0x5d646c, 0.5, 0.7));
  box.position.set(x, 4.6, z + 0.1);
  g.add(box);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 18), toon('#eef0f2'));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(x - 0.06, 4.72, z + 0.16);
  g.add(dial);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.004), toon('#c9564f'));
  needle.position.set(x - 0.06, 4.72, z + 0.168);
  needle.rotation.z = 0.7;
  g.add(needle);

  return g;
}

export function createUtilityPoles() {
  const group = new THREE.Group();
  group.name = 'utilityPole';
  POLES.forEach((p, i) => group.add(makePole(p, 151 + i * 37)));
  return group;
}
