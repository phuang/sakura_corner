/**
 * 复古路灯 ×2 —— 独立资产。
 * - 铸铁灯柱（锥度杆身 + 装饰环箍）+ 玻璃灯罩灯笼头；
 * - 暖光呼吸：灯泡自发光 + 弱点光源正弦调制（双灯相位错开）。
 * 位置：(10.2, +2.6) 路口角、(-6.8, +2.7) 车区旁。
 */

import * as THREE from 'three';
import { toon, metal, glass } from '../../core/materials.js';
import { breathing } from '../../core/lighting.js';

const SIDEWALK_TOP = 0.05;
const LAMPS = [
  { x: 10.2, z: 2.6, phase: 0 },
  { x: -6.8, z: 2.7, phase: 2.1 },
];

function makeLamp({ x, z, phase }) {
  const g = new THREE.Group();
  g.name = `streetLamp_${x}`;

  const ironMat = metal(0x3a3f45, 0.5, 0.72); // 铸铁（深灰蓝）
  const baseY = SIDEWALK_TOP;

  // —— 底座法兰 + 锥度杆身 ——
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.07, 20), ironMat);
  flange.position.set(x, baseY + 0.035, z);
  g.add(flange);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.068, 2.9, 14), ironMat);
  shaft.position.set(x, baseY + 0.07 + 1.45, z);
  shaft.castShadow = true;
  g.add(shaft);

  // —— 装饰环箍 ×2（铸铁复古细节）——
  for (const hy of [baseY + 0.35, baseY + 2.6]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 18), ironMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, hy, z);
    g.add(ring);
  }

  // —— 灯笼头：玻璃罩 + 暖光灯泡 + 方锥顶盖 ——
  const headY = baseY + 3.16;
  const glassMat = glass({ tint: 0xfff2d8, opacity: 0.3 });
  const shade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.2), glassMat);
  shade.position.set(x, headY, z);
  g.add(shade);

  // 四角立柱（铸铁）
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.26, 0.024), ironMat);
      post.position.set(x + sx * 0.1, headY, z + sz * 0.1);
      g.add(post);
    }
  }

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x2a2620,
    emissive: new THREE.Color(0xffd9a0),
    emissiveIntensity: 1.8,
    roughness: 0.4,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), bulbMat);
  bulb.position.set(x, headY - 0.03, z);
  g.add(bulb);

  // 方锥顶盖 + 宝顶
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.15, 4), ironMat);
  cap.rotation.y = Math.PI / 4;
  cap.position.set(x, headY + 0.2, z);
  g.add(cap);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), ironMat);
  finial.position.set(x, headY + 0.31, z);
  g.add(finial);

  // —— 暖光呼吸（点光源 + 灯泡自发光，相位错开）——
  const light = new THREE.PointLight(0xffd9a0, 0.85, 7, 2);
  light.position.set(x, headY - 0.03, z);
  g.add(light);

  breathing(light, { base: 0.85, amp: 0.24, speed: 0.6, phase });
  breathing(bulbMat, { base: 1.8, amp: 0.5, speed: 0.6, phase });

  return g;
}

export function createStreetLamps() {
  const group = new THREE.Group();
  group.name = 'streetLamp';
  for (const spec of LAMPS) group.add(makeLamp(spec));
  return group;
}
