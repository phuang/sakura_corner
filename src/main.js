/**
 * 总装入口 —— 按 docs/LAYOUT_PLAN.md 坐标组装全部资产，注册动画并启动渲染循环。
 * - 渲染器：PCFSoft 软阴影 + ACES 色调映射；PMREM + RoomEnvironment 提供金属/玻璃反射环境；
 * - 后处理链：RenderPass → OutlinePass（全场景动漫描边）→ UnrealBloomPass → OutputPass；
 * - 相机：OrbitRig 第三人称自由观景（拖拽旋转 / 无极缩放，阻尼平滑）。
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// —— 核心管线 ——
import { createComposer } from './core/composer.js';
import { OrbitRig } from './core/cameraControls.js';
import { setupLighting } from './core/lighting.js';
import { tick } from './core/animationRegistry.js';

// —— 环境层 ——
import { createSky } from './environment/sky.js';
import { createBasePlatform } from './environment/basePlatform.js';

// —— 车站组 ——
import { createTracks } from './assets/station/tracks.js';
import { createPlatform } from './assets/station/platform.js';
import { createTrain } from './assets/station/train.js';
import { createShelter } from './assets/station/shelter.js';

// —— 便利店外壳 ——
import { createStoreBuilding } from './assets/convenienceStore/storeBuilding.js';
import { createGlassFacade } from './assets/convenienceStore/glassFacade.js';
import { createAutoDoor } from './assets/convenienceStore/autoDoor.js';
import { createCanopy } from './assets/convenienceStore/canopy.js';
import { createDoorMat } from './assets/convenienceStore/doorMat.js';

// —— 便利店内部（14 项）——
import { createStoreInterior } from './assets/convenienceStore/interior/storeInterior.js';
import { createShelves } from './assets/convenienceStore/interior/shelves.js';
import { createSnackShelves } from './assets/convenienceStore/interior/snackShelves.js';
import { createDrinkCooler } from './assets/convenienceStore/interior/drinkCooler.js';
import { createBentoDisplay } from './assets/convenienceStore/interior/bentoDisplay.js';
import { createRegisterCounter } from './assets/convenienceStore/interior/registerCounter.js';
import { createCoffeeMachine } from './assets/convenienceStore/interior/coffeeMachine.js';
import { createMagazineRack } from './assets/convenienceStore/interior/magazineRack.js';
import { createPosterLightbox } from './assets/convenienceStore/interior/posterLightbox.js';
import { createStandingFreezer } from './assets/convenienceStore/interior/standingFreezer.js';
import { createOdenCounter } from './assets/convenienceStore/interior/odenCounter.js';
import { createFloorGuide } from './assets/convenienceStore/interior/floorGuide.js';
import { createStorageLockers } from './assets/convenienceStore/interior/storageLockers.js';
import { createBackDoor } from './assets/convenienceStore/interior/backDoor.js';

// —— 店外道具 ——
import { createVendingMachine } from './assets/convenienceStore/vendingMachine.js';
import { createUmbrellaStand } from './assets/convenienceStore/umbrellaStand.js';
import { createTrashBins } from './assets/convenienceStore/trashBins.js';
import { createFlowerPots } from './assets/convenienceStore/flowerPot.js';
import { createAcOutdoorUnits } from './assets/convenienceStore/acOutdoorUnit.js';

// —— 街道组 ——
import { createAsphaltRoad } from './assets/street/asphaltRoad.js';
import { createCrosswalks } from './assets/street/crosswalk.js';
import { createParkingSpaces } from './assets/street/parkingSpace.js';
import { createDrainageGutter } from './assets/street/drainageGutter.js';
import { createGuardrails } from './assets/street/guardrail.js';
import { createSignboard } from './assets/street/signboard.js';
import { createTrafficSignal } from './assets/street/trafficSignal.js';
import { createStreetLamps } from './assets/street/streetLamp.js';
import { createUtilityPoles } from './assets/street/utilityPole.js';
import { createPowerWires } from './assets/street/powerWires.js';
import { createAlleyEntrance } from './assets/street/alleyEntrance.js';
import { createPosterBoard } from './assets/street/posterBoard.js';
import { createBikeRacks } from './assets/street/bikeRack.js';
import { createBicycles } from './assets/street/bicycle.js';
import { createDeliveryTruck } from './assets/street/deliveryTruck.js';

// —— 樱花系统 ——
import { createYoshinoCherry } from './assets/sakura/cherryTreeYoshino.js';
import { createLateCherry } from './assets/sakura/cherryTreeLate.js';
import { createPetalSystem } from './assets/sakura/petalSystem.js';

// ================= 渲染器 / 场景 / 相机 =================

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); // MSAA×4 由合成器渲染目标承担
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);

// PMREM + RoomEnvironment：金属/玻璃反射环境（无外部 HDR 依赖）
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
}

// ================= 组装 =================

const add = (obj) => scene.add(obj);

// —— 环境层：天空穹顶 + 雾、正方形纯色底座 ——
createSky(scene);
setupLighting(scene);
add(createBasePlatform());

// —— 车站组（世界坐标内置）——
add(createTracks());
add(createPlatform());
add(createTrain());
add(createShelter());

// —— 便利店：外壳 + 内部 + 店外道具 ——
add(createStoreBuilding());
add(createGlassFacade());
add(createAutoDoor());
add(createCanopy());
add(createDoorMat());

add(createStoreInterior());
add(createShelves());
add(createSnackShelves());
add(createDrinkCooler());
add(createBentoDisplay());
add(createRegisterCounter());
add(createCoffeeMachine());
add(createMagazineRack());
add(createPosterLightbox());
add(createStandingFreezer());
add(createOdenCounter());
add(createFloorGuide());
add(createStorageLockers());
add(createBackDoor());

add(createVendingMachine());
add(createUmbrellaStand());
add(createTrashBins());
add(createFlowerPots());
add(createAcOutdoorUnits());

// —— 街道组（世界坐标内置）——
add(createAsphaltRoad());
add(createCrosswalks());
add(createParkingSpaces());
add(createDrainageGutter());
add(createGuardrails());
add(createSignboard());
add(createTrafficSignal());
add(createStreetLamps());
add(createUtilityPoles());
add(createPowerWires());
add(createAlleyEntrance());
add(createPosterBoard());
add(createBikeRacks());
add(createBicycles());

// —— 送货小货车（主路 A 北侧路边停靠，车头朝西）——
const truck = createDeliveryTruck();
truck.position.set(4.0, 0, 9.2);
truck.rotation.y = 0; // 车头朝西（-X），局部 -X 方向
scene.add(truck);

// —— 樱花树（局部原点 = 树干基部，按布局落位）——
function plant(factory, seed, x, y, z) {
  const tree = factory({ seed });
  tree.position.set(x, y, z);
  scene.add(tree);
}
plant(createYoshinoCherry, 7, -14.5, 0.05, 0.8);   // T1 染井吉野樱（大，西侧主景）
plant(createYoshinoCherry, 13, -9.3, 0.05, 1.4);   // T2 染井吉野樱
plant(createLateCherry, 21, 10.75, 0.05, -6.5);    // L2 晚樱（东侧人行道树池内）
plant(createYoshinoCherry, 29, -4, 0, -16);        // T3 染井吉野樱（背景大树，轨道后方）
plant(createLateCherry, 37, 10.75, 0.05, 1.0);     // L1 晚樱（东侧人行道树池内）

// —— 樱花动态系统：飘落 / 空中飞舞 / 地面堆积随风移动 ——
createPetalSystem(scene, {
  trees: [
    { x: -14.5, z: 0.8, crownY: 6.3, crownR: 2.7 },   // T1
    { x: -9.3, z: 1.4, crownY: 6.0, crownR: 2.4 },    // T2
    { x: 10.75, z: -6.5, crownY: 4.9, crownR: 2.0 },  // L2
    { x: -4, z: -16, crownY: 6.5, crownR: 2.9 },      // T3
    { x: 10.75, z: 1.0, crownY: 4.7, crownR: 1.9 },   // L1
  ],
  seed: 301,
});

// ================= 相机控制 + 后处理 =================

const rig = new OrbitRig(camera, canvas);
const { composer, collectOutlineTargets } = createComposer(renderer, scene, camera);
collectOutlineTargets(); // 全场景动漫描边（userData.noOutline 者除外）

// ================= 渲染循环 =================

const clock = new THREE.Clock();
let elapsed = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  rig.update(dt);
  tick(elapsed, dt); // 驱动全部已注册动画（花瓣/枝摆/玻璃浮动/灯光呼吸/信号灯/自动门…）
  composer.render();
});

// ================= 窗口自适应 =================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
