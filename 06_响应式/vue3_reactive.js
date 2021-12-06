// 保存当前需要收集的响应式函数
let activeReactiveFn = null;

// 封装一个响应式的函数
function watchFn(fn) {
  activeReactiveFn = fn;
  fn();
  activeReactiveFn = null;
}

// Dep类
class Depend {
  constructor() {
    this.reactiveFns = new Set();
  }
  depend() {
    if (activeReactiveFn) {
      this.reactiveFns.add(activeReactiveFn);
    }
  }
  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// 用于存储所有对象对应key依赖项的总Map
const targetMap = new WeakMap();

// 获取Dep对象的方法
function getDepend(target, key) {
  let map = targetMap.get(target);
  if (!map) {
    map = new Map();
    targetMap.set(target, map);
  }
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

// 响应式函数 类似于Vue3 composition API 中的 ref() / reactive({})
function reactive(obj) {
  return new Proxy(obj, {
    get: function (target, key, receiver) {
      const depend = getDepend(target, key);
      depend.depend();
      return Reflect.get(target, key, receiver);
    },
    set: function (target, key, newValue, receiver) {
      Reflect.set(target, key, newValue, receiver);
      const depend = getDepend(target, key);
      depend.notify();
    },
  });
}

// test code
const objProxy = reactive({
  name: "xkf", // 对应一个dep对象，里面维护着所有依赖函数（订阅者）
  age: 18, // 对应一个dep对象，里面维护者所有依赖函数（订阅者）
});

const infoProxy = reactive({
  address: "无锡市",
  height: 1.85,
});

watchFn(() => {
  console.log(infoProxy.address); // 一开始打印初始值，类似于useEffect()也是一样的机制
});

infoProxy.address = "苏州市";

const foo = reactive({
  name: "foo",
});

watchFn(() => {
  console.log(foo.name);
});

foo.name = "bar";
