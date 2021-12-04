// 1. 最基本的实现 考虑到this的绑定问题及剩余参数问题
// function throttle(fn, interval) {
//   let lastTime = 0;
//   function _throttle(...args) {
//     const currTime = new Date().getTime();
//     const remainTime = interval - (currTime - lastTime);
//     if (remainTime <= 0) {
//       fn.apply(this, args);
//       lastTime = currTime;
//     }
//   }
//   return _throttle;
// }

// 2. 升级版：第一次不触发
// function throttle(fn, interval, options = { leading: true, trailing: true }) {
//   const { leading, trailing } = options;
//   let lastTime = 0;
//   function _throttle(...args) {
//     const currTime = new Date().getTime();
//     // 若第一次不需要触发，则立刻将lastTime与currTime保持一致
//     if (!leading && !lastTime) lastTime = currTime;
//     const remainTime = interval - (currTime - lastTime);
//     if (remainTime <= 0) {
//       fn.apply(this, args);
//       lastTime = currTime;
//     }
//   }
//   return _throttle;
// }

// 3. 升级版：最后一次触发
// function throttle(fn, interval, options = { leading: true, trailing: true }) {
//   const { leading, trailing } = options;
//   // 1.记录上一次的开始时间
//   let lastTime = 0;
//   let timer = null;
//   // 2.事件触发时, 真正执行的函数
//   function _throttle(...args) {
//     const currTime = new Date().getTime();
//     // 2.1.若第一次不需要触发，则立刻将lastTime与currTime保持一致
//     if (!leading && !lastTime) lastTime = currTime;
//     // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
//     const remainTime = interval - (currTime - lastTime);
//     if (remainTime <= 0) {
//       if (timer) {
//         clearTimeout(timer);
//         timer = null;
//       }
//       fn.apply(this, args);
//       lastTime = currTime;
//       return;
//     }
//     if (trailing && !timer) {
//       timer = setTimeout(() => {
//         timer = null;
//         lastTime = !leading ? 0 : new Date().getTime();
//         fn.apply(this, args);
//       }, remainTime);
//     }
//   }
//   return _throttle;
// }

// 4. 升级版：取消功能
// function throttle(fn, interval, options = { leading: true, trailing: true }) {
//   const { leading, trailing } = options;
//   // 1.记录上一次的开始时间
//   let lastTime = 0;
//   let timer = null;
//   // 2.事件触发时, 真正执行的函数
//   function _throttle(...args) {
//     const currTime = new Date().getTime();
//     // 2.1.若第一次不需要触发，则立刻将lastTime与currTime保持一致
//     if (!leading && !lastTime) lastTime = currTime;
//     // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
//     const remainTime = interval - (currTime - lastTime);
//     if (remainTime <= 0) {
//       if (timer) {
//         clearTimeout(timer);
//         timer = null;
//       }
//       fn.apply(this, args);
//       lastTime = currTime;
//       return;
//     }
//     if (trailing && !timer) {
//       timer = setTimeout(() => {
//         timer = null;
//         fn.apply(this, args);
//         lastTime = !leading ? 0 : currTime;
//       }, remainTime);
//     }
//   }
//   _throttle.cancel = function () {
//     if (timer) {
//       clearTimeout(timer);
//       timer = null;
//     }
//   };
//   return _throttle;
// }

// 5.处理返回值
function throttle(
  fn,
  interval,
  options = { leading: true, trailing: true, callback: null }
) {
  const { leading, trailing, callback } = options;
  // 1.记录上一次的开始时间
  let lastTime = 0;
  let timer = null;
  // 2.事件触发时, 真正执行的函数
  function _throttle(...args) {
    const currTime = new Date().getTime();
    // 2.1.若第一次不需要触发，则立刻将lastTime与currTime保持一致
    if (!leading && !lastTime) lastTime = currTime;
    // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
    const remainTime = interval - (currTime - lastTime);
    if (remainTime <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const res = fn.apply(this, args);
      if (callback && typeof callback === "function") callback(res);
      lastTime = currTime;
      return;
    }
    if (trailing && !timer) {
      timer = setTimeout(() => {
        timer = null;
        const res = fn.apply(this, args);
        if (callback && typeof callback === "function") callback(res);
        lastTime = !leading ? 0 : currTime;
      }, remainTime);
    }
  }
  _throttle.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return _throttle;
}
