/**
 * 自行车停放区 —— 独立资产。
 * - U 形停车架 ×3：x∈[-6.5,-2.5], z≈1.4（人行道带内）；
 * - 镀锌钢管倒 U 结构 + 底座压板。
 */

import * as THREE from 'three';
import { metal } from '../../core/materials.js';

const SIDEWALK_TOP = 0.05;
const RACK_XS = [-6.0, -4.5, -3.0];
const RACK_Z = 1.4;
const POST_H = 0.72;   // 立柱高
const ARC_R = 0.42;    // U 形半径（= 柱距半宽）

export function createBikeRacks() {
  const group = new THREE.Group();
  group.name = 'bikeRack';

  const tubeMat = metal(0x9aa1a8, 0.4, 0.8); // 镀锌钢管
  const plateMat = metal(0x7d848c, 0.5, 0.7);

  for (const x of RACK_XS) {
    // —— 立柱 ×2 + U 形顶弧（TorusGeometry 上半圆）——
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, POST_H, 10), tubeMat);
      post.position.set(x + s * ARC_R, SIDEWALK_TOP + POST_H / 2, RACK_Z);
      post.castShadow = true;
      group.add(post);

      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.18), plateMat);
      plate.position.set(x + s * ARC_R, SIDEWALK_TOP + 0.015, RACK_Z);
      group.add(plate);
    }

    const arc = new THREE.Mesh(new THREE.TorusGeometry(ARC_R, 0.028, 10, 24, Math.PI), tubeMat);
    arc.position.set(x, SIDEWALK_TOP + POST_H, RACK_Z); // 上半圆：+X → +Y → -X
    group.add(arc);
  }

  return group;
}
