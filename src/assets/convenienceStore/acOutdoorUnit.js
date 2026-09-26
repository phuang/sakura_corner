/**
 * 空调外机 ×2 —— 独立资产。
 * - 西墙（x=+2）外侧安装，离地 0.5m；z=-3.4 / z=-2.2；
 * - 正面风扇格栅（同心环 + 辐条 + 轮毂），侧面百叶出风口；
 * - 铜管 ×2 沿墙面下行入墙（弯头细节）+ 锈迹/积尘做旧。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { grimeOverlay } from '../../core/textures.js';
import { STORE } from './storeBuilding.js';

const UNITS = [
  { z: -3.4, seed: 511 },
  { z: -2.2, seed: 521 },
];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeUnit({ z, seed }) {
  const g = new THREE.Group();
  const r = rng(seed);

  const W = 0.6;    // 宽（Z）
  const H = 0.45;   // 高
  const D = 0.32;   // 深（X，贴西墙外表面 x=STORE.X0）
  const X_FACE = STORE.X0 - D / 2;      // 机身中心 x（1.84）
  const Y_BOT = 0.5;                     // 离地 0.5m
  const Y_C = Y_BOT + H / 2;

  // —— 箱体（金属外壳，积尘做旧）——
  const shellMat = toon('#ffffff', { map: grimeOverlay(seed) }); // 浅灰底 + 污渍锈痕
  const shell = new THREE.Mesh(new THREE.BoxGeometry(D, H, W), shellMat);
  shell.position.set(X_FACE, Y_C, z);
  shell.castShadow = true;
  g.add(shell);

  // —— 正面风扇格栅（-X 面）——
  const grilleMat = metal(0x6d737b, 0.5, 0.7);
  const gx = X_FACE - D / 2 - 0.01;      // 格栅平面 x

  const ringOuter = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.014, 8, 32), grilleMat);
  ringOuter.rotation.y = Math.PI / 2;    // 环面转向 X
  ringOuter.position.set(gx, Y_C + 0.05, z);
  g.add(ringOuter);

  const ringInner = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.011, 8, 24), grilleMat);
  ringInner.rotation.y = Math.PI / 2;
  ringInner.position.set(gx, Y_C + 0.05, z);
  g.add(ringInner);

  // 辐条 ×3（60° 分布）
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.3, 0.02), grilleMat);
    spoke.position.set(gx, Y_C + 0.05, z);
    spoke.rotation.x = (i * Math.PI) / 3; // 绕 X 轴旋转 → 在 YZ 平面展开
    g.add(spoke);
  }

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), metal(0x8d949b, 0.45, 0.7));
  hub.rotation.z = Math.PI / 2; // 轴沿 X
  hub.position.set(gx - 0.005, Y_C + 0.05, z);
  g.add(hub);

  // —— 侧面百叶出风口（+Z 面，4 片斜板）——
  const louverMat = toon('#8d949b');
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(D - 0.1, 0.035, 0.02), louverMat);
    louver.position.set(X_FACE + 0.02, Y_C - 0.16 + i * 0.09, z + W / 2 + 0.008);
    louver.rotation.x = 0.5; // 斜置百叶
    g.add(louver);
  }

  // —— 安装支架（墙面托板 ×2）——
  const bracketMat = metal(0x7d848c, 0.5, 0.7);
  for (const s of [-1, 1]) {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(D + 0.06, 0.05, 0.08), bracketMat);
    bracket.position.set(X_FACE - 0.02, Y_BOT - 0.03, z + s * (W / 2 - 0.1));
    g.add(bracket);
  }

  // —— 铜管 ×2（沿墙面下行入墙）——
  const copperMat = metal(0xb87333, 0.35, 0.9);
  for (const s of [-1, 1]) {
    const pz = z + s * 0.16;
    const pts = [
      new THREE.Vector3(X_FACE - D / 2 + 0.04, Y_BOT + 0.05, pz), // 机底接口
      new THREE.Vector3(STORE.X0 - 0.09, Y_BOT - 0.18, pz),       // 沿墙面下行
      new THREE.Vector3(STORE.X0 - 0.06, 0.2 + r() * 0.05, pz),   // 低位弯头
      new THREE.Vector3(STORE.X0 + 0.08, 0.19, pz),               // 入墙
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.017, 8, false), copperMat);
    g.add(pipe);

    // 弯头加粗环（保温套接缝）
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), toon('#d8d2c4'));
    sleeve.position.set(STORE.X0 - 0.075, Y_BOT - 0.16, pz);
    g.add(sleeve);
  }

  // —— 墙面锈迹水痕（铜管入墙点上方垂流）——
  const stainMat = toon('#ffffff', { map: grimeOverlay(seed + 3) });
  for (const s of [-1, 1]) {
    const stain = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.5), stainMat);
    stain.position.set(STORE.X0 - 0.006, Y_BOT + 0.28, z + s * 0.16);
    stain.rotation.y = -Math.PI / 2; // 贴西墙外表面（朝 -X）
    g.add(stain);
  }

  return g;
}

export function createAcOutdoorUnits() {
  const group = new THREE.Group();
  group.name = 'acOutdoorUnit';
  for (const spec of UNITS) group.add(makeUnit(spec));
  return group;
}
