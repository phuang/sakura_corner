/**
 * 海报灯箱 —— 独立资产。
 * - 立式金属框架（0.62×0.3，h≈1.9），正面朝 +Z（入口方向）；
 * - 发光海报面：MeshStandardMaterial map + emissiveMap 同图自发光，呼吸明暗；
 * - 顶部内藏 LED 灯条（Bloom 轻拾取），底座加宽防倾。
 * 位置：(5.8, 1.9)。
 */

import * as THREE from 'three';
import { toon, metal, emissive } from '../../../core/materials.js';
import { posterTexture } from '../../../core/textures.js';
import { breathing } from '../../../core/lighting.js';

const FLOOR_Y = 0.15;
const CX = 5.8, CZ = 1.9;
const W = 0.62, D = 0.3, HT = 1.9;

export function createPosterLightbox() {
  const group = new THREE.Group();
  group.name = 'posterLightbox';

  const frameMat = metal(0x5d636b, 0.42, 0.7); // 深灰金属框架
  const bodyMat = toon('#eef0f2');             // 箱体暖白

  // —— 底座（加宽防倾）——
  const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.16, 0.14, D + 0.18), frameMat);
  base.position.set(CX, FLOOR_Y + 0.07, CZ);
  group.add(base);

  // —— 箱体（底座之上）——
  const bodyH = HT - 0.14;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, bodyH, D), bodyMat);
  body.position.set(CX, FLOOR_Y + 0.14 + bodyH / 2, CZ);
  group.add(body);

  // —— 正面金属框（海报外圈）——
  const frameT = 0.05;
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(W, frameT, 0.03), frameMat);
  fTop.position.set(CX, FLOOR_Y + HT - frameT / 2, CZ + D / 2 - 0.01);
  group.add(fTop);
  const fBot = new THREE.Mesh(new THREE.BoxGeometry(W, frameT, 0.03), frameMat);
  fBot.position.set(CX, FLOOR_Y + 0.14 + frameT / 2, CZ + D / 2 - 0.01);
  group.add(fBot);
  for (const x of [CX - W / 2 + frameT / 2, CX + W / 2 - frameT / 2]) {
    const fSide = new THREE.Mesh(new THREE.BoxGeometry(frameT, bodyH - frameT * 2, 0.03), frameMat);
    fSide.position.set(x, FLOOR_Y + 0.14 + bodyH / 2, CZ + D / 2 - 0.01);
    group.add(fSide);
  }

  // —— 发光海报面（map + emissiveMap，呼吸）——
  const posterTex = posterTexture(97, ['#ffd9e0', '#fff3d6', '#d8ecff']);
  const posterMat = new THREE.MeshStandardMaterial({
    map: posterTex,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: posterTex,
    emissiveIntensity: 1.25,
    roughness: 0.65,
    metalness: 0.05,
  });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(W - frameT * 2 - 0.03, bodyH - frameT * 2 - 0.1), posterMat);
  poster.position.set(CX, FLOOR_Y + 0.14 + bodyH / 2 + 0.02, CZ + D / 2 + 0.006);
  group.add(poster);

  // —— 顶部内藏 LED 灯条（呼吸）——
  const ledMat = emissive(0xfff3d8, 1.9);
  const led = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.03, 0.05), ledMat);
  led.position.set(CX, FLOOR_Y + HT - 0.075, CZ + D / 2 - 0.14);
  group.add(led);

  breathing(posterMat, { base: 1.25, amp: 0.3, speed: 0.45, phase: 0.4 });
  breathing(ledMat, { base: 1.9, amp: 0.45, speed: 0.45, phase: 0.4 });

  return group;
}
