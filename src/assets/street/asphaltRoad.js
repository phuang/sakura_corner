/**
 * 柏油路面 —— 独立资产（L 形双路 + 人行道带）。
 * - 主路 A（东西向）：z∈[3,8.5]，全宽；沥青板顶面 y=0.14（与 petalSystem groundY 一致）；
 * - 路 B（南北向）：x∈[10.5,16]，z∈[-19,+3]；与主路 A 在东南形成 L 形街角路口；
 * - 人行道带：z∈[-2,+3] 全宽薄铺装，顶面 y=0.05（花瓣落地基准）+ 铺装分缝；
 * - 道路两侧混凝土路缘石 + 磨损白漆边缘线（分段实例化、逐段色差/缺口）；
 * - 井盖 ×3（金属 + 环形压边）；树池 ×2（晚樱 L1/L2 落于路 B 内，设方形树池收口）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { asphaltTexture, concreteTexture } from '../../core/textures.js';

const ROAD_TOP = 0.14;      // 路面顶面
const SIDEWALK_TOP = 0.05;  // 人行道带顶面

export function createAsphaltRoad() {
  const group = new THREE.Group();
  group.name = 'asphaltRoad';

  // —— 主路 A（东西向沥青板，z∈[8.1,14.3]，南侧紧凑收边）——
  const roadA = new THREE.Mesh(
    new THREE.BoxGeometry(34.2, ROAD_TOP, 6.2),
    toon('#ffffff', { map: asphaltTexture(7) })
  );
  roadA.position.set(0.5, ROAD_TOP / 2, 11.2); // z∈[8.1,14.3], x∈[-16.6,17.6]
  roadA.receiveShadow = true;
  group.add(roadA);

  // —— 路 B（南北向沥青板，x∈[12.0,17.2]，z∈[-18.1,8.1]）——
  const roadB = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, ROAD_TOP, 26.2),
    toon('#ffffff', { map: asphaltTexture(17) })
  );
  roadB.position.set(14.6, ROAD_TOP / 2, -5.0); // x∈[12.0,17.2], z∈[-18.1,+8.1]
  roadB.receiveShadow = true;
  group.add(roadB);

  // —— 人行道网络 ——
  const walkMat = toon('#ffffff', { map: concreteTexture(121, '#cfcac0') });

  // 1. 车站西侧站前广场（x∈[-16.5,2], z∈[-2,8.1]）
  const walkWest = new THREE.Mesh(
    new THREE.BoxGeometry(18.5, SIDEWALK_TOP, 10.1),
    walkMat
  );
  walkWest.position.set(-7.25, SIDEWALK_TOP / 2, 3.05);
  walkWest.receiveShadow = true;
  group.add(walkWest);

  // 2. 便利店前侧人行道（x∈[2,12.0], z∈[3.0,8.1]，宽 5.1m 店前广场）
  const walkFront = new THREE.Mesh(
    new THREE.BoxGeometry(10.0, SIDEWALK_TOP, 5.1),
    walkMat
  );
  walkFront.position.set(7.0, SIDEWALK_TOP / 2, 5.55);
  walkFront.receiveShadow = true;
  group.add(walkFront);

  // 3. 便利店东侧人行道（x∈[9.5,12.0], z∈[-18.1,8.1]，承载晚樱树与树池）
  const walkEast = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, SIDEWALK_TOP, 26.2),
    walkMat
  );
  walkEast.position.set(10.75, SIDEWALK_TOP / 2, -5.0);
  walkEast.receiveShadow = true;
  group.add(walkEast);

  // 4. 主路 A 南侧紧凑路肩（z∈[14.3,16.0]，仅留 1.7m 路肩收边，彻底消除留白）
  const walkSouth = new THREE.Mesh(
    new THREE.BoxGeometry(34.2, SIDEWALK_TOP, 1.7),
    walkMat
  );
  walkSouth.position.set(0.5, SIDEWALK_TOP / 2, 15.15);
  walkSouth.receiveShadow = true;
  group.add(walkSouth);

  // 5. 路 B 东侧路缘带（x∈[17.2,17.5], z∈[-18.1,16.0]）
  const walkEdgeE = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, SIDEWALK_TOP, 34.1),
    walkMat
  );
  walkEdgeE.position.set(17.35, SIDEWALK_TOP / 2, -1.0);
  walkEdgeE.receiveShadow = true;
  group.add(walkEdgeE);

  // 铺装分缝（细暗线，InstancedMesh）
  {
    const jointGeo = new THREE.BoxGeometry(1, 0.006, 0.024);
    const jointMat = toon('#a9a59b');
    const joints = [];
    for (let x = -16; x <= 11; x += 2) joints.push({ x, z: 3.05, len: 10.1, rot: 0 }); // 西区纵向缝
    for (let x = 2; x <= 11; x += 2) joints.push({ x, z: 5.55, len: 5.1, rot: 0 });    // 店前纵向缝
    for (let z = -17; z <= 7; z += 2) joints.push({ x: 10.75, z, len: 2.5, rot: Math.PI / 2 }); // 东区横向缝
    for (let z = -1.5; z <= 7.5; z += 1.5) joints.push({ x: -7.25, z, len: 18.5, rot: Math.PI / 2 }); // 西区横向缝
    const inst = new THREE.InstancedMesh(jointGeo, jointMat, joints.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eul = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    joints.forEach((j, i) => {
      eul.set(0, j.rot, 0);
      q.setFromEuler(eul);
      s.set(j.len, 1, 1);
      p.set(j.x, SIDEWALK_TOP + 0.003, j.z);
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
  }

  // —— 路缘石（混凝土，顶面 y=0.20）——
  const curbMat = toon('#ffffff', { map: concreteTexture(123, '#b9b4a8') });
  function curb(w, d, x, z) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), curbMat);
    c.position.set(x, 0.1, z);
    c.castShadow = true;
    c.receiveShadow = true;
    group.add(c);
  }
  curb(28.5, 0.22, -2.25, 7.99);       // 主路 A 北侧（止于路口 x=12.0）
  curb(34.2, 0.22, 0.5, 14.41);        // 主路 A 南侧全长收口
  curb(0.22, 26.2, 11.89, -5.0);       // 路 B 西侧（止于路口 z=8.1）
  curb(0.22, 34.1, 17.25, -1.0);       // 场景东侧边缘全长路缘

  // —— 边缘白线（磨损：分段实例化 + 逐段色差/随机缺口）——
  {
    const segGeo = new THREE.BoxGeometry(1.9, 0.012, 0.13);
    const segMat = toon('#ffffff');
    const specs = [
      { x0: -16.0, x1: 11.5, z: 8.45, rot: 0 },         // 主路 A 北缘
      { x0: -16.0, x1: 17.0, z: 13.95, rot: 0 },        // 主路 A 南缘
      { x0: 12.4, x1: 12.4, z0: -17.5, z1: 7.5, rot: Math.PI / 2 },  // 路 B 西缘
      { x0: 16.8, x1: 16.8, z0: -17.5, z1: 13.5, rot: Math.PI / 2 }, // 路 B 东缘
    ];
    const items = [];
    for (const sp of specs) {
      const along = sp.rot === 0 ? [sp.x0, sp.x1] : [sp.z0, sp.z1];
      let u = along[0];
      while (u < along[1]) {
        if (Math.random() < 0.82) items.push({ u, sp }); // 随机缺口 → 磨损感
        u += 1.95;
      }
    }
    const inst = new THREE.InstancedMesh(segGeo, segMat, items.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eul = new THREE.Euler();
    const s = new THREE.Vector3(1, 1, 1);
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      const sp = it.sp;
      eul.set(0, sp.rot, 0);
      q.setFromEuler(eul);
      if (sp.rot === 0) p.set(it.u + 0.95, ROAD_TOP + 0.006, sp.z);
      else p.set(sp.x0, ROAD_TOP + 0.006, it.u + 0.95);
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
      // 逐段色差（新漆 → 褪色）
      const v = 0.78 + Math.random() * 0.2;
      col.setRGB(0.91 * v, 0.9 * v, 0.85 * v);
      inst.setColorAt(i, col);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    group.add(inst);
  }

  // —— 井盖 ×3（金属 + 环形压边，位于马路上）——
  const manholeMat = metal(0x787f88, 0.5, 0.72);
  const rimMat = metal(0x61686f, 0.55, 0.7);
  for (const [mx, mz] of [[-8.5, 11.2], [-2, 11.5], [14.6, -9.0]]) {
    const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.035, 28), manholeMat);
    cover.position.set(mx, ROAD_TOP + 0.017, mz);
    group.add(cover);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.022, 8, 32), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(mx, ROAD_TOP + 0.035, mz);
    group.add(rim);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 8, 28), rimMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.set(mx, ROAD_TOP + 0.037, mz);
    group.add(innerRing);
  }

  // —— 树池 ×2（晚樱 L1/L2 落于东侧人行道 x=10.75：方形混凝土收边 + 土面）——
  const pitMat = toon('#ffffff', { map: concreteTexture(127, '#b3aea2') });
  const soilMat = toon('#4a3b2e');
  for (const [tx, tz] of [[10.75, 1.0], [10.75, -6.5]]) {
    const S = 1.4, T = 0.14; // 边长 / 壁厚
    const mk = (w, d, x, z) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), pitMat);
      b.position.set(x, SIDEWALK_TOP + 0.09, z);
      b.castShadow = true;
      group.add(b);
    };
    mk(S, T, tx, tz - S / 2 + T / 2);
    mk(S, T, tx, tz + S / 2 - T / 2);
    mk(T, S - 2 * T, tx - S / 2 + T / 2, tz);
    mk(T, S - 2 * T, tx + S / 2 - T / 2, tz);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 24), soilMat);
    soil.position.set(tx, SIDEWALK_TOP + 0.02, tz);
    group.add(soil);
  }

  return group;
}
