import { longestCommonPrefix, findFirstWildcard, isWildcard } from "./_util.ts";

type Func = Function | undefined;
type Params = { key: string; value: string }[];

export class Node {
  children = new Map<string, Node>();
  path = "";
  func: Func;

  constructor(node?: Partial<Node>) {
    if (node) {
      Object.assign(this, node);
    }
  }

  add(path: string, func: Func): void {
    let n: Node = this;

    for (let i = 0; i < path.length; ++i) {
      if (isWildcard(path[i])) {
        n.#insert(path.slice(0, i), undefined);
        for (; i < path.length && path[i] !== "/"; ++i);
        n.#insert(path.slice(0, i), undefined);
      }
    }

    n.#insert(path, func);
  }

  find(path: string): { func: Func; params: Params } {
    let func: Func;
    const params: Params = [];

    return { func, params };
  }

  #insert = (path: string, func: Func): void => {
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
      }

      n.func = n.func ?? func;
      break;
    }
  };
}
