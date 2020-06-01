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

// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
 * on npm.
 *
 * ```
 * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
 * console.log(bgBlue(red(bold("Hello world!"))));
 * ```
 *
 * This module supports `NO_COLOR` environmental variable disabling any coloring
 * if `NO_COLOR` is set.
 *
 * This module is browser compatible. */
System.register(
  "https://deno.land/std@0.54.0/fmt/colors",
  [],
  function (exports_1, context_1) {
    "use strict";
    var noColor, enabled, ANSI_PATTERN;
    var __moduleName = context_1 && context_1.id;
    function setColorEnabled(value) {
      if (noColor) {
        return;
      }
      enabled = value;
    }
    exports_1("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
      return enabled;
    }
    exports_1("getColorEnabled", getColorEnabled);
    function code(open, close) {
      return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
      };
    }
    function run(str, code) {
      return enabled
        ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
        : str;
    }
    function reset(str) {
      return run(str, code([0], 0));
    }
    exports_1("reset", reset);
    function bold(str) {
      return run(str, code([1], 22));
    }
    exports_1("bold", bold);
    function dim(str) {
      return run(str, code([2], 22));
    }
    exports_1("dim", dim);
    function italic(str) {
      return run(str, code([3], 23));
    }
    exports_1("italic", italic);
    function underline(str) {
      return run(str, code([4], 24));
    }
    exports_1("underline", underline);
    function inverse(str) {
      return run(str, code([7], 27));
    }
    exports_1("inverse", inverse);
    function hidden(str) {
      return run(str, code([8], 28));
    }
    exports_1("hidden", hidden);
    function strikethrough(str) {
      return run(str, code([9], 29));
    }
    exports_1("strikethrough", strikethrough);
    function black(str) {
      return run(str, code([30], 39));
    }
    exports_1("black", black);
    function red(str) {
      return run(str, code([31], 39));
    }
    exports_1("red", red);
    function green(str) {
      return run(str, code([32], 39));
    }
    exports_1("green", green);
    function yellow(str) {
      return run(str, code([33], 39));
    }
    exports_1("yellow", yellow);
    function blue(str) {
      return run(str, code([34], 39));
    }
    exports_1("blue", blue);
    function magenta(str) {
      return run(str, code([35], 39));
    }
    exports_1("magenta", magenta);
    function cyan(str) {
      return run(str, code([36], 39));
    }
    exports_1("cyan", cyan);
    function white(str) {
      return run(str, code([37], 39));
    }
    exports_1("white", white);
    function gray(str) {
      return run(str, code([90], 39));
    }
    exports_1("gray", gray);
    function bgBlack(str) {
      return run(str, code([40], 49));
    }
    exports_1("bgBlack", bgBlack);
    function bgRed(str) {
      return run(str, code([41], 49));
    }
    exports_1("bgRed", bgRed);
    function bgGreen(str) {
      return run(str, code([42], 49));
    }
    exports_1("bgGreen", bgGreen);
    function bgYellow(str) {
      return run(str, code([43], 49));
    }
    exports_1("bgYellow", bgYellow);
    function bgBlue(str) {
      return run(str, code([44], 49));
    }
    exports_1("bgBlue", bgBlue);
    function bgMagenta(str) {
      return run(str, code([45], 49));
    }
    exports_1("bgMagenta", bgMagenta);
    function bgCyan(str) {
      return run(str, code([46], 49));
    }
    exports_1("bgCyan", bgCyan);
    function bgWhite(str) {
      return run(str, code([47], 49));
    }
    exports_1("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
      return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
      return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_1("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
      return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_1("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb.
     * `color` can be a number in range `0x000000` to `0xffffff` or
     * an `Rgb`.
     *
     * To produce the color magenta:
     *
     *      rgba24("foo", 0xff00ff);
     *      rgba24("foo", {r: 255, g: 0, b: 255});
     */
    function rgb24(str, color) {
      if (typeof color === "number") {
        return run(
          str,
          code(
            [38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff],
            39,
          ),
        );
      }
      return run(
        str,
        code([
          38,
          2,
          clampAndTruncate(color.r),
          clampAndTruncate(color.g),
          clampAndTruncate(color.b),
        ], 39),
      );
    }
    exports_1("rgb24", rgb24);
    /** Set background color using 24bit rgb.
     * `color` can be a number in range `0x000000` to `0xffffff` or
     * an `Rgb`.
     *
     * To produce the color magenta:
     *
     *      bgRgba24("foo", 0xff00ff);
     *      bgRgba24("foo", {r: 255, g: 0, b: 255});
     */
    function bgRgb24(str, color) {
      if (typeof color === "number") {
        return run(
          str,
          code(
            [48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff],
            49,
          ),
        );
      }
      return run(
        str,
        code([
          48,
          2,
          clampAndTruncate(color.r),
          clampAndTruncate(color.g),
          clampAndTruncate(color.b),
        ], 49),
      );
    }
    exports_1("bgRgb24", bgRgb24);
    function stripColor(string) {
      return string.replace(ANSI_PATTERN, "");
    }
    exports_1("stripColor", stripColor);
    return {
      setters: [],
      execute: function () {
        noColor = globalThis.Deno?.noColor ?? true;
        enabled = !noColor;
        // https://github.com/chalk/ansi-regex/blob/2b56fb0c7a07108e5b54241e8faec160d393aedb/index.js
        ANSI_PATTERN = new RegExp(
          [
            "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
            "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
          ].join("|"),
          "g",
        );
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** This module is browser compatible. */
System.register(
  "https://deno.land/std@0.54.0/testing/diff",
  [],
  function (exports_2, context_2) {
    "use strict";
    var DiffType, REMOVED, COMMON, ADDED;
    var __moduleName = context_2 && context_2.id;
    function createCommon(A, B, reverse) {
      const common = [];
      if (A.length === 0 || B.length === 0) {
        return [];
      }
      for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
        if (
          A[reverse ? A.length - i - 1 : i] ===
            B[reverse ? B.length - i - 1 : i]
        ) {
          common.push(A[reverse ? A.length - i - 1 : i]);
        } else {
          return common;
        }
      }
      return common;
    }
    function diff(A, B) {
      const prefixCommon = createCommon(A, B);
      const suffixCommon = createCommon(
        A.slice(prefixCommon.length),
        B.slice(prefixCommon.length),
        true,
      ).reverse();
      A = suffixCommon.length
        ? A.slice(prefixCommon.length, -suffixCommon.length)
        : A.slice(prefixCommon.length);
      B = suffixCommon.length
        ? B.slice(prefixCommon.length, -suffixCommon.length)
        : B.slice(prefixCommon.length);
      const swapped = B.length > A.length;
      [A, B] = swapped ? [B, A] : [A, B];
      const M = A.length;
      const N = B.length;
      if (!M && !N && !suffixCommon.length && !prefixCommon.length) {
        return [];
      }
      if (!N) {
        return [
          ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
          ...A.map((a) => ({
            type: swapped ? DiffType.added : DiffType.removed,
            value: a,
          })),
          ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ];
      }
      const offset = N;
      const delta = M - N;
      const size = M + N + 1;
      const fp = new Array(size).fill({ y: -1 });
      /**
         * INFO:
         * This buffer is used to save memory and improve performance.
         * The first half is used to save route and last half is used to save diff
         * type.
         * This is because, when I kept new uint8array area to save type,performance
         * worsened.
         */
      const routes = new Uint32Array((M * N + size + 1) * 2);
      const diffTypesPtrOffset = routes.length / 2;
      let ptr = 0;
      let p = -1;
      function backTrace(A, B, current, swapped) {
        const M = A.length;
        const N = B.length;
        const result = [];
        let a = M - 1;
        let b = N - 1;
        let j = routes[current.id];
        let type = routes[current.id + diffTypesPtrOffset];
        while (true) {
          if (!j && !type) {
            break;
          }
          const prev = j;
          if (type === REMOVED) {
            result.unshift({
              type: swapped ? DiffType.removed : DiffType.added,
              value: B[b],
            });
            b -= 1;
          } else if (type === ADDED) {
            result.unshift({
              type: swapped ? DiffType.added : DiffType.removed,
              value: A[a],
            });
            a -= 1;
          } else {
            result.unshift({ type: DiffType.common, value: A[a] });
            a -= 1;
            b -= 1;
          }
          j = routes[prev];
          type = routes[prev + diffTypesPtrOffset];
        }
        return result;
      }
      function createFP(slide, down, k, M) {
        if (slide && slide.y === -1 && down && down.y === -1) {
          return { y: 0, id: 0 };
        }
        if (
          (down && down.y === -1) ||
          k === M ||
          (slide && slide.y) > (down && down.y) + 1
        ) {
          const prev = slide.id;
          ptr++;
          routes[ptr] = prev;
          routes[ptr + diffTypesPtrOffset] = ADDED;
          return { y: slide.y, id: ptr };
        } else {
          const prev = down.id;
          ptr++;
          routes[ptr] = prev;
          routes[ptr + diffTypesPtrOffset] = REMOVED;
          return { y: down.y + 1, id: ptr };
        }
      }
      function snake(k, slide, down, _offset, A, B) {
        const M = A.length;
        const N = B.length;
        if (k < -N || M < k) {
          return { y: -1, id: -1 };
        }
        const fp = createFP(slide, down, k, M);
        while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
          const prev = fp.id;
          ptr++;
          fp.id = ptr;
          fp.y += 1;
          routes[ptr] = prev;
          routes[ptr + diffTypesPtrOffset] = COMMON;
        }
        return fp;
      }
      while (fp[delta + offset].y < N) {
        p = p + 1;
        for (let k = -p; k < delta; ++k) {
          fp[k + offset] = snake(
            k,
            fp[k - 1 + offset],
            fp[k + 1 + offset],
            offset,
            A,
            B,
          );
        }
        for (let k = delta + p; k > delta; --k) {
          fp[k + offset] = snake(
            k,
            fp[k - 1 + offset],
            fp[k + 1 + offset],
            offset,
            A,
            B,
          );
        }
        fp[delta + offset] = snake(
          delta,
          fp[delta - 1 + offset],
          fp[delta + 1 + offset],
          offset,
          A,
          B,
        );
      }
      return [
        ...prefixCommon.map((c) => ({ type: DiffType.common, value: c })),
        ...backTrace(A, B, fp[delta + offset], swapped),
        ...suffixCommon.map((c) => ({ type: DiffType.common, value: c })),
      ];
    }
    exports_2("default", diff);
    return {
      setters: [],
      execute: function () {
        (function (DiffType) {
          DiffType["removed"] = "removed";
          DiffType["common"] = "common";
          DiffType["added"] = "added";
        })(DiffType || (DiffType = {}));
        exports_2("DiffType", DiffType);
        REMOVED = 1;
        COMMON = 2;
        ADDED = 3;
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** This module is browser compatible. Do not rely on good formatting of values
 * for AssertionError messages in browsers. */
System.register(
  "https://deno.land/std@0.54.0/testing/asserts",
  [
    "https://deno.land/std@0.54.0/fmt/colors",
    "https://deno.land/std@0.54.0/testing/diff",
  ],
  function (exports_3, context_3) {
    "use strict";
    var colors_ts_1, diff_ts_1, CAN_NOT_DISPLAY, AssertionError;
    var __moduleName = context_3 && context_3.id;
    function format(v) {
      let string = globalThis.Deno ? Deno.inspect(v) : String(v);
      if (typeof v == "string") {
        string = `"${string.replace(/(?=["\\])/g, "\\")}"`;
      }
      return string;
    }
    function createColor(diffType) {
      switch (diffType) {
        case diff_ts_1.DiffType.added:
          return (s) => colors_ts_1.green(colors_ts_1.bold(s));
        case diff_ts_1.DiffType.removed:
          return (s) => colors_ts_1.red(colors_ts_1.bold(s));
        default:
          return colors_ts_1.white;
      }
    }
    function createSign(diffType) {
      switch (diffType) {
        case diff_ts_1.DiffType.added:
          return "+   ";
        case diff_ts_1.DiffType.removed:
          return "-   ";
        default:
          return "    ";
      }
    }
    function buildMessage(diffResult) {
      const messages = [];
      messages.push("");
      messages.push("");
      messages.push(
        `    ${colors_ts_1.gray(colors_ts_1.bold("[Diff]"))} ${
          colors_ts_1.red(colors_ts_1.bold("Actual"))
        } / ${colors_ts_1.green(colors_ts_1.bold("Expected"))}`,
      );
      messages.push("");
      messages.push("");
      diffResult.forEach((result) => {
        const c = createColor(result.type);
        messages.push(c(`${createSign(result.type)}${result.value}`));
      });
      messages.push("");
      return messages;
    }
    function isKeyedCollection(x) {
      return [Symbol.iterator, "size"].every((k) => k in x);
    }
    function equal(c, d) {
      const seen = new Map();
      return (function compare(a, b) {
        // Have to render RegExp & Date for string comparison
        // unless it's mistreated as object
        if (
          a &&
          b &&
          ((a instanceof RegExp && b instanceof RegExp) ||
            (a instanceof Date && b instanceof Date))
        ) {
          return String(a) === String(b);
        }
        if (Object.is(a, b)) {
          return true;
        }
        if (a && typeof a === "object" && b && typeof b === "object") {
          if (seen.get(a) === b) {
            return true;
          }
          if (Object.keys(a || {}).length !== Object.keys(b || {}).length) {
            return false;
          }
          if (isKeyedCollection(a) && isKeyedCollection(b)) {
            if (a.size !== b.size) {
              return false;
            }
            let unmatchedEntries = a.size;
            for (const [aKey, aValue] of a.entries()) {
              for (const [bKey, bValue] of b.entries()) {
                /* Given that Map keys can be references, we need
                             * to ensure that they are also deeply equal */
                if (
                  (aKey === aValue && bKey === bValue && compare(aKey, bKey)) ||
                  (compare(aKey, bKey) && compare(aValue, bValue))
                ) {
                  unmatchedEntries--;
                }
              }
            }
            return unmatchedEntries === 0;
          }
          const merged = { ...a, ...b };
          for (const key in merged) {
            if (!compare(a && a[key], b && b[key])) {
              return false;
            }
          }
          seen.set(a, b);
          return true;
        }
        return false;
      })(c, d);
    }
    exports_3("equal", equal);
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
      if (!expr) {
        throw new AssertionError(msg);
      }
    }
    exports_3("assert", assert);
    /**
     * Make an assertion that `actual` and `expected` are equal, deeply. If not
     * deeply equal, then throw.
     */
    function assertEquals(actual, expected, msg) {
      if (equal(actual, expected)) {
        return;
      }
      let message = "";
      const actualString = format(actual);
      const expectedString = format(expected);
      try {
        const diffResult = diff_ts_1.default(
          actualString.split("\n"),
          expectedString.split("\n"),
        );
        const diffMsg = buildMessage(diffResult).join("\n");
        message = `Values are not equal:\n${diffMsg}`;
      } catch (e) {
        message = `\n${colors_ts_1.red(CAN_NOT_DISPLAY)} + \n\n`;
      }
      if (msg) {
        message = msg;
      }
      throw new AssertionError(message);
    }
    exports_3("assertEquals", assertEquals);
    /**
     * Make an assertion that `actual` and `expected` are not equal, deeply.
     * If not then throw.
     */
    function assertNotEquals(actual, expected, msg) {
      if (!equal(actual, expected)) {
        return;
      }
      let actualString;
      let expectedString;
      try {
        actualString = String(actual);
      } catch (e) {
        actualString = "[Cannot display]";
      }
      try {
        expectedString = String(expected);
      } catch (e) {
        expectedString = "[Cannot display]";
      }
      if (!msg) {
        msg = `actual: ${actualString} expected: ${expectedString}`;
      }
      throw new AssertionError(msg);
    }
    exports_3("assertNotEquals", assertNotEquals);
    /**
     * Make an assertion that `actual` and `expected` are strictly equal.  If
     * not then throw.
     */
    function assertStrictEq(actual, expected, msg) {
      if (actual === expected) {
        return;
      }
      let message;
      if (msg) {
        message = msg;
      } else {
        const actualString = format(actual);
        const expectedString = format(expected);
        if (actualString === expectedString) {
          const withOffset = actualString
            .split("\n")
            .map((l) => `     ${l}`)
            .join("\n");
          message =
            `Values have the same structure but are not reference-equal:\n\n${
              colors_ts_1.red(withOffset)
            }\n`;
        } else {
          try {
            const diffResult = diff_ts_1.default(
              actualString.split("\n"),
              expectedString.split("\n"),
            );
            const diffMsg = buildMessage(diffResult).join("\n");
            message = `Values are not strictly equal:\n${diffMsg}`;
          } catch (e) {
            message = `\n${colors_ts_1.red(CAN_NOT_DISPLAY)} + \n\n`;
          }
        }
      }
      throw new AssertionError(message);
    }
    exports_3("assertStrictEq", assertStrictEq);
    /**
     * Make an assertion that actual contains expected. If not
     * then thrown.
     */
    function assertStrContains(actual, expected, msg) {
      if (!actual.includes(expected)) {
        if (!msg) {
          msg = `actual: "${actual}" expected to contain: "${expected}"`;
        }
        throw new AssertionError(msg);
      }
    }
    exports_3("assertStrContains", assertStrContains);
    /**
     * Make an assertion that `actual` contains the `expected` values
     * If not then thrown.
     */
    function assertArrayContains(actual, expected, msg) {
      const missing = [];
      for (let i = 0; i < expected.length; i++) {
        let found = false;
        for (let j = 0; j < actual.length; j++) {
          if (equal(expected[i], actual[j])) {
            found = true;
            break;
          }
        }
        if (!found) {
          missing.push(expected[i]);
        }
      }
      if (missing.length === 0) {
        return;
      }
      if (!msg) {
        msg = `actual: "${actual}" expected to contain: "${expected}"`;
        msg += "\n";
        msg += `missing: ${missing}`;
      }
      throw new AssertionError(msg);
    }
    exports_3("assertArrayContains", assertArrayContains);
    /**
     * Make an assertion that `actual` match RegExp `expected`. If not
     * then thrown
     */
    function assertMatch(actual, expected, msg) {
      if (!expected.test(actual)) {
        if (!msg) {
          msg = `actual: "${actual}" expected to match: "${expected}"`;
        }
        throw new AssertionError(msg);
      }
    }
    exports_3("assertMatch", assertMatch);
    /**
     * Forcefully throws a failed assertion
     */
    function fail(msg) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      assert(false, `Failed assertion${msg ? `: ${msg}` : "."}`);
    }
    exports_3("fail", fail);
    /** Executes a function, expecting it to throw.  If it does not, then it
     * throws.  An error class and a string that should be included in the
     * error message can also be asserted.
     */
    function assertThrows(fn, ErrorClass, msgIncludes = "", msg) {
      let doesThrow = false;
      let error = null;
      try {
        fn();
      } catch (e) {
        if (
          ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)
        ) {
          msg =
            `Expected error to be instance of "${ErrorClass.name}", but was "${e.constructor.name}"${
              msg ? `: ${msg}` : "."
            }`;
          throw new AssertionError(msg);
        }
        if (msgIncludes && !e.message.includes(msgIncludes)) {
          msg =
            `Expected error message to include "${msgIncludes}", but got "${e.message}"${
              msg ? `: ${msg}` : "."
            }`;
          throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
      }
      if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
      }
      return error;
    }
    exports_3("assertThrows", assertThrows);
    async function assertThrowsAsync(fn, ErrorClass, msgIncludes = "", msg) {
      let doesThrow = false;
      let error = null;
      try {
        await fn();
      } catch (e) {
        if (
          ErrorClass && !(Object.getPrototypeOf(e) === ErrorClass.prototype)
        ) {
          msg =
            `Expected error to be instance of "${ErrorClass.name}", but got "${e.name}"${
              msg ? `: ${msg}` : "."
            }`;
          throw new AssertionError(msg);
        }
        if (msgIncludes && !e.message.includes(msgIncludes)) {
          msg =
            `Expected error message to include "${msgIncludes}", but got "${e.message}"${
              msg ? `: ${msg}` : "."
            }`;
          throw new AssertionError(msg);
        }
        doesThrow = true;
        error = e;
      }
      if (!doesThrow) {
        msg = `Expected function to throw${msg ? `: ${msg}` : "."}`;
        throw new AssertionError(msg);
      }
      return error;
    }
    exports_3("assertThrowsAsync", assertThrowsAsync);
    /** Use this to stub out methods that will throw when invoked. */
    function unimplemented(msg) {
      throw new AssertionError(msg || "unimplemented");
    }
    exports_3("unimplemented", unimplemented);
    /** Use this to assert unreachable code. */
    function unreachable() {
      throw new AssertionError("unreachable");
    }
    exports_3("unreachable", unreachable);
    return {
      setters: [
        function (colors_ts_1_1) {
          colors_ts_1 = colors_ts_1_1;
        },
        function (diff_ts_1_1) {
          diff_ts_1 = diff_ts_1_1;
        },
      ],
      execute: function () {
        CAN_NOT_DISPLAY = "[Cannot display]";
        AssertionError = class AssertionError extends Error {
          constructor(message) {
            super(message);
            this.name = "AssertionError";
          }
        };
        exports_3("AssertionError", AssertionError);
      },
    };
  },
);
System.register(
  "file:///C:/Users/zhbnh/Desktop/abc_workspace/router/vendor/https/deno.land/std/testing/asserts",
  ["https://deno.land/std@0.54.0/testing/asserts"],
  function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function exportStar_1(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default") exports[n] = m[n];
      }
      exports_4(exports);
    }
    return {
      setters: [
        function (asserts_ts_1_1) {
          exportStar_1(asserts_ts_1_1);
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///C:/Users/zhbnh/Desktop/abc_workspace/router/_util",
  ["file:///C:/Users/zhbnh/Desktop/abc_workspace/router/vendor/https/deno.land/std/testing/asserts"],
  function (exports_5, context_5) {
    "use strict";
    var asserts_ts_2;
    var __moduleName = context_5 && context_5.id;
    function longestCommonPrefix(a, b) {
      let i = 0;
      let len = Math.min(a.length, b.length);
      for (; i < len && a[i] === b[i]; ++i);
      return i;
    }
    exports_5("longestCommonPrefix", longestCommonPrefix);
    function splitFromFirstSlash(path) {
      let i = 0;
      for (; i < path.length && path[i] !== "/"; ++i);
      return [path.slice(0, i), path.slice(i)];
    }
    exports_5("splitFromFirstSlash", splitFromFirstSlash);
    function isWildcard(c) {
      asserts_ts_2.assert(c.length === 1);
      return c === ":" || c === "*";
    }
    exports_5("isWildcard", isWildcard);
    function getWildcardPos(path) {
      let i = 0;
      for (; i < path.length && !isWildcard(path[i]););
      return i === path.length ? -1 : i;
    }
    exports_5("getWildcardPos", getWildcardPos);
    return {
      setters: [
        function (asserts_ts_2_1) {
          asserts_ts_2 = asserts_ts_2_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///C:/Users/zhbnh/Desktop/abc_workspace/router/node",
  ["file:///C:/Users/zhbnh/Desktop/abc_workspace/router/_util"],
  function (exports_6, context_6) {
    "use strict";
    var _util_ts_1, Node;
    var __moduleName = context_6 && context_6.id;
    return {
      setters: [
        function (_util_ts_1_1) {
          _util_ts_1 = _util_ts_1_1;
        },
      ],
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
                const i = _util_ts_1.longestCommonPrefix(path, n.path);
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
            for (; i < path.length && !_util_ts_1.isWildcard(path[i]); ++i);
            n = n.#merge(path.slice(0, i));
            let j = i;
            for (; i < path.length; ++i) {
              if (_util_ts_1.isWildcard(path[i])) {
                if (j !== i) {
                  // insert static route
                  n = n.#insert(path.slice(j, i));
                  j = i;
                }
                ++i;
                let invalid = false;
                for (; i < path.length && path[i] !== "/"; ++i) {
                  if (_util_ts_1.isWildcard(path[i])) {
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
                // insert wildcard route
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
            // node, path, vis
            const stack = [[this, path, false]];
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
                np = "";
              } else if (n.path[0] === ":") {
                const [s1, s2] = _util_ts_1.splitFromFirstSlash(p);
                params.set(n.path.slice(1), s1);
                np = s2;
              } else {
                if (n.path === p) {
                  np = "";
                }
                const lcp = _util_ts_1.longestCommonPrefix(n.path, p);
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
          #merge;
          #insert;
        };
        exports_6("Node", Node);
      },
    };
  },
);
System.register(
  "file:///C:/Users/zhbnh/Desktop/abc_workspace/router/mod",
  ["file:///C:/Users/zhbnh/Desktop/abc_workspace/router/node"],
  function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    function exportStar_2(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default") exports[n] = m[n];
      }
      exports_7(exports);
    }
    return {
      setters: [
        function (node_ts_1_1) {
          exportStar_2(node_ts_1_1);
        },
      ],
      execute: function () {
      },
    };
  },
);

const __exp = __instantiate(
  "file:///C:/Users/zhbnh/Desktop/abc_workspace/router/mod",
);
export const Node = __exp["Node"];
