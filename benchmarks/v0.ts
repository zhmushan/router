import {
  bench,
  runBenchmarks,
} from "../vendor/https/deno.land/std/testing/bench.ts";
import { Node } from "https://deno.land/x/router@v0.1.0/mod.ts";
import routes from "./routes.ts";

bench({
  name: "add route",
  runs: 20,
  func(b): void {
    b.start();
    for (let i = 0; i < 10000; ++i) {
      const n = new Node();
      for (const r of routes) {
        n.addRoute(r, undefined!);
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
      n.addRoute(r, (): string => r);
    }
    b.start();
    for (let i = 0; i < 10000; ++i) {
      n.getValue("/info/zhmushan/project/router");
    }
    b.stop();
  },
});

runBenchmarks();
