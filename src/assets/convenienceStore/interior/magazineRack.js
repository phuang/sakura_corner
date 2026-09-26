/**
 * 杂志架 —— 独立资产。
 * - 立式自由架（1.1×0.32，h≈1.75），正面朝 +Z（入口方向）；
 * - 4 层斜托槽：刊面薄盒实例化扇形陈列（逐本随机色相/倾角/微旋转，无空白死角）；
 * - 顶部抽象色块楣板（posterTexture，无文字）。
 * 位置：(6.3, 2.2)。
 */

import * as THREE from 'three';
import { toon } from '../../../core/materials.js';
import { posterTexture } from '../../../core/textures.js';

const FLOOR_Y = 0.15;
const CX = 6.3, CZ = 2.2;
const W = 1.1, D = 0.32, HT = 1.75;
const TIER_YS = [0.42, 0.82, 1.22, 1.62];   // 各层托槽基准（相对 FLOOR_Y）
const LEAN = -0.32;                          // 刊面后仰角（rad）

const COVER_COLORS = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0',
                      '#8d7bd4', '#4ecdc4', '#f5e6c8', '#3f7fbf', '#c9564f'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMagazineRack() {
  const group = new THREE.Group();
  group.name = 'magazineRack';

  const frameMat = toon('#c8ccd2');   // 侧板/立柱（浅灰）
  const trayMat = toon('#e6e8ea');    // 托槽
  const baseMat = toon('#7a8087');    // 底座

  // —— 底座 ——
  const base = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), baseMat);
  base.position.set(CX, FLOOR_Y + 0.06, CZ);
  group.add(base);

  // —— 两侧板（竖向）——
  for (const x of [CX - W / 2 + 0.025, CX + W / 2 - 0.025]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, HT - 0.12, D), frameMat);
    side.position.set(x, FLOOR_Y + 0.12 + (HT - 0.12) / 2, CZ);
    group.add(side);
  }

  // —— 顶部楣板（抽象色块，无文字）——
  const header = new THREE.Mesh(new THREE.BoxGeometry(W, 0.34, 0.05), toon('#f4f6f8'));
  header.position.set(CX, FLOOR_Y + HT - 0.17, CZ);
  group.add(header);
  const headerFace = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.12, 0.26),
    toon('#ffffff', { map: posterTexture(87) })
  );
  headerFace.position.set(CX, FLOOR_Y + HT - 0.17, CZ + D / 2 - 0.02);
  group.add(headerFace);

  // —— 4 层斜托槽 ——
  for (const y of TIER_YS) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.035, D * 0.8), trayMat);
    tray.position.set(CX, FLOOR_Y + y, CZ - 0.02);
    group.add(tray);
    // 托槽前沿挡条（防止刊面滑落）
    const lip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, 0.05, 0.02), frameMat);
    lip.position.set(CX, FLOOR_Y + y + 0.03, CZ + D * 0.4 - 0.06);
    group.add(lip);
  }

  // —— 刊面实例化扇形陈列（薄盒，后仰 + 微旋转）——
  const r = rng(651);
  const items = []; // {x,y,z,rotY,sx,sy,sz,color}

  for (const y of TIER_YS) {
    let x = CX - W / 2 + 0.14;
    while (x < CX + W / 2 - 0.13) {
      const w = 0.185 + r() * 0.04;   // 刊宽（X）
      const h = 0.26 + r() * 0.05;    // 刊高
      const th = 0.018 + r() * 0.007; // 厚度
      items.push({
        x: x + w / 2,
        y: FLOOR_Y + y + h / 2 - 0.03,
        z: CZ + (r() - 0.5) * 0.04,
        rotY: (r() - 0.5) * 0.26,     // 扇形微旋转
        sx: w, sy: h, sz: th,
        color: COVER_COLORS[Math.floor(r() * COVER_COLORS.length)],
      });
      x += w + 0.012;
    }
  }

  const magGeo = new THREE.BoxGeometry(1, 1, 1);
  const magMesh = new THREE.InstancedMesh(magGeo, toon('#ffffff'), items.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      e.set(LEAN, it.rotY, 0);
      q.setFromEuler(e);
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz);
      m4.compose(p, q, s);
      magMesh.setMatrixAt(i, m4);
      col.set(it.color);
      magMesh.setColorAt(i, col);
    });
    magMesh.instanceMatrix.needsUpdate = true;
    if (magMesh.instanceColor) magMesh.instanceColor.needsUpdate = true;
  }
  group.add(magMesh);

  return group;
}
