/**
 * 零食区货架（西墙挂架）—— 独立资产。
 * - 贴西墙整排高柜：z∈[-2.2,0.8]，深 0.45m，高 ~1.92m；
 * - 5 层商品层板 + 价签条，背板/侧板封闭；
 * - 零食包装实例化满陈列（盒装立放 + 杯面两类 InstancedMesh，逐件随机色相与尺寸）。
 * 朝向：+X（面向店内主通道）。
 */

import * as THREE from 'three';
import { toon } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const X_WALL = 2.18;          // 西墙内表面
const DEPTH = 0.45;           // 柜体进深（X）
const Z_A = -2.2, Z_B = 0.8;  // 沿墙长度范围
const HT = 1.92;              // 柜顶高
const SHELF_YS = [0.30, 0.62, 0.94, 1.26, 1.58]; // 层板顶面（相对 FLOOR_Y）

const PALETTE = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0',
                 '#f5e6c8', '#8d7bd4', '#4ecdc4', '#f08c3a', '#c9564f'];

/** 简单种子随机（保证陈列稳定） */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSnackShelves() {
  const group = new THREE.Group();
  group.name = 'snackShelves';

  const L = Z_B - Z_A;                 // 3.0
  const cx = X_WALL + DEPTH / 2;       // 柜体中心 x
  const cz = (Z_A + Z_B) / 2;          // 柜体中心 z

  const frameMat = toon('#c8ccd2');    // 立柱/顶框（浅灰金属感）
  const shelfMat = toon('#f2f3f5');    // 层板
  const backMat  = toon('#e6e8ea');    // 背板
  const sideMat  = toon('#dfe2e5');    // 侧板
  const tagMat   = toon('#ffffff');    // 价签条
  const baseMat  = toon('#7a8087');    // 底座

  // —— 底座（深色踢脚，略内收）——
  const base = new THREE.Mesh(new THREE.BoxGeometry(DEPTH - 0.04, 0.14, L), baseMat);
  base.position.set(cx, FLOOR_Y + 0.07, cz);
  group.add(base);

  // —— 背板（贴墙）——
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.025, HT - 0.14, L), backMat);
  back.position.set(X_WALL + 0.013, FLOOR_Y + 0.14 + (HT - 0.14) / 2, cz);
  group.add(back);

  // —— 两端侧板 ——
  for (const z of [Z_A + 0.015, Z_B - 0.015]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, HT - 0.14, 0.03), sideMat);
    side.position.set(cx, FLOOR_Y + 0.14 + (HT - 0.14) / 2, z);
    group.add(side);
  }

  // —— 前立柱 ×3（两端 + 中部）——
  for (const z of [Z_A + 0.05, cz, Z_B - 0.05]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, HT, 0.06), frameMat);
    post.position.set(X_WALL + DEPTH - 0.03, FLOOR_Y + HT / 2, z);
    group.add(post);
  }

  // —— 层板 ×5 + 价签条 ——
  for (const y of SHELF_YS) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(DEPTH - 0.03, 0.032, L - 0.06), shelfMat);
    shelf.position.set(cx, FLOOR_Y + y - 0.016, cz);
    group.add(shelf);
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.045, L - 0.1), tagMat);
    tag.position.set(X_WALL + DEPTH - 0.012, FLOOR_Y + y + 0.028, cz);
    group.add(tag);
  }

  // —— 顶板 + 顶部收边框 ——
  const top = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, 0.045, L), shelfMat);
  top.position.set(cx, FLOOR_Y + HT - 0.022, cz);
  group.add(top);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, L), frameMat);
  crown.position.set(X_WALL + DEPTH - 0.035, FLOOR_Y + HT + 0.012, cz);
  group.add(crown);

  // —— 零食实例化陈列（盒装 / 杯面）——
  const r = rng(917);
  const boxItems = [];   // {x,y,z,sx,sy,sz,color}
  const cupItems = [];   // {x,y,z,r,h,color}

  for (let li = 0; li < SHELF_YS.length; li++) {
    const yTop = FLOOR_Y + SHELF_YS[li];
    const maxH = Math.min(0.26, SHELF_YS[(li + 1) % SHELF_YS.length] - SHELF_YS[li] - 0.05);
    let z = Z_A + 0.09;
    while (z < Z_B - 0.08) {
      if (r() < 0.72) {
        // 盒装零食（立放，正面朝 +X）
        const w = 0.085 + r() * 0.045;   // 沿墙宽（Z）
        const h = Math.min(0.16 + r() * 0.09, maxH);
        const d = 0.05 + r() * 0.035;    // 进深（X）
        boxItems.push({
          x: cx - 0.02 + (r() - 0.5) * 0.04,
          y: yTop + h / 2,
          z: z + w / 2,
          sx: d, sy: h, sz: w,
          color: PALETTE[Math.floor(r() * PALETTE.length)],
        });
        z += w + 0.014;
      } else {
        // 杯面（矮圆柱）
        const rad = 0.036 + r() * 0.008, h = 0.085 + r() * 0.02;
        cupItems.push({
          x: cx - 0.01 + (r() - 0.5) * 0.03,
          y: yTop + h / 2,
          z: z + 0.045,
          r: rad, h,
          color: PALETTE[Math.floor(r() * PALETTE.length)],
        });
        z += 0.1;
      }
    }
  }

  const boxMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#ffffff'), boxItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    boxItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz);
      m4.compose(p, q, s);
      boxMesh.setMatrixAt(i, m4);
      col.set(it.color);
      boxMesh.setColorAt(i, col);
    });
    boxMesh.instanceMatrix.needsUpdate = true;
    if (boxMesh.instanceColor) boxMesh.instanceColor.needsUpdate = true;
  }
  group.add(boxMesh);

  const cupGeo = new THREE.CylinderGeometry(1, 0.92, 1, 14);
  const cupMesh = new THREE.InstancedMesh(cupGeo, toon('#ffffff'), cupItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    cupItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      cupMesh.setMatrixAt(i, m4);
      col.set(it.color);
      cupMesh.setColorAt(i, col);
    });
    cupMesh.instanceMatrix.needsUpdate = true;
    if (cupMesh.instanceColor) cupMesh.instanceColor.needsUpdate = true;
  }
  group.add(cupMesh);

  return group;
}
