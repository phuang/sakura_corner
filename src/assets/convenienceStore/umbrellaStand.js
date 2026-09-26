/**
 * 雨伞架 —— 独立资产。
 * - 圆筒金属伞架（入口右侧）；
 * - 多把收拢雨伞：彩色伞帽 + 细杆，随机倾角插放。
 * 位置：(+9.68, +2.45)，东南角入口右侧（贩卖机旁）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';

const X = 9.68, Z = 2.45;
const SIDEWALK_TOP = 0.05;

const UMBRELLA_COLORS = ['#d95b4a', '#4a7fd9', '#f2b04e', '#5aa05a',
                         '#ef8bb0', '#e8e6df', '#f08c3a', '#8d7bd4'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createUmbrellaStand() {
  const group = new THREE.Group();
  group.name = 'umbrellaStand';

  const r = rng(351);
  const standMat = metal(0x8d949b, 0.42, 0.75);

  // —— 圆筒伞架（底座 + 筒身 + 顶缘）——
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.04, 20), standMat);
  base.position.set(X, SIDEWALK_TOP + 0.02, Z);
  group.add(base);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 20, 1, true), standMat);
  barrel.position.set(X, SIDEWALK_TOP + 0.04 + 0.25, Z);
  group.add(barrel);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.016, 8, 24), standMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(X, SIDEWALK_TOP + 0.54, Z);
  group.add(rim);

  // —— 收拢雨伞 ×8（伞帽 + 细杆，随机倾角）——
  for (let i = 0; i < UMBRELLA_COLORS.length; i++) {
    const color = UMBRELLA_COLORS[i];
    const tiltX = (r() - 0.5) * 0.24; // 前后倾
    const tiltZ = (r() - 0.5) * 0.24; // 左右倾
    const offX = (r() - 0.5) * 0.16;  // 筒内偏移
    const offZ = (r() - 0.5) * 0.16;

    const shaftLen = 0.72 + r() * 0.1;
    const dir = new THREE.Vector3(tiltX, 1, tiltZ).normalize();
    const basePos = new THREE.Vector3(X + offX, SIDEWALK_TOP + 0.1, Z + offZ);

    // 伞杆（细金属）
    const shaftGeo = new THREE.CylinderGeometry(0.009, 0.009, shaftLen, 6);
    const shaft = new THREE.Mesh(shaftGeo, metal(0x6d737b, 0.5, 0.7));
    shaft.position.copy(basePos).addScaledVector(dir, shaftLen / 2 - 0.18);
    group.add(shaft);

    // 收拢伞帽（锥台 + 顶钩）
    const capMat = toon(color);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.052, 0.34, 10), capMat);
    cap.position.copy(basePos).addScaledVector(dir, shaftLen / 2 + 0.08);
    cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(cap);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), metal(0x6d737b, 0.5, 0.7));
    tip.position.copy(basePos).addScaledVector(dir, shaftLen / 2 + 0.26);
    group.add(tip);
  }

  return group;
}
