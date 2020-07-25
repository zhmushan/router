// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
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
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("mod", [], function (exports_1, context_1) {
  "use strict";
  var Node, AssertionError;
  var __moduleName = context_1 && context_1.id;
  function longestCommonPrefix(a, b) {
    let i = 0;
    let len = Math.min(a.length, b.length);
    for (; i < len && a[i] === b[i]; ++i);
    return i;
  }
  function splitFromFirstSlash(path) {
    let i = 0;
    for (; i < path.length && path[i] !== "/"; ++i);
    return [path.slice(0, i), path.slice(i)];
  }
  function isWildcard(c) {
    assert(c.length === 1);
    return c === ":" || c === "*";
  }
  function assert(expr, msg = "") {
    if (!expr) {
      throw new AssertionError(msg);
    }
  }
  return {
    setters: [],
    execute: function () {
      Node = class Node {
        constructor(node) {
          this.children = new Map();
          this.path = "";
          this.#merge = (path, func) => {
            let n = this;
            if (n.path === "" && n.children.size === 0) {
              n.path = path;
              n.func = func;
              return n;
            }
            if (path === "") {
              if (n.func) {
                throw new Error(
                  `a function is already registered for path "${n.path}"`,
                );
              }
              n.func = func;
              return n;
            }
            for (;;) {
              const i = longestCommonPrefix(path, n.path);
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
                n = c;
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
            return n;
          };
          this.#insert = (path, func) => {
            let n = this;
            let c = n.children.get(path[0]);
            if (c) {
              n = c.#merge(path, func);
            } else {
              c = new Node({ path, func });
              n.children.set(path[0], c);
              n = c;
            }
            return n;
          };
          if (node) {
            Object.assign(this, node);
          }
        }
        add(path, func) {
          let n = this;
          let i = 0;
          for (; i < path.length && !isWildcard(path[i]); ++i);
          n = n.#merge(path.slice(0, i));
          let j = i;
          for (; i < path.length; ++i) {
            if (isWildcard(path[i])) {
              if (j !== i) {
                n = n.#insert(path.slice(j, i));
                j = i;
              }
              ++i;
              let invalid = false;
              for (; i < path.length && path[i] !== "/"; ++i) {
                if (isWildcard(path[i])) {
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
              n = n.#insert(path.slice(j, i));
              j = i;
            }
          }
          if (j === path.length) {
            n.#merge("", func);
          } else {
            n.#insert(path.slice(j), func);
          }
        }
        find(path) {
          let func;
          let params = new Map();
          const stack = [[this, path, false]];
          for (let i = 0; i >= 0;) {
            const [n, p, v] = stack[i];
            let np;
            if (v) {
              --i;
              if (n.path[0] === ":") {
                params.delete(n.path.slice(1));
              }
              continue;
            } else {
              stack[i][2] = true;
            }
            if (n.path[0] === "*") {
              if (n.path.length > 1) {
                params.set(n.path.slice(1), p);
              }
              np = "";
            } else if (n.path[0] === ":") {
              const [s1, s2] = splitFromFirstSlash(p);
              params.set(n.path.slice(1), s1);
              np = s2;
            } else {
              if (n.path === p) {
                np = "";
              }
              const lcp = longestCommonPrefix(n.path, p);
              if (lcp !== n.path.length) {
                --i;
                continue;
              } else {
                np = p.slice(lcp);
              }
            }
            if (!np) {
              if (n.func) {
                func = n.func;
                break;
              }
              --i;
              continue;
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
        #merge;
        #insert;
      };
      exports_1("Node", Node);
      AssertionError = class AssertionError extends Error {
        constructor(message) {
          super(message);
          this.name = "AssertionError";
        }
      };
    },
  };
});

const __exp = __instantiate("mod", false);
export const Node = __exp["Node"];
