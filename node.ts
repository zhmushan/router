import {
  longestCommonPrefix,
  isWildcard,
  splitFromFirstSlash,
} from "./_util.ts";

export class Node {
  children = new Map<string, Node>();
  path = "";
  func: Function | undefined;

  constructor(node?: Partial<Node>) {
    if (node) {
      Object.assign(this, node);
    }
  }

  add(path: string, func: Function): void {
    let n: Node = this;

    for (let i = 0; i < path.length; ++i) {
      if (isWildcard(path[i])) {
        n.#insert(path.slice(0, i));
        const j = i;
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
              path.slice(
                j,
                i,
              )
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

  find(path: string): { func?: Function; params?: Record<string, string> } {
    let n: Node = this;
    let func: Function | undefined;
    let params: Record<string, string> | undefined;

    for (;;) {
      if (n.path === path) {
        func = n.func;

        break;
      }

      if (!isWildcard(n.path[0])) {
        const lcp = longestCommonPrefix(n.path, path);

        if (lcp !== n.path.length) {
          break;
        } else {
          path = path.slice(lcp);
        }
      } else {
        if (n.path.length === 1) {
          // Maybe "*"
          func = n.func;
          break;
        }

        const key = n.path.slice(1);
        if (!params) {
          params = {};
        }

        if (n.path[0] === "*") {
          params[key] = path;
          path = "";
        } else {
          const [value, nextPath] = splitFromFirstSlash(path);
          params[key] = value;
          path = nextPath;
        }
      }

      if (!path) {
        func = n.func;
        break;
      }

      let c = n.children.get(path[0]);
      if (c) {
        const findResult = c.find(path);
        if (findResult.func) {
          func = findResult.func;
          if (findResult.params) {
            if (!params) {
              params = findResult.params;
            } else if (findResult.params) {
              params = { ...params, ...findResult.params };
            }
          }

          break;
        }
      }

      c = n.children.get(":");
      if (c) {
        const findResult = c.find(path);
        if (findResult.func) {
          func = findResult.func;
          if (findResult.params) {
            if (!params) {
              params = findResult.params;
            } else if (findResult.params) {
              params = { ...params, ...findResult.params };
            }
          }

          break;
        }
      }

      c = n.children.get("*");
      if (c) {
        const findResult = c.find(path);
        if (findResult.func) {
          func = findResult.func;
          if (findResult.params) {
            if (!params) {
              params = findResult.params;
            } else if (findResult.params) {
              params = { ...params, ...findResult.params };
            }
          }

          break;
        }
      }

      break;
    }

    return { func, params };
  }

  #insert = (path: string, func?: Function): void => {
    let n: Node = this;

    if (n.path === "" && n.children.size === 0) {
      n.path = path;
      n.func = func;

      return;
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
}
