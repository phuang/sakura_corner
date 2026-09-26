/**
 * 正方形纯色底座 —— 微缩收藏模型台座。
 * 38×38 规整方台，顶面 y=0（场景地面基准），单一暖米色，无纹理无装饰。
 */

import * as THREE from 'three';
import { toon } from '../core/materials.js';

export const BASE_SIZE = 38; // x,z ∈ [-19, +19]

export function createBasePlatform() {
  const group = new THREE.Group();
  group.name = 'basePlatform';

  const mat = toon('#f0e7d8'); // 纯色：暖米白（与春日樱花色调相衬）
  const slab = new THREE.Mesh(new THREE.BoxGeometry(BASE_SIZE, 1.5, BASE_SIZE), mat);
  slab.position.y = -0.75; // 顶面恰好 y=0
  slab.receiveShadow = true;
  group.add(slab);

  return group;
}
