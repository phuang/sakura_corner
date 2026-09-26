/**
 * 护栏 —— 独立资产。
 * - 轨道尽头围栏：x≈8.45，z∈[-6.3,-14.2]（挡车器外侧封闭双线尽头）；
 * - 路口短护栏：路 B 北端（z≈-18.6），防止车辆冲出底座边缘。
 */

import * as THREE from 'three';
import { metal } from '../../core/materials.js';

const BALLAST_TOP = 0.28; // 道砟顶面（轨道尽头围栏基准）
const ROAD_TOP = 0.14;    // 路面顶面（路口短护栏基准）

/** 一段金属栏杆：立柱 + 双横杆 */
function railRun({ x, z, len, rotY, baseY, posts }) {
  const g = new THREE.Group();
  const postMat = metal(0x8f979e, 0.42, 0.8);
  const railMat = metal(0xa6adb4, 0.38, 0.82);

  for (let i = 0; i < posts; i++) {
    const t = posts === 1 ? 0.5 : i / (posts - 1);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), postMat);
    // 沿运行方向布点（局部 X 轴）
    post.position.set((t - 0.5) * len, baseY + 0.5, 0);
    post.castShadow = true;
    g.add(post);
  }

  for (const h of [1.12, 0.78]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len + 0.06, 0.07, 0.05), railMat);
    rail.position.set(0, baseY + h - 0.34, 0); // 横杆中心高度
    g.add(rail);
  }

  g.rotation.y = rotY;
  g.position.set(x, 0, z);
  return g;
}

export function createGuardrails() {
  const group = new THREE.Group();
  group.name = 'guardrail';

  // —— 轨道尽头围栏（沿 Z，x=8.45）——
  const trackFence = railRun({ x: 8.45, z: -10.25, len: 7.9, rotY: Math.PI / 2, baseY: BALLAST_TOP, posts: 5 });
  group.add(trackFence);

  // —— 路口 B 角短护栏（路 B 北端，沿 X）——
  const cornerRail = railRun({ x: 13.25, z: -18.6, len: 4.7, rotY: 0, baseY: ROAD_TOP, posts: 4 });
  group.add(cornerRail);

  return group;
}
