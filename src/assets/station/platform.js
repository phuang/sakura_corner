/**
 * 站台 —— 独立资产。
 * - 混凝土板：顶面 y=0.45，L 形避让「小巷（x∈[-1,+0.8]）+ 便利店西北角」：
 *   A1 x∈[-17,-1]×z∈[-5.5,-4.62]、A2 x∈[+0.8,+9]×z∈[-5.5,-4.62]（轨道侧带）
 *   B1 x∈[-17,-1]×z∈[-4.62,-2]（候车区块，东端止于小巷西墙）；
 * - 边缘黄色盲道触感砖（InstancedMesh 凸点阵列，随小巷断开）；
 * - 顶部压边条 + 端头收口。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { concreteTexture } from '../../core/textures.js';

const TOP_Y = 0.45;

// L 形站台分块（避让小巷 x∈[-1,+0.8] 与便利店 x≥+2,z≥-4.5）
const SLABS = [
  { x0: -17, x1: -1, z0: -5.5, z1: -4.62 }, // A1 轨道侧带（西段）
  { x0: 0.8, x1: 9, z0: -5.5, z1: -4.62 },  // A2 轨道侧带（东段，至挡车器端）
  { x0: -17, x1: -1, z0: -4.62, z1: -2 },   // B1 候车区块
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
    if (s.z0 !== -5.5) continue; // 仅轨道侧带（A1/A2）有压边条
    const strip = new THREE.Mesh(new THREE.BoxGeometry(s.x1 - s.x0, 0.05, 0.1), edgeMat);
    strip.position.set((s.x0 + s.x1) / 2, TOP_Y + 0.025, s.z0 + 0.05);
    group.add(strip);
  }

  // —— 黄色盲道触感砖（轨道侧边缘带；随小巷断开为两段）——
  const tactileMat = toon('#f0c04a');
  for (const s of SLABS) {
    if (s.z0 !== -5.5) continue;
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
  const trackSlabs = SLABS.filter((s) => s.z0 === -5.5);
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

  // —— 端头收口（东端 x=+9，A2 断面）——
  const endCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, TOP_Y + 0.06, -4.62 - (-5.5)),
    toon('#b5b2a8', { map: concreteTexture(33) })
  );
  endCap.position.set(9 + 0.06, (TOP_Y + 0.06) / 2 - 0.03, (-5.5 + -4.62) / 2);
  group.add(endCap);

  // —— B1 东端立面收边（面向小巷，深灰压条）——
  const bEdge = new THREE.Mesh(new THREE.BoxGeometry(0.03, TOP_Y, -2 - (-4.62)), toon('#a8a59b'));
  bEdge.position.set(-1 + 0.015, TOP_Y / 2, (-4.62 + -2) / 2);
  group.add(bEdge);

  return group;
}
