// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register("_util", [], function (exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  function longestCommonPrefix(a, b) {
    let i = 0;
    let len = Math.min(a.length, b.length);
    for (; i < len && a[i] === b[i]; ++i);
    return i;
  }
  exports_1("longestCommonPrefix", longestCommonPrefix);
  function splitFromFirstWildcard(path) {
    let i = 0;
    for (; i < path.length && !isWildcard(path[i]); ++i);
    return [path.slice(0, i), path.slice(i)];
  }
  exports_1("splitFromFirstWildcard", splitFromFirstWildcard);
  function findFirstWildcard(path) {
    let wildcard = "";
    let pos = -1;
    let i = 0;
    for (; i < path.length; ++i) {
      if (!isWildcard(path[i])) {
        continue;
      }
      pos = i;
      ++i;
      for (; i < path.length; ++i) {
        if (path[i] === "/") {
          break;
        }
      }
      wildcard = path.slice(pos, i);
      break;
    }
    return { wildcard, pos };
  }
  exports_1("findFirstWildcard", findFirstWildcard);
  function isWildcard(c) {
    console.assert(c.length === 1);
    return c === ":" || c === "*";
  }
  exports_1("isWildcard", isWildcard);
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register("node", ["_util"], function (exports_2, context_2) {
  "use strict";
  var _util_ts_1, Node;
  var __moduleName = context_2 && context_2.id;
  return {
    setters: [
      function (_util_ts_1_1) {
        _util_ts_1 = _util_ts_1_1;
      },
    ],
    execute: function () {
      Node = class Node {
        constructor(node) {
          this.children = new Map();
          this.path = "";
          this.#insert = (path, func) => {
            let n = this;
            if (n.path === "" && n.children.size === 0) {
              n.path = path;
              n.func = func;
              return;
            }
            for (;;) {
              const i = _util_ts_1.longestCommonPrefix(path, n.path);
              if (i < n.path.length) {
                const c = new Node({
                  path: n.path.slice(i),
                  children: n.children,
                  func: n.func,
                  parent: n,
                });
                n.children = new Map([[c.path[0], c]]);
                n.path = path.slice(0, i);
                n.func = undefined;
              }
              if (i < path.length) {
                path = path.slice(i);
                let c = n.children.get(path[0]);
                if (c) {
                  n = c;
                  continue;
                }
                c = new Node({ path, func, parent: n });
                n.children.set(path[0], c);
              }
              n.func = n.func ?? func;
              break;
            }
          };
          if (node) {
            Object.assign(this, node);
          }
        }
        add(path, func) {
          let n = this;
          for (let i = 0; i < path.length; ++i) {
            if (_util_ts_1.isWildcard(path[i])) {
              n.#insert(path.slice(0, i), undefined);
              for (; i < path.length && path[i] !== "/"; ++i);
              n.#insert(path.slice(0, i), undefined);
            }
          }
          n.#insert(path, func);
        }
        find(path) {
          let func;
          const params = [];
          return { func, params };
        }
        #insert;
      };
      exports_2("Node", Node);
    },
  };
});
System.register("mod", ["node"], function (exports_3, context_3) {
  "use strict";
  var __moduleName = context_3 && context_3.id;
  function exportStar_1(m) {
    var exports = {};
    for (var n in m) {
      if (n !== "default") exports[n] = m[n];
    }
    exports_3(exports);
  }
  return {
    setters: [
      function (node_ts_1_1) {
        exportStar_1(node_ts_1_1);
      },
    ],
    execute: function () {
    },
  };
});

const __exp = __instantiate("mod");
export const Node = __exp["Node"];
