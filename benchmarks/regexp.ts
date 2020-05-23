import { bench, runIfMain } from "../dev_deps.ts";
import { pathToRegexp } from "https://cdn.pika.dev/path-to-regexp@6.1.0";
import routes from "./routes.ts";

const routesSpec = routes.map((r) => {
  r = r.replace("*", "(.*)");
  return r;
});

bench({
  name: "add route",
  runs: 20,
  func(b): void {
    b.start();
    for (let i = 0; i < 10000; ++i) {
      for (const r of routesSpec) {
        pathToRegexp(r);
      }
    }
    b.stop();
  },
});

bench({
  name: "find route",
  runs: 20,
  func(b): void {
    const rules = [];
    for (const r of routesSpec) {
      rules.push(pathToRegexp(r));
    }
    b.start();
    for (let i = 0; i < 100000; ++i) {
      for (const r of rules) {
        if (r.exec("/info/zhmushan/project/router")) {
          break;
        }
      }
    }
    b.stop();
  },
});

// bench({
//   name: "find route",
//   runs: 20,
//   func(b): void {
//     const n = new Node();
//     for (const r of routes) {
//       n.add(r, (): string => r);
//     }
//     b.start();
//     for (let i = 0; i < 100000; ++i) {
//       n.find("/info/zhmushan/project/router");
//     }
//     b.stop();
//   },
// });

runIfMain(import.meta);
