/**
 * 电车（2 节车厢）—— 独立资产。
 * - 车体：圆角矩形断面挤出，奶油白 + 青绿腰线；
 * - 车窗带：分块深色玻璃窗（立柱间隙自然形成）+ 车门小窗；
 * - 滑动门：每侧两端各一组双扇门，中缝细节；
 * - 转向架：可见车轮（金属）+ 裙板 + 车顶空调机组；
 * - 车头/车尾：挡风玻璃、暖光前照灯（呼吸）、目的地显示（琥珀发光）。
 * 停靠于轨道1（轨心 z=-8），x∈[-9.5,+7.5]。
 */

import * as THREE from 'three';
import { toon, metal, glass, emissive } from '../../core/materials.js';
import { breathing } from '../../core/lighting.js';

const CAR_L = 8;        // 单节车长
const BODY_W = 2.64;    // 车体宽（半宽 1.32）
const BODY_H = 3.0;     // 车体高
const RAIL_TOP = 0.572; // 轨头顶面高度

/** 圆角矩形断面 Shape（u=横向, v=纵向高度） */
function bodyShape() {
  const w = BODY_W / 2, h = BODY_H, rt = 0.46, rb = 0.12;
  const s = new THREE.Shape();
  s.moveTo(-w + rb, 0);
  s.lineTo(w - rt, 0);
  s.quadraticCurveTo(w, 0, w, rb);          // 右下圆角
  s.lineTo(w, h - rt);
  s.quadraticCurveTo(w, h, w - rt, h);      // 右上圆角
  s.lineTo(-w + rt, h);
  s.quadraticCurveTo(-w, h, -w, h - rt);    // 左上圆角
  s.lineTo(-w, rb);
  s.quadraticCurveTo(-w, 0, -w + rb, 0);    // 左下圆角
  s.closePath();
  return s;
}

/** 单节车厢（局部原点 = 车体中心，z=0 为轨心线） */
function createCar(seed) {
  const car = new THREE.Group();

  const bodyMat = toon('#f7f3ea');
  const stripeMat = toon('#84b59a');   // 青绿腰线
  const lineMat = toon('#c26d5e');     // 细红线
  const doorMat = toon('#ece4d3');
  const winMat = new THREE.MeshPhysicalMaterial({
    color: 0x31505f, metalness: 0.55, roughness: 0.16, envMapIntensity: 1.7,
  });
  const darkMat = toon('#4c5157');

  // —— 车体（挤出 + 旋转使长度沿 X）——
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape(), { depth: CAR_L, bevelEnabled: false });
  bodyGeo.rotateY(Math.PI / 2);   // (x,y,z)→(z,y,-x)：长度 z→x
  bodyGeo.translate(-CAR_L / 2, 0, 0);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = RAIL_TOP + 0.38; // 车体底边离轨面 ~0.38m（裙板下方留转向架空间）
  body.castShadow = true;
  car.add(body);

  const yBase = RAIL_TOP + 0.38;    // 车体底部世界高度
  const zSide = BODY_W / 2 + 0.015; // 侧面外贴位置

  // —— 腰线（青绿带 + 细红线，包裹两侧）——
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(CAR_L + 0.03, 0.52, BODY_W + 0.04), stripeMat);
  stripe.position.y = yBase + 1.62;
  car.add(stripe);
  const redLine = new THREE.Mesh(new THREE.BoxGeometry(CAR_L + 0.03, 0.07, BODY_W + 0.05), lineMat);
  redLine.position.y = yBase + 1.3;
  car.add(redLine);

  // —— 车窗带（分块玻璃窗，间隙形成立柱）——
  const winGeo = new THREE.BoxGeometry(0.6, 0.8, 0.05);
  for (const side of [-1, 1]) {
    // 中央连续窗区（两门之间）
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.82;
      if (Math.abs(x) > 2.75) continue;
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(x, yBase + 2.15, side * zSide);
      car.add(win);
    }
    // —— 滑动门（两端各一组双扇，距端盖留足间隙）——
    for (const dx of [-3.3, 3.3]) {
      for (const panel of [-0.34, 0.34]) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 2.15, 0.04), doorMat);
        door.position.set(dx + panel, yBase + 1.18, side * zSide);
        car.add(door);
        // 门小窗
        const dwin = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.72, 0.05), winMat);
        dwin.position.set(dx + panel, yBase + 1.85, side * zSide);
        car.add(dwin);
      }
      // 门中缝
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.1, 0.05), toon('#b9b0a0'));
      seam.position.set(dx, yBase + 1.18, side * zSide);
      car.add(seam);
    }
  }

  // —— 车顶：空调机组 ×2 + 顶盖收边 ——
  const roofMat = toon('#d6d4cd');
  for (const dx of [-2.3, 2.3]) {
    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.15), toon('#a8aeb4'));
    ac.position.set(dx, yBase + BODY_H + 0.25, 0);
    ac.castShadow = true;
    car.add(ac);
    // 格栅缝（细条）
    for (let i = -3; i <= 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.05, 0.06), toon('#7d848b'));
      slat.position.set(dx, yBase + BODY_H + 0.25, i * 0.15);
      car.add(slat);
    }
  }

  // —— 裙板（车体下沿深色围板）——
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(CAR_L - 0.4, 0.36, BODY_W - 0.1), darkMat);
  skirt.position.y = yBase + 0.18;
  car.add(skirt);

  // —— 转向架 ×2（可见车轮）——
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.15, 20);
  wheelGeo.rotateX(Math.PI / 2); // 轮轴沿 Z
  const wheelMat = metal(0x8f969e, 0.4, 0.85);
  for (const dx of [-(CAR_L / 2 - 1.15), CAR_L / 2 - 1.15]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.26, 1.9), toon('#3f444a'));
    frame.position.set(dx, RAIL_TOP + 0.3, 0);
    car.add(frame);
    for (const wx of [-0.58, 0.58]) {
      for (const wz of [-0.62, 0.62]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(dx + wx, RAIL_TOP + 0.34, wz);
        car.add(wheel);
      }
    }
  }

  return car;
}

