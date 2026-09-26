/**
 * 斑马线 ×2 —— 独立资产。
 * - 斑马线 A：跨主路 A，x∈[4.8,7.8]（正对便利店入口，动线核心）；
 * - 斑马线 B：跨路 B，z∈[-6.2,-3.2]（小巷方向人行横道）；
 * - 磨损白漆：逐条随机长度/色差/缺口，InstancedMesh 单几何实现。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';

const ROAD_TOP = 0.14;

/** 生成一条斑马线的实例数据（沿 u 方向排布横条） */
function barSpecs(u0, u1, v, rot) {
  const items = [];
  let u = u0;
  while (u < u1 - 0.2) {
    if (Math.random() < 0.94) {
      items.push({ u: u + Math.random() * 0.06, v, rot });
    }
    u += 0.62; // 条间距（含条宽）
  }
  return items;
}

export function createCrosswalks() {
  const group = new THREE.Group();
  group.name = 'crosswalk';

  const barGeo = new THREE.BoxGeometry(1, 0.012, 0.42); // 单位长条，实例缩放/旋转
  const barMat = toon('#ffffff');

  // —— 斑马线 A：横条沿 X（跨主路 A，z∈[8.1,14.3]，正对便利店自动门 x=7.0）——
  const specsA = barSpecs(8.4, 14.0, null, 0);
  const instA = new THREE.InstancedMesh(barGeo, barMat, specsA.length);

  // —— 斑马线 B：横条沿 Z（跨路 B，x∈[12.0,17.2]）——
  const specsB = barSpecs(12.3, 16.9, null, Math.PI / 2);
  const instB = new THREE.InstancedMesh(barGeo, barMat, specsB.length);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const col = new THREE.Color();

  function fill(inst, specs) {
    specs.forEach((it, i) => {
      // 磨损：长度抖动 + 逐条褪色
      const lenJitter = 0.92 + Math.random() * 0.1;
      eul.set(0, it.rot, (Math.random() - 0.5) * 0.03);
      q.setFromEuler(eul);
      if (it.rot === 0) {
        s.set(2.98 * lenJitter, 1, 1);
        p.set(7.0 + (Math.random() - 0.5) * 0.04, ROAD_TOP + 0.007, it.u + 0.21);
      } else {
        s.set(2.8 * lenJitter, 1, 1);
        p.set(it.u + 0.21, ROAD_TOP + 0.007, -4.75 + (Math.random() - 0.5) * 0.04);
      }
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
      const v = 0.72 + Math.random() * 0.26; // 褪色程度
      col.setRGB(0.89 * v, 0.88 * v, 0.83 * v);
      inst.setColorAt(i, col);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }

  fill(instA, specsA);
  fill(instB, specsB);
  group.add(instA, instB);

  return group;
}
