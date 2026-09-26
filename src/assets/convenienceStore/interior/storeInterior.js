/**
 * 室内壳体 —— 独立资产。
 * - 瓷砖地面（顶面 y=0.15，与室外踢脚槽衔接）；
 * - 吊顶 + 长条灯带 ×4（自发光柔光，Bloom 轻拾取）+ 嵌入式筒灯；
 * - 室内软点光源：透过玻璃可见的店内暖光层次。
 * 内界：x∈[2.18,9.5]、z∈[-4.32,3]（北/西为实体墙，南/东为幕墙）。
 */

import * as THREE from 'three';
import { toon, emissive } from '../../../core/materials.js';
import { tileFloorTexture } from '../../../core/textures.js';

const FLOOR_Y = 0.15; // 室内地面顶面（各内装资产共用基准）

export function createStoreInterior() {
  const group = new THREE.Group();
  group.name = 'storeInterior';

  const X0 = 2.18, X1 = 9.5, Z0 = -4.32, Z1 = 3.0;
  const W = X1 - X0, D = Z1 - Z0;
  const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;

  // —— 瓷砖地面 ——
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(W, FLOOR_Y, D),
    toon('#ffffff', { map: tileFloorTexture() })
  );
  floor.position.set(cx, FLOOR_Y / 2, cz);
  floor.receiveShadow = true;
  group.add(floor);

  // —— 吊顶板（玻璃顶线之下）——
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, D), toon('#f4f5f7'));
  ceil.position.set(cx, 3.62 - 0.09, cz);
  group.add(ceil);

  // —— 长条灯带 ×4（沿 X，均匀布于纵深）——
  const stripMat = emissive(0xfff6e6, 2.1);
  for (const z of [-3.3, -1.5, 0.3, 2.1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.04, 0.14), stripMat);
    strip.position.set(cx + 0.1, 3.435, z);
    group.add(strip);
  }

  // —— 嵌入式筒灯 ×6（灯带之间点缀）——
  const downMat = emissive(0xfff2dc, 1.8);
  for (const [x, z] of [[3.4, -2.4], [5.9, -2.4], [8.2, -2.4], [3.4, 1.2], [5.9, 1.2], [8.2, 1.2]]) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), downMat);
    d.position.set(x, 3.445, z);
    group.add(d);
  }

  // —— 室内软点光（透过玻璃可见的暖光层次）——
  const inner = new THREE.PointLight(0xfff1de, 0.55, 13, 2);
  inner.position.set(6, 3.1, -0.7);
  group.add(inner);

  return group;
}
