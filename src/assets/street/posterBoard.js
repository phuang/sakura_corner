/**
 * 公告海报栏 —— 独立资产。
 * - 立式公告栏（1.5×1.85m），面向主路 A；
 * - 金属边框 + 顶檐防雨帽 + 底座压盘；
 * - 2×3 抽象海报阵列（posterTexture，多组配色，无文字）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { posterTexture } from '../../core/textures.js';

const X = -1.8, Z = 1.2;      // 车区与候车亭之间，面向主路 A（+Z）
const SIDEWALK_TOP = 0.05;

export function createPosterBoard() {
  const group = new THREE.Group();
  group.name = 'posterBoard';

  const frameMat = metal(0x4a5058, 0.45, 0.7);
  const backMat = toon('#dfe3e6');

  // —— 底座压盘 + 背板 ——
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.2), frameMat);
  plinth.position.set(X, SIDEWALK_TOP + 0.04, Z - 0.03);
  group.add(plinth);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.85, 0.05), backMat);
  back.position.set(X, SIDEWALK_TOP + 0.08 + 0.925, Z - 0.03);
  back.castShadow = true;
  group.add(back);

  // —— 金属边框（四面）——
  const rimT = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.07, 0.06), frameMat);
  rimT.position.set(X, SIDEWALK_TOP + 0.08 + 1.85 - 0.035, Z - 0.02);
  group.add(rimT);
  const rimB = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.07, 0.06), frameMat);
  rimB.position.set(X, SIDEWALK_TOP + 0.08 + 0.035, Z - 0.02);
  group.add(rimB);
  for (const s of [-1, 1]) {
    const rimS = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.85, 0.06), frameMat);
    rimS.position.set(X + s * 0.745, SIDEWALK_TOP + 0.08 + 0.925, Z - 0.02);
    group.add(rimS);
  }

  // —— 顶檐防雨帽（前挑）——
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.05, 0.34), frameMat);
  cap.position.set(X, SIDEWALK_TOP + 0.08 + 1.92, Z + 0.07);
  cap.castShadow = true;
  group.add(cap);

  // —— 抽象海报 ×6（2 列 × 3 行）——
  // 较深配色：强光下保持可读性（避免粉白一片）
  const palettes = [
    ['#f2a8bc', '#f5d78e'],
    ['#9cc4ea', '#a8d5a2'],
    ['#f0b98a', '#f2a8bc'],
    ['#a8d5a2', '#9cc4ea'],
    ['#f5d78e', '#ef9db4'],
    ['#9cc4ea', '#f0b98a'],
  ];
  const posterGeo = new THREE.PlaneGeometry(0.62, 0.5);
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 3; row++) {
      const i = col * 3 + row;
      const poster = new THREE.Mesh(posterGeo, toon('#ffffff', { map: posterTexture(211 + i * 7, palettes[i]) }));
      poster.position.set(
        X - 0.36 + col * 0.72,
        SIDEWALK_TOP + 0.08 + 0.5 + row * 0.55,
        Z + 0.012
      );
      group.add(poster);
    }
  }

  return group;
}
