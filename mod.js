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

// The following code is based off:
// https://github.com/julienschmidt/httprouter
//
// Copyright (c) 2013, Julien Schmidt
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
System.register("node", [], function (exports_1, context_1) {
  "use strict";
  var Node;
  var __moduleName = context_1 && context_1.id;
  function countParams(path) {
    let n = 0;
    for (let i = 0; i < path.length; ++i) {
      switch (path[i]) {
        case ":":
        case "*":
          n++;
      }
    }
    if (n >= 255) {
      return 255;
    }
    return n;
  }
  exports_1("countParams", countParams);
  return {
    setters: [],
    execute: function () {
      Node = class Node {
        constructor() {
          this.priority = 0;
          this.children = [];
          this.path = "";
          this.wildChild = false;
          this.nType = 0 /* Static */;
          this.indices = "";
          this.maxParams = 0;
        }
        addRoute(path, handle) {
          let node = this;
          const fullPath = path;
          ++node.priority;
          let numParams = countParams(path);
          // non-empty tree
          if (node.path.length > 0 || node.children.length > 0) {
            walk:
            while (true) {
              // Update maxParams of the current node
              if (numParams > node.maxParams) {
                node.maxParams = numParams;
              }
              // Find the longest common prefix.
              // This also implies that the common prefix contains no ':' or '*'
              // since the existing key can't contain those chars.
              let i = 0;
              const max = Math.min(path.length, node.path.length);
              for (; i < max && path[i] === node.path[i]; ++i);
              // Split edge
              if (i < node.path.length) {
                const child = new Node();
                child.path = node.path.slice(i);
                child.wildChild = node.wildChild;
                child.nType = 0 /* Static */;
                child.indices = node.indices;
                child.children = node.children;
                child.handle = node.handle;
                child.priority = node.priority - 1;
                // Update maxParams (max of all children)
                for (const cc of child.children) {
                  if (cc.maxParams > child.maxParams) {
                    child.maxParams = cc.maxParams;
                  }
                }
                node.children = [child];
                node.indices = node.path[i];
                node.path = path.slice(0, i);
                node.handle = undefined;
                node.wildChild = false;
              }
              // Make new node a child of this node
              if (i < path.length) {
                path = path.slice(i);
                if (node.wildChild) {
                  node = node.children[0];
                  ++node.priority;
                  // Update maxParams of the child node
                  if (numParams > node.maxParams) {
                    node.maxParams = numParams;
                  }
                  --numParams;
                  // Check if the wildcard matches
                  if (
                    path.length >= node.path.length &&
                    node.path === path.slice(0, node.path.length) &&
                    node.nType != 3 /* CatchAll */ &&
                    // Check for longer wildcard, e.g. :name and :names
                    (node.path.length >= path.length ||
                      path[node.path.length] === "/")
                  ) {
                    continue walk;
                  } else {
                    // Wildcard conflict
                    let pathSeg = path;
                    if (node.nType !== 3 /* CatchAll */) {
                      pathSeg = pathSeg.split("/", 1)[0];
                    }
                    const prefix =
                      fullPath.slice(0, fullPath.indexOf(pathSeg)) +
                      node.path;
                    throw new Error(
                      `'${pathSeg}' in new path '${fullPath}' conflicts with existing wildcard '${node.path}' in existing prefix '${prefix}'`,
                    );
                  }
                }
                const c = path[0];
                // slash after param
                if (
                  node.nType === 2 /* Param */ &&
                  c === "/" &&
                  node.children.length === 1
                ) {
                  node = node.children[0];
                  ++node.priority;
                  continue walk;
                }
                // Check if a child with the next path byte exists
                for (let i = 0; i < node.indices.length; ++i) {
                  if (c === node.indices[i]) {
                    i = node.incrementChildPrio(i);
                    node = node.children[i];
                    continue walk;
                  }
                }
                // Otherwise insert it
                if (c !== ":" && c !== "*") {
                  node.indices += c;
                  const child = new Node();
                  child.maxParams = numParams;
                  node.children.push(child);
                  node.incrementChildPrio(node.indices.length - 1);
                  node = child;
                }
                node.insertChild(numParams, path, fullPath, handle);
                return;
              }
              if (node.handle) {
                throw new Error(
                  `a handle is already registered for path '${fullPath}'`,
                );
              }
              node.handle = handle;
              return;
            }
          } else {
            // Empty tree
            node.insertChild(numParams, path, fullPath, handle);
            node.nType = 1 /* Root */;
          }
        }
        // increments priority of the given child and reorders if necessary
        incrementChildPrio(pos) {
          const cs = this.children;
          ++cs[pos].priority;
          const prio = cs[pos].priority;
          // adjust position (move to front)
          let newPos = pos;
          for (; newPos > 0 && cs[newPos - 1].priority < prio; --newPos) {
            // swap node positions
            [cs[newPos - 1], cs[newPos]] = [cs[newPos], cs[newPos - 1]];
          }
          // build new index char string
          if (newPos !== pos) {
            this.indices = this.indices.slice(0, newPos) + // unchanged prefix, might be empty
              this.indices.slice(pos, pos + 1) + // the index char we move
              this.indices.slice(newPos, pos) +
              this.indices.slice(pos + 1); // rest without char at 'pos'
          }
          return newPos;
        }
        insertChild(numParams, path, fullPath, handle) {
          let node = this;
          let offset = 0; // already handled bytes of the path
          // find prefix until first wildcard (beginning with ':'' or '*'')
          for (let i = 0, max = path.length; numParams > 0; ++i) {
            const c = path[i];
            if (c !== ":" && c !== "*") {
              continue;
            }
            // find wildcard end (either '/' or path end)
            let end = i + 1;
            while (end < max && path[end] !== "/") {
              switch (path[end]) {
                // the wildcard name must not contain ':' and '*'
                case ":":
                case "*":
                  throw new Error(
                    `only one wildcard per path segment is allowed, has: '${
                      path.slice(i)
                    }' in path '${fullPath}'`,
                  );
                default:
                  ++end;
              }
            }
            // check if this Node existing children which would be
            // unreachable if we insert the wildcard here
            if (node.children.length > 0) {
              throw new Error(
                `wildcard route '${
                  path.slice(i, end)
                }' conflicts with existing children in path '${fullPath}'`,
              );
            }
            // check if the wildcard has a name
            if (end - i < 2) {
              throw new Error(
                `wildcards must be named with a non-empty name in path '${fullPath}'`,
              );
            }
            if (c === ":") {
              // param
              // split path at the beginning of the wildcard
              if (i > 0) {
                node.path = path.slice(offset, i);
                offset = i;
              }
              const child = new Node();
              child.nType = 2 /* Param */;
              child.maxParams = numParams;
              node.children = [child];
              node.wildChild = true;
              node = child;
              ++node.priority;
              --numParams;
              // if the path doesn't end with the wildcard, then there
              // will be another non-wildcard subpath starting with '/'
              if (end < max) {
                node.path = path.slice(offset, end);
                offset = end;
                const child = new Node();
                child.maxParams = numParams;
                child.priority = 1;
                node.children = [child];
                node = child;
              }
            } else {
              // catchAll
              if (end !== max || numParams > 1) {
                throw new Error(
                  `catch-all routes are only allowed at the end of the path in path '${fullPath}'`,
                );
              }
              if (
                node.path.length > 0 &&
                node.path[node.path.length - 1] === "/"
              ) {
                throw new Error(
                  `catch-all conflicts with existing handle for the path segment root in path '${fullPath}'`,
                );
              }
              // currently fixed width 1 for '/'
              --i;
              if (path[i] !== "/") {
                throw new Error(`no / before catch-all in path '${fullPath}'`);
              }
              node.path = path.slice(offset, i);
              // first node: catchAll node with empty path
              let child = new Node();
              child.wildChild = true;
              child.nType = 3 /* CatchAll */;
              child.maxParams = 1;
              if (node.maxParams < 1) {
                node.maxParams = 1;
              }
              node.children = [child];
              node.indices = path[i];
              node = child;
              ++node.priority;
              // second node: node holding the variable
              child = new Node();
              child.path = path.slice(i);
              child.nType = 3 /* CatchAll */;
              child.maxParams = 1;
              child.handle = handle;
              child.priority = 1;
              node.children = [child];
              return;
            }
          }
          // insert remaining path part and handle to the leaf
          node.path = path.slice(offset);
          node.handle = handle;
        }
        getValue(path) {
          let node = this;
          let handle, p, tsr = false;
          // outer loop for walking the tree
          walk:
          while (true) {
            if (path.length > node.path.length) {
              if (path.slice(0, node.path.length) === node.path) {
                path = path.slice(node.path.length);
                // If this node does not have a wildcard (param or catchAll)
                // child,  we can just look up the next child node and continue
                // to walk down the tree
                if (!node.wildChild) {
                  const c = path[0];
                  for (let i = 0; i < node.indices.length; ++i) {
                    if (c === node.indices[i]) {
                      node = node.children[i];
                      continue walk;
                    }
                  }
                  // Nothing found.
                  // We can recommend to redirect to the same URL without a
                  // trailing slash if a leaf exists for that path.
                  if (node.handle && path === "/") {
                    tsr = true;
                  }
                  break walk;
                }
                // handle wildcard child
                node = node.children[0];
                switch (node.nType) {
                  case 2 /* Param */: {
                    // find param end (either '/' or path end)
                    let end = 0;
                    for (; end < path.length && path[end] !== "/"; ++end);
                    // save param value
                    if (!p) {
                      // lazy allocation
                      p = [];
                    }
                    const i = p.length;
                    p[i] = {
                      key: node.path.slice(1),
                      value: path.slice(0, end),
                    };
                    // we need to go deeper!
                    if (end < path.length) {
                      if (node.children.length > 0) {
                        path = path.slice(end);
                        node = node.children[0];
                        continue walk;
                      }
                      // ... but we can't
                      tsr = path.length === end + 1;
                      break walk;
                    }
                    handle = node.handle;
                    if (handle) {
                      break walk;
                    } else if (node.children.length === 1) {
                      // No handle found. Check if a handle for this path + a
                      // trailing slash exists for TSR recommendation
                      node = node.children[0];
                      if (node.handle && node.path === "/") {
                        tsr = true;
                      }
                    }
                    break walk;
                  }
                  case 3 /* CatchAll */: {
                    // save param value
                    if (!p) {
                      // lazy allocation
                      p = [];
                    }
                    const i = p.length;
                    p[i] = {
                      key: node.path.slice(2),
                      value: path,
                    };
                    handle = node.handle;
                    break walk;
                  }
                  default: {
                    throw new Error("invalid node type");
                  }
                }
              }
            } else if (path === node.path) {
              // We should have reached the node containing the handle.
              // Check if this node has a handle registered.
              handle = node.handle;
              if (handle) {
                break walk;
              }
              if (
                path === "/" && node.wildChild && node.nType !== 1 /* Root */
              ) {
                tsr = true;
                break walk;
              }
              // No handle found. Check if a handle for this path + a
              // trailing slash exists for trailing slash recommendation
              for (let i = 0; i < node.indices.length; ++i) {
                if (node.indices[i] === "/") {
                  node = node.children[i];
                  if (
                    (node.handle && node.path.length === 1) ||
                    (node.children[0].handle && node.nType === 3 /* CatchAll */)
                  ) {
                    tsr = true;
                  }
                  break walk;
                }
              }
              break walk;
            }
            // Nothing found. We can recommend to redirect to the same URL with an
            // extra trailing slash if a leaf exists for that path
            if (
              path === "/" ||
              (node.path.length === path.length + 1 &&
                node.path[path.length] === "/" &&
                node.handle &&
                path === node.path.slice(0, node.path.length - 1))
            ) {
              tsr = true;
            }
            break walk;
          }
          return [handle, p, tsr];
        }
      };
      exports_1("Node", Node);
    },
  };
});
System.register("mod", ["node"], function (exports_2, context_2) {
  "use strict";
  var __moduleName = context_2 && context_2.id;
  function exportStar_1(m) {
    var exports = {};
    for (var n in m) {
      if (n !== "default") exports[n] = m[n];
    }
    exports_2(exports);
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
export const countParams = __exp["countParams"];
export const Node = __exp["Node"];
