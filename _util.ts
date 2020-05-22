export function longestCommonPrefix(a: string, b: string): number {
  let i = 0;
  let len = Math.min(a.length, b.length);
  for (; i < len && a[i] === b[i]; ++i);

  return i;
}

export function splitFromFirstSlash(path: string): [string, string] {
  let i = 0;
  for (; i < path.length && path[i] !== "/"; ++i);
  return [path.slice(0, i), path.slice(i)];
}

export function isWildcard(c: string): boolean {
  console.assert(c.length === 1);

  return c === ":" || c === "*";
}
