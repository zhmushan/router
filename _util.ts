export function longestCommonPrefix(a: string, b: string): number {
  let i = 0;
  let len = Math.min(a.length, b.length);
  for (; i < len && a[i] === b[i]; ++i);

  return i;
}

export function splitFromFirstWildcard(path: string): [string, string] {
  let i = 0;
  for (; i < path.length && !isWildcard(path[i]); ++i);
  return [path.slice(0, i), path.slice(i)];
}

export function findFirstWildcard(
  path: string,
): { wildcard: string; pos: number } {
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
      if (path[i] === "/") break;
    }
    wildcard = path.slice(pos, i);

    break;
  }

  return { wildcard, pos };
}

export function isWildcard(c: string): boolean {
  console.assert(c.length === 1);

  return c === ":" || c === "*";
}
