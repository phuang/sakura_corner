# AGENT.md — 日式乡村车站街角便利店 · 微缩三维景观

> 白天晴暖氛围的日式乡村「电车站 + 临街便利店」街角组合，Three.js 模块化工程。
> 本文件为项目核心需求与硬性约束的唯一权威说明（Single Source of Truth）。

---

## 1. 场景总览

- **主题**：小型社区电车站 + 停靠电车 + 标准日式街角转折处的临街便利店，春日樱花街头感。
- **视角**：第三人称自由观景视角（环绕目标点观察的微缩模型视角）。
- **画面纯净度**：**无任何 UI、弹窗、标注、控件、水印、多余文字**，无画面干扰元素。
- **交互**：拖拽旋转（360° 全向）、滚轮/双指无极缩放；带阻尼的平滑手感。
- **底座**：整个场景放置在一块**规整正方形纯色底座**上（微缩收藏模型质感）。

## 2. 渲染标准（最高优先级）

| 项 | 要求 |
| --- | --- |
| 风格 | 纯正日式二次元「三渲二」卡通渲染，画面通透、轮廓锐利干净 |
| 描边 | 物体带动漫风格轮廓描边（OutlinePass 全场景统一描边，色相偏深蓝灰） |
| 明暗 | 场景明暗分明；白日柔和漫射日光 + 电影级打光（主光/补光/半球环境光分层） |
| 色彩 | 柔和治愈、自然饱和度；春日粉樱 × 暖白建筑 × 青绿点缀 |
| 材质区分 | **金属 / 玻璃 / 木材 / 塑胶 / 沥青 / 花瓣 / 树皮** 各自独立质感，不混用 |
| 光影物理 | 樱花透光、路面反光、玻璃折射/反射、物体阴影过渡自然（PCFSoft 软阴影） |
| 质量底线 | 无模糊、无锯齿（MSAA + 抗锯齿后处理链）、无穿模、细节不丢失；多边形精度高 |
| 氛围 | 春日柔和空气光晕（Bloom 低强度泛光 + 远景雾），空间层次与景深分明 |

## 3. 动态效果（柔和不杂乱）

1. **樱花持续飘落**：空中花瓣实例系统，受风场驱动，落地后循环重生。
2. **花枝微风微动**：树干/主枝带枢轴摆动动画，树冠轻微呼吸式起伏。
3. **地面花瓣随风移动**：地面堆积花瓣缓慢漂移、翻转。
4. **玻璃光影浮动**：便利店幕墙与自动贩卖机玻璃的反射高光缓慢流动（envMapRotation 动画）。
5. **灯光微弱呼吸明暗**：路灯、店内灯带、灯箱、贩卖机内灯做正弦呼吸式强度变化。
6. **交通信号灯缓慢渐变**：红/绿之间平滑交叉淡化，节奏舒缓。
7. **自动门开合**：便利店玻璃自动门周期性缓动开合（生活感细节）。

## 4. 场景布局（详见 `docs/LAYOUT_PLAN.md`）

- 小型社区电车站 + 电车 + 临街便利店的街角组合；
- 包含电车轨道、站台；标准日式街角转折（L 形双路交汇），动线合理，尺度紧凑；
- 内容填充饱满、疏密得当，还原日本春日街头风貌；
- **不放置人物、动物**，保持静谧。

## 5. 资产清单（全部独立建模）

