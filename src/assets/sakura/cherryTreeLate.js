/**
 * 晚樱（盛放）—— 独立资产。
 * 特征：重瓣深粉，花冠密实浑圆、层次更厚；树干较矮壮，
 * 冠层由更多小团块堆叠而成，花瓣簇密度高于染井吉野樱。
 */

import * as THREE from 'three';
import {
  rng, makeTrunk, makeBranch, makeCanopyPuff, scatterPetals, registerSway, makePetalGeometry,
} from './treeBuilder.js';

const COLOR_BASE = '#ef9db8';   // 冠层主体：深樱粉（重瓣）
const COLOR_LIGHT = '#f7c3d5';  // 受光面：浅粉
const COLOR_DEEP = '#e084a4';   // 阴影面：浓粉

/**
 * @param {object} o { seed }
 * @returns {THREE.Group}
 */
export function createLateCherry({ seed = 201 } = {}) {
  const r = rng(seed);
  const group = new THREE.Group();
  group.name = `lateCherry_${seed}`;

  // —— 树干（较矮壮）——
  const height = 3.7 + r() * 0.8;
  const baseRadius = 0.16 + r() * 0.04;
  const trunk = makeTrunk({ height, baseRadius, seed: seed + 5 });
  group.add(trunk);

  // —— 主枝（3~4 根，开展角度更缓）——
  const branchPivots = [];
  const branchTips = [];
  const nBranches = 3 + Math.floor(r() * 2);
  for (let i = 0; i < nBranches; i++) {
    const attachH = height * (0.55 + r() * 0.3);
    const len = 1.3 + r() * 0.9;
    const { pivot } = makeBranch({ length: len, baseRadius: 0.042 + r() * 0.018, seed: seed * 41 + i });
    const azim = (i / nBranches) * Math.PI * 2 + (r() - 0.5) * 1.1;
    // 计算附着高度处树干实际半径（锥形收分公式与 makeTrunk 一致）
    const attachT = attachH / height;
    const trunkRadAtAttach = baseRadius * (1 - Math.pow(attachT, 1.35) * 0.86);
    pivot.position.set(
      Math.cos(azim) * trunkRadAtAttach,
      attachH,
      Math.sin(azim) * trunkRadAtAttach
    );
    const tilt = 0.55 + r() * 0.4; // 与竖直方向夹角（32°~55°）
    pivot.rotation.order = 'YXZ';
    pivot.rotation.y = azim;       // 水平朝向方位角
    pivot.rotation.x = tilt;      // 从竖直向外倾斜
    group.add(pivot);
    branchPivots.push(pivot);

    const tipLocal = new THREE.Vector3(0, len, 0).applyEuler(pivot.rotation);
    branchTips.push(pivot.position.clone().add(tipLocal));
  }

  // —— 花冠：密实浑圆（更多小团块堆叠）——
  const crownCenter = new THREE.Vector3((r() - 0.5) * 0.3, height + 0.6 + r() * 0.25, (r() - 0.5) * 0.3);
  const crownR = 1.75 + r() * 0.4;

  const puffs = [];
  const nPuffBase = 17 + Math.floor(r() * 6);
  for (let i = 0; i < nPuffBase; i++) {
    let c;
    if (i < branchTips.length && r() > 0.4) {
      const t = branchTips[i % branchTips.length];
      c = new THREE.Vector3(
        t.x + (r() - 0.5) * 1.0,
        Math.max(t.y, crownCenter.y - 0.3),
        t.z + (r() - 0.5) * 1.0
      );
    } else {
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(1 - r());
      c = new THREE.Vector3(
        crownCenter.x + Math.sin(phi) * Math.cos(theta) * crownR * (0.5 + r() * 0.45),
        crownCenter.y + Math.abs(Math.cos(phi)) * crownR * 0.6,
        crownCenter.z + Math.sin(phi) * Math.sin(theta) * crownR * (0.5 + r() * 0.45)
      );
    }
    const rad = 0.7 + r() * 0.55; // 团块更小更密
    const puff = makeCanopyPuff({ radius: rad, seed: seed * 19 + i, color: COLOR_BASE });
    puff.position.copy(c);
    group.add(puff);
    puffs.push({ c, rad });
  }

  // 受光面（重瓣花冠顶部浅粉）
  const nLight = 9 + Math.floor(r() * 4);
  for (let i = 0; i < nLight; i++) {
    const src = puffs[Math.floor(r() * puffs.length)];
    const c = src.c.clone().add(new THREE.Vector3((r() - 0.5) * 0.6, src.rad * 0.45, (r() - 0.5) * 0.6));
    const puff = makeCanopyPuff({ radius: src.rad * (0.42 + r() * 0.3), seed: seed * 23 + i, color: COLOR_LIGHT });
    puff.position.copy(c);
    group.add(puff);
  }

  // 阴影面（冠层下缘浓粉，密实感）
  const nDeep = 7 + Math.floor(r() * 4);
  for (let i = 0; i < nDeep; i++) {
    const src = puffs[Math.floor(r() * puffs.length)];
    const c = src.c.clone().add(new THREE.Vector3((r() - 0.5) * 0.5, -src.rad * 0.42, (r() - 0.5) * 0.5));
    const puff = makeCanopyPuff({ radius: src.rad * (0.4 + r() * 0.26), seed: seed * 31 + i, color: COLOR_DEEP });
    puff.position.copy(c);
    group.add(puff);
  }

  // —— 花瓣簇：重瓣密度更高（每个团块都散布）——
  const petalGeo = makePetalGeometry();
  for (let i = 0; i < puffs.length; i++) {
    const { c, rad } = puffs[i];
    group.add(scatterPetals({ center: c, radius: rad, count: 34 + Math.floor(r() * 22), seed: seed * 61 + i, petalGeo }));
  }

  // —— 微风摆动 ——
  registerSway(branchPivots, { amp: 0.026, speed: 0.5 });

  return group;
}
