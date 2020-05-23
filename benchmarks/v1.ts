import { bench, runIfMain } from "../dev_deps.ts";
import { Node } from "../mod.ts";
import routes from "./routes.ts";

bench({
  name: "add route",
  runs: 20,
  func(b): void {
    const n = new Node();
    b.start();
    for (let i = 0; i < 10000; ++i) {
      for (const r of routes) {
        n.add(r, undefined!);
      }
    }
    b.stop();
  },
});

bench({
  name: "find route",
  runs: 20,
  func(b): void {
    const n = new Node();
    for (const r of routes) {
      n.add(r, (): string => r);
    }
    b.start();
    for (let i = 0; i < 100000; ++i) {
      n.find("/info/zhmushan/project/router");
    }
    b.stop();
  },
});

runIfMain(import.meta);
