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
        for (; i < path.length && path[i] !== "/"; ++i);
        n.#insert(path.slice(0, i));
      }
    }

    n.#insert(path, func);
  }

  find(path: string): { func?: Function; params?: Map<string, string> } {
    let n: Node = this;
    let func: Function | undefined;
    let params: Map<string, string> | undefined;

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
      } else if (n.path[0] === ":") {
        const [p, np] = splitFromFirstSlash(path);
        if (!params) {
          params = new Map();
        }
        params.set(n.path.slice(1), p);
        path = np;
      } else if (n.path[0] === "*") {
        [, path] = splitFromFirstSlash(path);
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
              params = new Map();
            }
            for (const [k, v] of findResult.params) {
              params.set(k, v);
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
              params = new Map();
            }
            for (const [k, v] of findResult.params) {
              params.set(k, v);
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
              params = new Map();
            }
            for (const [k, v] of findResult.params) {
              params.set(k, v);
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
      } else {
        n.func = func;
      }

      break;
    }
  };
}
