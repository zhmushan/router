import { assertEquals } from "./dev_deps.ts";
import { Node } from "./node.ts";
const { test } = Deno;

interface TestRequest {
  path: string;
  isMatch: boolean;
  route: string;
  params?: Map<string, string>;
}

function convertJSONToMap(obj: Record<string, any>): Map<string, any> {
  const mp = new Map();
  for (const k in obj) {
    mp.set(k, obj[k]);
  }

  return mp;
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
      params: convertJSONToMap({ tool: "test" }),
    },
    // {
    //   path: "/cmd/test",
    //   isMatch: false,
    //   route: "",
    //   params: convertJSONToMap({ tool: "test" }),
    // },
    {
      path: "/cmd/test/3",
      isMatch: true,
      route: "/cmd/:tool/:sub",
      params: convertJSONToMap({ tool: "test", sub: "3" }),
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
    // { path: "/search/", isMatch: true, route: "/search/" },
    // {
    //   path: "/search/someth!ng+in+ünìcodé",
    //   isMatch: true,
    //   route: "/search/:query",
    //   params: convertJSONToMap({ query: "someth!ng+in+ünìcodé" }),
    // },
    // {
    //   path: "/search/someth!ng+in+ünìcodé/",
    //   isMatch: false,
    //   route: "",
    //   params: convertJSONToMap({ query: "someth!ng+in+ünìcodé" }),
    // },
    // {
    //   path: "/user_gopher",
    //   isMatch: true,
    //   route: "/user_:name",
    //   params: convertJSONToMap({ name: "gopher" }),
    // },
    {
      path: "/user_gopher/about",
      isMatch: true,
      route: "/user_:name/about",
      params: convertJSONToMap({ name: "gopher" }),
    },
    {
      path: "/files/js/framework.js",
      isMatch: true,
      route: "/files/:dir/*",
      params: convertJSONToMap({ dir: "js" }),
    },
    {
      path: "/info/gordon/public",
      isMatch: true,
      route: "/info/:user/public",
      params: convertJSONToMap({ user: "gordon" }),
    },
    {
      path: "/info/gordon/project/go",
      isMatch: true,
      route: "/info/:user/project/:project",
      params: convertJSONToMap({ user: "gordon", project: "go" }),
    },
  ]);
});
