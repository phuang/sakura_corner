/**
 * 花盆 ×3 —— 独立资产。
 * - 陶瓷盆（口沿 + 盆身 + 排水底足）+ 土面；
 * - 绿植叶丛 + 樱粉色花簇（团块堆叠，逐盆随机形态）。
 * 位置：东侧步道 (+9.8,-1.7)、店前西侧人行道 (0.7,+2.5) / (1.7,+2.5)。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';

const SIDEWALK_TOP = 0.05;
const POTS = [
  { x: 9.8, z: -1.7, seed: 411 },
  { x: 0.7, z: 2.5, seed: 421 },
  { x: 1.7, z: 2.5, seed: 431 },
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

function makePot({ x, z, seed }) {
  const g = new THREE.Group();
  g.name = `flowerPot_${seed}`;
  const r = rng(seed);

  // —— 陶瓷盆（底足 + 盆身 + 口沿）——
  const ceramic = toon('#f2ede4');
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.05, 16), ceramic);
  foot.position.set(x, SIDEWALK_TOP + 0.025, z);
  g.add(foot);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.24, 16), ceramic);
  body.position.set(x, SIDEWALK_TOP + 0.05 + 0.12, z);
  body.castShadow = true;
  g.add(body);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.175, 0.045, 16), ceramic);
  rim.position.set(x, SIDEWALK_TOP + 0.29 + 0.02, z);
  g.add(rim);

  // —— 土面 ——
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.03, 16), toon('#4a3b2e'));
  soil.position.set(x, SIDEWALK_TOP + 0.31, z);
  g.add(soil);

  // —— 绿植叶丛（深绿团块）——
  const leafMat = toon('#5f9e5a');
  const nLeaf = 4 + Math.floor(r() * 3);
  for (let i = 0; i < nLeaf; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * 0.1;
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + r() * 0.05, 1), leafMat);
    puff.scale.set(1, 0.75 + r() * 0.3, 1);
    puff.position.set(x + Math.cos(a) * rr, SIDEWALK_TOP + 0.36 + r() * 0.08, z + Math.sin(a) * rr);
    g.add(puff);
  }

  // —— 樱粉色花簇（浅粉团块，点缀叶丛上方）——
  const bloomMat = toon('#f6c8d4');
  const nBloom = 3 + Math.floor(r() * 3);
  for (let i = 0; i < nBloom; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * 0.12;
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + r() * 0.04, 1), bloomMat);
    puff.position.set(x + Math.cos(a) * rr, SIDEWALK_TOP + 0.46 + r() * 0.1, z + Math.sin(a) * rr);
    g.add(puff);
  }

  return g;
}

export function createFlowerPots() {
  const group = new THREE.Group();
  group.name = 'flowerPot';
  for (const spec of POTS) group.add(makePot(spec));
  return group;
}
