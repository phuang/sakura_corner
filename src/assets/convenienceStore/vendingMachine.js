/**
 * 自动贩卖机 —— 独立资产。
 * - **真实玻璃门，内部每层饮料清晰可见**（4 层货架 + 罐/瓶实例化满陈列）；
 * - 右侧控制面板：按钮阵列、投币口、退币口、读卡器；
 * - 顶部内灯呼吸（暖白）+ 柜内弱点光；顶盖抽象色块标识（无文字）。
 * 位置：(+9.95, +1.8) 东南角人行道（路 B 与店之间），正面朝西南路口。
 */

import * as THREE from 'three';
import { toon, metal, glass, emissive } from '../../core/materials.js';
import { breathing } from '../../core/lighting.js';

const X = 9.95, Z = 1.8;
const SIDEWALK_TOP = 0.05;
const YAW = -0.35; // 正面朝南偏西

const CAN_COLORS = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0',
                    '#8d7bd4', '#4ecdc4', '#f08c3a', '#c9564f', '#3f7fbf'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createVendingMachine() {
  const group = new THREE.Group();
  group.name = 'vendingMachine';

  const bodyMat = toon('#eef0f2');      // 机身暖白
  const darkMat = toon('#3a4048');      // 深色嵌件
  const coralMat = toon('#ef8b7c');     // 品牌色带（抽象标识）

  // —— 底座 + 机身 ——
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.74), darkMat);
  plinth.position.set(X, SIDEWALK_TOP + 0.05, Z);
  group.add(plinth);

  // —— 机身：空心壳体（正面开口），玻璃门后可见内部陈列 ——
  const BODY_BOT = SIDEWALK_TOP + 0.1;   // 机底 y=0.15，机顶 y=2.15
  function slab(w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
    return m;
  }
  slab(0.96, 2.0, 0.04, X, BODY_BOT + 1.0, Z - 0.33);        // 背板
  slab(0.04, 2.0, 0.7, X - 0.46, BODY_BOT + 1.0, Z);         // 左板
  slab(0.04, 2.0, 0.7, X + 0.46, BODY_BOT + 1.0, Z);         // 右板
  slab(0.96, 0.04, 0.7, X, BODY_BOT + 1.98, Z);              // 顶板
  slab(0.96, 0.04, 0.7, X, BODY_BOT + 0.02, Z);              // 底板
  // 正面封板（仅留玻璃门洞）：踢脚 / 顶盖 / 左右边条
  slab(0.96, 0.26, 0.04, X, BODY_BOT + 0.13, Z + 0.33);      // 踢脚板 y∈[0.15,0.41]
  slab(0.96, 0.1, 0.04, X, BODY_BOT + 1.95, Z + 0.33);       // 顶盖条 y∈[2.05,2.15]
  slab(0.05, 1.52, 0.03, X - 0.455, SIDEWALK_TOP + 1.08, Z + 0.33); // 左边条
  slab(0.05, 1.52, 0.03, X + 0.455, SIDEWALK_TOP + 1.08, Z + 0.33); // 右边条

  // —— 顶盖品牌带（抽象色块，无文字）——
  const brandBand = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.26, 0.72), coralMat);
  brandBand.position.set(X, SIDEWALK_TOP + 1.94, Z);
  group.add(brandBand);
  const logoDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), toon('#f6c8d4'));
  logoDisc.rotation.x = Math.PI / 2;
  logoDisc.position.set(X - 0.3, SIDEWALK_TOP + 1.94, Z + 0.37);
  group.add(logoDisc);

  // —— 玻璃门（左侧）：铝框 + 物理玻璃 ——
  const doorX = X - 0.16;               // 门中心 x（机身左半部）
  const FRAME_Y = SIDEWALK_TOP + 1.08;
  const frameMat = metal(0x8d949b, 0.45, 0.7);
  // 门框：四根边条围合（非整板），玻璃后可见内部
  function bar(w, h, x, y) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), frameMat);
    m.position.set(x, y, Z + 0.34);
    group.add(m);
  }
  bar(0.04, 1.52, doorX - 0.26, FRAME_Y);   // 左竖梃
  bar(0.04, 1.52, doorX + 0.26, FRAME_Y);   // 右竖梃
  bar(0.56, 0.04, doorX, FRAME_Y + 0.74);   // 上横档
  bar(0.56, 0.04, doorX, FRAME_Y - 0.74);   // 下横档

  const doorGlass = glass({ tint: 0xdff0f7, opacity: 0.12 });
  const pane = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.44, 0.02), doorGlass);
  pane.position.set(doorX, FRAME_Y, Z + 0.37);
  group.add(pane);

  // —— 内部：背板 + 4 层货架 + 饮料满陈列 ——
  const innerBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1.5, 0.02), toon('#2a2e35'));
  innerBack.position.set(doorX, SIDEWALK_TOP + 1.08, Z - 0.24);
  group.add(innerBack);

  const shelfMat = metal(0x9aa1a8, 0.5, 0.6);
  const SHELF_YS = [0.48, 0.86, 1.24, 1.62]; // 层板顶面（相对 SIDEWALK_TOP，顶层瓶口不超出门洞上沿）
  for (const sy of SHELF_YS) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.02, 0.3), shelfMat);
    shelf.position.set(doorX, SIDEWALK_TOP + sy, Z - 0.06);
    group.add(shelf);
  }

  // 罐装（InstancedMesh）：每层 7 罐 ×4 层
  const r = rng(311);
  const canGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.13, 10);
  const cans = new THREE.InstancedMesh(canGeo, toon('#ffffff'), SHELF_YS.length * 7);
  // 瓶装（InstancedMesh）：每层 4 瓶 ×4 层
  const bottleGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.18, 10);
  const bottles = new THREE.InstancedMesh(bottleGeo, toon('#ffffff'), SHELF_YS.length * 4);
  {
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    let ci = 0, bi = 0;
    for (const sy of SHELF_YS) {
      // 罐：左半区
      for (let i = 0; i < 7; i++) {
        m.makeTranslation(
          doorX - 0.2 + i * 0.058 + (r() - 0.5) * 0.01,
          SIDEWALK_TOP + sy + 0.065 + r() * 0.004,
          Z - 0.06 + (r() - 0.5) * 0.03
        );
        cans.setMatrixAt(ci, m);
        col.set(CAN_COLORS[Math.floor(r() * CAN_COLORS.length)]);
        cans.setColorAt(ci, col);
        ci++;
      }
      // 瓶：右半区（更高）
      for (let i = 0; i < 4; i++) {
        m.makeTranslation(
          doorX + 0.07 + i * 0.05 + (r() - 0.5) * 0.01,
          SIDEWALK_TOP + sy + 0.09,
          Z - 0.06 + (r() - 0.5) * 0.03
        );
        bottles.setMatrixAt(bi, m);
        col.set(CAN_COLORS[Math.floor(r() * CAN_COLORS.length)]);
        bottles.setColorAt(bi, col);
        bi++;
      }
    }
    cans.instanceMatrix.needsUpdate = true;
    bottles.instanceMatrix.needsUpdate = true;
    if (cans.instanceColor) cans.instanceColor.needsUpdate = true;
    if (bottles.instanceColor) bottles.instanceColor.needsUpdate = true;
  }
  group.add(cans, bottles);

  // —— 顶部内灯（暖白自发光，呼吸）+ 柜内弱点光 ——
  const innerLightMat = emissive(0xfff3d8, 1.9);
  const lightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.04), innerLightMat);
  lightStrip.position.set(doorX, SIDEWALK_TOP + 1.78, Z - 0.2);
  group.add(lightStrip);
  breathing(innerLightMat, { base: 1.9, amp: 0.5, speed: 0.5, phase: 0.4 });

  const innerGlow = new THREE.PointLight(0xfff3d8, 0.9, 2.4, 2);
  innerGlow.position.set(doorX, SIDEWALK_TOP + 1.6, Z - 0.05);
  group.add(innerGlow);

  // —— 右侧控制面板：按钮阵列 + 投币口 + 退币口 + 读卡器 ——
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.52, 0.04), darkMat);
  panel.position.set(X + 0.28, SIDEWALK_TOP + 1.08, Z + 0.35);
  group.add(panel);

  // 按钮阵列（InstancedMesh：6 列 × 9 行小圆钮）
  const btnGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8);
  const btns = new THREE.InstancedMesh(btnGeo, toon('#d7dbe0'), 54);
  {
    const m = new THREE.Matrix4();
    let idx = 0;
    for (let row = 0; row < 9; row++) {
      for (let c = 0; c < 6; c++) {
        m.makeRotationX(Math.PI / 2);
        m.setPosition(
          X + 0.17 + c * 0.034,
          SIDEWALK_TOP + 1.5 - row * 0.115,
          Z + 0.372
        );
        btns.setMatrixAt(idx++, m);
      }
    }
    btns.instanceMatrix.needsUpdate = true;
  }
  group.add(btns);

  // 投币口（竖缝）+ 退币口 + 读卡器
  const coinSlot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.02), toon('#14171c'));
  coinSlot.position.set(X + 0.38, SIDEWALK_TOP + 1.62, Z + 0.372);
  group.add(coinSlot);
  const returnSlot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.02), toon('#14171c'));
  returnSlot.position.set(X + 0.38, SIDEWALK_TOP + 0.62, Z + 0.372);
  group.add(returnSlot);
  const cardReader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.03), metal(0x5d646c, 0.5, 0.7));
  cardReader.position.set(X + 0.38, SIDEWALK_TOP + 0.85, Z + 0.372);
  group.add(cardReader);

  // —— 整机朝向（正面朝南偏西）：部件按世界坐标布设，包入枢轴组绕机身中心旋转 ——
  const pivot = new THREE.Group();
  pivot.position.set(X, 0, Z);
  for (const c of [...group.children]) {
    c.position.x -= X;
    c.position.z -= Z;
    group.remove(c);
    pivot.add(c);
  }
  pivot.rotation.y = YAW;
  group.add(pivot);

  return group;
}
