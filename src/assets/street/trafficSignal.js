/**
 * 交通信号灯 —— 独立资产（主路 A / 路 B 路口角）。
 * - 立杆 + 双信号头：竖向三灯头（朝西，面向主路来车）+ 横向两灯头（朝北，面向路 B 来车）；
 * - 红/绿之间平滑交叉淡化（琥珀过渡），节奏舒缓（18s 周期，双头相位错开）；
 * - 灯罩遮檐细节，未点亮灯面呈深灰。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { addUpdater } from '../../core/animationRegistry.js';

const ROAD_TOP = 0.14;
const X = 9.9, Z = 3.4; // 路口角（主路 A 边缘）

/** smoothstep 交叉淡化 */
function cross(t, a, b) {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

export function createTrafficSignal() {
  const group = new THREE.Group();
  group.name = 'trafficSignal';

  const housingMat = toon('#3a4048');
  const poleMat = metal(0x565c64, 0.45, 0.75);

  // —— 底座压盘 + 立杆 ——
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.06, 20), toon('#b5b1a7'));
  pad.position.set(X, ROAD_TOP + 0.03, Z);
  group.add(pad);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 3.3, 14), poleMat);
  pole.position.set(X, ROAD_TOP + 0.06 + 1.65, Z);
  pole.castShadow = true;
  group.add(pole);

  // —— 灯面材质（自发光，Bloom 拾取；未点亮时近黑）——
  function lensMat(color) {
    return new THREE.MeshStandardMaterial({
      color: 0x14171c,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.05,
      roughness: 0.35,
      metalness: 0.1,
    });
  }

  /** 竖向三灯头（局部 +Z 为正面） */
  function makeVerticalHead() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.78, 0.16), housingMat);
    body.castShadow = true;
    g.add(body);

    const mats = {};
    const lensGeo = new THREE.CircleGeometry(0.075, 24);
    for (const [key, y] of [['red', 0.24], ['amber', 0], ['green', -0.24]]) {
      const m = lensMat(key === 'red' ? 0xff4a3c : key === 'amber' ? 0xffb63c : 0x39d97e);
      mats[key] = m;
      const lens = new THREE.Mesh(lensGeo, m);
      lens.position.set(0, y, 0.082);
      g.add(lens);
      // 遮檐（斜置小挡板）
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.1), housingMat);
      hood.position.set(0, y + 0.1, 0.12);
      hood.rotation.x = -0.6;
      g.add(hood);
    }
    return { group: g, mats };
  }

  /** 横向两灯头（局部 +Z 为正面） */
  function makeHorizontalHead() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.16), housingMat);
    body.castShadow = true;
    g.add(body);

    const mats = {};
    const lensGeo = new THREE.CircleGeometry(0.065, 24);
    for (const [key, x] of [['red', -0.13], ['green', 0.13]]) {
      const m = lensMat(key === 'red' ? 0xff4a3c : 0x39d97e);
      mats[key] = m;
      const lens = new THREE.Mesh(lensGeo, m);
      lens.position.set(x, 0, 0.082);
      g.add(lens);
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.1), housingMat);
      hood.position.set(x, 0.1, 0.12);
      hood.rotation.x = -0.6;
      g.add(hood);
    }
    return { group: g, mats };
  }

  // —— 竖向头：朝西（-X），面向主路 A 来车 ——
  const headA = makeVerticalHead();
  headA.group.rotation.y = -Math.PI / 2; // +Z → -X
  headA.group.position.set(X - 0.16, ROAD_TOP + 3.15, Z);
  group.add(headA.group);

  // —— 横向头：朝北（-Z），面向路 B 来车 ——
  const headB = makeHorizontalHead();
  headB.group.rotation.y = Math.PI; // +Z → -Z
  headB.group.position.set(X, ROAD_TOP + 2.62, Z - 0.14);
  group.add(headB.group);

  // —— 红绿缓慢交叉淡化（双头相位错开半周期）——
  const T = 18;
  addUpdater((t) => {
    for (const [head, phase] of [[headA, 0], [headB, T / 2]]) {
      const tt = ((t + phase) % T + T) % T;
      // 红：[0,7) 亮 → 7~8.5 淡出；绿：8.5 起亮 → 16~17.5 淡出回红
      const redOn = 1 - cross(tt, 7, 8.5);
      const greenOn = cross(tt, 7, 8.5) * (1 - cross(tt, 16, 17.5));
      const amberOn = Math.max(0, 1 - Math.abs(tt - 7.75) / 0.9); // 过渡中段琥珀微亮
      head.mats.red.emissiveIntensity = 0.05 + redOn * 2.4;
      head.mats.green.emissiveIntensity = 0.05 + greenOn * 2.4;
      if (head.mats.amber) head.mats.amber.emissiveIntensity = 0.05 + amberOn * 1.6;
    }
  });

  return group;
}
