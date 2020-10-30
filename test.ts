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

import {
  assertEquals,
  assertNotEquals,
} from "./vendor/https/deno.land/std/testing/asserts.ts";
import { Node } from "./mod.ts";
const { test } = Deno;

interface TestRequest {
  path: string;
  isMatch: boolean;
  route: string;
  params?: Map<string, string>;
}

function getErr(func: () => void): Error | undefined {
  try {
    func();
  } catch (e) {
    return e;
  }
}

function checkRequests(n: Node, requests: TestRequest[]): void {
  for (const r of requests) {
    const [func, params] = n.find(r.path);
    if (func === undefined) {
      assertEquals(r.isMatch, false);
    } else {
      assertEquals(r.isMatch, true);
      assertEquals(func(), r.route);
    }
    if (!r.params) {
      r.params = new Map();
    }
    assertEquals(params, r.params);
  }
}

test("add and find", function (): void {
  const n = new Node();
  const routes = [
    "/hi",
    "/contact",
    "/co",
    "/c",
    "/a",
    "/ab",
    "/doc/",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/α",
    "/β",
  ];
  for (const r of routes) {
    n.add(r, (): string => r);
  }

  checkRequests(n, [
    { path: "/a", isMatch: true, route: "/a" },
    { path: "/", isMatch: false, route: "" },
    { path: "/hi", isMatch: true, route: "/hi" },
    { path: "/contact", isMatch: true, route: "/contact" },
    { path: "/co", isMatch: true, route: "/co" },
    { path: "/con", isMatch: false, route: "" }, // key mismatch
    { path: "/cona", isMatch: false, route: "" }, // key mismatch
    { path: "/no", isMatch: false, route: "" }, // no matching child
    { path: "/ab", isMatch: true, route: "/ab" },
    { path: "/α", isMatch: true, route: "/α" },
    { path: "/β", isMatch: true, route: "/β" },
  ]);
});

test("wildcard", function (): void {
  const n = new Node();
  const routes = [
    "/",
    "/cmd/:tool/:sub",
    "/cmd/:tool/",
    "/src/*filepath",
    "/search/",
    "/search/:query",
    "/user_:name",
    "/user_:name/about",
    "/files/:dir/*filepath",
    "/doc/",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/info/:user/public",
    "/info/:user/project/:project",
  ];

  for (const r of routes) {
    n.add(r, (): string => r);
  }

  checkRequests(n, [
    { path: "/", isMatch: true, route: "/" },
    {
      path: "/cmd/test/",
      isMatch: true,
      route: "/cmd/:tool/",
      params: new Map([["tool", "test"]]),
    },
    {
      path: "/cmd/test",
      isMatch: false,
      route: "",
      params: new Map([["tool", "test"]]),
    },
    {
      path: "/cmd/test/3",
      isMatch: true,
      route: "/cmd/:tool/:sub",
      params: new Map([
        ["tool", "test"],
        ["sub", "3"],
      ]),
    },
    {
      path: "/src/",
      isMatch: true,
      route: "/src/*filepath",
      params: new Map([["filepath", ""]]),
    },
    {
      path: "/src/index.html",
      isMatch: true,
      route: "/src/*filepath",
      params: new Map([["filepath", "index.html"]]),
    },
    {
      path: "/src/some/file.png",
      isMatch: true,
      route: "/src/*filepath",
      params: new Map([["filepath", "some/file.png"]]),
    },
    { path: "/search/", isMatch: true, route: "/search/" },
    {
      path: "/search/someth!ng+in+ünìcodé",
      isMatch: true,
      route: "/search/:query",
      params: new Map([["query", "someth!ng+in+ünìcodé"]]),
    },
    {
      path: "/search/someth!ng+in+ünìcodé/",
      isMatch: false,
      route: "",
    },
    {
      path: "/user_gopher",
      isMatch: true,
      route: "/user_:name",
      params: new Map([["name", "gopher"]]),
    },
    {
      path: "/user_gopher/about",
      isMatch: true,
      route: "/user_:name/about",
      params: new Map([["name", "gopher"]]),
    },
    {
      path: "/files/js/inc/framework.js",
      isMatch: true,
      route: "/files/:dir/*filepath",
      params: new Map([
        ["dir", "js"],
        ["filepath", "inc/framework.js"],
      ]),
    },
    {
      path: "/info/gordon/public",
      isMatch: true,
      route: "/info/:user/public",
      params: new Map([["user", "gordon"]]),
    },
    {
      path: "/info/gordon/project/go",
      isMatch: true,
      route: "/info/:user/project/:project",
      params: new Map([
        ["user", "gordon"],
        ["project", "go"],
      ]),
    },
  ]);
});

