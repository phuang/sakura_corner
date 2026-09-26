/**
 * 便利店建筑壳体 —— 独立资产。
 * - L 形街角玻璃盒：北墙 / 西墙为实体抹灰墙（南、东立面由 glassFacade 提供）；
 * - 平屋顶板 + 金属滴水檐口环 + 屋面排风细节；
 * - 招牌带（fascia）：沿南/东立面环绕转角，抽象色条标识（无文字）；
 * - 墙脚深色踢脚裙边（经年积尘）。
 * 布局：占地 x∈[2,9.5], z∈[-4.5,3]；玻璃顶线 y=3.62；招牌带 3.62→4.30；屋面 4.30→4.54。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { concreteTexture } from '../../core/textures.js';

// —— 店铺几何常量（幕墙 / 自动门 / 雨棚 / 室内模块共用，单一数据源）——
export const STORE = {
  X0: 2.0,        // 西墙外立面 x
  X1: 9.5,        // 东玻璃面 x
  Z0: -4.5,       // 北墙外立面 z
  Z1: 3.0,        // 南玻璃面 z
  WALL_T: 0.18,   // 实体墙厚
  GLASS_TOP: 3.62,// 幕墙玻璃顶线
  FASCIA_BOT: 3.62,
  FASCIA_TOP: 4.30,
  ROOF_TOP: 4.54, // 屋面板顶面
};

export function createStoreBuilding() {
  const group = new THREE.Group();
  group.name = 'storeBuilding';

  const stuccoMat = toon('#f7f0e2', { map: concreteTexture(101, '#f3ead9') });
  const skirtMat = toon('#ffffff', { map: concreteTexture(103, '#cfc5b2') });
  const roofMat = toon('#ffffff', { map: concreteTexture(102, '#cfc8bb') });

  // —— 北墙（实体，z=-4.5）——
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(STORE.X1 - STORE.X0, STORE.FASCIA_TOP, STORE.WALL_T),
    stuccoMat
  );
  northWall.position.set((STORE.X0 + STORE.X1) / 2, STORE.FASCIA_TOP / 2, STORE.Z0 + STORE.WALL_T / 2);
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  group.add(northWall);

  // —— 西墙（实体，x=+2；南端止于南玻璃面 z=+3）——
  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(STORE.WALL_T, STORE.FASCIA_TOP, STORE.Z1 - (STORE.Z0 + STORE.WALL_T)),
    stuccoMat
  );
  westWall.position.set(
    STORE.X0 + STORE.WALL_T / 2,
    STORE.FASCIA_TOP / 2,
    (STORE.Z0 + STORE.WALL_T + STORE.Z1) / 2
  );
  westWall.castShadow = true;
  westWall.receiveShadow = true;
  group.add(westWall);

  // —— 墙脚踢脚裙边（深色积尘带，微凸出墙面）——
  const skirtN = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0, 0.3, 0.03), skirtMat);
  skirtN.position.set((STORE.X0 + STORE.X1) / 2, 0.15, STORE.Z0 - 0.015);
  group.add(skirtN);
  const skirtW = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, STORE.Z1 - (STORE.Z0 + STORE.WALL_T)), skirtMat);
  skirtW.position.set(STORE.X0 - 0.015, 0.15, (STORE.Z0 + STORE.WALL_T + STORE.Z1) / 2);
  group.add(skirtW);

  // —— 招牌带（fascia）：南段 + 东段，转角连续环绕 ——
  const fasciaMat = toon('#f8f3e9');
  const bandH = STORE.FASCIA_TOP - STORE.FASCIA_BOT; // 0.68
  const bandY = (STORE.FASCIA_BOT + STORE.FASCIA_TOP) / 2; // 3.96

  const fasciaS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0 + 0.1, bandH, 0.1), fasciaMat);
  fasciaS.position.set((STORE.X0 + STORE.X1 + 0.1) / 2, bandY, STORE.Z1 + 0.05);
  fasciaS.castShadow = true;
  group.add(fasciaS);

  const fasciaE = new THREE.Mesh(new THREE.BoxGeometry(0.1, bandH, STORE.X1 - STORE.X0 + 0.1), fasciaMat);
  fasciaE.position.set(STORE.X1 + 0.05, bandY, (STORE.Z0 + STORE.Z1 + 0.1) / 2);
  fasciaE.castShadow = true;
  group.add(fasciaE);

  // —— 抽象色条（无文字）：青绿主带 + 珊瑚细线，转角连续 ——
  const greenMat = toon('#57ab96');
  const coralMat = toon('#ef8b7c');
  const stripeZ = STORE.Z1 + 0.1 + 0.008; // 南段条纹中心 z（凸出带面）
  const stripeX = STORE.X1 + 0.1 + 0.008; // 东段条纹中心 x

  const greenS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0 + 0.1, 0.26, 0.016), greenMat);
  greenS.position.set((STORE.X0 + STORE.X1 + 0.1) / 2, 4.01, stripeZ);
  group.add(greenS);
  const coralS = new THREE.Mesh(new THREE.BoxGeometry(STORE.X1 - STORE.X0 + 0.1, 0.055, 0.016), coralMat);
  coralS.position.set((STORE.X0 + STORE.X1 + 0.1) / 2, 3.7775, stripeZ);
  group.add(coralS);

  const greenE = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.26, STORE.X1 - STORE.X0 + 0.1), greenMat);
  greenE.position.set(stripeX, 4.01, (STORE.Z0 + STORE.Z1 + 0.1) / 2);
  group.add(greenE);
  const coralE = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.055, STORE.X1 - STORE.X0 + 0.1), coralMat);
  coralE.position.set(stripeX, 3.7775, (STORE.Z0 + STORE.Z1 + 0.1) / 2);
  group.add(coralE);

  // —— 抽象圆形徽记（樱粉，无文字）——
  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.024, 28), toon('#f4bcc9'));
  medallion.rotation.x = Math.PI / 2; // 圆柱轴转向 +Z，正面朝街
  medallion.position.set(8.35, 4.01, stripeZ + 0.02);
  group.add(medallion);

  // —— 平屋顶板（四周微出挑）——
  const roof = new THREE.Mesh(new THREE.BoxGeometry(7.78, 0.24, 7.78), roofMat);
  roof.position.set((STORE.X0 + STORE.X1) / 2, STORE.FASCIA_TOP + 0.12, (STORE.Z0 + STORE.Z1) / 2);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // —— 金属滴水檐口环（屋面顶缘收边）——
  {
    const outer = 3.95, inner = 3.86;
    const shape = new THREE.Shape();
    shape.moveTo(-outer, -outer);
    shape.lineTo(outer, -outer);
    shape.lineTo(outer, outer);
    shape.lineTo(-outer, outer);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-inner, -inner);
    hole.lineTo(inner, -inner);
    hole.lineTo(inner, inner);
    hole.lineTo(-inner, inner);
    hole.closePath();
    shape.holes.push(hole);
    const capGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
    capGeo.rotateX(Math.PI / 2); // (x,y,z)→(x,-z,y)：厚度沿 +Y，shape.y → 世界 Z
    const cap = new THREE.Mesh(capGeo, metal(0xa9b0b8, 0.45, 0.7));
    cap.position.set((STORE.X0 + STORE.X1) / 2, STORE.ROOF_TOP, (STORE.Z0 + STORE.Z1) / 2);
    group.add(cap);
  }

  // —— 屋面排风罩（北端，百叶细节）——
  const hvacMat = metal(0xb7bcc2, 0.5, 0.65);
  const hoodBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.42, 0.8), hvacMat);
  hoodBase.position.set(3.6, STORE.ROOF_TOP + 0.21, -3.6);
  hoodBase.castShadow = true;
  group.add(hoodBase);
  const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.3, 0.56), hvacMat);
  hoodTop.position.set(3.6, STORE.ROOF_TOP + 0.42 + 0.15, -3.6);
  hoodTop.castShadow = true;
  group.add(hoodTop);
  // 百叶（南立面 4 片）
  const louverMat = toon('#8d949b');
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.035, 0.02), louverMat);
    louver.position.set(3.6, STORE.ROOF_TOP + 0.47 + i * 0.062, -3.6 + 0.29);
    group.add(louver);
  }

  // —— 屋面小通风帽 ×2（东端）——
  const ventMat = metal(0xaab1b8, 0.5, 0.7);
  for (const [vx, vz] of [[8.3, -3.9], [7.6, -3.4]]) {
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 18), ventMat);
    vent.position.set(vx, STORE.ROOF_TOP + 0.1, vz);
    vent.castShadow = true;
    group.add(vent);
  }

  return group;
}