/** 车头/车尾端面细节（挡风玻璃、前照灯、目的地显示） */
function createEndCap(facing) {
  // facing: +1 = 东端(+X), -1 = 西端(-X)
  const cap = new THREE.Group();
  const yBase = RAIL_TOP + 0.38;

  const winMat = new THREE.MeshPhysicalMaterial({
    color: 0x2c4756, metalness: 0.5, roughness: 0.14, envMapIntensity: 1.8,
  });
  // 挡风玻璃（端面薄板，略内凹）
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.92, 1.86), winMat);
  windshield.position.set(facing * (CAR_L / 2 + 0.02), yBase + 2.35, 0);
  cap.add(windshield);

  // 前照灯 ×2（暖光，呼吸）
  const lampGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 18);
  lampGeo.rotateZ(Math.PI / 2);
  for (const dz of [-0.72, 0.72]) {
    const lampMat = emissive('#fff3d4', 1.5);
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(facing * (CAR_L / 2 + 0.07), yBase + 1.05, dz);
    cap.add(lamp);
    breathing(lampMat, { base: 1.35, amp: 0.25, speed: 0.7 });
  }

  // 目的地显示（琥珀发光条，呼吸）
  const destMat = emissive('#ffd9a0', 1.8);
  const dest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 1.25), destMat);
  dest.position.set(facing * (CAR_L / 2 + 0.01), yBase + 3.02, 0);
  cap.add(dest);
  breathing(destMat, { base: 1.7, amp: 0.3, speed: 0.5 });

  // 端部裙板收口
  const endSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, BODY_W - 0.2), toon('#4c5157'));
  endSkirt.position.set(facing * (CAR_L / 2 + 0.03), yBase + 0.18, 0);
  cap.add(endSkirt);

  return cap;
}

/**
 * @returns {THREE.Group} 两节车厢编组（轨心 z=-8）
 */
export function createTrain() {
  const group = new THREE.Group();
  group.name = 'train';

  const carA = createCar(1);
  carA.position.set(-5.25, 0, -8); // x∈[-9.5,-1]
  group.add(carA);
  const capW = createEndCap(-1);   // A 车西端（端面局部 z=0 为轨心线，须整体落到 z=-8）
  capW.position.set(-5.25, 0, -8);
  group.add(capW);

  const carB = createCar(2);
  carB.position.set(3.5, 0, -8);   // x∈[-0.5,+7.5]
  group.add(carB);
  const capE = createEndCap(+1);   // B 车东端
  capE.position.set(3.5, 0, -8);
  group.add(capE);

  // —— 车钩过渡棚（两节之间）——
  const gangway = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, BODY_W - 0.4), toon('#565b61'));
  gangway.position.set(-0.75, RAIL_TOP + 1.35, -8);
  group.add(gangway);
  const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 12), metal(0x6f757c));
  coupler.rotation.z = Math.PI / 2;
  coupler.position.set(-0.75, RAIL_TOP + 0.85, -8);
  group.add(coupler);

  return group;
}
