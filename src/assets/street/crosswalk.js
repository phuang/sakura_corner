/**
 * 斑马线 ×2 —— 独立资产（纯正日式横断歩道）。
 * - 斑马线 A：跨主路 A（z∈[8.1,14.3]，正对便利店自动门 x=7.0）；
 * - 斑马线 B：跨路 B（x∈[12.0,17.2]，连接东侧人行道）；
 * - 规范画法：等宽等距白线、两端齐平直线收口、高精度三渲二动漫涂装，无残缺错位。
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';

const ROAD_TOP = 0.14;

export function createCrosswalks() {
  const group = new THREE.Group();
  group.name = 'crosswalk';

  const paintMat = toon('#f4f6fa'); // 规范道路白漆（干净通透动漫质感）

  // ================= 斑马线 A（跨主路 A，行人沿 Z 向行走，白条沿 X 方向延展）=================
  // 路宽：z 从 8.1 到 14.3，在路面净宽内等距布置 7 根规范标线
  const STRIPE_LEN_A = 3.6; // 斑马线通行宽度（沿 X）
  const STRIPE_W_A = 0.45;  // 标线条宽（沿 Z）
  const STRIPE_ZS = [8.55, 9.42, 10.29, 11.16, 12.03, 12.90, 13.77];

  const geoA = new THREE.BoxGeometry(STRIPE_LEN_A, 0.012, STRIPE_W_A);
  const instA = new THREE.InstancedMesh(geoA, paintMat, STRIPE_ZS.length);
  {
    const m = new THREE.Matrix4();
    STRIPE_ZS.forEach((z, i) => {
      m.makeTranslation(7.0, ROAD_TOP + 0.006, z); // 严格居中对齐便利店大门 x=7.0
      instA.setMatrixAt(i, m);
    });
    instA.instanceMatrix.needsUpdate = true;
    instA.receiveShadow = true;
  }
  group.add(instA);

  // ================= 斑马线 B（跨路 B，行人沿 X 向行走，白条沿 Z 方向延展）=================
  // 路宽：x 从 12.0 到 17.2，等距布置 6 根规范标线
  const STRIPE_LEN_B = 3.6; // 斑马线通行宽度（沿 Z）
  const STRIPE_W_B = 0.45;  // 标线条宽（沿 X）
  const STRIPE_XS = [12.45, 13.32, 14.19, 15.06, 15.93, 16.80];

  const geoB = new THREE.BoxGeometry(STRIPE_W_B, 0.012, STRIPE_LEN_B);
  const instB = new THREE.InstancedMesh(geoB, paintMat, STRIPE_XS.length);
  {
    const m = new THREE.Matrix4();
    STRIPE_XS.forEach((x, i) => {
      m.makeTranslation(x, ROAD_TOP + 0.006, -3.5); // 位于路 B 斑马线中心 z=-3.5
      instB.setMatrixAt(i, m);
    });
    instB.instanceMatrix.needsUpdate = true;
    instB.receiveShadow = true;
  }
  group.add(instB);

  return group;
}
