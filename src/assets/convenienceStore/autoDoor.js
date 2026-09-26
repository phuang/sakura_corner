/**
 * 自动门 —— 独立资产（南立面门洞 x∈[6,8]）。
 * - 固定 transom 玻璃（横档上方）；
 * - 双扇滑动玻璃门：铝框 + 玻璃 + 横向推杆，周期性缓动开合（生活感细节）；
 *   滑扇内退于幕墙玻璃面之后 → 开启时隐入相邻分格玻璃后，真实不穿模；
 * - 门楣感应器盒 + 呼吸指示灯。
 */

import * as THREE from 'three';
import { metal, glass, emissive } from '../../core/materials.js';
import { addUpdater } from '../../core/animationRegistry.js';
import { breathing } from '../../core/lighting.js';
import { STORE } from './storeBuilding.js';

const DOOR_A = 6.0;      // 门洞左边界 x
const DOOR_B = 8.0;      // 门洞右边界 x
const BASE_H = 0.17;     // 与幕墙踢脚槽顶线一致
const TRANSOM_BOT = 2.57;// transom 横档下沿（滑扇顶线）
const TOP_RAIL_BOT = 3.5;

// 开合周期（秒）：开 → 保持开启 → 关 → 保持关闭
const T_OPEN = 2.4, HOLD_OPEN = 4.2, T_CLOSE = 2.4, HOLD_CLOSED = 6.8;
const TOTAL = T_OPEN + HOLD_OPEN + T_CLOSE + HOLD_CLOSED;
const MAX_OFFSET = 0.82; // 单扇最大滑移量

function easeInOut(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function createAutoDoor() {
  const group = new THREE.Group();
  group.name = 'autoDoor';

  const frameMat = metal(0xb9bfc6, 0.4, 0.78);
  const barMat = metal(0x8f959c, 0.32, 0.85);

  // —— 固定 transom 玻璃（门洞上方）——
  {
    const m = glass({ tint: 0xd8edf5, opacity: 0.24 });
    const w = DOOR_B - DOOR_A - 0.16;
    const h = TOP_RAIL_BOT - TRANSOM_BOT;
    const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.024), m);
    pane.position.set((DOOR_A + DOOR_B) / 2, (TRANSOM_BOT + TOP_RAIL_BOT) / 2, STORE.Z1 - 0.03);
    group.add(pane);
  }

  // —— 滑动门扇（左/右）——
  const PANEL_W = 0.98;
  const PANEL_H = TRANSOM_BOT - BASE_H;   // 2.4
  const panelY = (BASE_H + TRANSOM_BOT) / 2;
  const panelZ = STORE.Z1 - 0.09;         // 内退于幕墙玻璃面之后

  function makePanel() {
    const p = new THREE.Group();
    // 外框（铝）：上下横梃 + 左右竖梃
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W, 0.09, 0.06), frameMat);
    topBar.position.y = PANEL_H / 2 - 0.045;
    p.add(topBar);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W, 0.12, 0.07), frameMat);
    botBar.position.y = -PANEL_H / 2 + 0.06;
    p.add(botBar);
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.07, PANEL_H, 0.06), frameMat);
      side.position.set(s * (PANEL_W / 2 - 0.035), 0, 0);
      p.add(side);
    }
    // 玻璃芯板
    const gm = glass({ tint: 0xdff0f7, opacity: 0.2 });
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(PANEL_W - 0.14, PANEL_H - 0.24, 0.02),
      gm
    );
    p.add(core);
    // 横向推杆（金属，中部）
    const pushBar = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W - 0.3, 0.05, 0.035), barMat);
    pushBar.position.set(0, -0.12, 0.045);
    p.add(pushBar);
    // 推杆端部固定座
    for (const s of [-1, 1]) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.05), barMat);
      cap.position.set(s * (PANEL_W / 2 - 0.19), -0.12, 0.045);
      p.add(cap);
    }
    return p;
  }

  const panelL = makePanel();
  const panelR = makePanel();
  group.add(panelL, panelR);

  // —— 门楣感应器盒 + 呼吸指示灯 ——
  const sensorBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.08), metal(0x4a4f56, 0.5, 0.6));
  sensorBox.position.set((DOOR_A + DOOR_B) / 2, TOP_RAIL_BOT - 0.07, STORE.Z1 + 0.03);
  group.add(sensorBox);

  const ledMat = emissive(0xffd9a8, 1.4);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), ledMat);
  led.position.set((DOOR_A + DOOR_B) / 2, TOP_RAIL_BOT - 0.07, STORE.Z1 + 0.075);
  group.add(led);
  breathing(ledMat, { base: 1.4, amp: 0.5, speed: 1.6, phase: 1.2 });

  // —— 周期性缓动开合 ——
  addUpdater((t) => {
    const tt = t % TOTAL;
    let off;
    if (tt < T_OPEN) off = easeInOut(tt / T_OPEN) * MAX_OFFSET;
    else if (tt < T_OPEN + HOLD_OPEN) off = MAX_OFFSET;
    else if (tt < T_OPEN + HOLD_OPEN + T_CLOSE) {
      off = (1 - easeInOut((tt - T_OPEN - HOLD_OPEN) / T_CLOSE)) * MAX_OFFSET;
    } else off = 0;

    panelL.position.set(DOOR_A + PANEL_W / 2 - off, panelY, panelZ);
    panelR.position.set(DOOR_B - PANEL_W / 2 + off, panelY, panelZ);
  });

  return group;
}