test("dupliate path", function (): void {
  const n = new Node();
  const routes = ["/", "/doc/", "/src/*", "/search/:query", "/user_:name"];
  for (const r of routes) {
    let err = getErr((): void => n.add(r, (): string => r));
    assertEquals(err, undefined);
    err = getErr((): void => n.add(r, (): string => r));
    assertNotEquals(err, undefined);
  }

  checkRequests(n, [
    { path: "/", isMatch: true, route: "/" },
    { path: "/doc/", isMatch: true, route: "/doc/" },
    {
      path: "/src/some/file.png",
      isMatch: true,
      route: "/src/*",
    },
    {
      path: "/search/someth!ng+in+ünìcodé",
      isMatch: true,
      route: "/search/:query",
      params: new Map([["query", "someth!ng+in+ünìcodé"]]),
    },
    {
      path: "/user_gopher",
      isMatch: true,
      route: "/user_:name",
      params: new Map([["name", "gopher"]]),
    },
  ]);
});

test("empty param name", function (): void {
  const n = new Node();
  const routes = ["/user:", "/user:/", "/cmd/:/", "/src/:"];
  for (const r of routes) {
    const err = getErr((): void => n.add(r, undefined!));
    assertNotEquals(err, null);
  }
});

test("double wildcard", function (): void {
  const errMsg = "only one wildcard per path segment is allowed";
  const routes = ["/:foo:bar", "/:foo:bar/", "/:foo*"];
  for (const r of routes) {
    const n = new Node();
    const err = getErr((): void => n.add(r, undefined!));
    assertEquals(err!.message.startsWith(errMsg), true);
  }
});

test("trailing slash", function (): void {
  const n = new Node();
  let routes = [
    "/hi",
    "/b/",
    "/search/:query",
    "/cmd/:tool/",
    "/src/*filepath",
    "/x",
    "/x/y",
    "/y/",
    "/y/z",
    "/0/:id",
    "/0/:id/1",
    "/1/:id/",
    "/1/:id/2",
    "/aa",
    "/a/",
    "/admin",
    "/admin/:category",
    "/admin/:category/:page",
    "/doc",
    "/doc/go_faq.html",
    "/doc/go1.html",
    "/no/a",
    "/no/b",
    "/api/hello/:name",
  ];
  for (const r of routes) {
    const err = getErr((): void => n.add(r, (): string => r));
    assertEquals(err, undefined);
  }

  routes = [
    "/hi/",
    "/b",
    "/search/gopher/",
    "/cmd/vet",
    "/src",
    "/x/",
    "/y",
    "/0/go/",
    "/1/go",
    "/a",
    "/admin/",
    "/admin/config/",
    "/admin/config/permissions/",
    "/doc/",
  ];
  for (const r of routes) {
    const [func] = n.find(r);
    assertEquals(func, undefined);
  }

  routes = ["/", "/no", "/no/", "/_", "/_/", "/api/world/abc"];
  for (const r of routes) {
    const [func] = n.find(r);
    assertEquals(func, undefined);
  }
});

test("root trailing slash", function (): void {
  const n = new Node();
  const err = getErr((): void => n.add("/:test", (): string => "/:test"));
  assertEquals(err, undefined);

  const [func] = n.find("/");
  assertEquals(func, undefined);
});

test("static > param > any", function (): void {
  const n = new Node();
  const routes = [
    "/*",
    "/:username",
    "/:username/:project",
    "/zhmushan",
    "/zhmushan/router",
    "/zhmushan/:project",
  ];
  for (const r of routes) {
    n.add(r, (): string => r);
  }
  checkRequests(n, [
    { path: "/", isMatch: true, route: "/*" },
    { path: "/zhmushan", isMatch: true, route: "/zhmushan" },
    { path: "/zhmushan/", isMatch: true, route: "/*" },
    {
      path: "/zhmushan/abc",
      isMatch: true,
      route: "/zhmushan/:project",
      params: new Map([["project", "abc"]]),
    },
    {
      path: "/zhmushan/router",
      isMatch: true,
      route: "/zhmushan/router",
    },
    {
      path: "/mushan",
      isMatch: true,
      route: "/:username",
      params: new Map([["username", "mushan"]]),
    },
    { path: "/mushan/", isMatch: true, route: "/*" },
    {
      path: "/mushan/abc",
      isMatch: true,
      route: "/:username/:project",
      params: new Map([
        ["username", "mushan"],
        ["project", "abc"],
      ]),
    },
    {
      path: "/mushan/abc/",
      isMatch: true,
      route: "/*",
    },
  ]);
});
