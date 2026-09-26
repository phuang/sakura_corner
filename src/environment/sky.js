/**
 * 春日晴空穹顶 —— 垂直渐变（天青 → 地平线暖白）+ 太阳方向柔光晕。
 * BackSide 大球体，不参与描边；配合远景雾形成空气透视。
 */

import * as THREE from 'three';
import { markNoOutline } from '../core/materials.js';

export function createSky(scene) {
  const sunDir = new THREE.Vector3(-0.52, 0.68, 0.5).normalize(); // 与主光方向一致

  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenith: { value: new THREE.Color('#6fb4e8') },   // 天顶：清透蓝
      uMid: { value: new THREE.Color('#a9d3f0') },     // 中段：浅蓝
      uHorizon: { value: new THREE.Color('#eef7fc') }, // 地平线：暖白
      uSunDir: { value: sunDir },
      uSunColor: { value: new THREE.Color('#fff3dd') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      varying vec3 vDir;
      void main() {
        float h = clamp(vDir.y, 0.0, 1.0);
        // 三段渐变：地平线 → 中段 → 天顶
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.28, h));
        col = mix(col, uZenith, smoothstep(0.25, 0.85, h));
        // 太阳柔光晕（宽晕 + 核心）
        float sd = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
        col += uSunColor * (pow(sd, 6.0) * 0.16 + pow(sd, 48.0) * 0.35);
        // 地平线下方轻微暖化（防止底座边缘发灰）
        if (vDir.y < 0.0) col = mix(col, uHorizon, clamp(-vDir.y * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const dome = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 32), mat);
  dome.renderOrder = -10;
  markNoOutline(dome);
  scene.add(dome);

  // 远景雾：春日柔和空气感（只影响远处，近景通透）
  scene.fog = new THREE.Fog(0xeaf4fb, 62, 150);

  return dome;
}
