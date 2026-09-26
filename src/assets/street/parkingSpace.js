/**
 * 停车位 —— 独立资产。
 * - 垂直车位 ×3：z∈[8.9,11.4]，x∈[-13,-3]（主路 A 南侧）；
 * - 白色划线：车位前沿线 + 分隔立线（磨损白漆）；
 * - 禁停区斜纹带：车位西侧缓冲带，程序化斜纹纹理（无文字）。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { concreteTexture } from '../../core/textures.js';

const PAD_TOP = 0.05; // 与人行道/底座顶面一致（petalSystem groundY）

/** 禁停斜纹纹理：浅灰底 + 45° 白色斜条 */
function hatchTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b7b3a8';
  ctx.fillRect(0, 0, size, size);
  // 轻微斑驳
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const v = 150 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgba(${v},${v - 3},${v - 12},0.25)`;
    ctx.fillRect(x, y, 2, 2);
  }
  // 45° 斜条（白色，磨损感：端部渐隐）
  ctx.strokeStyle = 'rgba(226,223,214,0.95)';
  ctx.lineWidth = 16;
  for (let o = -size; o < size * 2; o += 44) {
    const g = ctx.createLinearGradient(o, 0, o + size, size);
    g.addColorStop(0, 'rgba(226,223,214,0.55)');
    g.addColorStop(0.5, 'rgba(226,223,214,0.95)');
    g.addColorStop(1, 'rgba(226,223,214,0.55)');
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(o, size);
    ctx.lineTo(o + size, 0);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createParkingSpaces() {
  const group = new THREE.Group();
  group.name = 'parkingSpace';

  // —— 铺装底板（车位区 + 禁停带，位于主路 A 南侧）——
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, PAD_TOP, 3.6),
    toon('#ffffff', { map: concreteTexture(131, '#c6c2b7') })
  );
  pad.position.set(-8.2, PAD_TOP / 2, 14.6); // x∈[-14.2,-2.2], z∈[12.8,16.4]
  pad.receiveShadow = true;
  group.add(pad);

  const lineMat = toon('#dedbd1'); // 磨损白漆

  // —— 车位前沿线（沿 X，z=12.95）——
  const frontLine = new THREE.Mesh(new THREE.BoxGeometry(10, 0.012, 0.13), lineMat);
  frontLine.position.set(-8, PAD_TOP + 0.006, 12.95);
  group.add(frontLine);

  // —— 分隔立线 ×4（x=-13 / -9.67 / -6.33 / -3，z∈[12.95,15.4]）——
  for (const x of [-13, -9.67, -6.33, -3]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.012, 2.45), lineMat);
    line.position.set(x, PAD_TOP + 0.006, 14.175);
    group.add(line);
  }

  // —— 禁停区斜纹带（车位西侧缓冲带 x∈[-14.05,-13.15]）——
  const hatch = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.012, 2.7),
    toon('#ffffff', { map: hatchTexture() })
  );
  hatch.position.set(-13.6, PAD_TOP + 0.006, 14.25);
  group.add(hatch);

  return group;
}
