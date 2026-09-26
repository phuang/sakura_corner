/**
 * 全局动画注册表 —— 各资产模块通过 addUpdater() 注册每帧更新函数，
 * main.js 的渲染循环统一驱动。避免各模块各自持有 requestAnimationFrame。
 */

const updaters = [];

/**
 * @param {(time:number, delta:number)=>void} fn 每帧回调（time: 秒, delta: 秒）
 * @returns {()=>void} 取消注册函数
 */
export function addUpdater(fn) {
  updaters.push(fn);
  return () => {
    const i = updaters.indexOf(fn);
    if (i >= 0) updaters.splice(i, 1);
  };
}

/** 每帧驱动所有已注册动画 */
export function tick(time, delta) {
  for (let i = 0; i < updaters.length; i++) {
    updaters[i](time, delta);
  }
}
