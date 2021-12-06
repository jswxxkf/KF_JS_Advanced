Function.prototype.kfBind = function (thisArg, ...argArray) {
  // 获取真正需要被调用的函数
  const fn = this;
  // 处理绑定的thisArg
  thisArg =
    thisArg === null || thisArg === undefined ? globalThis : Object(thisArg);
  // 创建并返回代理函数
  function proxyFn(...args) {
    thisArg.fn = fn;
    // 注意！系统提供的bind函数具备将两个传入的参数进行合并的功能
    const combinedArgs = [...argArray, ...args];
    const res = thisArg.fn(...combinedArgs);
    delete thisArg.fn;
    return res;
  }
  return proxyFn;
};

// test code
function foo(a, b, c, d, e) {
  console.log(this, a, b, c, d, e);
}

// const _foo = foo.kfBind(undefined, 1, 2);
// _foo(3, 4, 5);

const _foo = foo.kfBind({ name: "xkf" }, 1, 2);
_foo(3, 4, 5);
