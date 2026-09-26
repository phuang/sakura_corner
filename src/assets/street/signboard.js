/**
 * 路牌 —— 独立资产（斑马线 A 西侧，抽象标志无文字）。
 * - 金属立杆 + 圆形蓝底白箭头转向标志；
 * - 下方方形指示牌：双白色 V 形箭头（抽象动线提示）；
 * - 底座混凝土压盘。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';

const ROAD_TOP = 0.14; // 立杆落于主路 A 边缘沥青面

/** 圆形转向标志：蓝底 + 白环 + 白色右转箭头 */
function arrowSignTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  // 蓝底
  ctx.fillStyle = '#3d7ab5';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  // 白色内环
  ctx.strokeStyle = '#f4f6f8';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 18, 0, Math.PI * 2);
  ctx.stroke();
  // 白色右转箭头（竖杆 + 右折 + 三角头）
  ctx.fillStyle = '#f4f6f8';
  ctx.fillRect(size / 2 - 13, size * 0.3, 26, size * 0.5);          // 竖杆
  ctx.fillRect(size / 2 - 13, size * 0.3, size * 0.42, 26);         // 横折
  const ax = size / 2 + size * 0.42;
  ctx.beginPath();                                                  // 箭头三角
  ctx.moveTo(ax, size * 0.3 - 34);
  ctx.lineTo(ax + 52, size * 0.3 + 13);
  ctx.lineTo(ax, size * 0.3 + 60);
  ctx.closePath();
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 方形指示牌：深蓝底 + 双白色 V 形箭头 */
function chevronSignTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#37475c';
  ctx.fillRect(0, 0, 256, 192);
  ctx.strokeStyle = '#eef1f4';
  ctx.lineWidth = 20;
  for (const ox of [88, 168]) {
    ctx.beginPath();
    ctx.moveTo(ox - 34, 40);
    ctx.lineTo(ox + 34, 96);
    ctx.lineTo(ox - 34, 152);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createSignboard() {
  const group = new THREE.Group();
  group.name = 'signboard';

  const X = 5.2, Z = 3.1; // 斑马线 A 西侧（主路 A 边缘）

  // —— 底座压盘 + 立杆 ——
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.06, 20), toon('#b5b1a7'));
  pad.position.set(X, ROAD_TOP + 0.03, Z);
  group.add(pad);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 2.5, 14), metal(0x6d737b, 0.45, 0.8));
  pole.position.set(X, ROAD_TOP + 0.06 + 1.25, Z);
  pole.castShadow = true;
  group.add(pole);

  // —— 圆形转向标志（顶）——
  const signR = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 40),
    toon('#ffffff', { map: arrowSignTexture() })
  );
  signR.position.set(X, ROAD_TOP + 2.62, Z); // 面向 +Z（主路方向）
  group.add(signR);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 40), metal(0xd7dbe0, 0.4, 0.7));
  rim.position.set(X, ROAD_TOP + 2.62, Z);
  group.add(rim);

  // —— 方形 V 形指示牌（下）——
  const signSq = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.34, 0.03),
    toon('#ffffff', { map: chevronSignTexture() })
  );
  signSq.position.set(X, ROAD_TOP + 2.12, Z);
  group.add(signSq);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.02), metal(0x6d737b, 0.45, 0.8));
  frame.position.set(X, ROAD_TOP + 2.12, Z - 0.012);
  group.add(frame);

  return group;
}
