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
  function splitFromFirstSlash(path) {
    let i = 0;
    for (; i < path.length && path[i] !== "/"; ++i);
    return [path.slice(0, i), path.slice(i)];
  }
  exports_1("splitFromFirstSlash", splitFromFirstSlash);
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
  var _util_ts_1, Node, routes, root;
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
                c = new Node({ path, func });
                n.children.set(path[0], c);
              } else if (func) {
                if (n.func) {
                  throw new Error(
                    `a function is already registered for path "${path}"`,
                  );
                }
                n.func = func;
              }
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
              n.#insert(path.slice(0, i));
              const j = i;
              ++i;
              let invalid = false;
              for (; i < path.length && path[i] !== "/"; ++i) {
                if (_util_ts_1.isWildcard(path[i])) {
                  invalid = true;
                }
              }
              if (invalid) {
                throw new Error(
                  `only one wildcard per path segment is allowed, has: "${
                    path.slice(j, i)
                  }" in path "${path}"`,
                );
              }
              if (path[j] === ":" && i - j === 1) {
                throw new Error(
                  `param must be named with a non-empty name in path "${path}"`,
                );
              }
              n.#insert(path.slice(0, i));
            }
          }
          n.#insert(path, func);
        }
        find(path) {
          let func;
          let params;
          // node, path, vis
          const stack = [[this, path, false]];
          for (let i = 0; i >= 0;) {
            const [n, p, v] = stack[i];
            let np = p; // next path
            if (v) {
              --i;
              // assert not "*"
              if (n.path[0] === ":") {
                params?.delete(n.path.slice(1));
              }
              continue;
            } else {
              // vis = true
              stack[i][2] = true;
            }
            if (n.path[0] === "*") {
              if (n.path.length > 1) {
                if (!params) {
                  params = new Map();
                }
                params.set(n.path.slice(1), p);
              }
              func = n.func;
              break;
            } else if (n.path[0] === ":") {
              if (!params) {
                params = new Map();
              }
              const [s1, s2] = _util_ts_1.splitFromFirstSlash(p);
              params.set(n.path.slice(1), s1);
              np = s2;
            } else {
              if (n.path === p) {
                func = n.func;
                break;
              }
              const lcp = _util_ts_1.longestCommonPrefix(n.path, p);
              if (lcp !== n.path.length) {
                --i;
                continue;
              } else {
                np = p.slice(lcp);
              }
            }
            let c = n.children.get("*");
            if (c) {
              stack[++i] = [c, np, false];
            }
            c = n.children.get(":");
            if (c) {
              stack[++i] = [c, np, false];
            }
            c = n.children.get(np[0]);
            if (c) {
              stack[++i] = [c, np, false];
            }
          }
          return [func, params];
        }
        #insert;
      };
      exports_2("Node", Node);
      routes = [
        "/",
        "/cmd/:tool/:sub",
        "/cmd/:tool/",
        "/src/*filepath",
        "/search/",
        "/search/:query",
        "/user_:name",
        "/user_:name/about",
        "/files/:dir/*",
        "/doc/",
        "/doc/go_faq.html",
        "/doc/go1.html",
        "/info/:user/public",
        "/info/:user/project/:project",
      ];
      root = new Node();
      for (const r of routes) {
        root.add(r, () => r);
      }
      root.find("/search/");
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
