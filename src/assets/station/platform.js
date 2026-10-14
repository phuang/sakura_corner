/**
 * 站台 —— 独立资产。
 * - 混凝土板：顶面 y=0.45，L 形避让「小巷（x∈[-1,+0.8]）+ 便利店西北角」：
 *   A1 x∈[-16.5,-1]×z∈[-6.55,-4.62]、A2 x∈[+0.8,+9.5]×z∈[-6.55,-4.5]（轨道侧带，北缘紧贴电车门踏板 z=-6.55，间隙仅 13cm）
 *   B1 x∈[-16.5,-1]×z∈[-4.62,-2]（候车区块，西端齐平底座 -16.5，东端止于小巷西墙）；
 * - 边缘黄色盲道触感砖（InstancedMesh 凸点阵列，随小巷断开）；
 * - 顶部压边条 + 端头收口。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { concreteTexture } from '../../core/textures.js';

const TOP_Y = 0.45;
const PLATFORM_NORTH = -6.55; // 紧贴电车门踏板（电车南壁 z=-6.68，间隙仅 13cm）

// L 形站台分块（西端对齐底座西边缘 x=-16.5；北缘对齐电车门 z=-6.55；嵌合入小巷外墙 2cm 消除边界共面闪烁）
const SLABS = [
  { x0: -16.5, x1: -1.14, z0: PLATFORM_NORTH, z1: -4.62 }, // A1 轨道侧带（西段，齐平底座 x=-16.5，紧贴电车与小巷西墙嵌合）
  { x0: 0.94, x1: 9.5, z0: PLATFORM_NORTH, z1: -4.5 },     // A2 轨道侧带（东段，紧贴电车与便利店北墙，东抵东人行道 x=9.5）
  { x0: -16.5, x1: -1.14, z0: -4.62, z1: -2 },             // B1 候车区块（西段，齐平底座 x=-16.5，避让小巷西墙嵌合）
];

export function createPlatform() {
  const group = new THREE.Group();
  group.name = 'platform';

  // —— 站台主体混凝土板（L 形分块，顶面齐平 y=0.45）——
  const slabMat = toon('#ffffff', { map: concreteTexture(21) });
  for (const s of SLABS) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(s.x1 - s.x0, TOP_Y, s.z1 - s.z0),
      slabMat
    );
    slab.position.set((s.x0 + s.x1) / 2, TOP_Y / 2, (s.z0 + s.z1) / 2);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
  }

  // —— 顶部压边条（轨道侧边缘，深灰收口；随小巷断开为两段）——
  const edgeMat = toon('#9b988f');
  for (const s of SLABS) {
    if (s.z0 !== PLATFORM_NORTH) continue; // 仅轨道侧带（A1/A2）有压边条
    const strip = new THREE.Mesh(new THREE.BoxGeometry(s.x1 - s.x0, 0.05, 0.1), edgeMat);
    strip.position.set((s.x0 + s.x1) / 2, TOP_Y + 0.025, s.z0 + 0.05);
    group.add(strip);
  }

  // —— 黄色盲道触感砖（轨道侧边缘带；随小巷断开为两段）——
  const tactileMat = toon('#f0c04a');
  for (const s of SLABS) {
    if (s.z0 !== PLATFORM_NORTH) continue;
    const tactile = new THREE.Mesh(new THREE.BoxGeometry(s.x1 - s.x0, 0.035, 0.62), tactileMat);
    tactile.position.set((s.x0 + s.x1) / 2, TOP_Y + 0.018, s.z0 + 0.4);
    tactile.receiveShadow = true;
    group.add(tactile);
  }

  // 触感凸点（InstancedMesh：3 排 × 全长）
  const bumpGeo = new THREE.SphereGeometry(0.021, 6, 4);
  bumpGeo.scale(1, 0.55, 1);
  const bumpMat = toon('#e8b73f');
  const spacingX = 0.19;
  const rowsZ = [-0.16, 0, 0.16];
  const trackSlabs = SLABS.filter((s) => s.z0 === PLATFORM_NORTH);
  let nBumps = 0;
  for (const s of trackSlabs) {
    nBumps += Math.floor((s.x1 - s.x0 - 0.6) / spacingX + 0.99) * rowsZ.length;
  }
  const bumps = new THREE.InstancedMesh(bumpGeo, bumpMat, nBumps);
  {
    const m = new THREE.Matrix4();
    let idx = 0;
    for (const s of trackSlabs) {
      const count = Math.floor((s.x1 - s.x0 - 0.6) / spacingX + 0.99);
      for (let i = 0; i < count; i++) {
        const x = s.x0 + 0.3 + i * spacingX;
        for (const dz of rowsZ) {
          m.makeTranslation(x, TOP_Y + 0.045, s.z0 + 0.4 + dz);
          bumps.setMatrixAt(idx++, m);
        }
      }
    }
    bumps.instanceMatrix.needsUpdate = true;
  }
  group.add(bumps);

  // —— 端头收口（东端 x=+9.5，A2 断面）——
  const endCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, TOP_Y + 0.06, -4.5 - PLATFORM_NORTH),
    toon('#b5b2a8', { map: concreteTexture(33) })
  );
  endCap.position.set(9.5 + 0.06, (TOP_Y + 0.06) / 2 - 0.03, (PLATFORM_NORTH + -4.5) / 2);
  group.add(endCap);

  return group;
}
