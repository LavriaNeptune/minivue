let activeEffect = null;
// 用来中转事件的一个变量

// ↓ 经典的发布订阅模式类 ↓
class Dep {
  subscribes = new Set();
  depend() {
    if (activeEffect) {
      this.subscribes.add(activeEffect);
    }
  }
  notify() {
    this.subscribes.forEach((effect) => {
      effect();
    });
  }
}

function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

// ↓ 在响应式原理代码基础上，实现响应式代码 ↓

//#region Object.defineProperty 实现（Vue 旧版本实现方式）

// function reactive(raw) {
//   // raw 是一个状态对象...
//   Object.keys(raw).forEach((key) => {
//     const dep = new Dep();
//     // 这里使用到里闭包...
//     let value = raw[key];
//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend();
//         return value;
//       },
//       set(newValue) {
//         value = newValue;
//         dep.notify();
//       },
//     });
//   });
//   return raw;
// }

//#endregion

const targetMap = new WeakMap();

// 如果数据对象失去引用,弱映射所对应的 Map 对象(key -> dep)也会被自动回收

function getDep(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

const reactiveHandlers = {
  get(target, key, receiver) {
    const dep = getDep(target, key);
    dep.depend();
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const dep = getDep(target, key);
    const result = Reflect.set(target, key, value, receiver);
    dep.notify();
    return result;
  },
};

function reactive(raw) {
  return new Proxy(raw, reactiveHandlers);
}
// 设置代理是为了在使用数据对象的 get 和 set 方法时，能够自动地设置 dep 对象。PS:顺带处理了数组的情况

const state = reactive({ count: 0 });
watchEffect(() => {
  console.log(state.count);
});
let Timer = setInterval(() => {
  state.count++;
}, 1000);
// 如果运行正常的话,每隔一秒 count 的值都会增加 1。随之会执行 console.log(state.count)。控制台中会出现每隔 1s 输出的值会增长 1
