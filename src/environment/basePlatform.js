/**
 * 正方形纯色底座 —— 微缩收藏模型台座。
 * 38×38 规整方台，顶面 y=0（场景地面基准），单一暖米色，无纹理无装饰。
 */

import * as THREE from 'three';
import { toon } from '../core/materials.js';

export const BASE_SIZE = 34; // 34×34 正方形底座，x∈[-16.5, +17.5], z∈[-18.0, +16.0]

export function createBasePlatform() {
  const group = new THREE.Group();
  group.name = 'basePlatform';

  const mat = toon('#f0e7d8'); // 纯色：暖米白（与春日樱花色调相衬）
  const slab = new THREE.Mesh(new THREE.BoxGeometry(BASE_SIZE, 1.5, BASE_SIZE), mat);
  slab.position.set(0.5, -0.76, -1.0); // 顶面 y=-0.01（微沉 1cm 形成台座凹槽，彻底消除地表网格底面共面闪烁）
  slab.receiveShadow = true;
  group.add(slab);

  return group;
}
