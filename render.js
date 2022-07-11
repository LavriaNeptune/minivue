// 模拟实现 Vue3 中用于生成虚拟 DOM 对象的 h 函数

// h 函数的功能 -> 根据给定参数返回一个虚拟 DOM 对象(本质上是是一个 JavaScript 对象...)
// 需要的参数:元素标签 -> tag;元素属性 -> props;元素的子节点 -> children
function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

// 模拟实现 Vue3 中用于将虚拟 DOM 转换为真实 DOM ,并将 DOM 渲染在一个容器元素中的 mount 函数

function mount(vnode, container) {
  // 依据虚拟 DOM 的 tag 属性生成一个对应的真实 DOM 元素...
  const el = (vnode.el = document.createElement(vnode.tag)); // 将真实 DOM 对象的引用保存一份在虚拟 DOM node 的对象上...便于日后 patch 时的对比工作
  if (vnode.props) {
    // 为了简化模型,假设传入参数均为 attribute，忽略事件监听器、props 的可能..
    for (const key in vnode.props) {
      const value = vnode.props[key];
      el.setAttribute(key, value);
    }
  }
  if (vnode.children) {
    // 此处仅考虑子节点为文本节点或元素节点的其中一种，忽略两者可能并存的情况...
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children;
    } else {
      // 规定：对于嵌套的元素节点，建议以数组的结构形式传入，便于此处使用 forEach 方法进行遍历...
      vnode.children.forEach((child) => {
        mount(child, el); // 这里用到了迭代...
      });
    }
  }
  // 将处理完后的 el 作为容器元素的子节点插入...
  container.appendChild(el);
}

// 模拟实现 Vue3 中用于对比两个虚拟 DOM 节点的 patch 函数

function patch(oldNode, newNode) {
  // 首先判断元素标签是否存在改变...
  if (oldNode.tag === newNode.tag) {
    // tag 未发生改变时，对 props 的处理 ->
    const el = (newNode.el = oldNode.el); // oldNode.el 还要给 newNode.el 一份，因为以后的 newNode.el 就是下一次 patch 的 oldNode 了...
    // 如果虚拟 DOM 存在属性配置，则取出，否则使用备选的空对象 {}
    const oldProps = oldNode.props || {};
    const newProps = newNode.props || {};

    // 处理新增属性、或是已有属性值变更的情况
    for (const key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        // 处理这样的情况:新旧两个属性都存在，但是值不同，则更新属性值...
        el.setAttribute(key, newValue);
      }
    }
    // 处理属性删除情况
    for (const key in oldProps) {
      if (!(key in newProps)) {
        // 处理这样的情况:删除旧节点中不存在的属性...
        el.removeAttribute(key);
      }
    }

    // children 处理
    const oldChildren = oldNode.children;
    const newChildren = newNode.children;
    // 四种子元素情况：文本节点、元素节点(数组) 通过 if 嵌套表示处理方式...
    if (typeof newChildren === 'string') {
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.textContent = newChildren;
      }
    } else {
      if (typeof oldChildren === 'string') {
        el.innerHTML = '';
        newChildren.forEach((child) => {
          mount(child, el);
        });
      } else {
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((child) => {
            mount(child, el);
          });
        } else if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((child) => {
            el.removeChild(child.el);
          });
        }
      }
    }
  } else {
    // 标签都变了就整个替换
  }
}

const myDom = h('div', { class: 'red' }, [h('span', null, 'hello')]);
mount(myDom, document.getElementById('app'));

const myDomChange = h('div', { class: 'green' }, [h('span', null, 'Changed!')]);
setTimeout(() => {
  patch(myDom, myDomChange);
}, 1000);
// 理论上打开网页后,红字的 hello 在 1s 后会改变为绿字的 Changed!
