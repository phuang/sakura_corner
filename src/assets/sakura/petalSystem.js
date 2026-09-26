/**
 * 樱花动态系统 —— 独立资产。
 * - 空中飘落：600 片花瓣实例，风场驱动 + 个体 flutter（翻滚/飘摆），落地循环重生；
 * - 地面堆积：约 950 片贴地花瓣，随风缓慢漂移、翻转；
 * - 花堆：树下与路缘的粉色花瓣丘（压扁团块）；
 * - 落粉层：树冠投影下的柔和粉色渐变贴片。
 */

import * as THREE from 'three';
import { toon, markNoOutline } from '../../core/materials.js';
import { addUpdater } from '../../core/animationRegistry.js';
import { rng, makePetalGeometry } from './treeBuilder.js';

/** 场景地面高度（与布局一致：站台/道路/人行道） */
function groundY(x, z) {
  if (x >= -17 && x <= 9 && z >= -5.5 && z <= -2) return 0.46; // 站台顶面
  if (z >= 8.1 && z <= 14.3) return 0.14;                       // 主路 A
  if (x >= 12.0 && x <= 17.2 && z < 8.1) return 0.14;           // 路 B
  return 0.05;                                                  // 人行道/底座顶面
}

/** 落粉层径向渐变纹理 */
function makePinkPatchTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(246,198,212,0.5)');
  g.addColorStop(0.55, 'rgba(246,198,212,0.22)');
  g.addColorStop(1, 'rgba(246,198,212,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * @param {THREE.Scene} scene
 * @param {object} o { trees: [{x,z,crownY,crownR}], seed }
 */
export function createPetalSystem(scene, { trees, seed = 301 } = {}) {
  const r = rng(seed);
  const group = new THREE.Group();
  group.name = 'petalSystem';

  const petalGeo = makePetalGeometry();
  const WIND = new THREE.Vector2(0.55, 0.14); // 基础风向量（x,z）

  // ================= 空中飘落花瓣 =================
  const N_FALL = 600;
  const fallMat = toon('#f9dde7', { side: THREE.DoubleSide });
  const fallInst = new THREE.InstancedMesh(petalGeo, fallMat, N_FALL);
  fallInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const st = []; // 每片花瓣状态
  function spawnPetal(i, initial) {
    const tree = trees[Math.floor(r() * trees.length)];
    const a = r() * Math.PI * 2;
    const rr = Math.sqrt(r()) * (tree.crownR + 0.6);
    st[i] = {
      x: tree.x + Math.cos(a) * rr,
      y: initial ? 0.5 + r() * (tree.crownY + 1.2) : tree.crownY - 0.4 + r() * 1.6,
      z: tree.z + Math.sin(a) * rr,
      fall: 0.32 + r() * 0.42,          // 下落速度 m/s
      flutFreq: 1.2 + r() * 1.8,        // flutter 频率
      flutPhase: r() * Math.PI * 2,
      rotX: (r() - 0.5) * 6,            // 翻滚角速度
      rotY: (r() - 0.5) * 6,
      rotZ: (r() - 0.5) * 4,
      ex: r() * Math.PI * 2, ey: r() * Math.PI * 2, ez: r() * Math.PI * 2, // 当前欧拉角
      scale: 0.8 + r() * 0.7,
    };
  }
  for (let i = 0; i < N_FALL; i++) spawnPetal(i, true);

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const sv = new THREE.Vector3();
  const pv = new THREE.Vector3();

  // ================= 地面堆积花瓣（随风漂移）=================
  const N_GROUND = 950;
  const groundMat = toon('#f4c6d4', { side: THREE.DoubleSide });
  const groundInst = new THREE.InstancedMesh(petalGeo, groundMat, N_GROUND);
  groundInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const gst = [];
  for (let i = 0; i < N_GROUND; i++) {
    // 70% 聚集在树下，30% 散布于风向下风向的路缘/人行道
    let hx, hz;
    if (r() < 0.7) {
      const tree = trees[Math.floor(r() * trees.length)];
      const a = r() * Math.PI * 2;
      const rr = Math.sqrt(r()) * (tree.crownR + 1.4);
      hx = tree.x + Math.cos(a) * rr;
      hz = tree.z + Math.sin(a) * rr;
    } else {
      hx = -17 + r() * 32;
      hz = -5 + r() * 8.5; // 人行道带与路口区域
    }
    if (Math.abs(hx) > 18.4 || Math.abs(hz) > 18.4) { hx *= 0.9; hz *= 0.9; }
    gst.push({
      hx, hz,
      phase: r() * Math.PI * 2,
      speed: 0.3 + r() * 0.5,
      driftAmp: 0.25 + r() * 0.45,   // 随风漂移幅度
      rotBase: r() * Math.PI * 2,
      scale: 0.85 + r() * 0.6,
    });
  }

  function writeGroundMatrices(t) {
    for (let i = 0; i < N_GROUND; i++) {
      const g = gst[i];
      // 随风缓慢漂移（双频正弦往复，无跳变），贴地
      const dx = Math.sin(t * g.speed + g.phase) * g.driftAmp
               + Math.sin(t * 0.17 + g.phase * 2.1) * g.driftAmp * 0.5;
      const dz = Math.cos(t * g.speed * 0.8 + g.phase) * g.driftAmp * 0.6;
      const x = g.hx + dx;
      const z = g.hz + dz;
      const y = groundY(x, z) + 0.012;
      eul.set(
        Math.sin(t * 0.4 + g.phase) * 0.35, // 轻微翻动
        g.rotBase + t * 0.05,
        Math.cos(t * 0.33 + g.phase) * 0.3
      );
      q.setFromEuler(eul);
      sv.setScalar(g.scale);
      pv.set(x, y, z);
      m4.compose(pv, q, sv);
      groundInst.setMatrixAt(i, m4);
    }
    groundInst.instanceMatrix.needsUpdate = true;
  }

  // ================= 花堆（树下/路缘花瓣丘）=================
  // 暖粉自发光（低蓝）：阴影 + 冷半球光下防止粉色偏蓝紫
  const moundMat = toon('#f3c2d1', { emissive: '#c96f8e', emissiveIntensity: 0.75 });
  const moundGeo = new THREE.IcosahedronGeometry(1, 1);
  {
    const pos = moundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      // 压扁 + 噪声起伏
      pos.setY(i, pos.getY(i) * 0.28 + Math.sin(pos.getX(i) * 5.1) * 0.06);
    }
    moundGeo.computeVertexNormals();
  }
  for (const tree of trees) {
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const rr = r() * (tree.crownR * 0.8 + 1.2);
      const x = tree.x + Math.cos(a) * rr;
      const z = tree.z + Math.sin(a) * rr;
      const mound = new THREE.Mesh(moundGeo, moundMat);
      const s = 0.45 + r() * 0.55;
      mound.scale.set(s, s * (0.8 + r() * 0.4), s);
      mound.position.set(x, groundY(x, z) - 0.02, z);
      mound.rotation.y = r() * Math.PI * 2;
      mound.receiveShadow = true;
      group.add(mound);
    }
  }

  // ================= 落粉层（树冠投影下的柔和粉色）=================
  const patchTex = makePinkPatchTexture();
  for (const tree of trees) {
    const patchMat = new THREE.MeshBasicMaterial({
      map: patchTex, transparent: true, depthWrite: false, opacity: 0.85,
    });
    const patch = new THREE.Mesh(new THREE.CircleGeometry(tree.crownR + 1.6, 40), patchMat);
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(tree.x, groundY(tree.x, tree.z) + 0.015, tree.z);
    markNoOutline(patch);
    group.add(patch);
  }

  // ================= 每帧更新 =================
  addUpdater((t, dt) => {
    const d = Math.min(dt, 0.05); // 防大步长跳变
    // 风场缓慢起伏
    const wx = WIND.x + Math.sin(t * 0.13) * 0.22;
    const wz = WIND.y + Math.cos(t * 0.11) * 0.14;

    for (let i = 0; i < N_FALL; i++) {
      const p = st[i];
      // flutter：水平飘摆叠加在风场上
      const flutX = Math.sin(t * p.flutFreq + p.flutPhase) * 0.55;
      const flutZ = Math.cos(t * p.flutFreq * 0.83 + p.flutPhase) * 0.42;
      p.x += (wx + flutX) * d;
      p.z += (wz + flutZ) * d;
      p.y -= p.fall * d;
      // 翻滚旋转
      p.ex += p.rotX * d; p.ey += p.rotY * d; p.ez += p.rotZ * d;

      const gy = groundY(p.x, p.z);
      if (p.y < gy + 0.02 || Math.abs(p.x) > 18.6 || Math.abs(p.z) > 18.6) {
        spawnPetal(i, false); // 重生于某棵樱花树冠
      }

      eul.set(p.ex, p.ey, p.ez);
      q.setFromEuler(eul);
      sv.setScalar(p.scale);
      pv.set(p.x, p.y, p.z);
      m4.compose(pv, q, sv);
      fallInst.setMatrixAt(i, m4);
    }
    fallInst.instanceMatrix.needsUpdate = true;

    writeGroundMatrices(t);
  });

  group.add(fallInst);
  group.add(groundInst);
  scene.add(group);
  return group;
}
