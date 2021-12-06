// 0. 最简单的方法（存在很大弊端）
// const s1 = Symbol();
// const s2 = Symbol();

// const obj = {
//   name: "why",
//   friend: {
//     name: "kobe",
//   },
//   foo: function () {
//     // JSON的序列化和解析操作对函数对象无能为力！
//     console.log("foo function");
//   },
//   [s1]: "abc", // 同样，对于Symbol作为key及value也无能为力！
//   s2: s2,
// };

// // obj.inner = obj;

// const info = JSON.parse(JSON.stringify(obj));
// console.log(info === obj);
// obj.friend.name = "james";
// console.log(info);

// 1. 基本实现：
// 封装判断是否为一个对象的函数
// function isObject(obj) {
//   const valType = typeof obj;
//   return valType !== null && (valType === "object" || valType === "function");
// }

// function deepClone(originValue) {
//   // 判断传入的originVal是否为一个对象类型
//   if (!isObject(originValue)) {
//     return originValue;
//   }
//   const newObj = {};
//   for (const key in originValue) {
//     newObj[key] = deepClone(originValue[key]);
//   }
//   return newObj;
// }

// // test code
// const obj = {
//   name: "kobe",
//   age: 18,
//   friend: {
//     name: "james",
//   },
// };

// const newObj = deepClone(obj);
// console.log(newObj === obj);
// console.log(newObj);

// 2.升级版：更多数据类型的判定及特殊处理 + 循环引用 [Circular]
function isObject(obj) {
  const valType = typeof obj;
  return valType !== null && (valType === "object" || valType === "function");
}

function deepClone(originValue, map = new WeakMap()) {
  // 判断传入的originVal是否为一个Set对象
  if (originValue instanceof Set) {
    return new Set([...originValue]);
  }
  // 判断传入的originVal是否为一个Map对象
  if (originValue instanceof Map) {
    return new Map([...originValue]);
  }
  // 判断传入的originVal是否为一个Symbol作为value
  if (typeof originValue === "symbol") {
    return Symbol(originValue.description);
  }
  // 判断传入的originVal是否为一个函数对象(直接使用同一个函数)
  if (typeof originValue === "function") {
    return originValue;
  }
  // 判断传入的originVal是否为一个对象类型
  if (!isObject(originValue)) {
    return originValue;
  }
  // 判断是否包含循环引用
  if (map.has(originValue)) {
    return map.get(originValue);
  }
  // 判断传入的originVal是一个数组还是对象，即初始化方式不同
  const newObj = Array.isArray(originValue) ? [] : {};
  map.set(originValue, newObj);
  for (const key in originValue) {
    newObj[key] = deepClone(originValue[key], map);
  }
  // 因Symbol作为Key是无法被迭代器所枚举的，因此做特殊处理
  const symbolKeys = Object.getOwnPropertySymbols(originValue);
  for (const symbolKey of symbolKeys) {
    const newSymbolKey = Symbol(symbolKey.description);
    newObj[newSymbolKey] = deepClone(originValue[symbolKey]);
  }
  return newObj;
}

// test code
const s1 = Symbol("aaa");
const s2 = Symbol("bbb");

const obj = {
  name: "kobe",
  age: 18,
  friend: {
    name: "james",
  },
  hobbies: ["basketball", "football", "tennis"],
  run: function () {
    console.log("is running~!");
  },
  set: new Set(["aaa", "bbb", "ccc"]),
  map: new Map([
    ["k1", "v1"],
    ["k2", "v2"],
    ["k3", "v3"],
  ]),
  [s1]: "aaa",
  s2: s2,
};

// 循环引用
obj.info = obj;

const newObj = deepClone(obj);
console.log(newObj === obj);
console.log(newObj);
