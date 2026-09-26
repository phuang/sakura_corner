/**
 * 分类垃圾桶 ×3 —— 独立资产。
 * - 并排摆放（间距 ~0.6m），面向主路 A；
 * - 彩色桶盖（红/蓝/绿，对应可燃/不可燃/可回收）+ 桶身经年磨损污渍；
 * - 投口缝隙 + 提手细节。
 * 位置：(x∈[0.4~1.6], +1.0) 店前西侧人行道，面向主路 A。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { grimeOverlay } from '../../core/textures.js';

const Z = 3.6;
const SIDEWALK_TOP = 0.05;
const BINS = [
  { x: 0.4, lid: '#d95b4a' }, // 红：可燃
  { x: 1.0, lid: '#4a7fd9' }, // 蓝：不可燃
  { x: 1.6, lid: '#5aa05a' }, // 绿：可回收
];

export function createTrashBins() {
  const group = new THREE.Group();
  group.name = 'trashBins';

  const bodyMat = toon('#ffffff', { map: grimeOverlay(97) }); // 浅灰桶身 + 积尘污渍（做旧）
  const slotMat = toon('#1c1f24');

  BINS.forEach((b, i) => {
    const bin = new THREE.Group();
    bin.name = `trashBin_${i}`;

    // —— 桶身（微锥台，上宽下窄）——
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.185, 0.72, 4), bodyMat);
    body.rotation.y = Math.PI / 4; // 四棱柱朝向街道（正面朝 +Z）
    body.position.set(b.x, SIDEWALK_TOP + 0.36, Z);
    body.castShadow = true;
    group.add(body);

    // —— 彩色桶盖（微出挑 + 前缘提手缺口）——
    const lidMat = toon(b.lid);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.1, 4), lidMat);
    lid.rotation.y = Math.PI / 4;
    lid.position.set(b.x, SIDEWALK_TOP + 0.77, Z);
    lid.castShadow = true;
    group.add(lid);

    // —— 投口（正面顶部暗缝）——
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.03), slotMat);
    slot.position.set(b.x, SIDEWALK_TOP + 0.79, Z + 0.21);
    group.add(slot);

    // —— 提手（盖顶两侧小耳）——
    const earMat = toon('#8d949b');
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.06), earMat);
      ear.position.set(b.x + s * 0.17, SIDEWALK_TOP + 0.84, Z);
      group.add(ear);
    }

    // —— 桶脚（深色底座圈）——
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.2, 0.05, 4), toon('#3a4048'));
    foot.rotation.y = Math.PI / 4;
    foot.position.set(b.x, SIDEWALK_TOP + 0.025, Z);
    group.add(foot);
  });

  return group;
}
