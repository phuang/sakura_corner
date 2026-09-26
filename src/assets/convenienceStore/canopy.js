/**
 * 入口雨棚 —— 独立资产。
 * - 悬挑板（x∈[5.3,8.7]，自南立面外挑 1.6m），顶面 y≈3.06；
 * - 两根斜拉索连接招牌带锚点（含锚板细节）；
 * - 底缘灯带：暖白自发光 + 呼吸明暗；前缘深色收边条。
 */

import * as THREE from 'three';
import { toon, metal, emissive } from '../../core/materials.js';
import { concreteTexture, grimeOverlay } from '../../core/textures.js';
import { breathing } from '../../core/lighting.js';
import { STORE } from './storeBuilding.js';

/** 两点间圆柱（拉索） */
function rodBetween(p1, p2, r) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r, r, len, 10);
  const m = new THREE.Mesh(geo, metal(0x9aa1a8, 0.4, 0.8));
  m.position.copy(p1).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

export function createCanopy() {
  const group = new THREE.Group();
  group.name = 'canopy';

  const X_A = 5.3, X_B = 8.7;          // 雨棚左右边界
  const Z_FACE = STORE.Z1;             // 立面 z=+3
  const Z_TIP = 4.6;                   // 外挑端
  const TOP_Y = 3.06;                  // 顶面
  const THK = 0.14;                    // 板厚

  // —— 悬挑主面板 ——
  const slabMat = toon('#ffffff', { map: concreteTexture(141, '#eef1f4') });
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(X_B - X_A, THK, Z_TIP - (Z_FACE - 0.06)),
    slabMat
  );
  slab.position.set((X_A + X_B) / 2, TOP_Y - THK / 2, (Z_TIP + Z_FACE - 0.06) / 2);
  slab.castShadow = true;
  slab.receiveShadow = true;
  group.add(slab);

  // —— 底面（带积尘污渍，做旧）——
  const underMat = toon('#ffffff', { map: grimeOverlay(143) });
  const under = new THREE.Mesh(new THREE.BoxGeometry(X_B - X_A - 0.1, 0.02, Z_TIP - Z_FACE - 0.1), underMat);
  under.position.set((X_A + X_B) / 2, TOP_Y - THK - 0.01, (Z_TIP + Z_FACE) / 2);
  group.add(under);

  // —— 前缘深色收边条 ——
  const trimMat = toon('#5d636b');
  const trim = new THREE.Mesh(new THREE.BoxGeometry(X_B - X_A, 0.05, 0.07), trimMat);
  trim.position.set((X_A + X_B) / 2, TOP_Y - THK + 0.01, Z_TIP - 0.035);
  group.add(trim);

  // —— 底缘灯带（暖白自发光，呼吸）——
  const stripMat = emissive(0xfff3d8, 1.7);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(X_B - X_A - 0.5, 0.045, 0.09), stripMat);
  strip.position.set((X_A + X_B) / 2, TOP_Y - THK - 0.035, Z_TIP - 0.16);
  group.add(strip);
  breathing(stripMat, { base: 1.7, amp: 0.42, speed: 0.5, phase: 0.8 });

  // —— 斜拉索 ×2（雨棚前缘 → 招牌带锚点）——
  const anchorY = 3.95; // 招牌带中段（fascia y∈[3.62,4.30]）
  for (const x of [X_A + 0.4, X_B - 0.4]) {
    const pLow = new THREE.Vector3(x, TOP_Y - THK / 2, Z_TIP - 0.1);
    const pHigh = new THREE.Vector3(x, anchorY, Z_FACE + 0.08);
    group.add(rodBetween(pLow, pHigh, 0.02));

    // 锚板（上/下各一）
    const plateHi = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.03), metal(0x8d949b, 0.5, 0.7));
    plateHi.position.set(x, anchorY + 0.02, Z_FACE + 0.06);
    group.add(plateHi);
    const plateLo = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.03), metal(0x8d949b, 0.5, 0.7));
    plateLo.position.set(x, TOP_Y - THK / 2, Z_TIP - 0.06);
    group.add(plateLo);
  }

  return group;
}
