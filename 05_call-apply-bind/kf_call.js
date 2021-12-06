Function.prototype.kfCall = function (thisArg, ...args) {
  // xxx.kfCall(undefined)
  // 获取到需要被立刻执行的函数
  const fn = this;
  // 处理绑定的thisArg
  thisArg =
    thisArg === null || thisArg === undefined ? globalThis : Object(thisArg);
  thisArg.fn = fn;
  const res = thisArg.fn(...args); // 核心：必须让fn真正执行时this被隐式绑定为thisArg
  delete thisArg.fn;
  // const res = fn(...args)  // 这样默认绑定为 window / global (globalThis)，也就失去了call方法的意义
  return res;
};

function foo(a, b) {
  console.log(this, a, b);
}

// test code
// foo.kfCall(undefined, 2, 3);
foo.kfCall({ name: "xkf" }, 2, 3);
