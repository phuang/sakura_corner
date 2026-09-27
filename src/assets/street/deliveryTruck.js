/**
 * 送货小货车 —— 独立资产。
 * - 车身：白色厢式货车，圆润卡通风格；
 * - 驾驶室：前部带挡风玻璃、侧窗、后视镜；
 * - 货箱：后部封闭方箱，侧面有抽象品牌标识（无文字）；
 * - 车轮：4 个可见金属轮毂 + 轮胎；
 * - 细节：前大灯、尾灯、保险杠、排气管。
 * 停靠于便利店南侧路边（主路 A 北侧），车头朝西（-X）。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';

const BODY_L = 4.2;    // 车身总长
const CABIN_W = 1.8;   // 驾驶室宽
const CARGO_W = 2.0;   // 货箱宽（略宽于驾驶室）
const WHEEL_R = 0.35;  // 车轮半径

/**
 * @returns {THREE.Group} 送货小货车（局部原点 = 车身中心底部，z=0 为地面线）
 */
export function createDeliveryTruck() {
  const truck = new THREE.Group();
  truck.name = 'deliveryTruck';

  // —— 材质定义 ——
  const bodyMat = toon('#f5f2eb');      // 白色车身
  const cargoMat = toon('#e8e4dc');     // 货箱米白
  const darkMat = toon('#3a3f45');      // 深色底盘/保险杠
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x2c4756, metalness: 0.5, roughness: 0.15, envMapIntensity: 1.8,
  });
  const wheelMat = metal(0x8f969e, 0.4, 0.85); // 金属轮毂
  const tireMat = toon('#2a2d30');       // 轮胎黑色

  // —— 底盘（深色长条）——
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(BODY_L - 0.3, 0.18, CARGO_W - 0.1), darkMat);
  chassis.position.y = WHEEL_R + 0.09;
  truck.add(chassis);

  // —— 驾驶室（前部，车头朝西 -X）——
  const cabinL = 1.6;
  const cabinH = 1.5;
  const cabinGeo = new THREE.BoxGeometry(cabinL, cabinH, CABIN_W);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.set(-(BODY_L / 2 - cabinL / 2), WHEEL_R + 0.18 + cabinH / 2, 0);
  cabin.castShadow = true;
  truck.add(cabin);

  // —— 驾驶室挡风玻璃（前部倾斜）——
  const windshieldGeo = new THREE.BoxGeometry(0.06, 0.75, CABIN_W - 0.3);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(-(BODY_L / 2 + 0.01), WHEEL_R + 0.18 + cabinH * 0.65, 0);
  truck.add(windshield);

  // —— 驾驶室侧窗（左右各一）——
  const sideWinGeo = new THREE.BoxGeometry(0.9, 0.55, 0.04);
  for (const side of [-1, 1]) {
    const sideWin = new THREE.Mesh(sideWinGeo, glassMat);
    sideWin.position.set(-(BODY_L / 2 - cabinL * 0.3), WHEEL_R + 0.18 + cabinH * 0.65, side * (CABIN_W / 2 + 0.01));
    truck.add(sideWin);
  }

  // —— 后视镜（左右各一，小圆镜）——
  const mirrorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
  mirrorGeo.rotateZ(Math.PI / 2);
  for (const side of [-1, 1]) {
    const mirror = new THREE.Mesh(mirrorGeo, darkMat);
    mirror.position.set(-(BODY_L / 2 + 0.15), WHEEL_R + 0.18 + cabinH * 0.7, side * (CABIN_W / 2 + 0.1));
    truck.add(mirror);
  }

  // —— 货箱（后部封闭方箱）——
  const cargoL = BODY_L - cabinL - 0.3;
  const cargoH = 1.8;
  const cargoGeo = new THREE.BoxGeometry(cargoL, cargoH, CARGO_W);
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  cargo.position.set((BODY_L / 2 - cabinL - 0.3) / 2 + 0.15, WHEEL_R + 0.18 + cargoH / 2, 0);
  cargo.castShadow = true;
  truck.add(cargo);

  // —— 货箱侧面装饰图案（彩色条纹 + 樱花 + 几何图形）——
  const decoY = WHEEL_R + 0.18;
  
  // 底部彩色条纹带（青绿 + 暖红 + 米黄，与场景配色呼应）
  const stripeColors = ['#84b59a', '#c26d5e', '#f5e6d3'];
  const stripeH = 0.12;
  for (let i = 0; i < 3; i++) {
    const stripeMat = toon(stripeColors[i]);
    const stripeGeo = new THREE.BoxGeometry(cargoL - 0.2, stripeH, CARGO_W + 0.04);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(cargo.position.x, decoY + 0.15 + i * (stripeH + 0.03), 0);
    truck.add(stripe);
  }

  // 樱花图案 ×3（粉色花瓣簇，平贴在货箱侧面）
  const sakuraMat = toon('#f4c2c2'); // 樱粉色
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      const petalGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 5); // 五边形花瓣
      petalGeo.rotateX(Math.PI / 2); // 轴沿 Z，圆盘面朝侧面
      const petal = new THREE.Mesh(petalGeo, sakuraMat);
      petal.position.set(
        cargo.position.x + i * 0.6,
        decoY + cargoH * 0.55,
        side * (CARGO_W / 2 + 0.01)
      );
      truck.add(petal);
    }
  }

  // 中央圆形品牌标识（青绿色，平贴在货箱侧面）
  const logoGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24);
  logoGeo.rotateX(Math.PI / 2); // 轴沿 Z，圆盘面朝侧面
  for (const side of [-1, 1]) {
    const logoMat = toon('#84b59a');
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(cargo.position.x, decoY + cargoH * 0.6, side * (CARGO_W / 2 + 0.01));
    truck.add(logo);
  }

  // 顶部装饰线条（细白线，增加层次感）
  const topLineMat = toon('#ffffff');
  const topLineGeo = new THREE.BoxGeometry(cargoL - 0.3, 0.04, CARGO_W + 0.02);
  const topLine = new THREE.Mesh(topLineGeo, topLineMat);
  topLine.position.set(cargo.position.x, decoY + cargoH - 0.15, 0);
  truck.add(topLine);

  // —— 车轮 ×4（前轴 2 + 后轴 2）——
  const wheelGeo = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.18, 20);
  wheelGeo.rotateX(Math.PI / 2); // 轮轴沿 Z

  const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.19, 16);
  hubGeo.rotateX(Math.PI / 2);

  for (const wx of [-(BODY_L / 2 - 0.7), BODY_L / 2 - 0.8]) { // 前轴、后轴
    for (const wz of [-CARGO_W / 2 + 0.15, CARGO_W / 2 - 0.15]) {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.position.set(wx, WHEEL_R, wz);
      truck.add(tire);

      const hub = new THREE.Mesh(hubGeo, wheelMat);
      hub.position.set(wx, WHEEL_R, wz);
      truck.add(hub);
    }
  }

  // —— 前大灯 ×2（暖光）——
  const headlightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16);
  headlightGeo.rotateZ(Math.PI / 2);
  for (const dz of [-CABIN_W / 2 + 0.35, CABIN_W / 2 - 0.35]) {
    const hlMat = toon('#fff8e7');
    const headlight = new THREE.Mesh(headlightGeo, hlMat);
    headlight.position.set(-(BODY_L / 2 + 0.01), WHEEL_R + 0.45, dz);
    truck.add(headlight);
  }

  // —— 尾灯 ×2（红色）——
  const taillightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
  taillightGeo.rotateZ(Math.PI / 2);
  for (const dz of [-CARGO_W / 2 + 0.3, CARGO_W / 2 - 0.3]) {
    const tlMat = toon('#c45a4f');
    const taillight = new THREE.Mesh(taillightGeo, tlMat);
    taillight.position.set(BODY_L / 2 + 0.01, WHEEL_R + 0.6, dz);
    truck.add(taillight);
  }

  // —— 前保险杠（深色横条）——
  const bumperGeo = new THREE.BoxGeometry(0.15, 0.3, CABIN_W - 0.2);
  const bumper = new THREE.Mesh(bumperGeo, darkMat);
  bumper.position.set(-(BODY_L / 2 + 0.05), WHEEL_R + 0.25, 0);
  truck.add(bumper);

  // —— 排气管（右侧短管）——
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12);
  exhaustGeo.rotateZ(Math.PI / 2);
  const exhaust = new THREE.Mesh(exhaustGeo, metal(0x7d848b, 0.3, 0.9));
  exhaust.position.set(BODY_L / 2 - 0.5, WHEEL_R + 0.15, CARGO_W / 2 - 0.2);
  truck.add(exhaust);

  return truck;
}
