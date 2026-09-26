/**
 * 架空电线 —— 独立资产。
 * - **仅存在于两根电线杆 A↔B 之间**：3 条垂弧曲线，两端均落于杆上绝缘子/抱箍；
 * - 悬链线近似（二次贝塞尔下垂），金属细管渲染。
 */

import * as THREE from 'three';
import { metal } from '../../core/materials.js';
import { POLES, ARM_YS, INS_OFFSET } from './utilityPole.js';

const WIRE_TOP = 0.22; // 绝缘子顶面相对横担高差（与 utilityPole 几何一致）

export function createPowerWires() {
  const group = new THREE.Group();
  group.name = 'powerWires';

  const A = POLES[0], B = POLES[1];
  // A 杆取东侧端部（+X），B 杆取西侧端部（-X）→ 两杆之间连线
  const axA = A.x + INS_OFFSET;
  const axB = B.x - INS_OFFSET;

  /** 垂弧电线：两端点 + 下垂量 */
  function wire(p0, p1, sag) {
    const mid = new THREE.Vector3(
      (p0.x + p1.x) / 2,
      (p0.y + p1.y) / 2 - sag,
      (p0.z + p1.z) / 2
    );
    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    const geo = new THREE.TubeGeometry(curve, 48, 0.013, 6, false);
    return new THREE.Mesh(geo, metal(0x2f343a, 0.55, 0.7));
  }

  // —— 线 1：上横担端部绝缘子之间（sag 0.5）——
  group.add(wire(
    new THREE.Vector3(axA, ARM_YS[0] + WIRE_TOP, A.z),
    new THREE.Vector3(axB, ARM_YS[0] + WIRE_TOP, B.z),
    0.5
  ));

  // —— 线 2：下横担端部绝缘子之间（sag 0.62）——
  group.add(wire(
    new THREE.Vector3(axA, ARM_YS[1] + WIRE_TOP, A.z),
    new THREE.Vector3(axB, ARM_YS[1] + WIRE_TOP, B.z),
    0.62
  ));

  // —— 线 3：杆身中部抱箍之间（sag 0.42）——
  const MID_Y = 8.05;
  group.add(wire(
    new THREE.Vector3(A.x + 0.14, MID_Y, A.z),
    new THREE.Vector3(B.x - 0.14, MID_Y, B.z),
    0.42
  ));

  // —— 抱箍（线 3 两端落于杆身，金属环箍细节）——
  const strapMat = metal(0x6d737b, 0.5, 0.7);
  for (const p of [A, B]) {
    const side = p === A ? 1 : -1; // A 取东侧、B 取西侧
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.1), strapMat);
    strap.position.set(p.x + side * 0.13, MID_Y, p.z);
    group.add(strap);
  }

  return group;
}
