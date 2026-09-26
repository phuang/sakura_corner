/**
 * 多层货架（中岛）—— 独立资产。
 * - 双列中岛货架：金属立柱 + 5 层板 + 背板；
 * - 商品实例化满陈列（盒装 / 瓶装两类 InstancedMesh，逐件随机色相与尺寸，无空白死角）。
 * 位置：SW 象限 x∈[3,5]，两列 z=-1.7 / z=+0.35。
 */

import * as THREE from 'three';
import { toon } from '../../../core/materials.js';

const FLOOR_Y = 0.15;
const L = 1.9, DP = 0.62, HT = 1.75; // 货架长 / 深 / 高
const SHELF_YS = [0.5, 0.85, 1.2, 1.55];
const GONDOLAS = [{ x: 4.0, z: -1.7 }, { x: 4.0, z: 0.35 }];

const PALETTE = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0', '#f5e6c8', '#8d7bd4', '#4ecdc4'];

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

export function createShelves() {
  const group = new THREE.Group();
  group.name = 'shelves';

  const frameMat = toon('#c8ccd2');      // 立柱（浅灰金属感）
  const shelfMat = toon('#f2f3f5');      // 层板
  const backMat = toon('#e6e8ea');       // 背板
  const tagMat = toon('#ffffff');        // 价签条

  for (const g of GONDOLAS) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(L, 0.12, DP), toon('#7a8087'));
    base.position.set(g.x, FLOOR_Y + 0.06, g.z);
    group.add(base);

    // 立柱 ×4
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, HT, 0.06), frameMat);
        post.position.set(g.x + sx * (L / 2 - 0.03), FLOOR_Y + HT / 2, g.z + sz * (DP / 2 - 0.03));
        group.add(post);
      }
    }

    // 背板（商品衬底）
    const back = new THREE.Mesh(new THREE.BoxGeometry(L - 0.1, HT - 0.25, 0.02), backMat);
    back.position.set(g.x, FLOOR_Y + (HT - 0.25) / 2 + 0.1, g.z - DP / 2 + 0.03);
    group.add(back);

    // 层板 ×4 + 价签条
    for (const y of SHELF_YS) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(L, 0.035, DP), shelfMat);
      shelf.position.set(g.x, FLOOR_Y + y, g.z);
      group.add(shelf);
      const tag = new THREE.Mesh(new THREE.BoxGeometry(L - 0.12, 0.045, 0.02), tagMat);
      tag.position.set(g.x, FLOOR_Y + y + 0.03, g.z + DP / 2 - 0.01);
      group.add(tag);
    }

    // 顶板
    const top = new THREE.Mesh(new THREE.BoxGeometry(L, 0.04, DP), shelfMat);
    top.position.set(g.x, FLOOR_Y + HT, g.z);
    group.add(top);
  }

  // —— 商品实例化陈列（盒装 / 瓶装）——
  const r = rng(731);
  const boxItems = [];   // {x,y,z,sx,sy,sz,color}
  const cylItems = [];   // {x,y,z,r,h,color}

  for (const g of GONDOLAS) {
    for (const y of SHELF_YS) {
      let x = g.x - L / 2 + 0.14;
      while (x < g.x + L / 2 - 0.12) {
        const z = g.z + (r() - 0.5) * 0.36;
        if (r() < 0.62) {
          // 盒装（立放）
          const w = 0.09 + r() * 0.04, h = 0.17 + r() * 0.1, d = 0.11 + r() * 0.06;
          boxItems.push({ x: x + w / 2 - 0.05, y: FLOOR_Y + y + 0.018 + h / 2, z, sx: w, sy: h, sz: d, color: PALETTE[Math.floor(r() * PALETTE.length)] });
          x += w + 0.015;
        } else {
          // 瓶装（圆柱）
          const rad = 0.032 + r() * 0.012, h = 0.2 + r() * 0.08;
          cylItems.push({ x: x + 0.05, y: FLOOR_Y + y + 0.018 + h / 2, z, r: rad, h, color: PALETTE[Math.floor(r() * PALETTE.length)] });
          x += 0.13;
        }
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

  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
  const cylMesh = new THREE.InstancedMesh(cylGeo, toon('#ffffff'), cylItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    cylItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      cylMesh.setMatrixAt(i, m4);
      col.set(it.color);
      cylMesh.setColorAt(i, col);
    });
    cylMesh.instanceMatrix.needsUpdate = true;
    if (cylMesh.instanceColor) cylMesh.instanceColor.needsUpdate = true;
  }
  group.add(cylMesh);

  return group;
}
