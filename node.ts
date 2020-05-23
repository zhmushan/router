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

  find(path: string): [Function | undefined, Map<string, string>] {
    let func: Function | undefined;
    let params = new Map<string, string>();
    // node, path, vis
    const stack: [Node, string, boolean][] = [[this, path, false]];

    for (let i = 0; i >= 0;) {
      const [n, p, v] = stack[i];
      let np = p; // next path

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
        func = n.func;

        break;
      } else if (n.path[0] === ":") {
        const [s1, s2] = splitFromFirstSlash(p);
        params.set(n.path.slice(1), s1);
        np = s2;
      } else {
        if (n.path === p) {
          func = n.func;
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
        func = n.func;

        break;
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
