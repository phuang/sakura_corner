/**
 * 收银台（L 形）—— 独立资产。
 * - 主柜沿东玻璃面：x∈[7.95,8.6]，z∈[-0.5,1.8]；北端向西延伸出翼台（L 形转角）；
 * - 顾客侧立面木纹饰板 + 品牌色带；台面微出挑收边；
 * - POS 终端（显示屏/刷卡器/键盘）+ 小件商品陈列（糖果架/纸巾盒/玻璃罐）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../../core/materials.js';
import { woodPlankTexture } from '../../../core/textures.js';

const FLOOR_Y = 0.15;
const TOP_H = 1.0;               // 台面高（相对地面）
const SLAB_T = 0.08;             // 台板厚

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRegisterCounter() {
  const group = new THREE.Group();
  group.name = 'registerCounter';

  const bodyMat = toon('#f4f6f8');        // 柜体暖白
  const slabMat = toon('#e9ebe6');        // 台面（浅米）
  const woodMat = toon('#ffffff', { map: woodPlankTexture(71, '#b08a63', '#82603f') }); // 顾客侧木纹立面
  const bandMat = toon('#57ab96');        // 品牌色带
  const darkMat = toon('#4c5158');        // 深色收边

  // —— 主柜体（x∈[7.95,8.6], z∈[-0.5,1.8]）——
  const mainW = 0.65, mainL = 2.3;
  const mainCx = 8.275, mainCz = 0.65;

  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(mainW - 0.04, TOP_H - SLAB_T, mainL), bodyMat);
  mainBody.position.set(mainCx, FLOOR_Y + (TOP_H - SLAB_T) / 2, mainCz);
  group.add(mainBody);

  // 顾客侧（-X）木纹立面 + 品牌色带
  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.03, TOP_H - SLAB_T - 0.1, mainL - 0.06), woodMat);
  frontPanel.position.set(mainCx - mainW / 2 + 0.005, FLOOR_Y + (TOP_H - SLAB_T) / 2, mainCz);
  group.add(frontPanel);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.09, mainL - 0.06), bandMat);
  band.position.set(mainCx - mainW / 2 + 0.005, FLOOR_Y + TOP_H - SLAB_T - 0.28, mainCz);
  group.add(band);

  // —— 翼台（北端向西延伸，x∈[6.85,7.95], z∈[-0.5,-0.02]）——
  const wingL = 1.1, wingD = 0.48;
  const wingCx = (6.85 + 7.95) / 2, wingCz = -0.26;

  const wingBody = new THREE.Mesh(new THREE.BoxGeometry(wingL, TOP_H - SLAB_T, wingD), bodyMat);
  wingBody.position.set(wingCx, FLOOR_Y + (TOP_H - SLAB_T) / 2, wingCz);
  group.add(wingBody);

  // 翼台南侧面（+Z）木纹立面
  const wingPanel = new THREE.Mesh(new THREE.BoxGeometry(wingL - 0.06, TOP_H - SLAB_T - 0.1, 0.03), woodMat);
  wingPanel.position.set(wingCx, FLOOR_Y + (TOP_H - SLAB_T) / 2, wingCz + wingD / 2 - 0.005);
  group.add(wingPanel);

  // —— 台面（主柜 + 翼台，微出挑）——
  const mainSlab = new THREE.Mesh(new THREE.BoxGeometry(mainW + 0.1, SLAB_T, mainL + 0.08), slabMat);
  mainSlab.position.set(mainCx, FLOOR_Y + TOP_H - SLAB_T / 2, mainCz);
  group.add(mainSlab);

  const wingSlab = new THREE.Mesh(new THREE.BoxGeometry(wingL + 0.1, SLAB_T, wingD + 0.08), slabMat);
  wingSlab.position.set(wingCx - 0.05, FLOOR_Y + TOP_H - SLAB_T / 2, wingCz);
  group.add(wingSlab);

  // 台面前沿深色收边条（主柜顾客侧）
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, mainL + 0.08), darkMat);
  edge.position.set(mainCx - mainW / 2 - 0.045, FLOOR_Y + TOP_H - SLAB_T + 0.01, mainCz);
  group.add(edge);

  // —— POS 终端（主柜台面北端，面向顾客 -X）——
  const posZ = -0.28;
  // 显示屏（支架 + 屏幕，微发光）
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.14), darkMat);
  standBase.position.set(mainCx + 0.05, FLOOR_Y + TOP_H + 0.012, posZ);
  group.add(standBase);
  const standPost = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.03), darkMat);
  standPost.position.set(mainCx + 0.05, FLOOR_Y + TOP_H + 0.1, posZ + 0.04);
  group.add(standPost);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.03), darkMat);
  screen.position.set(mainCx + 0.05, FLOOR_Y + TOP_H + 0.24, posZ - 0.02);
  screen.rotation.y = Math.PI / 2; // 屏幕面朝向 -X（顾客）
  group.add(screen);
  const screenFace = new THREE.Mesh(
    new THREE.BoxGeometry(0.23, 0.15, 0.006),
    toon('#0d1420', { emissive: '#9fd8ff', emissiveIntensity: 0.7 })
  );
  screenFace.position.set(mainCx + 0.05 - 0.018, FLOOR_Y + TOP_H + 0.24, posZ - 0.02);
  screenFace.rotation.y = Math.PI / 2;
  group.add(screenFace);

  // 刷卡器（小盒）+ 键盘
  const reader = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.07), toon('#3a4048'));
  reader.position.set(mainCx - 0.12, FLOOR_Y + TOP_H + 0.025, posZ + 0.16);
  group.add(reader);
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.1), toon('#3a4048'));
  keypad.position.set(mainCx - 0.12, FLOOR_Y + TOP_H + 0.02, posZ - 0.1);
  group.add(keypad);

  // —— 小件商品陈列（台面南段）——
  const r = rng(389);
  // 糖果展示架：底座 + 实例化彩色糖盒
  const candyBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.18), toon('#eef0f2'));
  candyBase.position.set(mainCx - 0.05, FLOOR_Y + TOP_H + 0.08, 0.75);
  group.add(candyBase);

  const CANDY_COLORS = ['#e86a5c', '#f2b04e', '#5aa9d6', '#7bc47f', '#e88bb0'];
  const candyItems = [];
  for (let row = 0; row < 3; row++) {
    let cxp = mainCx - 0.15;
    while (cxp < mainCx + 0.06) {
      candyItems.push({ x: cxp + 0.02, y: FLOOR_Y + TOP_H + 0.03 + row * 0.045, z: 0.75 + (r() - 0.5) * 0.06, color: CANDY_COLORS[Math.floor(r() * CANDY_COLORS.length)] });
      cxp += 0.042;
    }
  }
  const candyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.038, 0.04, 0.05), toon('#ffffff'), candyItems.length);
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const col = new THREE.Color();
    candyItems.forEach((it, i) => {
      p.set(it.x, it.y, it.z); s.set(1, 1, 1);
      m4.compose(p, q, s);
      candyMesh.setMatrixAt(i, m4);
      col.set(it.color);
      candyMesh.setColorAt(i, col);
    });
    candyMesh.instanceMatrix.needsUpdate = true;
    if (candyMesh.instanceColor) candyMesh.instanceColor.needsUpdate = true;
  }
  group.add(candyMesh);

  // 纸巾盒（白色小盒 + 抽纸口）
  const tissue = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), toon('#f5f3ee'));
  tissue.position.set(mainCx - 0.02, FLOOR_Y + TOP_H + 0.035, 1.3);
  group.add(tissue);

  // 玻璃罐 ×2（透明罐身 + 彩色内容物）
  for (const [jx, jz, jc] of [[mainCx - 0.18, 1.62, '#e8a15c'], [mainCx + 0.14, 1.6, '#7bc47f']]) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16), toon('#d8e8ee', { map: null }));
    jar.material = new THREE.MeshPhysicalMaterial({ color: 0xdceef5, transparent: true, opacity: 0.3, roughness: 0.08, clearcoat: 1 });
    jar.position.set(jx, FLOOR_Y + TOP_H + 0.06, jz);
    group.add(jar);
    const content = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.09, 14), toon(jc));
    content.position.set(jx, FLOOR_Y + TOP_H + 0.055, jz);
    group.add(content);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.016, 16), metal(0x9aa1a8, 0.35, 0.8));
    lid.position.set(jx, FLOOR_Y + TOP_H + 0.128, jz);
    group.add(lid);
  }

  return group;
}
