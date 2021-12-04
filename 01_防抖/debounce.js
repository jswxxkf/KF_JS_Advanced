// 1. 最基本的实现：考虑到this的绑定问题及剩余参数问题
// function debounce(fn, delay) {
//   // 定义一个定时器（自由变量），以实现保存上一次的定时器
//   let timer = null;
//   // 真正执行的函数
//   const _debounce = function (...args) {
//     // 取消上一次的定时器
//     if (timer) clearTimeout(timer);
//     // 延迟执行
//     timer = setTimeout(() => {
//       // 外部传入的真正需要执行的函数
//       fn.apply(this, args);
//       timer = null;
//     }, delay);
//   };
//   return _debounce;
// }

// 2. 升级版：第一次立即执行
// function debounce(fn, delay, immediate = false) {
//   let timer = null;
//   let isInvoke = false;
//   const _debounce = function (...args) {
//     // 取消上一次的定时器
//     if (timer) clearTimeout(timer);
//     // 判断是否需要立即执行
//     if (immediate && !isInvoke) {
//       fn.apply(this, args);
//       isInvoke = true;
//     } else {
//       // 延迟执行
//       timer = setTimeout(() => {
//         // 外部传入的真正需要执行的函数
//         fn.apply(this, args);
//         timer = null;
//         isInvoke = false;
//       }, delay);
//     }
//   };
//   return _debounce;
// }

// 3. 升级版：处理返回值
// function debounce(fn, delay, immediate = false, callback = null) {
//   let timer = null;
//   let isInvoke = false;
//   const _debounce = function (...args) {
//     // 取消上一次的定时器
//     if (timer) clearTimeout(timer);
//     // 判断是否需要立即执行
//     if (immediate && !isInvoke) {
//       const res = fn.apply(this, args);
//       if (callback && typeof callback === "function") callback(res);
//       isInvoke = true;
//     } else {
//       // 延迟执行
//       timer = setTimeout(() => {
//         // 外部传入的真正需要执行的函数
//         const res = fn.apply(this, args);
//         if (callback && typeof callback === "function") callback(res);
//         timer = null;
//         isInvoke = false;
//       }, delay);
//     }
//   };
//   return _debounce;
// }

// 4. 升级版：处理用户主动取消
function debounce(fn, delay, immediate = false, callback = null) {
  let timer = null;
  let isInvoke = false;
  const _debounce = function (...args) {
    // 取消上一次的定时器
    if (timer) clearTimeout(timer);
    // 判断是否需要立即执行
    if (immediate && !isInvoke) {
      const res = fn.apply(this, args);
      if (callback && typeof callback === "function") callback(res);
      isInvoke = true;
    } else {
      // 延迟执行
      timer = setTimeout(() => {
        // 外部传入的真正需要执行的函数
        const res = fn.apply(this, args);
        if (callback && typeof callback === "function") callback(res);
        timer = null;
        isInvoke = false;
      }, delay);
    }
  };
  _debounce.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    isInvoke = false;
  };
  return _debounce;
}
