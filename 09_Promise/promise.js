const PROMISE_STATUS_REJECTED = "rejected";
const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_FULFILLED = "fulfilled";

// 工具函数
function execFunctionWithCatchException(execFn, value, resolve, reject) {
  try {
    // 假如onFulfilled/onRejected无返回值，也必须resolve(undefined)!，达到链式调用
    const result = execFn(value);
    resolve(result);
  } catch (err) {
    reject(err);
  }
}

class KFPromise {
  constructor(executor) {
    this.status = PROMISE_STATUS_PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledFns = [];
    this.onRejectedFns = [];
    const resolve = (value) => {
      // 假如已经敲定，则不予执行
      if (this.status === PROMISE_STATUS_PENDING) {
        // 必须等待主线程同步代码执行完毕，即onFulfilledFns全部收集完毕，方可遍历执行
        // 并且与原生Promise保持一致，使onFulfilled与onRejected在微任务队列中执行
        queueMicrotask(() => {
          // 微任务队列执行前，若此promise已经敲定，则不做任何处理
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_FULFILLED;
          this.value = value;
          // 一旦resolve, 则通知所有的onFulfilled回调函数执行
          this.onFulfilledFns.forEach((fn) => {
            fn(this.value);
          });
        });
      }
    };
    const reject = (reason) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_REJECTED;
          this.reason = reason;
          // 一旦reject, 通知所有拒绝后的onRejected回调函数执行
          this.onRejectedFns.forEach((fn) => {
            fn(this.reason);
          });
        });
      }
    };
    // 令executor立即执行
    // try catch 包裹，一旦抛出异常，则触发reject，立刻置this的status为rejected
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    const defaultOnFulfilled = (value) => {
      return value;
    };
    const defaultOnRejected = (err) => {
      throw err;
    };
    onFulfilled = onFulfilled || defaultOnFulfilled;
    onRejected = onRejected || defaultOnRejected;
    return new KFPromise((resolve, reject) => {
      // 假如在调用then时(同步代码)，调用的promise的状态已经被敲定为解决
      if (this.status === PROMISE_STATUS_FULFILLED) {
        // 令onFulfilled立刻执行，并捕获异常(若有)并抛出
        execFunctionWithCatchException(
          onFulfilled,
          this.value,
          resolve,
          reject
        );
      }
      if (this.status === PROMISE_STATUS_REJECTED) {
        execFunctionWithCatchException(
          onRejected,
          this.reason,
          resolve,
          reject
        );
      }
      // 否则，将成功和失败对应的回调存入对象数组中
      if (this.status === PROMISE_STATUS_PENDING) {
        this.onFulfilledFns.push(() => {
          execFunctionWithCatchException(
            onFulfilled,
            this.value,
            resolve,
            reject
          );
        });
        this.onRejectedFns.push(() => {
          execFunctionWithCatchException(
            onRejected,
            this.reason,
            resolve,
            reject
          );
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  // 注意！在执行finally对象方法时，调用的promise的状态势必是已经敲定的
  finally(onFinally) {
    this.then(
      () => {
        onFinally();
      },
      () => {
        onFinally();
      }
    );
  }

  // ========== 以下为类方法 =========
  // 执行resolve类方法，直接(立刻resolve)返回一个fulfilled promise
  // 此处仅考虑传入的value是一个普通值的情况
  // 如果传入的是一个promise, 则其状态由传入的promise移交
  // 如果传入的是一个thenable的对象，则由对象的then方法的返回值确定
  static resolve(value) {
    return new KFPromise((resolve) => resolve(value));
  }

  // 对于reject类方法，则无需考虑reason的三种情形，直接是以原样进行reject的
  static reject(reason) {
    return new KFPromise((resolve, reject) => reject(reason));
  }

  // 对于all类方法，传入的promises全部被敲定为解决后，才resolve(results)，即所有成功结果
  // 一旦有一个被敲定为拒绝，则直接reject
  static all(promises) {
    return new KFPromise((resolve, reject) => {
      const values = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            values.push(res);
            // 只要有promise被敲定为fulfilled，就来判断一下是否均已fulfilled
            if (values.length === promises.length) {
              resolve(values);
            }
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  // 对于allSettled类方法(ES2020 ES11)，当所有promise的状态均被敲定后，返回aggregated results
  static allSettled(promises) {
    return new KFPromise((resolve, reject) => {
      const aggregatedResult = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            aggregatedResult.push({
              status: PROMISE_STATUS_FULFILLED,
              value: res,
            });
            if (aggregatedResult.length === promises.length) {
              resolve(aggregatedResult);
            }
          },
          (err) => {
            aggregatedResult.push({
              status: PROMISE_STATUS_REJECTED,
              value: err,
            });
            if (aggregatedResult.length === promises.length) {
              resolve(aggregatedResult);
            }
          }
        );
      });
    });
  }

  // 对于race类方法，一旦有一个promise状态被敲定，则直接resolve/reject
  static race(promises) {
    return new KFPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve, reject);
      });
    });
  }

  // 对于any类方法，resolve必须等待有一个fulfilled的结果，
  // 若所有的都转为rejected，则执行reject，传入AggregateError
  static any(promises) {
    return new KFPromise((resolve, reject) => {
      const errors = [];
      promises.forEach((promise) => {
        promise.then(resolve, (err) => {
          errors.push(err);
          // onRejected回调的特殊处理:
          // 每当有一个promise被拒绝, 都要判断是否是所有promise都被拒绝
          if (errors.length === promises.length) {
            reject(new AggregateError(errors));
          }
        });
      });
    });
  }
}

// test code
const p1 = new KFPromise((resolve, reject) => {
  setTimeout(() => reject("1111"), 1000);
});

const p2 = new KFPromise((resolve, reject) => {
  setTimeout(() => reject("2222"), 2000);
});

const p3 = new KFPromise((resolve, reject) => {
  setTimeout(() => reject("3333"), 3000);
});

// KFPromise.all([p1, p2, p3])
//   .then((values) => console.log(values))
//   .catch((err) => console.log(err)) // TypeError: execFn is not a function, 必须优化then方法
//   .finally(() => console.log("这是最终需要执行的代码~"));

// p1.then((res) => {
//   console.log(res);
//   return "success1";
// })
//   .then((res) => {
//     console.log(res);
//     throw new Error("error1");
//   })
//   .catch((err) => console.log(err));

// KFPromise.allSettled([p1, p2, p3]).then((aggregatedRes) => {
//   console.log("allSettled: ", aggregatedRes);
// });

KFPromise.any([p1, p2, p3])
  .then((res) => console.log("any: ", res))
  .catch((aggregatedErr) => console.log(aggregatedErr.errors));

KFPromise.race([p1, p2, p3]).then(
  (res) => console.log(res),
  (err) => console.log(err)
);
