/**
 * 小巷入口 —— 独立资产。
 * - x∈[-1,+0.8]，自人行道带（z=-2）向北至 z=-7；
 * - 两侧抹灰围墙（缺口收口 + 压顶条），与站台 L 形避让吻合；
 * - 巷内窄巷纵深：深色混凝土地面、排水立管、横管阀门、电表箱；
 * - 尽头铁门（竖杆栅栏 + 锈蚀做旧）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { concreteTexture, grimeOverlay } from '../../core/textures.js';

const X_W = -1.0;   // 西墙内表面
const X_E = 0.8;    // 东墙内表面
const Z_S = -2.0;   // 巷口（人行道带北缘）
const Z_N = -7.0;   // 尽头铁门
const WALL_H = 2.5;

export function createAlleyEntrance() {
  const group = new THREE.Group();
  group.name = 'alleyEntrance';

  const wallMat = toon('#ffffff', { map: concreteTexture(161, '#e9dfcc') });
  const kickMat = toon('#cfc4ae');      // 墙脚深色踢脚（积尘）
  const copingMat = toon('#a8a59b');    // 压顶条

  function wall(cx) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, WALL_H, Z_S - Z_N), wallMat);
    w.position.set(cx, WALL_H / 2, (Z_S + Z_N) / 2);
    w.castShadow = true;
    w.receiveShadow = true;
    group.add(w);

    const kick = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.55, Z_S - Z_N), kickMat);
    kick.position.set(cx, 0.275, (Z_S + Z_N) / 2);
    group.add(kick);

    const coping = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, Z_S - Z_N + 0.06), copingMat);
    coping.position.set(cx, WALL_H + 0.04, (Z_S + Z_N) / 2);
    group.add(coping);
  }
  wall(X_W - 0.08); // 西墙（内表面 x=-1）
  wall(X_E + 0.08); // 东墙（内表面 x=+0.8）

  // —— 巷内地坪（深色混凝土，略低于巷口）——
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(X_E - X_W, 0.03, Z_S - Z_N),
    toon('#ffffff', { map: concreteTexture(163, '#8f8b84') })
  );
  floor.position.set((X_W + X_E) / 2, 0.015, (Z_S + Z_N) / 2);
  floor.receiveShadow = true;
  group.add(floor);

  // —— 巷口门槛石（收口）——
  const threshold = new THREE.Mesh(new THREE.BoxGeometry(X_E - X_W + 0.16, 0.07, 0.2), toon('#9b988f'));
  threshold.position.set((X_W + X_E) / 2, 0.035, Z_S);
  group.add(threshold);

  // —— 排水立管（西墙内面，全高）——
  const pipeMat = metal(0x7d848c, 0.5, 0.6);
  const drainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, WALL_H - 0.1, 10), pipeMat);
  drainPipe.position.set(X_W + 0.045, (WALL_H - 0.1) / 2 + 0.03, Z_S - 1.1);
  group.add(drainPipe);
  // 管卡 ×2
  for (const py of [0.8, 1.9]) {
    const clamp = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12), pipeMat);
    clamp.position.set(X_W + 0.045, py, Z_S - 1.1);
    group.add(clamp);
  }

  // —— 横管（东墙内面，带阀门手轮）——
  const hPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1.9, 10), pipeMat);
  hPipe.rotation.x = Math.PI / 2;
  hPipe.position.set(X_E - 0.045, 1.78, Z_N + 1.0);
  group.add(hPipe);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 18), metal(0xb0563f, 0.45, 0.7));
  wheel.position.set(X_E - 0.09, 1.78, Z_N + 1.7);
  group.add(wheel);

  // —— 电表箱（东墙内面）——
  const meterBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.32), metal(0x5d646c, 0.5, 0.7));
  meterBox.position.set(X_E - 0.05, 1.45, Z_S - 1.4);
  group.add(meterBox);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 20), toon('#eef0f2'));
  dial.rotation.z = Math.PI / 2;
  dial.position.set(X_E - 0.106, 1.53, Z_S - 1.4);
  group.add(dial);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), toon('#c9564f'));
  dot.position.set(X_E - 0.114, 1.53, Z_S - 1.4);
  group.add(dot);

  // —— 尽头铁门（竖杆栅栏，锈蚀做旧）——
  const gateMat = toon('#ffffff', { map: grimeOverlay(91) }); // 深灰底 + 锈渍
  const ironDark = metal(0x4a443c, 0.55, 0.6);

  for (const gx of [X_W + 0.1, X_E - 0.1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.0, 0.09), ironDark);
    post.position.set(gx, 1.03, Z_N);
    post.castShadow = true;
    group.add(post);
  }

  for (const ry of [1.95, 0.4]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(X_E - X_W - 0.2, 0.07, 0.05), ironDark);
    rail.position.set((X_W + X_E) / 2, ry, Z_N);
    group.add(rail);
  }

  // 竖杆栅栏（InstancedMesh）
  const barCount = 13;
  const bars = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.014, 0.014, 1.5, 8),
    gateMat,
    barCount
  );
  {
    const m = new THREE.Matrix4();
    for (let i = 0; i < barCount; i++) {
      const x = X_W + 0.22 + i * ((X_E - X_W - 0.44) / (barCount - 1));
      m.makeTranslation(x, 1.18, Z_N);
      bars.setMatrixAt(i, m);
    }
    bars.instanceMatrix.needsUpdate = true;
  }
  group.add(bars);

  return group;
}
