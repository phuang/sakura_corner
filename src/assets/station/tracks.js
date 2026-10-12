/**
 * 电车轨道（双线）—— 独立资产。
 * - 道砟带：碎石质感混凝土板；
 * - 轨枕：InstancedMesh，0.7m 间距；
 * - 钢轨：真实 UIC 型断面挤出，写实金属材质（环境反射 + 高光）；
 * - 轨道尽头缓冲挡车器。
 * 布局：轨道1 轨心 z=-8（电车停靠线），轨道2 轨心 z=-12.5（侧线），西端齐平底座边缘 x=-16.5，东端至 x=+8。
 */

import * as THREE from 'three';
import { toon, metal } from '../../core/materials.js';
import { concreteTexture } from '../../core/textures.js';

const X_WEST = -16.5;            // 西侧严格对齐底座边缘（消除悬空）
const X1 = 8.0;                  // 轨道东端（挡车器位置）
const BALLAST_X1 = 8.3;          // 道砟东端（略超出挡车器底座）
const TRACKS = [ { z: -8 }, { z: -12.5 } ]; // 轨心线
const GAUGE = 1.4;               // 轨距
const BALLAST_TOP = 0.28;        // 道砟顶面高度

/** UIC 型钢轨断面（y=高, x=宽），挤出成长轨 */
function makeRailGeometry(length) {
  const s = new THREE.Shape();
  // 自轨底左侧起，顺时针描绘断面
  s.moveTo(-0.075, 0);
  s.lineTo(0.075, 0);            // 轨底宽 150mm
  s.lineTo(0.075, 0.028);
  s.lineTo(0.026, 0.034);        // 轨腰收窄
  s.lineTo(0.026, 0.128);
  s.lineTo(0.045, 0.14);         // 轨头下肩
  s.quadraticCurveTo(0.052, 0.17, 0.03, 0.172); // 轨头顶弧
  s.lineTo(-0.03, 0.172);
  s.quadraticCurveTo(-0.052, 0.17, -0.045, 0.14);
  s.lineTo(-0.026, 0.128);
  s.lineTo(-0.026, 0.034);
  s.lineTo(-0.075, 0.028);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
  // 断面在 XY 平面、沿 +Z 挤出 → 旋转使长度沿 X，轨头朝上
  geo.rotateY(Math.PI / 2);      // (x,y,z)→(z,y,-x)：长度方向 z→x
  return geo;
}

export function createTracks() {
  const group = new THREE.Group();
  group.name = 'tracks';

  // —— 道砟带（西端严格平齐底座边缘 x=-16.5，南缘衔接站台前沿 z=-6.6，北缘至 z=-15.5）——
  const ballastLen = BALLAST_X1 - X_WEST;
  const BALLAST_Z0 = -15.5, BALLAST_Z1 = -6.6;
  const ballast = new THREE.Mesh(
    new THREE.BoxGeometry(ballastLen, BALLAST_TOP, BALLAST_Z1 - BALLAST_Z0),
    toon('#8d857a', { map: concreteTexture(5, '#8d857a') })
  );
  ballast.position.set((X_WEST + BALLAST_X1) / 2, BALLAST_TOP / 2, (BALLAST_Z0 + BALLAST_Z1) / 2);
  ballast.receiveShadow = true;
  group.add(ballast);

  // —— 轨枕（InstancedMesh，西端起始于 x=-16.3，胎基收于底座内）——
  const sleeperGeo = new THREE.BoxGeometry(0.26, 0.12, 2.7);
  const sleeperMat = toon('#5d4f42', { map: concreteTexture(9, '#5d4f42') });
  const spacing = 0.7;
  const sleeperStartX = -16.3;
  const nPerTrack = Math.floor((7.6 - sleeperStartX) / spacing) + 1;
  const sleepers = new THREE.InstancedMesh(sleeperGeo, sleeperMat, nPerTrack * TRACKS.length);
  {
    const m = new THREE.Matrix4();
    let idx = 0;
    for (const tr of TRACKS) {
      for (let i = 0; i < nPerTrack; i++) {
        const x = sleeperStartX + i * spacing;
        m.makeTranslation(x, BALLAST_TOP + 0.06, tr.z);
        sleepers.setMatrixAt(idx++, m);
      }
    }
    sleepers.instanceMatrix.needsUpdate = true;
  }
  sleepers.castShadow = true;
  sleepers.receiveShadow = true;
  group.add(sleepers);

  // —— 钢轨（写实金属，环境反射；西端齐平 x=-16.5，东端至挡车器 x=+8.0）——
  const railLen = X1 - X_WEST;
  const railGeo = makeRailGeometry(railLen);
  const railMat = metal(0xb9c0c8, 0.3, 0.92);
  for (const tr of TRACKS) {
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, railMat);
      // 几何长度沿 +X，起点在 x=0 → 平移到 X_WEST
      rail.position.set(X_WEST, BALLAST_TOP + 0.12, tr.z + side * GAUGE / 2);
      rail.castShadow = true;
      group.add(rail);
    }
  }

  // —— 轨道尽头缓冲挡车器（x=+8）——
  const stopMat = metal(0x6f757c, 0.45, 0.8);
  for (const tr of TRACKS) {
    for (const side of [-1, 1]) {
      const z = tr.z + side * GAUGE / 2;
      // 立柱
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), stopMat);
      post.position.set(X1 - 0.15, BALLAST_TOP + 0.37, z);
      post.castShadow = true;
      group.add(post);
      // 斜撑
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.09), stopMat);
      brace.position.set(X1 - 0.38, BALLAST_TOP + 0.2, z);
      brace.rotation.z = 0.6;
      group.add(brace);
    }
  }

  return group;
}
