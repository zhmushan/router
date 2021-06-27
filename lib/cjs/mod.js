"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) ||
  function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
      throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
  };
var _merge, _insert;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
class Node {
  constructor(node) {
    this.children = new Map();
    this.path = "";
    _merge.set(this, (path, handler) => {
      let n = this;
      if (n.path === "" && n.children.size === 0) {
        n.path = path;
        n.handler = handler;
        return n;
      }
      if (path === "") {
        if (n.handler) {
          throw new Error(
            `a handler is already registered for path "${n.path}"`,
          );
        }
        n.handler = handler;
        return n;
      }
      for (;;) {
        const i = longestCommonPrefix(path, n.path);
        if (i < n.path.length) {
          const c = new Node({
            path: n.path.slice(i),
            children: n.children,
            handler: n.handler,
          });
          n.children = new Map([[c.path[0], c]]);
          n.path = path.slice(0, i);
          n.handler = undefined;
        }
        if (i < path.length) {
          path = path.slice(i);
          let c = n.children.get(path[0]);
          if (c) {
            n = c;
            continue;
          }
          c = new Node({ path, handler });
          n.children.set(path[0], c);
          n = c;
        } else if (handler) {
          if (n.handler) {
            throw new Error(
              `a handler is already registered for path "${path}"`,
            );
          }
          n.handler = handler;
        }
        break;
      }
      return n;
    });
    _insert.set(this, (path, handler) => {
      let n = this;
      let c = n.children.get(path[0]);
      if (c) {
        n = __classPrivateFieldGet(c, _merge).call(c, path, handler);
      } else {
        c = new Node({ path, handler });
        n.children.set(path[0], c);
        n = c;
      }
      return n;
    });
    if (node) {
      Object.assign(this, node);
    }
  }
  add(path, handler) {
    let n = this;
    let i = 0;
    for (; i < path.length && !isWildcard(path[i]); ++i);
    n = __classPrivateFieldGet(n, _merge).call(n, path.slice(0, i));
    let j = i;
    for (; i < path.length; ++i) {
      if (isWildcard(path[i])) {
        if (j !== i) {
          // insert static route
          n = __classPrivateFieldGet(n, _insert).call(n, path.slice(j, i));
          j = i;
        }
        ++i;
        for (; i < path.length && path[i] !== "/"; ++i) {
          if (isWildcard(path[i])) {
            throw new Error(
              `only one wildcard per path segment is allowed, has: "${
                path.slice(j, i)
              }" in path "${path}"`,
            );
          }
        }
        if (path[j] === ":" && i - j === 1) {
          throw new Error(
            `param must be named with a non-empty name in path "${path}"`,
          );
        }
        // insert wildcard route
        n = __classPrivateFieldGet(n, _insert).call(n, path.slice(j, i));
        j = i;
      }
    }
    if (j === path.length) {
      __classPrivateFieldGet(n, _merge).call(n, "", handler);
    } else {
      __classPrivateFieldGet(n, _insert).call(n, path.slice(j), handler);
    }
  }
  find(path) {
    let handler;
    let params = new Map();
    const stack = [
      [this, path, false],
    ];
    for (let i = 0; i >= 0;) {
      const [n, p, v] = stack[i];
      let np; // next path
      if (v) {
        --i;
        // assert not "*"
        if (n.path[0] === ":") {
          params.delete(n.path.slice(1));
        }
        continue;
      } else {
        // vis = true
        stack[i][2] = true;
      }
      if (n.path[0] === "*") {
        if (n.path.length > 1) {
          params.set(n.path.slice(1), p);
        }
        np = undefined;
      } else if (n.path[0] === ":") {
        const [_cp, _np] = splitFromFirstSlash(p);
        params.set(n.path.slice(1), _cp);
        np = _np === "" ? undefined : _np;
      } else if (n.path === p) {
        if (n.handler === undefined) {
          if (n.children.has("*")) {
            np = "";
          } else {
            --i;
            continue;
          }
        } else {
          np = undefined;
        }
      } else {
        const lcp = longestCommonPrefix(n.path, p);
        if (lcp !== n.path.length) {
          --i;
          continue;
        } else {
          np = p.slice(lcp);
        }
      }
      if (np === undefined) {
        handler = n.handler;
        break;
      }
      let c = n.children.get("*");
      if (c) {
        stack[++i] = [c, np, false];
      }
      if (np === "") {
        continue;
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
    return [handler, params];
  }
}
exports.Node = Node;
_merge = new WeakMap(), _insert = new WeakMap();
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
class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}