### 户外资产
| 资产 | 文件 | 要点 |
| --- | --- | --- |
| 染井吉野樱 ×3 | `assets/sakura/cherryTreeYoshino.js` | 精细树干树皮、盛开花冠、花瓣簇、枝摆动画 |
| 晚樱 ×2 | `assets/sakura/cherryTreeLate.js` | 深粉重瓣质感，树冠更密实 |
| 樱花动态系统 | `assets/sakura/petalSystem.js` | 飘落 / 空中飞舞 / 地面堆积随风移动 |
| 电车轨道（双线） | `assets/station/tracks.js` | 道砟、轨枕、钢轨（金属反光材质） |
| 站台 | `assets/station/platform.js` | 混凝土板 + 黄色盲道触感砖（实例化凸点） |
| 电车（2 节车厢） | `assets/station/train.js` | 挤出圆角车体、车窗带、滑动门、车头灯、目的地显示 |
| 车站候车亭 | `assets/station/shelter.js` | 雨棚、立柱、木长椅、时刻表牌、站名牌 |
| 便利店建筑 | `assets/convenienceStore/storeBuilding.js` | 街角 L 形玻璃幕墙 + 实体墙 + 平屋顶女儿墙 |
| 玻璃幕墙 | `assets/convenienceStore/glassFacade.js` | 竖梃/横档铝框网格 + 物理玻璃（反射流动动画） |
| 自动门 | `assets/convenienceStore/autoDoor.js` | 双扇玻璃门，周期性缓动开合 |
| 雨棚 | `assets/convenienceStore/canopy.js` | 入口悬挑雨棚 + 底部灯带呼吸 |
| 门口地垫 | `assets/convenienceStore/doorMat.js` | 深色防滑地垫（程序纹理） |
| 自动贩卖机 | `assets/convenienceStore/vendingMachine.js` | **真实玻璃门，内部每层饮料可见**；按钮阵列、投币口、内灯呼吸 |
| 雨伞架 | `assets/convenienceStore/umbrellaStand.js` | 圆筒伞架 + 多把收拢雨伞（多色） |
| 分类垃圾桶 ×3 | `assets/convenienceStore/trashBins.js` | 并排摆放，彩色桶盖，经年磨损污渍 |
| 花盆 ×3 | `assets/convenienceStore/flowerPot.js` | 陶瓷盆 + 绿植/樱粉色花簇 |
| 空调外机 ×2 | `assets/convenienceStore/acOutdoorUnit.js` | 侧面安装，风扇格栅、铜管、锈迹磨损 |
| 复古路灯 ×2 | `assets/street/streetLamp.js` | 铸铁灯柱 + 玻璃灯罩，暖光呼吸 |
| 电线杆 ×2 | `assets/street/utilityPole.js` | 混凝土杆身、横担、绝缘子 |
| 架空电线 | `assets/street/powerWires.js` | **仅存在于两根电线杆之间**（两端必须连接电线杆），垂弧曲线 |
| 路牌 | `assets/street/signboard.js` | 抽象箭头/圆形标志，无文字 |
| 护栏 | `assets/street/guardrail.js` | 轨道尽头围栏 + 路口短护栏 |
| 停车位 | `assets/street/parkingSpace.js` | 路面划线车位 ×3（含禁停区斜纹） |
| 排水沟 | `assets/street/drainageGutter.js` | 路缘排水沟 + 铸铁篦子 |
| 柏油路面 | `assets/street/asphaltRoad.js` | L 形双路、路缘石、井盖（程序沥青纹理） |
| 斑马线 ×2 | `assets/street/crosswalk.js` | 路口人行横道，磨损白漆 |
| 小巷入口 | `assets/street/alleyEntrance.js` | 围墙缺口 + 窄巷纵深 + 尽头铁门 |
| 公告海报栏 | `assets/street/posterBoard.js` | 立式公告栏 + 多张抽象海报 |
| 自行车停放区 | `assets/street/bikeRack.js` | U 形停车架 ×3 |
| 日式通勤自行车 ×5 | `assets/street/bicycle.js` | 弯把/直把、前车篮、后货架、脚撑；便利店外 1 辆 + 车区 4 辆 |

### 便利店内部资产（透过大面积玻璃完整可见，全部独立文件）
| 资产 | 文件 | 要点 |
| --- | --- | --- |
| 室内壳体 | `interior/storeInterior.js` | 瓷砖地面、吊顶灯带（柔光）、内墙 |
| 多层货架（中岛） | `interior/shelves.js` | 金属框架 + 4~5 层，商品实例化满陈列 |
| 零食区货架 | `interior/snackShelves.js` | 西墙挂架，彩色包装密集陈列 |
| 饮料冷柜 | `interior/drinkCooler.js` | 玻璃门、多层瓶装/罐装、顶部 LED 冷光 |
| 便当/饭团寿司陈列 | `interior/bentoDisplay.js` | 冷藏展示柜：便当盒、饭团、寿司卷分层托盘 |
| 收银台 | `interior/registerCounter.js` | L 形柜台 + POS 终端 + 小件商品 |
| 咖啡机 | `interior/coffeeMachine.js` | 金属机身、冲煮头、杯架（写实金属） |
| 杂志架 | `interior/magazineRack.js` | 多层斜架，彩色刊面扇形陈列 |
| 海报灯箱 | `interior/posterLightbox.js` | 立式灯箱，发光海报 + 呼吸光 |
| 立式冰柜 | `interior/standingFreezer.js` | 通高玻璃门冰柜，层板饮料满陈列 |
| 关东煮柜台 | `interior/odenCounter.js` | 汤锅、串签食材、蒸汽微动 |
| 地面导视 | `interior/floorGuide.js` | 黄色引导线 + 圆形站位标识（无文字） |
| 储物柜 | `interior/storageLockers.js` | 3×4 金属小柜，通风孔/锁孔细节 |
| 后场门 | `interior/backDoor.js` | 钢制后门、推杆、观察窗 |

## 6. 硬性架构约束（工程）

