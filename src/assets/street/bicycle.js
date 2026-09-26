/**
 * 日式通勤自行车 ×5 —— 独立资产。
 * - 弯把/直把、前车篮（开放式）、后货架、脚撑、辐条车轮；
 * - 车架管束 + 链罩 + 曲柄脚踏，逐辆随机车漆色；
 * - 便利店外 1 辆斜靠东墙 + 自行车停放区 4 辆。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { grimeOverlay } from '../../core/textures.js';

const SIDEWALK_TOP = 0.05;

/** 两点间圆柱（车架管） */
function tube(p1, p2, r, mat) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r, r, len, 8);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(p1).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

const FRAME_COLORS = ['#3f5a4e', '#7e3b32', '#39424e', '#5d4a63']; // 墨绿 / 绛红 / 藏青 / 炭灰

/**
 * 单辆通勤车（局部原点 = 两轮中点地面，+X 为车头方向）
 */
export function createBicycle({ seed = 1, color } = {}) {
  const g = new THREE.Group();
  g.name = `bicycle_${seed}`;

  let a = (seed * 2654435761) >>> 0;
  const rnd = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const frameMat = toon(color || FRAME_COLORS[seed % FRAME_COLORS.length]);
  const darkMat = toon('#2e3237');
  const tireMat = toon('#33383d', { map: grimeOverlay(40 + seed) }); // 轮胎做旧
  const rimMat = metal(0xb9c0c8, 0.35, 0.85);
  const basketMat = toon('#cfd4d8');

  const RA = new THREE.Vector3(-0.52, 0.34, 0); // 后轴
  const FA = new THREE.Vector3(0.52, 0.34, 0);  // 前轴
  const BB = new THREE.Vector3(0.0, 0.36, 0);   // 中轴
  const ST = new THREE.Vector3(-0.22, 0.82, 0); // 座管顶
  const HT = new THREE.Vector3(0.44, 0.78, 0);  // 头管上端
  const HB = new THREE.Vector3(0.4, 0.6, 0);    // 头管下端

  // —— 车轮（轮胎 + 轮圈 + 轮毂 + 辐条）——
  function wheel(center) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 10, 28), tireMat);
    w.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.013, 8, 28), rimMat);
    w.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 10), rimMat);
    hub.rotation.x = Math.PI / 2;
    w.add(hub);
    // 辐条：4 根全径杆（=8 辐）
    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.56, 5), rimMat);
      spoke.rotation.z = (i * Math.PI) / 4 + rnd() * 0.1;
      w.add(spoke);
    }
    w.position.copy(center);
    return w;
  }
  g.add(wheel(RA), wheel(FA));

  // —— 车架管束（低跨城市车几何）——
  const T = (p1, p2) => { const t = tube(p1, p2, 0.021, frameMat); g.add(t); };
  T(RA, BB);   // 后下叉
  T(RA, ST);   // 座管斜撑
  T(BB, ST);   // 座管
  T(ST, HT);   // 上管（低跨）
  T(BB, HB);   // 下管
  T(HT, FA);   // 前叉
  T(HT, HB);   // 头管

  // —— 车把（直把 + 立管）——
  const stem = tube(HT, new THREE.Vector3(0.46, 0.87, 0), 0.015, frameMat);
  g.add(stem);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8), darkMat);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(0.46, 0.87, 0);
  g.add(bar);
  for (const s of [-1, 1]) { // 把套
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), darkMat);
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0.46, 0.87, s * 0.19);
    g.add(grip);
  }

  // —— 座垫 + 座杆 ——
  const seatPost = tube(ST, new THREE.Vector3(-0.22, 0.88, 0), 0.014, rimMat);
  g.add(seatPost);
  const saddle = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), darkMat);
  saddle.scale.set(0.15, 0.038, 0.075);
  saddle.position.set(-0.22, 0.9, 0);
  g.add(saddle);

  // —— 前车篮（开放式 + 边框）——
  {
    const bx = 0.56, by = 0.68;
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.2), basketMat);
    bottom.position.set(bx, by - 0.07, 0);
    g.add(bottom);
    for (const [w, d, ox, oz] of [[0.28, 0.015, 0, 0.1], [0.28, 0.015, 0, -0.1], [0.015, 0.2, 0.14, 0], [0.015, 0.2, -0.14, 0]]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.13, d), basketMat);
      wall.position.set(bx + ox, by + 0.02, oz * (w > d ? 1 : 0) + (d > w ? oz : 0));
      g.add(wall);
    }
    // 车篮支架（连前叉）
    const mount = tube(new THREE.Vector3(FA.x - 0.02, FA.y + 0.18, 0), new THREE.Vector3(bx, by - 0.07, 0), 0.012, rimMat);
    g.add(mount);
  }

  // —— 后货架（平板 + 支撑）——
  {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.2), basketMat);
    rack.position.set(-0.48, 0.74, 0);
    g.add(rack);
    for (const s of [-1, 1]) {
      const sup = tube(new THREE.Vector3(RA.x + 0.06, RA.y + 0.05, s * 0.08), new THREE.Vector3(-0.42, 0.73, s * 0.08), 0.011, rimMat);
      g.add(sup);
    }
  }

  // —— 脚撑（左后斜撑地）——
  const kick = tube(new THREE.Vector3(-0.05, 0.32, -0.06), new THREE.Vector3(-0.17, 0.02, -0.14), 0.012, darkMat);
  g.add(kick);

  // —— 曲柄 + 脚踏 + 链罩 ——
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 14), darkMat);
  crank.rotation.x = Math.PI / 2;
  crank.position.copy(BB).setZ(-0.03);
  g.add(crank);
  for (const s of [-1, 1]) {
    const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.06), darkMat);
    pedal.position.set(BB.x + s * 0.13, BB.y - s * 0.04, -0.05);
    g.add(pedal);
  }
  const chainGuard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.028), frameMat);
  chainGuard.position.set((RA.x + BB.x) / 2 - 0.02, (RA.y + BB.y) / 2 + 0.01, -0.045);
  chainGuard.rotation.z = Math.atan2(BB.y - RA.y, BB.x - RA.x);
  g.add(chainGuard);

  return g;
}

/** 全场景 5 辆：便利店外 1 辆（斜靠东墙）+ 停放区 4 辆 */
export function createBicycles() {
  const group = new THREE.Group();
  group.name = 'bicycle';

  const spots = [
    // 便利店外：斜靠东玻璃墙（x=9.5）东侧步道，车头朝北
    { x: 9.75, z: -0.3, yaw: Math.PI / 2, lean: -0.14 },
    // 自行车停放区（U 形架之间）
    { x: -5.7, z: 1.15, yaw: 0.3 },
    { x: -5.6, z: 1.9, yaw: -0.2 },
    { x: -4.2, z: 1.2, yaw: 0.15 },
    { x: -4.1, z: 1.85, yaw: -0.35 },
  ];

  spots.forEach((sp, i) => {
    const bike = createBicycle({ seed: i + 1 });
    bike.position.set(sp.x, SIDEWALK_TOP, sp.z);
    bike.rotation.y = sp.yaw;
    if (sp.lean) bike.rotation.z = sp.lean; // 靠墙倾斜（世界 Z 轴）
    group.add(bike);
  });

  return group;
}
