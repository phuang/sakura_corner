/**
 * 排水沟 —— 独立资产。
 * - 主路 A 北侧路缘（z≈+2.95）全长铸铁篦子，间距 4m；
 * - 路 B 西侧路缘（x≈10.45）同规格篦子列；
 * - 篦子几何：外框 + 指条合并为单几何，InstancedMesh 沿两线布设。
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { metal } from '../../core/materials.js';

export function createDrainageGutter() {
  const group = new THREE.Group();
  group.name = 'drainageGutter';

  // —— 篦子几何（外框 + 7 根指条）——
  const parts = [];
  const frame = new THREE.BoxGeometry(0.95, 0.045, 0.3);
  parts.push(frame);
  for (let i = 0; i < 7; i++) {
    const finger = new THREE.BoxGeometry(0.86, 0.022, 0.028);
    finger.translate(-0.43 + i * (0.86 / 6), 0.028, 0);
    parts.push(finger);
  }
  const grateGeo = mergeGeometries(parts, false);

  // —— 布设位置：主路 A 北侧（z=6.45，x -18→12）+ 路 B 西侧（x=12.95，z -18→6）——
  const spots = [];
  for (let x = -18; x <= 12; x += 4) spots.push({ x, z: 6.45, rot: 0 });
  for (let z = -18; z <= 6; z += 4) spots.push({ x: 12.95, z, rot: Math.PI / 2 });

  const grateMat = metal(0x4a4f55, 0.55, 0.7);
  const inst = new THREE.InstancedMesh(grateGeo, grateMat, spots.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const s = new THREE.Vector3(1, 1, 1);
  const p = new THREE.Vector3();

  spots.forEach((sp, i) => {
    eul.set(0, sp.rot, 0);
    q.setFromEuler(eul);
    // 顶面与路面齐平（y=0.14）
    p.set(sp.x, 0.14 - 0.0225 + 0.012, sp.z);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
  });
  inst.instanceMatrix.needsUpdate = true;
  group.add(inst);

  return group;
}
