/**
 * 后处理合成器 —— 电影级三渲二渲染链。
 * RenderPass → OutlinePass（全场景动漫描边）→ UnrealBloomPass（春日空气光晕/灯光泛光）→ OutputPass
 * 使用 HalfFloat + MSAA×4 渲染目标，保证无锯齿、色彩过渡干净。
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createComposer(renderer, scene, camera) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());

  // MSAA×4 + HalfFloat 渲染目标（抗锯齿 + 宽色域）
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const composer = new EffectComposer(renderer, rt);

  // —— 场景渲染 ——
  composer.addPass(new RenderPass(scene, camera));

  // —— 动漫描边：可见轮廓深蓝灰、内部硬边缘浅淡，锐利干净 ——
  const outline = new OutlinePass(size.clone(), scene, camera);
  outline.edgeStrength = 4.2;
  outline.edgeGlow = 0.55;
  outline.edgeThickness = 1.35;
  outline.pulsePeriod = 0;
  outline.visibleEdgeColor.set('#33415e');
  outline.hiddenEdgeColor.set('#a8b6cf');
  composer.addPass(outline);

  // —— 春日空气光晕：低强度泛光，只拾取高亮（灯带/灯箱/阳光高光）——
  const bloom = new UnrealBloomPass(size.clone(), 0.34, 0.72, 0.8);
  composer.addPass(bloom);

  // —— 输出（sRGB + 色调映射）——
  composer.addPass(new OutputPass());

  function resize() {
    const s = renderer.getDrawingBufferSize(new THREE.Vector2());
    composer.setSize(s.x, s.y);
    outline.resolution.copy(s);
  }
  window.addEventListener('resize', resize);

  /** 收集场景中所有参与描边的网格（userData.noOutline=true 的除外） */
  function collectOutlineTargets() {
    const targets = [];
    scene.traverse((o) => {
      if ((o.isMesh || o.isInstancedMesh) && !o.userData.noOutline) {
        targets.push(o);
      }
    });
    outline.selectedObjects = targets;
  }

  return { composer, outline, bloom, resize, collectOutlineTargets };
}
