import { assert } from "./vendor/https/deno.land/std/testing/asserts.ts";

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
  assert(c.length === 1);

  return c === ":" || c === "*";
}

export function getWildcardPos(path: string): number {
  let i = 0;
  for (; i < path.length && !isWildcard(path[i]););

  return i === path.length ? -1 : i;
}
