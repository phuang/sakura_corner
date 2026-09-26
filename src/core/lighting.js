/**
 * 电影级打光 —— 白日晴暖漫射日光。
 * - 主光（太阳）：暖白方向光，PCFSoft 大阴影范围，投向东侧强化街角体积感；
 * - 半球环境光：天蓝 / 地面暖色，提供柔和漫射基底；
 * - 补光：冷色弱方向光，从对侧提亮暗部，避免死黑。
 * breathing()：路灯/店灯/灯箱的微弱呼吸明暗（正弦调制）。
 */

import * as THREE from 'three';
import { addUpdater } from './animationRegistry.js';

export function setupLighting(scene) {
  // —— 主光：太阳 ——
  const sun = new THREE.DirectionalLight(0xfff1da, 2.35);
  sun.position.set(-17, 26, 19);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  const ext = 27;
  sun.shadow.camera.left = -ext;
  sun.shadow.camera.right = ext;
  sun.shadow.camera.top = ext;
  sun.shadow.camera.bottom = -ext;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  scene.add(sun.target);

  // —— 半球环境光（漫射基底）——
  const hemi = new THREE.HemisphereLight(0xbcd9ff, 0xffe8d2, 0.85);
  scene.add(hemi);

  // —— 补光：冷色弱光，提亮暗部 ——
  const fill = new THREE.DirectionalLight(0xd4e6ff, 0.5);
  fill.position.set(22, 14, -16);
  scene.add(fill);

  return { sun, hemi, fill };
}

/**
 * 呼吸明暗动画：对灯光 intensity 或材质 emissiveIntensity 做正弦调制。
 * @param {THREE.Light|THREE.Material} target
 * @param {object} o { base, amp, speed, phase }
 */
export function breathing(target, { base = 1.0, amp = 0.16, speed = 0.55, phase = 0 } = {}) {
  addUpdater((t) => {
    const v = base + amp * Math.sin(t * speed + phase);
    if (target.isLight) target.intensity = v;
    else if (target.emissiveIntensity !== undefined) target.emissiveIntensity = v;
  });
}
