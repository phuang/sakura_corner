/**
 * 材质工厂 —— 三渲二卡通渲染的核心。
 * - toon():   MeshToonMaterial + 共享 3 级渐变图（明暗分明、柔和过渡）
 * - metal():  写实金属（钢轨/灯具/自行车架等），依赖 PMREM 环境反射
 * - glass():  物理玻璃（幕墙/冷柜/贩卖机门），透明 + 强反射，支持 envMapRotation 动画
 * - emissive(): 自发光材质（灯带/灯箱/目的地显示），供 Bloom 拾取
 */

import * as THREE from 'three';

let gradientMap = null;

/** 3 级卡通渐变图：暗部 / 中间调 / 亮部，NearestFilter 保证阶跃干净 */
function getGradientMap() {
  if (gradientMap) return gradientMap;
  const data = new Uint8Array([96, 176, 255]);
  gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

const toonCache = new Map();

/**
 * 卡通材质（带缓存）
 * @param {number|string} color 基础色
 * @param {object} [opts] { map, emissive, emissiveIntensity, roughness, side }
 */
export function toon(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (toonCache.has(key)) return toonCache.get(key);
  const mat = new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap: getGradientMap(),
    map: opts.map || null,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 1.0,
    side: opts.side || THREE.FrontSide,
  });
  if (opts.map) {
    mat.map.colorSpace = THREE.SRGBColorSpace;
  }
  toonCache.set(key, mat);
  return mat;
}

/** 写实金属材质（钢轨、灯具、车架等） */
export function metal(color = 0x9aa3ad, roughness = 0.38, metalness = 0.85) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    envMapIntensity: 1.0,
  });
  return m;
}

/**
 * 物理玻璃材质（透明 + 反射）
 * @param {object} [opts] { tint, opacity, roughness }
 */
export function glass(opts = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(opts.tint ?? 0xd8edf5),
    transparent: true,
    opacity: opts.opacity ?? 0.24,
    roughness: opts.roughness ?? 0.06,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  return m;
}

/** 自发光材质（灯带 / 灯箱 / 显示屏），Bloom 拾取 */
export function emissive(color = 0xfff2cf, intensity = 1.6) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a1d24),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.6,
    metalness: 0.1,
  });
  return m;
}

/** 标记物体不参与描边（天空穹顶、雾面贴片等） */
export function markNoOutline(obj) {
  obj.traverse?.((o) => (o.userData.noOutline = true));
  if (!obj.traverse) obj.userData.noOutline = true;
  return obj;
}
