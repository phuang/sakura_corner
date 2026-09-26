/**
 * 玻璃幕墙 —— 独立资产（南立面 + 东立面 L 形转角包裹）。
 * - 铝框网格：竖梃 / 横档（transom）/ 顶部压顶 / 底部踢脚槽；
 * - 分格物理玻璃（每格独立材质，envMapRotation 缓慢流动 → 玻璃光影浮动）；
 * - 门洞 x∈[6,8] 的玻璃与滑扇由 autoDoor.js 提供，本模块只出框架与 transom。
 * 立面平面：南 z=+3.0、东 x=+9.5（与 STORE 常量一致）。
 */

import * as THREE from 'three';
import { metal, glass } from '../../core/materials.js';
import { addUpdater } from '../../core/animationRegistry.js';
import { STORE } from './storeBuilding.js';

const H = STORE.GLASS_TOP;      // 3.62 幕墙总高
const BASE_H = 0.17;            // 底部踢脚槽顶线（玻璃自此起）
const TOP_RAIL_BOT = 3.5;       // 顶部压顶底边
const TRANSOM_Y = 2.52;         // transom 横档中心线

export function createGlassFacade() {
  const group = new THREE.Group();
  group.name = 'glassFacade';

  const frameMat = metal(0xc9ced4, 0.35, 0.8);   // 亮铝竖梃 / 横档
  const darkMat = metal(0x6d737b, 0.5, 0.72);    // 底部踢脚槽（深灰）

  const glassMats = [];
  /** 分格玻璃：thin box，独立物理材质 */
  function addPane(w, h, x, y, z, rotY = 0) {
    const m = glass({ tint: 0xd8edf5, opacity: 0.24 });
    glassMats.push(m);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.024), m);
    pane.position.set(x, y, z);
    if (rotY) pane.rotation.y = rotY;
    group.add(pane);
  }

  // —— 南立面竖梃（x=4/6/8；门洞两侧 x=6、x=8）——
  for (const x of [4, 6, 8]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.1, H, 0.15), frameMat);
    v.position.set(x, H / 2, STORE.Z1);
    v.castShadow = true;
    group.add(v);
  }

  // —— 转角立柱（SE 街角主柱 + SW/NE 端柱）——
  const postSE = new THREE.Mesh(new THREE.BoxGeometry(0.19, H, 0.19), frameMat);
  postSE.position.set(STORE.X1, H / 2, STORE.Z1);
  postSE.castShadow = true;
  group.add(postSE);

  const postSW = new THREE.Mesh(new THREE.BoxGeometry(0.16, H, 0.17), frameMat);
  postSW.position.set(STORE.X0 + 0.04, H / 2, STORE.Z1 - 0.005);
  postSW.castShadow = true;
  group.add(postSW);

  const postNE = new THREE.Mesh(new THREE.BoxGeometry(0.17, H, 0.16), frameMat);
  postNE.position.set(STORE.X1 - 0.005, H / 2, STORE.Z0 + 0.04);
  postNE.castShadow = true;
  group.add(postNE);

  // —— 东立面竖梃（z=-3/-1.5/0/+1.5，五格 1.5m）——
  for (const z of [-3, -1.5, 0, 1.5]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.15, H, 0.1), frameMat);
    v.position.set(STORE.X1, H / 2, z);
    v.castShadow = true;
    group.add(v);
  }

  // —— transom 横档（门洞上方连续）——
  const transS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0, 0.1, 0.14), frameMat);
  transS.position.set((STORE.X0 + STORE.X1) / 2, TRANSOM_Y, STORE.Z1);
  group.add(transS);

  const transE = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, STORE.X1 - STORE.X0), frameMat);
  transE.position.set(STORE.X1, TRANSOM_Y, (STORE.Z0 + STORE.Z1) / 2);
  group.add(transE);

  // —— 顶部压顶（玻璃顶线收边）——
  const railS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0, 0.12, 0.16), frameMat);
  railS.position.set((STORE.X0 + STORE.X1) / 2, TOP_RAIL_BOT + 0.06, STORE.Z1);
  railS.castShadow = true;
  group.add(railS);

  const railE = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, STORE.X1 - STORE.X0), frameMat);
  railE.position.set(STORE.X1, TOP_RAIL_BOT + 0.06, (STORE.Z0 + STORE.Z1) / 2);
  railE.castShadow = true;
  group.add(railE);

  // —— 底部踢脚槽（深灰金属，盖住室内外高差）——
  const kickS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0, BASE_H, 0.18), darkMat);
  kickS.position.set((STORE.X0 + STORE.X1) / 2, BASE_H / 2, STORE.Z1 - 0.04);
  group.add(kickS);

  const kickE = new THREE.Mesh(new THREE.BoxGeometry(0.18, BASE_H, STORE.X1 - STORE.X0), darkMat);
  kickE.position.set(STORE.X1 - 0.04, BASE_H / 2, (STORE.Z0 + STORE.Z1) / 2);
  group.add(kickE);

  // —— 分格玻璃（南：[2-4]、[4-6]、[8-9.5]；东：五格）——
  const paneH = TOP_RAIL_BOT - BASE_H;          // 3.33
  const paneY = (BASE_H + TOP_RAIL_BOT) / 2;    // 1.835
  const zGlass = STORE.Z1 - 0.03;               // 南玻璃面（略退于竖梃中线）
  const xGlass = STORE.X1 - 0.03;               // 东玻璃面

  for (const [a, b] of [[2, 4], [4, 6], [8, 9.5]]) {
    addPane(b - a - 0.16, paneH, (a + b) / 2, paneY, zGlass);
  }
  for (const [a, b] of [[-4.5, -3], [-3, -1.5], [-1.5, 0], [0, 1.5], [1.5, 3]]) {
    addPane(b - a - 0.16, paneH, xGlass, paneY, (a + b) / 2, Math.PI / 2);
  }

  // —— 玻璃光影浮动：envMapRotation 缓慢漂移（各格相位错开）——
  addUpdater((t) => {
    for (let i = 0; i < glassMats.length; i++) {
      glassMats[i].envMapRotation = t * 0.03 + i * 1.7;
    }
  });

  return group;
}
