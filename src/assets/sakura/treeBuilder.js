/**
 * 樱花树体构建器 —— 染井吉野樱与晚樱共享的底层构件。
 * - makeTrunk():      LatheGeometry 树干，纵向收分 + 基部膨大，树皮纹理
 * - makeBranch():     锥形主枝/侧枝（独立枢轴，供微风摆动）
 * - makeCanopyPuff(): 顶点噪声位移的有机花冠团块
 * - scatterPetals():  花冠表面花瓣簇（InstancedMesh，盛放密度感）
 * - registerSway():   枝条/树冠微风摆动动画注册
 */

import * as THREE from 'three';
import { toon } from '../../core/materials.js';
import { barkTexture } from '../../core/textures.js';
import { addUpdater } from '../../core/animationRegistry.js';

/** mulberry32 种子随机数（与 textures.js 同算法，保证可复现） */
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 花瓣几何：微弯泪滴形小片（飘落/花簇共用） */
export function makePetalGeometry() {
  const w = 0.052, l = 0.082;
  const shape = new THREE.Shape();
  shape.moveTo(0, -l / 2);
  shape.bezierCurveTo(w * 0.95, -l * 0.12, w * 0.72, l * 0.34, 0, l / 2);
  shape.bezierCurveTo(-w * 0.72, l * 0.34, -w * 0.95, -l * 0.12, 0, -l / 2);
  const geo = new THREE.ShapeGeometry(shape, 8);
  // 沿长度方向轻微杯状弯曲（花瓣自然卷曲）
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + l / 2) / l;
    pos.setZ(i, Math.sin(t * Math.PI) * 0.016);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * 树干：LatheGeometry 轮廓（基部膨大 → 平滑收分），树皮纹理。
 */
export function makeTrunk({ height = 4.6, baseRadius = 0.17, seed = 1 }) {
  const r = rng(seed);
  const pts = [];
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // 基部膨大 + 平滑收分 + 轻微不规则
    let rad = baseRadius * (1 - Math.pow(t, 1.35) * 0.86);
    rad *= 1 + 0.14 * Math.sin(t * 7.3 + r() * 2) * t;
    pts.push(new THREE.Vector2(Math.max(rad, 0.02), t * height));
  }
  const geo = new THREE.LatheGeometry(pts, 16);
  // 整体轻微弯曲（自然生长姿态）
  const bendX = (r() - 0.5) * 0.35;
  const bendZ = (r() - 0.5) * 0.35;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = Math.pow(y / height, 2);
    pos.setX(i, pos.getX(i) + bendX * k * height * 0.16);
    pos.setZ(i, pos.getZ(i) + bendZ * k * height * 0.16);
  }
  geo.computeVertexNormals();

  const mat = toon('#ffffff', { map: barkTexture(seed * 7 + 3) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * 锥形枝条（独立枢轴组，便于摆动）。
 * @returns {{ pivot:THREE.Group, tip:THREE.Vector3 }}
 */
export function makeBranch({ length = 1.6, baseRadius = 0.05, seed = 2 }) {
  const r = rng(seed);
  const mat = toon('#ffffff', { map: barkTexture(seed * 13 + 5) });

  const pivot = new THREE.Group();
  const geo = new THREE.CylinderGeometry(baseRadius * 0.42, baseRadius, length, 8, 3);
  geo.translate(0, length / 2, 0); // 以基部为原点向上生长
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  pivot.add(mesh);

  // 侧生小枝（1~2 根）
  const subCount = 1 + Math.floor(r() * 2);
  for (let i = 0; i < subCount; i++) {
    const t = 0.45 + r() * 0.4; // 附着位置（沿主枝）
    const subLen = length * (0.35 + r() * 0.3);
    const subGeo = new THREE.CylinderGeometry(baseRadius * 0.16, baseRadius * 0.3, subLen, 6, 2);
    subGeo.translate(0, subLen / 2, 0);
    const sub = new THREE.Mesh(subGeo, mat);
    sub.position.set(0, t * length, 0);
    sub.rotation.z = (r() > 0.5 ? 1 : -1) * (0.7 + r() * 0.6);
    sub.rotation.x = (r() - 0.5) * 0.8;
    sub.castShadow = true;
    pivot.add(sub);
  }

  const tip = new THREE.Vector3(0, length, 0).applyEuler(pivot.rotation);
  return { pivot, tip };
}

/**
 * 花冠团块：Icosahedron + 顶点噪声位移 → 有机蓬松轮廓。
 */
export function makeCanopyPuff({ radius = 1.2, seed = 3, color }) {
  const r = rng(seed);
  const geo = new THREE.IcosahedronGeometry(radius, 2);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    // 低频 + 高频噪声叠加，形成自然起伏
    const n =
      0.72 * Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.7 + seed * 1.7) +
      0.28 * Math.sin(v.z * 5.3 + v.x * 4.1 + seed * 2.3);
    const k = radius * (1 + n * 0.22);
    pos.setXYZ(i, v.x * k, v.y * k * 0.86, v.z * k); // 纵向略压扁（树冠扁圆）
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, toon(color));
  mesh.castShadow = true;
  return mesh;
}

/**
 * 花冠表面花瓣簇：在团块外表面散布小花瓣（盛放密度感）。
 */
export function scatterPetals({ center, radius, count = 60, seed = 4, petalGeo }) {
  const r = rng(seed);
  const mat = toon('#fbe3ea', { side: THREE.DoubleSide });
  const inst = new THREE.InstancedMesh(petalGeo, mat, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < count; i++) {
    // 球面随机方向（偏上/偏外）
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(1 - r() * 1.35); // 偏向半球外侧
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.abs(Math.cos(phi)) * 0.8 + 0.2,
      Math.sin(phi) * Math.sin(theta)
    ).normalize();
    const p = center.clone().addScaledVector(dir, radius * (0.96 + r() * 0.1));
    e.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
    q.setFromEuler(e);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
  }
  inst.instanceMatrix.needsUpdate = true;
  return inst;
}

/**
 * 微风摆动：对枢轴组做小角度正弦旋转（各枝条相位/频率错开）。
 */
export function registerSway(pivots, { amp = 0.028, speed = 0.5 } = {}) {
  const items = pivots.map((p) => ({
    pivot: p,
    axisX: (Math.random() - 0.5),
    axisZ: (Math.random() - 0.5),
    phase: Math.random() * Math.PI * 2,
    speedMul: 0.7 + Math.random() * 0.6,
  }));
  addUpdater((t) => {
    for (const it of items) {
      const a = amp * Math.sin(t * speed * it.speedMul + it.phase);
      it.pivot.rotation.x = it.axisX * a;
      it.pivot.rotation.z = it.axisZ * a;
    }
  });
}
