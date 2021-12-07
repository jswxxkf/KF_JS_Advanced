function add(x, y, z) {
  return x + y + z;
}

// 自动柯里化函数希望对传入的函数进行柯里化
function kfCurrying(fn) {
  function curried(...args) {
    // 判断传入参数的个数是否大于等于fn期待传入的参数个数
    // 当传入的参数已经大于等于fn期待的参数个数时, 就执行函数
    if (args.length >= fn.length) {
      // return fn.call(this, ...args);
      return fn.apply(this, args);
    } else {
      // 没有达到个数时, 需要返回一个新的函数, 继续来接收的参数
      // 上一次传入的args被绑定为下方函数的自由变量
      function curried2(...args2) {
        // 接收到参数后, 需要递归调用curried来检查函数的个数是否达到
        return curried.apply(this, [...args, ...args2]);
      }
      return curried2;
    }
  }

  return curried;
}

// test code
const curriedAdd = kfCurrying(add);
console.log(curriedAdd(10, 20, 30));
console.log(curriedAdd(10)(20, 30));
console.log(curriedAdd(10)(20)(30));
