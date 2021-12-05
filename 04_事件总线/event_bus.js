class KFEventBus {
  constructor() {
    this.eventBus = {}; // {name1: [{eventCallback:,thisArg:,}], name2: handlers}
  }
  on(eventName, eventCallback, thisArg) {
    let handlers = this.eventBus[eventName];
    if (!handlers) {
      handlers = [];
      this.eventBus[eventName] = handlers;
    }
    handlers.push({
      eventCallback,
      thisArg,
    });
  }
  off(eventName, eventCallback) {
    const handlers = this.eventBus[eventName];
    if (!handlers) return;
    const newHandlers = handlers.filter((handler) => {
      return handler.eventCallback !== eventCallback;
    });
    this.eventBus[eventName] = newHandlers;
  }
  emit(eventName, ...payload) {
    const handlers = this.eventBus[eventName];
    if (!handlers) return;
    handlers.forEach((handler) => {
      handler.eventCallback.apply(handler.thisArg, payload);
    });
  }
}

const eventBus = new KFEventBus();

eventBus.on(
  "abc",
  function () {
    console.log("监听abc1", this);
  },
  { name: "xkf" }
);

const handleCallback = function () {
  console.log("监听abc2", this);
};

eventBus.on("abc", handleCallback, { name: "xkf" });
// 发射事件
eventBus.emit("abc", 123);
// 取消监听
eventBus.off("abc", handleCallback);
// 再次发射事件
eventBus.emit("abc", 123);
