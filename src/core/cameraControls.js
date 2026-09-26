/**
 * 自定义轨道相机 —— 第三人称自由观景。
 * - 左键/单指拖拽：360° 全向旋转（方位角无界，俯仰角限制在地平线上下）；
 * - 滚轮 / 双指捏合：无极缩放（指数平滑，半径连续变化）；
 * - 阻尼插值保证手感顺滑。无任何 UI 元素。
 */

import * as THREE from 'three';

export class OrbitRig {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;

    // 观察目标点（街角中心略偏上）
    this.target = new THREE.Vector3(0.5, 1.6, -1.2);

    // 球坐标状态：theta=方位角, phi=极角(自 +Y), radius=距离
    this.theta = Math.PI * 0.27;      // 默认东南向视角
    this.phi = 1.04;                  // 约 32° 仰角
    this.radius = 36;

    // 目标值（阻尼插值）
    this.goalTheta = this.theta;
    this.goalPhi = this.phi;
    this.goalRadius = this.radius;

    this.minPhi = 0.18;   // 接近顶视
    this.maxPhi = 1.52;   // 略低于地平线，防止穿入底座
    this.minRadius = 4.5;
    this.maxRadius = 95;

    this.pointers = new Map();
    this.pinchDist = 0;

    dom.addEventListener('pointerdown', (e) => this.onDown(e));
    dom.addEventListener('pointermove', (e) => this.onMove(e));
    dom.addEventListener('pointerup', (e) => this.onUp(e));
    dom.addEventListener('pointercancel', (e) => this.onUp(e));
    dom.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  onDown(e) {
    this.dom.setPointerCapture?.(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
    this.dom.classList.add('dragging');
  }

  onMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const prev = this.pointers.get(e.pointerId);
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 1) {
      // 单指/鼠标：旋转（拖拽方向 = 场景转动方向，与水平轴一致）
      this.goalTheta -= dx * 0.0052;
      this.goalPhi -= dy * 0.0038; // 下拖 → 相机升高、俯视更多
      this.clampGoal();
    } else if (this.pointers.size === 2) {
      // 双指：捏合缩放（同时保留旋转中点）
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinchDist > 0 && d > 0) {
        this.goalRadius *= this.pinchDist / d;
        this.clampGoal();
      }
      this.pinchDist = d;
    }
  }

  onUp(e) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinchDist = 0;
    if (this.pointers.size === 0) this.dom.classList.remove('dragging');
  }

  onWheel(e) {
    e.preventDefault();
    // deltaY>0 向下滚 → 拉远；指数映射实现无极缩放
    this.goalRadius *= Math.exp(e.deltaY * 0.0011);
    this.clampGoal();
  }

  clampGoal() {
    this.goalPhi = THREE.MathUtils.clamp(this.goalPhi, this.minPhi, this.maxPhi);
    this.goalRadius = THREE.MathUtils.clamp(this.goalRadius, this.minRadius, this.maxRadius);
  }

  /** 每帧调用：阻尼插值 + 更新相机位姿 */
  update(dt) {
    const k = 1 - Math.exp(-dt * 7.5); // 阻尼系数
    this.theta += (this.goalTheta - this.theta) * k;
    this.phi += (this.goalPhi - this.phi) * k;
    this.radius += (this.goalRadius - this.radius) * k;

    const sp = Math.sin(this.phi), cp = Math.cos(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sp * Math.sin(this.theta),
      this.target.y + this.radius * cp,
      this.target.z + this.radius * sp * Math.cos(this.theta)
    );
    this.camera.lookAt(this.target);
  }
}
