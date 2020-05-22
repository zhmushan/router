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

import { assertEquals } from "./dev_deps.ts";
import { Node } from "./node.ts";
const { test } = Deno;

interface TestRequest {
  path: string;
  isMatch: boolean;
  route: string;
  params?: Record<string, string>;
}

function checkRequests(n: Node, requests: TestRequest[]): void {
  for (const r of requests) {
    const { func, params } = n.find(r.path);
    if (func === undefined) {
      assertEquals(r.isMatch, false);
    } else {
      assertEquals(r.isMatch, true);
      assertEquals(func(), r.route);
    }
    assertEquals(params, r.params);
  }
}

test("node add and find", function (): void {
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

test("node wildcard", function (): void {
  const n = new Node();
  const routes = [
    "/",
    "/cmd/:tool/:sub",
    "/cmd/:tool/",
    "/src/*",
    "/search/",
    "/search/:query",
    "/user_:name",
    "/user_:name/about",
    "/files/:dir/*",
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
      params: { tool: "test" },
    },
    {
      path: "/cmd/test",
      isMatch: false,
      route: "",
    },
    {
      path: "/cmd/test/3",
      isMatch: true,
      route: "/cmd/:tool/:sub",
      params: { tool: "test", sub: "3" },
    },
    {
      path: "/src/",
      isMatch: false,
      route: "/src/*",
    },
    {
      path: "/src/index.html",
      isMatch: true,
      route: "/src/*",
    },
    {
      path: "/src/some/file.png",
      isMatch: false,
      route: "/src/*",
    },
    { path: "/search/", isMatch: true, route: "/search/" },
    {
      path: "/search/someth!ng+in+ünìcodé",
      isMatch: true,
      route: "/search/:query",
      params: { query: "someth!ng+in+ünìcodé" },
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
      params: { name: "gopher" },
    },
    {
      path: "/user_gopher/about",
      isMatch: true,
      route: "/user_:name/about",
      params: { name: "gopher" },
    },
    {
      path: "/files/js/framework.js",
      isMatch: true,
      route: "/files/:dir/*",
      params: { dir: "js" },
    },
    {
      path: "/info/gordon/public",
      isMatch: true,
      route: "/info/:user/public",
      params: { user: "gordon" },
    },
    {
      path: "/info/gordon/project/go",
      isMatch: true,
      route: "/info/:user/project/:project",
      params: { user: "gordon", project: "go" },
    },
  ]);
});
