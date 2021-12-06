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

// 响应式函数 Vue2中的 options API data(){return {}}
function reactive(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    // Vue3不再使用它是因为强行将数据属性描述符转为了存取(访问)属性描述符，
    // 且Object.defineProperty提出的本意并不是用来做响应式的~
    Object.defineProperty(obj, key, {
      get: function () {
        const depend = getDepend(obj, key);
        depend.depend();
        return value;
      },
      set: function (newValue) {
        value = newValue;
        const depend = getDepend(obj, key);
        depend.notify();
      },
    });
  });
  return obj;
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
