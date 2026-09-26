/**
 * 门口地垫 —— 独立资产。
 * - 深色防滑橡胶垫（入口正前方，雨棚下）；
 * - 本地程序纹理：横向沟槽 + 边缘磨损 + 使用痕迹（无外部图片）。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { STORE } from './storeBuilding.js';

/** 防滑地垫纹理：深炭灰底 + 横向沟槽 + 边缘磨白 */
function matTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // 基底（深炭灰，轻微明暗不均）
  ctx.fillStyle = '#3b3e44';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const v = 52 + Math.floor(Math.random() * 26);
    ctx.fillStyle = `rgba(${v},${v + 1},${v + 4},0.35)`;
    ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }

  // 横向沟槽（防滑纹）：暗槽 + 上缘高光
  for (let y = 10; y < size - 6; y += 9) {
    ctx.fillStyle = 'rgba(24,25,29,0.85)';
    ctx.fillRect(6, y, size - 12, 3);
    ctx.fillStyle = 'rgba(120,124,132,0.28)';
    ctx.fillRect(6, y + 3, size - 12, 1);
  }

  // 边缘磨白（四周渐淡）
  const edge = (x, y, w, h, dx, dy) => {
    const g = ctx.createLinearGradient(x, y, x + dx * w, y + dy * h);
    g.addColorStop(0, 'rgba(150,152,158,0.34)');
    g.addColorStop(1, 'rgba(150,152,158,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  };
  edge(0, 0, size, 14, 0, 1);
  edge(0, size - 14, size, 14, 0, -1);
  edge(0, 0, 14, size, 1, 0);
  edge(size - 14, 0, 14, size, -1, 0);

  // 中部踩踏磨亮带（入口动线方向）
  const g = ctx.createLinearGradient(0, size * 0.35, 0, size * 0.65);
  g.addColorStop(0, 'rgba(96,98,104,0)');
  g.addColorStop(0.5, 'rgba(96,98,104,0.22)');
  g.addColorStop(1, 'rgba(96,98,104,0)');
  ctx.fillStyle = g;
  ctx.fillRect(30, size * 0.35, size - 60, size * 0.3);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createDoorMat() {
  const group = new THREE.Group();
  group.name = 'doorMat';

  // 入口 x∈[6,8]，垫子居中略宽；人行道顶面 y=0.12（见 asphaltRoad.js）
  const W = 1.7, D = 1.15;
  const cx = 7.0;                              // 门洞中心 x=7
  const cz = STORE.Z1 + 0.06 + D / 2;         // 自立面外沿起（z≈3.68）

  const mat = toon('#ffffff', { map: matTexture() });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, 0.025, D), mat);
  mesh.position.set(cx, 0.132, cz);
  mesh.receiveShadow = true;
  group.add(mesh);

  return group;
}