1. **禁止把全部模型逻辑塞进单个 HTML**。`index.html` 仅作为入口主框架（importmap + canvas + 启动脚本）。
2. **地图与每一个模型资产全部拆分为独立模块文件**，ES Module 导入组装：
   - `src/core/*` — 渲染管线、相机控制、材质/纹理工厂、灯光、动画注册表；
   - `src/environment/*` — 天空穹顶、正方形底座；
   - `src/assets/**` — 每个资产一个文件，导出 `create*()` 工厂函数返回 `THREE.Group`。
3. **开发顺序**：先输出整体布局方案（`docs/LAYOUT_PLAN.md`），再逐个资产依次建模开发（见 §8 步骤清单）。
4. **质量优先**：不计时间 / token / 渲染开销；禁止批量粗制合成；每个物件独立建模、独立渲染，**不合并网格、不简化细节、不压缩精度**。
5. **磨损细节**：所有户外道具增加现实经年磨损（污渍、锈迹、褪色、划痕），还原真实反光纹理。

## 7. 技术栈与运行方式

- Three.js r160+（ESM，importmap 指向 CDN）；后处理链：RenderPass → OutlinePass → UnrealBloomPass → OutputPass。
- 程序化 CanvasTexture 生成沥青 / 混凝土 / 树皮 / 瓷砖等纹理，无外部图片依赖。
- `PMREM + RoomEnvironment` 提供金属/玻璃反射环境。
- **运行**：直接双击打开 `index.html`（需联网加载 three.js CDN），或任意静态服务器。

## 8. 开发步骤清单（依次执行）

| # | 阶段 | 内容 | 产出文件 |
| --- | --- | --- | --- |
| 0 | 需求整理 | 核心需求与架构约束成文 | `AGENT.md` |
| 1 | 布局规划 | 俯视坐标布局方案（道路/轨道/建筑/资产落位） | `docs/LAYOUT_PLAN.md` |
| 2 | 入口框架 | importmap、canvas、启动脚本、全局样式（无 UI） | `index.html` |
| 3 | 核心管线 | 动画注册表 / 相机控制 / 材质工厂 / 程序纹理 / 灯光 / 后处理合成器 | `src/core/*`（6 文件） |
| 4 | 环境层 | 天空穹顶 + 雾、正方形纯色底座 | `src/environment/sky.js`、`basePlatform.js` |
| 5 | 樱花系统 | 树体构建器 → 染井吉野樱 → 晚樱 → 花瓣动态系统 | `assets/sakura/*`（4 文件） |
| 6 | 车站组 | 轨道 → 站台 → 电车 → 候车亭 | `assets/station/*`（4 文件） |
| 7 | 便利店外壳 | 建筑壳体 → 玻璃幕墙 → 自动门 → 雨棚 → 地垫 | `assets/convenienceStore/*`（5 文件） |
| 8 | 便利店内部 | 室内壳体 + 13 个独立内装资产 | `interior/*`（14 文件） |
| 9 | 店外道具 | 贩卖机 / 雨伞架 / 垃圾桶 / 花盆 / 空调外机 | `assets/convenienceStore/*`（5 文件） |
| 10 | 街道组 | 柏油路 → 斑马线 → 停车位 → 排水沟 → 护栏 → 路牌 → 信号灯 → 路灯 → 电线杆+电线 → 小巷 → 公告栏 → 车区+自行车 | `assets/street/*`（13 文件） |
| 11 | 总装 | `main.js` 按布局坐标组装全部资产、注册动画、启动循环 | `src/main.js` |
| 12 | 验收 | 逐条对照 §2/§3/§5 检查渲染与动态效果，修正穿模/细节 | — |

## 9. 验收标准（Definition of Done）

- [ ] 打开页面即见完整街角微缩场景，无任何 UI / 文字 / 水印；
- [ ] 拖拽 360° 旋转、无极缩放流畅稳定（阻尼平滑）；
- [ ] 三渲二卡通渲染 + 全物体动漫描边，明暗分明，电影级打光；
- [ ] 正方形纯色底座承载全部场景；
- [ ] 樱花飘落 / 枝摆 / 地面花瓣移动 / 玻璃光影浮动 / 灯光呼吸 / 信号灯渐变 全部生效且柔和；
- [ ] 便利店内部透过玻璃完整可见：货架、冷柜、便当陈列、收银台、咖啡机、杂志架、灯箱、冰柜、关东煮、导视、储物柜、后场门，商品饱满无空白死角；
- [ ] 自动贩卖机玻璃门内每层饮料清晰可见；两根电线杆之间电线两端均连接电线杆；
- [ ] 模块化结构：`index.html` 仅入口，每个资产独立文件，无巨型单文件。
