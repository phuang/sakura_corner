/**
 * 立式冰柜 —— 独立资产。
 * - 西墙 z∈[-4.2,-2.6]（长 1.6m），进深 0.75m，通高 2.1m；
 * - 正面整幅玻璃门朝 +X（主通道方向）+ 铝框 + 竖直拉手；
 * - 内层板 ×4：罐装 / 瓶装实例化满陈列（瓶身 + 瓶盖双 InstancedMesh），玻璃后清晰可见；
 * - 顶部 LED 冷光灯带呼吸 + 柜内弱点光。
 */

import * as THREE from 'three';
import { toon, metal, glass, emissive } from '../../../core/materials.js';
import { breathing } from '../../../core/lighting.js';

const FLOOR_Y = 0.15;
const X_WALL = 2.18;             // 西墙内表面
const DEPTH = 0.75;              // 进深（X）
const Z_A = -4.2, Z_B = -2.6;    // 沿墙长度范围
const L = Z_B - Z_A;             // 1.6
const H = 2.1;                   // 柜高
const SHELF_YS = [0.42, 0.82, 1.22, 1.62];

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

export function createStandingFreezer() {
  const group = new THREE.Group();
  group.name = 'standingFreezer';

  const cz = (Z_A + Z_B) / 2;    // -3.4
  const xFront = X_WALL + DEPTH; // 2.93（玻璃面）
  const xc = X_WALL + DEPTH / 2;

  const bodyMat = toon('#f4f6f8');      // 柜体暖白
  const innerMat = toon('#e9f1f4');     // 内壁
  const kickMat = toon('#5d636b');      // 底部踢脚
  const frameMat = metal(0x7c848c, 0.42, 0.8);

  // —— 柜体：背板（贴西墙）/ 两端侧板 / 顶盖 / 底踢脚 ——
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.05, H, L), bodyMat);
  backPanel.position.set(X_WALL + 0.025, FLOOR_Y + H / 2, cz);
  group.add(backPanel);

  for (const z of [Z_A + 0.03, Z_B - 0.03]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, H, 0.06), bodyMat);
    side.position.set(xc, FLOOR_Y + H / 2, z);
    group.add(side);
  }

  // 顶盖（略出挑）+ 品牌色细带（朝 +X，抽象无文字）
  const cap = new THREE.Mesh(new THREE.BoxGeometry(DEPTH + 0.05, 0.14, L + 0.06), bodyMat);
  cap.position.set(xc - 0.02, FLOOR_Y + H + 0.07, cz);
  group.add(cap);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, L + 0.06), toon('#57ab96'));
  band.position.set(xFront + 0.03, FLOOR_Y + H + 0.02, cz);
  group.add(band);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, 0.14, L), kickMat);
  kick.position.set(xc, FLOOR_Y + 0.07, cz);
  group.add(kick);

  // —— 内壁（玻璃后衬底，冷白）——
  const innerBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, H - 0.3, L - 0.12), innerMat);
  innerBack.position.set(X_WALL + 0.06, FLOOR_Y + (H - 0.3) / 2 + 0.14, cz);
  group.add(innerBack);

  // —— 内层板 ×4 ——
  const shelfMat = toon('#dfe7ea');
  for (const y of SHELF_YS) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(DEPTH - 0.2, 0.03, L - 0.16), shelfMat);
    shelf.position.set(xc + 0.04, FLOOR_Y + y - 0.015, cz);
    group.add(shelf);
  }

  // —— 商品实例化陈列（罐装 / 瓶装，沿 Z 排布）——
  const r = rng(839);
  const canItems = [];
  const bottleBodies = [];
  const bottleCaps = [];

  for (const y of SHELF_YS) {
    let z = Z_A + 0.14;
    while (z < Z_B - 0.12) {
      if (r() < 0.55) {
        const rad = 0.031 + r() * 0.006, h = 0.118;
        canItems.push({ x: xc + 0.04 + (r() - 0.5) * 0.28, y: FLOOR_Y + y + h / 2, z: z + rad, r: rad, h, color: CAN_COLORS[Math.floor(r() * CAN_COLORS.length)] });
        z += rad * 2 + 0.012;
      } else {
        const rad = 0.028 + r() * 0.006, h = 0.19 + r() * 0.03;
        const x = xc + 0.04 + (r() - 0.5) * 0.28;
        bottleBodies.push({ x, y: FLOOR_Y + y + h / 2, z: z + rad, r: rad, h, color: CAN_COLORS[Math.floor(r() * CAN_COLORS.length)] });
        const capCol = ['#ffffff', '#e86a5c', '#f2b04e'][Math.floor(r() * 3)];
        bottleCaps.push({ x, y: FLOOR_Y + y + h + 0.011, z: z + rad, r: rad * 0.72, h: 0.022, color: capCol });
        z += rad * 2 + 0.016;
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

  const bottleGeo = new THREE.CylinderGeometry(0.82, 1, 1, 14);
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

  // —— 玻璃门（整幅，朝 +X）+ 铝框 + 拉手 ——
  const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(0.02, H - 0.34, L - 0.14), glass({ tint: 0xdceef5, opacity: 0.2 }));
  glassDoor.position.set(xFront + 0.01, FLOOR_Y + (H - 0.34) / 2 + 0.16, cz);
  group.add(glassDoor);

  const frameT = 0.05;
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(0.07, frameT, L), frameMat);
  fTop.position.set(xFront, FLOOR_Y + H - 0.14 + frameT / 2, cz);
  group.add(fTop);
  const fBot = new THREE.Mesh(new THREE.BoxGeometry(0.07, frameT, L), frameMat);
  fBot.position.set(xFront, FLOOR_Y + 0.165, cz);
  group.add(fBot);
  for (const z of [Z_A + frameT / 2, Z_B - frameT / 2]) {
    const fSide = new THREE.Mesh(new THREE.BoxGeometry(0.07, H - 0.34, frameT), frameMat);
    fSide.position.set(xFront, FLOOR_Y + (H - 0.34) / 2 + 0.16, z);
    group.add(fSide);
  }

  // 竖直拉手（靠 Z_B 端）
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.55, 0.035), metal(0x9aa1a8, 0.35, 0.85));
  handle.position.set(xFront + 0.045, FLOOR_Y + H / 2 - 0.1, Z_B - 0.16);
  group.add(handle);

  // —— 顶部 LED 冷光灯带（呼吸）+ 柜内弱点光 ——
  const ledMat = emissive(0xeaf6ff, 2.0);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, L - 0.3), ledMat);
  led.position.set(xc + 0.12, FLOOR_Y + H - 0.19, cz);
  group.add(led);
  breathing(ledMat, { base: 2.0, amp: 0.45, speed: 0.6, phase: 3.1 });

  const innerLight = new THREE.PointLight(0xdff2ff, 0.5, 2.6, 2);
  innerLight.position.set(xc, FLOOR_Y + H - 0.3, cz);
  group.add(innerLight);

  return group;
}
