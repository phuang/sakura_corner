/**
 * 饮料冷柜 —— 独立资产。
 * - 北墙 x∈[7.6,9.3]（宽 1.7m），进深 0.85m，高 2.1m；
 * - 正面整幅玻璃门（物理玻璃，内部商品清晰可见）+ 铝框 + 竖直拉手；
 * - 内层板 ×4：罐装 / 瓶装实例化满陈列（瓶身 + 瓶盖双 InstancedMesh）；
 * - 顶部 LED 冷光灯带呼吸 + 柜内弱点光，玻璃外形成冷色辉光层次。
 */

import * as THREE from 'three';
import { toon, metal, glass, emissive } from '../../../core/materials.js';
import { breathing } from '../../../core/lighting.js';

const FLOOR_Y = 0.15;
const X_A = 7.6, X_B = 9.3;      // 宽度范围（北墙）
const W = X_B - X_A;             // 1.7
const DEPTH = 0.85;
const Z_BACK = -4.32;            // 贴北墙内表面
const Z_C = Z_BACK + DEPTH / 2;  // -3.895
const H = 2.1;                   // 柜高
const SHELF_YS = [0.42, 0.82, 1.22, 1.62]; // 层板顶面（相对 FLOOR_Y）

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

export function createDrinkCooler() {
  const group = new THREE.Group();
  group.name = 'drinkCooler';

  const cx = (X_A + X_B) / 2;
  const bodyMat = toon('#f4f6f8');      // 柜体（暖白）
  const innerMat = toon('#e9f1f4');     // 内壁
  const kickMat = toon('#5d636b');      // 底部踢脚
  const frameMat = metal(0x7c848c, 0.42, 0.8); // 铝框

  // —— 柜体：背板 / 侧板 / 顶盖 / 底踢脚 ——
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.05), bodyMat);
  backPanel.position.set(cx, FLOOR_Y + H / 2, Z_BACK + 0.025);
  group.add(backPanel);

  for (const x of [X_A + 0.03, X_B - 0.03]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, H, DEPTH), bodyMat);
    side.position.set(x, FLOOR_Y + H / 2, Z_C);
    group.add(side);
  }

  // 顶盖（略出挑）+ 品牌色细带（抽象，无文字）
  const cap = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.14, DEPTH + 0.05), bodyMat);
  cap.position.set(cx, FLOOR_Y + H + 0.07, Z_C - 0.02);
  group.add(cap);
  const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.045, 0.018), toon('#57ab96'));
  band.position.set(cx, FLOOR_Y + H + 0.02, Z_C - DEPTH / 2 - 0.03);
  group.add(band);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W, 0.14, DEPTH), kickMat);
  kick.position.set(cx, FLOOR_Y + 0.07, Z_C);
  group.add(kick);

  // —— 内壁（玻璃后衬底，冷白）——
  const innerBack = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, H - 0.3, 0.02), innerMat);
  innerBack.position.set(cx, FLOOR_Y + (H - 0.3) / 2 + 0.14, Z_BACK + 0.06);
  group.add(innerBack);

  // —— 内层板 ×4 ——
  const shelfMat = toon('#dfe7ea');
  for (const y of SHELF_YS) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(W - 0.16, 0.03, DEPTH - 0.2), shelfMat);
    shelf.position.set(cx, FLOOR_Y + y - 0.015, Z_C + 0.04);
    group.add(shelf);
  }

  // —— 商品实例化陈列（罐装 / 瓶装）——
  const r = rng(247);
  const canItems = [];   // {x,y,z,r,h,color}
  const bottleBodies = []; // {x,y,z,r,h,color}
  const bottleCaps = [];   // {x,y,z,r,h,color}

  for (const y of SHELF_YS) {
    let x = X_A + 0.14;
    while (x < X_B - 0.12) {
      if (r() < 0.55) {
        // 罐装（矮圆柱）
        const rad = 0.031 + r() * 0.006, h = 0.118;
        canItems.push({ x: x + rad, y: FLOOR_Y + y + h / 2, z: Z_C + 0.04 + (r() - 0.5) * 0.3, r: rad, h, color: CAN_COLORS[Math.floor(r() * CAN_COLORS.length)] });
        x += rad * 2 + 0.012;
      } else {
        // 瓶装（瓶身 + 瓶盖）
        const rad = 0.028 + r() * 0.006, h = 0.19 + r() * 0.03;
        const z = Z_C + 0.04 + (r() - 0.5) * 0.3;
        bottleBodies.push({ x: x + rad, y: FLOOR_Y + y + h / 2, z, r: rad, h, color: CAN_COLORS[Math.floor(r() * CAN_COLORS.length)] });
        const capCol = ['#ffffff', '#e86a5c', '#f2b04e'][Math.floor(r() * 3)];
        bottleCaps.push({ x: x + rad, y: FLOOR_Y + y + h + 0.011, z, r: rad * 0.72, h: 0.022, color: capCol });
        x += rad * 2 + 0.016;
      }
    }
  }

  const canGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
  const canMesh = new THREE.InstancedMesh(canGeo, toon('#ffffff'), canItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    canItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      canMesh.setMatrixAt(i, m4);
      col.set(it.color);
      canMesh.setColorAt(i, col);
    });
    canMesh.instanceMatrix.needsUpdate = true;
    if (canMesh.instanceColor) canMesh.instanceColor.needsUpdate = true;
  }
  group.add(canMesh);

  const bottleGeo = new THREE.CylinderGeometry(0.82, 1, 1, 14); // 肩部收窄的瓶身
  const bottleMesh = new THREE.InstancedMesh(bottleGeo, toon('#ffffff'), bottleBodies.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    bottleBodies.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      bottleMesh.setMatrixAt(i, m4);
      col.set(it.color);
      bottleMesh.setColorAt(i, col);
    });
    bottleMesh.instanceMatrix.needsUpdate = true;
    if (bottleMesh.instanceColor) bottleMesh.instanceColor.needsUpdate = true;
  }
  group.add(bottleMesh);

  const capGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
  const capMesh = new THREE.InstancedMesh(capGeo, toon('#ffffff'), bottleCaps.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    bottleCaps.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      capMesh.setMatrixAt(i, m4);
      col.set(it.color);
      capMesh.setColorAt(i, col);
    });
    capMesh.instanceMatrix.needsUpdate = true;
    if (capMesh.instanceColor) capMesh.instanceColor.needsUpdate = true;
  }
  group.add(capMesh);

  // —— 玻璃门（整幅）+ 铝框 + 拉手 ——
  const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(W - 0.14, H - 0.34, 0.02), glass({ tint: 0xdceef5, opacity: 0.2 }));
  glassDoor.position.set(cx, FLOOR_Y + (H - 0.34) / 2 + 0.16, Z_C - DEPTH / 2 + 0.01);
  group.add(glassDoor);

  const frameT = 0.05; // 框料宽
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(W, frameT, 0.07), frameMat);
  fTop.position.set(cx, FLOOR_Y + H - 0.14 + frameT / 2, Z_C - DEPTH / 2);
  group.add(fTop);
  const fBot = new THREE.Mesh(new THREE.BoxGeometry(W, frameT, 0.07), frameMat);
  fBot.position.set(cx, FLOOR_Y + 0.14 - frameT / 2 + 0.03, Z_C - DEPTH / 2);
  group.add(fBot);
  for (const x of [X_A + frameT / 2, X_B - frameT / 2]) {
    const fSide = new THREE.Mesh(new THREE.BoxGeometry(frameT, H - 0.34, 0.07), frameMat);
    fSide.position.set(x, FLOOR_Y + (H - 0.34) / 2 + 0.16, Z_C - DEPTH / 2);
    group.add(fSide);
  }

  // 竖直拉手（右侧）
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.55, 0.045), metal(0x9aa1a8, 0.35, 0.85));
  handle.position.set(X_B - 0.16, FLOOR_Y + H / 2 - 0.1, Z_C - DEPTH / 2 - 0.045);
  group.add(handle);

  // —— 顶部 LED 冷光灯带（呼吸）+ 柜内弱点光 ——
  const ledMat = emissive(0xeaf6ff, 2.0);
  const led = new THREE.Mesh(new THREE.BoxGeometry(W - 0.3, 0.035, 0.07), ledMat);
  led.position.set(cx, FLOOR_Y + H - 0.19, Z_C - 0.12);
  group.add(led);
  breathing(ledMat, { base: 2.0, amp: 0.45, speed: 0.6, phase: 1.7 });

  const innerLight = new THREE.PointLight(0xdff2ff, 0.5, 2.6, 2);
  innerLight.position.set(cx, FLOOR_Y + H - 0.3, Z_C);
  group.add(innerLight);

  return group;
}
