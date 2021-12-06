Function.prototype.kfApply = function (thisArg, argArr) {
  // 获取到需要被立刻执行的函数
  const fn = this;
  // 处理绑定的thisArg
  thisArg =
    thisArg === null || thisArg === undefined ? globalThis : Object(thisArg);
  let result;
  thisArg.fn = fn;
  argArr = argArr || [];
  result = thisArg.fn(...argArr);
  delete thisArg.fn;
  return result;
};

// test code
function foo(a, b, c) {
  console.log(this, a, b, c);
}

// foo.kfApply(undefined, [1, "aaa", true]);
foo.kfApply({ name: "xkf" }, [1, "aaa", true]);
