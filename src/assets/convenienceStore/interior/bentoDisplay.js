/**
 * 便当 / 饭团 / 寿司冷藏陈列柜 —— 独立资产。
 * - 北墙 x∈[2.4,5.0]（宽 2.6m），进深 0.75m；
 * - 下部基础柜 h=1.0（门缝/拉手/品牌色带细节）+ 上部玻璃展示罩（四角立柱 + 前/顶玻璃）；
 * - 陈列三层：便当盒 / 饭团（三角棱柱 + 海苔片）/ 寿司卷（端面圆盘），全部实例化满陈列，托盘衬底。
 */

import * as THREE from 'three';
import { toon, metal, glass, emissive } from '../../../core/materials.js';
import { breathing } from '../../../core/lighting.js';

const FLOOR_Y = 0.15;
const X_A = 2.4, X_B = 5.0;      // 宽度范围（北墙）
const W = X_B - X_A;             // 2.6
const DEPTH = 0.75;
const Z_BACK = -4.32;            // 贴北墙内表面
const Z_FRONT = Z_BACK + DEPTH;  // -3.57
const CAB_H = 1.0;               // 基础柜高
const CASE_H = 1.0;              // 玻璃罩高

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createBentoDisplay() {
  const group = new THREE.Group();
  group.name = 'bentoDisplay';

  const cx = (X_A + X_B) / 2;
  const zc = Z_BACK + DEPTH / 2; // -3.945

  const cabMat = toon('#f4f6f8');     // 柜体暖白
  const kickMat = toon('#5d636b');    // 踢脚
  const frameMat = metal(0x7c848c, 0.42, 0.8);

  // —— 基础柜（h=1.0）——
  const cab = new THREE.Mesh(new THREE.BoxGeometry(W, CAB_H - 0.12, DEPTH), cabMat);
  cab.position.set(cx, FLOOR_Y + (CAB_H - 0.12) / 2 + 0.12, zc);
  group.add(cab);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, DEPTH), kickMat);
  kick.position.set(cx, FLOOR_Y + 0.06, zc);
  group.add(kick);

  // 柜门缝（两道竖向细线）+ 拉手
  const seamMat = toon('#c9ccd0');
  for (const x of [X_A + W / 3, X_A + (2 * W) / 3]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, CAB_H - 0.24, 0.012), seamMat);
    seam.position.set(x, FLOOR_Y + CAB_H / 2, Z_FRONT + 0.006);
    group.add(seam);
  }
  for (const x of [X_A + W / 6, X_A + W / 2, X_A + (5 * W) / 6]) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), metal(0x9aa1a8, 0.35, 0.85));
    handle.position.set(x, FLOOR_Y + CAB_H - 0.2, Z_FRONT + 0.02);
    group.add(handle);
  }

  // 品牌色带（抽象，无文字）
  const band = new THREE.Mesh(new THREE.BoxGeometry(W, 0.07, 0.016), toon('#57ab96'));
  band.position.set(cx, FLOOR_Y + CAB_H - 0.34, Z_FRONT + 0.008);
  group.add(band);

  // —— 玻璃展示罩（四角立柱 + 前/顶玻璃）——
  const postH = CASE_H;
  for (const x of [X_A + 0.025, X_B - 0.025]) {
    for (const z of [Z_BACK + 0.025, Z_FRONT - 0.025]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, postH, 0.05), frameMat);
      post.position.set(x, FLOOR_Y + CAB_H + postH / 2, z);
      group.add(post);
    }
  }

  // 背板（冷白衬底）
  const caseBack = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, CASE_H - 0.06, 0.02), toon('#eef4f6'));
  caseBack.position.set(cx, FLOOR_Y + CAB_H + CASE_H / 2, Z_BACK + 0.05);
  group.add(caseBack);

  // 前玻璃 + 顶玻璃
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, CASE_H - 0.08, 0.02), glass({ tint: 0xdceef5, opacity: 0.18 }));
  frontGlass.position.set(cx, FLOOR_Y + CAB_H + CASE_H / 2, Z_FRONT - 0.01);
  group.add(frontGlass);

  const topGlass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.02, DEPTH - 0.1), glass({ tint: 0xdceef5, opacity: 0.16 }));
  topGlass.position.set(cx, FLOOR_Y + CAB_H + CASE_H - 0.04, zc);
  group.add(topGlass);

  // —— 陈列层板 ×2（+ 柜顶面共三层陈列位）——
  const shelfMat = toon('#dfe7ea');
  const LEVELS = [FLOOR_Y + CAB_H + 0.01, FLOOR_Y + CAB_H + 0.34, FLOOR_Y + CAB_H + 0.68]; // 三层陈列面
  for (const y of LEVELS.slice(1)) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(W - 0.16, 0.028, DEPTH - 0.2), shelfMat);
    shelf.position.set(cx, y - 0.014, zc + 0.03);
    group.add(shelf);
  }

  // —— 商品实例化陈列（便当盒 / 饭团+海苔 / 寿司卷）——
  const r = rng(523);
  const bentoItems = [];   // {x,y,z,sx,sy,sz,color}
  const onigiriItems = []; // {x,y,z,r,h,rotY}
  const noriItems = [];    // {x,y,z,sx,sy,sz}
  const sushiItems = [];   // {x,y,z,r,h,color}

  const BENTO_COLORS = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0'];
  const SUSHI_COLORS = ['#3d4a3a', '#3d4a3a', '#4a5a44', '#e8c15a', '#d97b6c'];

  for (const yBase of LEVELS) {
    // —— 便当盒区（左段 x∈[X_A+0.12, X_A+1.15]）——
    let x = X_A + 0.14;
    while (x < X_A + 1.13) {
      const w = 0.15 + r() * 0.05, h = 0.042 + r() * 0.012, d = 0.12 + r() * 0.02;
      bentoItems.push({
        x: x + w / 2, y: yBase + h / 2, z: Z_FRONT - 0.16 - (r() - 0.5) * 0.08,
        sx: w, sy: h, sz: d,
        color: BENTO_COLORS[Math.floor(r() * BENTO_COLORS.length)],
      });
      x += w + 0.02;
    }

    // —— 饭团区（中段 x∈[X_A+1.3, X_A+2.0]）——
    for (let row = 0; row < 2; row++) {
      let ox = X_A + 1.34;
      while (ox < X_A + 1.98) {
        const rad = 0.05 + r() * 0.008, th = 0.045;
        const oz = Z_FRONT - 0.2 - row * 0.13 - (r() - 0.5) * 0.03;
        onigiriItems.push({ x: ox + rad, y: yBase + th / 2, z: oz, r: rad, h: th });
        noriItems.push({ x: ox + rad, y: yBase + 0.016, z: oz - 0.004, sx: rad * 1.5, sy: 0.032, sz: th + 0.012 });
        ox += rad * 2 + 0.018;
      }
    }

    // —— 寿司卷区（右段 x∈[X_A+2.1, X_B-0.1]）——
    for (let row = 0; row < 3; row++) {
      let sx = X_A + 2.14;
      while (sx < X_B - 0.14) {
        const rad = 0.026 + r() * 0.005, th = 0.034;
        sushiItems.push({
          x: sx + rad, y: yBase + th / 2, z: Z_FRONT - 0.18 - row * 0.11 - (r() - 0.5) * 0.02,
          r: rad, h: th, color: SUSHI_COLORS[Math.floor(r() * SUSHI_COLORS.length)],
        });
        sx += rad * 2 + 0.014;
      }
    }
  }

  // 便当盒（InstancedMesh）
  const bentoMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#ffffff'), bentoItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    bentoItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz);
      m4.compose(p, q, s);
      bentoMesh.setMatrixAt(i, m4);
      col.set(it.color);
      bentoMesh.setColorAt(i, col);
    });
    bentoMesh.instanceMatrix.needsUpdate = true;
    if (bentoMesh.instanceColor) bentoMesh.instanceColor.needsUpdate = true;
  }
  group.add(bentoMesh);

  // 饭团（三角棱柱，轴朝 +Z，正面呈三角形）
  const onigiriGeo = new THREE.CylinderGeometry(1, 1, 1, 3);
  onigiriGeo.rotateX(Math.PI / 2);
  const onigiriMesh = new THREE.InstancedMesh(onigiriGeo, toon('#f7f4ec'), onigiriItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    onigiriItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      onigiriMesh.setMatrixAt(i, m4);
    });
    onigiriMesh.instanceMatrix.needsUpdate = true;
  }
  group.add(onigiriMesh);

  // 海苔片（饭团底部深色薄片）
  const noriMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#2e3a30'), noriItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    noriItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.sx, it.sy, it.sz);
      m4.compose(p, q, s);
      noriMesh.setMatrixAt(i, m4);
    });
    noriMesh.instanceMatrix.needsUpdate = true;
  }
  group.add(noriMesh);

  // 寿司卷（端面圆盘，轴朝 +Z）
  const sushiGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
  sushiGeo.rotateX(Math.PI / 2);
  const sushiMesh = new THREE.InstancedMesh(sushiGeo, toon('#ffffff'), sushiItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    sushiItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(it.r * 2, it.h, it.r * 2);
      m4.compose(p, q, s);
      sushiMesh.setMatrixAt(i, m4);
      col.set(it.color);
      sushiMesh.setColorAt(i, col);
    });
    sushiMesh.instanceMatrix.needsUpdate = true;
    if (sushiMesh.instanceColor) sushiMesh.instanceColor.needsUpdate = true;
  }
  group.add(sushiMesh);

  // —— 陈列托盘（白色衬底，分区）——
  const trayMat = toon('#f2f4f5');
  for (const yBase of LEVELS) {
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.018, 0.3), trayMat);
    t1.position.set(X_A + 0.67, yBase - 0.009, Z_FRONT - 0.24);
    group.add(t1);
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.018, 0.3), trayMat);
    t2.position.set(X_A + 1.65, yBase - 0.009, Z_FRONT - 0.24);
    group.add(t2);
    const t3 = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.018, 0.36), trayMat);
    t3.position.set(X_A + 2.5, yBase - 0.009, Z_FRONT - 0.27);
    group.add(t3);
  }

  // —— 罩内顶部 LED（呼吸）+ 弱点光 ——
  const ledMat = emissive(0xf2fbff, 1.8);
  const led = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.03, 0.06), ledMat);
  led.position.set(cx, FLOOR_Y + CAB_H + CASE_H - 0.1, zc - 0.15);
  group.add(led);
  breathing(ledMat, { base: 1.8, amp: 0.4, speed: 0.5, phase: 2.6 });

  const innerLight = new THREE.PointLight(0xeaf6ff, 0.45, 2.4, 2);
  innerLight.position.set(cx, FLOOR_Y + CAB_H + CASE_H - 0.25, zc);
  group.add(innerLight);

  return group;
}
