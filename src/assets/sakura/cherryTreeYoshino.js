/**
 * 染井吉野樱（盛放）—— 独立资产。
 * 特征：树干灰褐纵裂、枝条开展呈花瓶形；花冠为淡粉单瓣，先花后叶，
 * 冠层顶部受光面更浅、底部略深，表面密布花瓣簇，枝干带微风摆动。
 */

import * as THREE from 'three';
import {
  rng, makeTrunk, makeBranch, makeCanopyPuff, scatterPetals, registerSway, makePetalGeometry,
} from './treeBuilder.js';

const COLOR_BASE = '#f6c8d4';   // 冠层主体：淡樱粉
const COLOR_LIGHT = '#fce7ee';  // 受光面：近白粉
const COLOR_DEEP = '#e9a9bf';   // 底部阴影面：深樱粉

/**
 * @param {object} o { seed }
 * @returns {THREE.Group}
 */
export function createYoshinoCherry({ seed = 101 } = {}) {
  const r = rng(seed);
  const group = new THREE.Group();
  group.name = `yoshinoCherry_${seed}`;

  // —— 树干（高度/基部随种子变化）——
  const height = 4.6 + r() * 1.0;
  const baseRadius = 0.17 + r() * 0.035;
  const trunk = makeTrunk({ height, baseRadius, seed });
  group.add(trunk);

  // —— 主枝（4~5 根，自树干上部斜上开展）——
  const branchPivots = [];
  const branchTips = [];
  const nBranches = 4 + Math.floor(r() * 2);
  for (let i = 0; i < nBranches; i++) {
    const attachH = height * (0.58 + r() * 0.3); // 附着高度
    const len = 1.5 + r() * 1.1;
    const { pivot } = makeBranch({ length: len, baseRadius: 0.045 + r() * 0.02, seed: seed * 31 + i });
    // 方位角均布 + 随机扰动，斜上开展（花瓶形）
    const azim = (i / nBranches) * Math.PI * 2 + (r() - 0.5) * 0.9;
    pivot.position.set(
      Math.cos(azim) * baseRadius * 1.6,
      attachH,
      Math.sin(azim) * baseRadius * 1.6
    );
    // 先绕自身轴倾斜：外展 + 上举
    const tilt = 0.55 + r() * 0.5; // 与竖直方向夹角
    pivot.rotation.z = (r() > 0.5 ? 1 : -1) * tilt;
    pivot.rotation.x = Math.cos(azim) * tilt * 0.35;
    group.add(pivot);
    branchPivots.push(pivot);

    // 记录枝端位置（花冠团块锚点）
    const tipLocal = new THREE.Vector3(0, len, 0).applyEuler(pivot.rotation);
    branchTips.push(pivot.position.clone().add(tipLocal));
  }

  // —— 花冠：扁圆冠层，中心位于树干顶端上方 ——
  const crownCenter = new THREE.Vector3((r() - 0.5) * 0.4, height + 0.75 + r() * 0.3, (r() - 0.5) * 0.4);
  const crownR = 2.1 + r() * 0.6;

  // 主体团块（围绕冠心 + 枝端分布）
  const puffs = [];
  const nPuffBase = 13 + Math.floor(r() * 5);
  for (let i = 0; i < nPuffBase; i++) {
    // 在扁球壳上取点：部分锚定枝端，其余填充冠层
    let c;
    if (i < branchTips.length && r() > 0.35) {
      const t = branchTips[i % branchTips.length];
      c = new THREE.Vector3(
        t.x + (r() - 0.5) * 1.2,
        Math.max(t.y, crownCenter.y - 0.4),
        t.z + (r() - 0.5) * 1.2
      );
    } else {
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(1 - r()); // 球面均匀
      c = new THREE.Vector3(
        crownCenter.x + Math.sin(phi) * Math.cos(theta) * crownR * (0.55 + r() * 0.4),
        crownCenter.y + Math.abs(Math.cos(phi)) * crownR * 0.62,
        crownCenter.z + Math.sin(phi) * Math.sin(theta) * crownR * (0.55 + r() * 0.4)
      );
    }
    const rad = 0.85 + r() * 0.75;
    const puff = makeCanopyPuff({ radius: rad, seed: seed * 17 + i, color: COLOR_BASE });
    puff.position.copy(c);
    group.add(puff);
    puffs.push({ c, rad });
  }

  // 受光面高光团块（顶部偏浅，模拟日光穿透花冠）
  const nLight = 8 + Math.floor(r() * 4);
  for (let i = 0; i < nLight; i++) {
    const src = puffs[Math.floor(r() * puffs.length)];
    const c = src.c.clone().add(new THREE.Vector3((r() - 0.5) * 0.7, src.rad * 0.42, (r() - 0.5) * 0.7));
    const puff = makeCanopyPuff({ radius: src.rad * (0.5 + r() * 0.3), seed: seed * 29 + i, color: COLOR_LIGHT });
    puff.position.copy(c);
    group.add(puff);
  }

  // 底部阴影团块（冠层下缘略深，增强体积感）
  const nDeep = 5 + Math.floor(r() * 3);
  for (let i = 0; i < nDeep; i++) {
    const src = puffs[Math.floor(r() * puffs.length)];
    const c = src.c.clone().add(new THREE.Vector3((r() - 0.5) * 0.6, -src.rad * 0.4, (r() - 0.5) * 0.6));
    const puff = makeCanopyPuff({ radius: src.rad * (0.45 + r() * 0.28), seed: seed * 37 + i, color: COLOR_DEEP });
    puff.position.copy(c);
    group.add(puff);
  }

  // —— 花瓣簇：盛放密度（外表面散布）——
  const petalGeo = makePetalGeometry();
  for (let i = 0; i < puffs.length; i += 2) {
    const { c, rad } = puffs[i];
    group.add(scatterPetals({ center: c, radius: rad, count: 46 + Math.floor(r() * 26), seed: seed * 53 + i, petalGeo }));
  }

  // —— 微风摆动：主枝小角度错相摆动 ——
  registerSway(branchPivots, { amp: 0.03, speed: 0.45 });

  return group;
}
