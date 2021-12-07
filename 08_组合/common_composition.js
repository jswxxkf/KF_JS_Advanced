function kfCompose(...fns) {
  const length = fns.length;
  for (let i = 0; i < length; ++i) {
    if (typeof fns[i] !== "function") {
      throw new TypeError("Expected parameters are functions!");
    }
  }
  function compose(...args) {
    let index = 0;
    let result = length ? fns[index].apply(this, args) : args;
    while (++index < length) {
      result = fns[index].call(this, result);
    }
    return result;
  }
  return compose;
}

// test code
function double(m) {
  return 2 * m;
}

function square(n) {
  return n ** 2;
}

const composedFn = kfCompose(double, square);
console.log(composedFn(10));
