# Router

A high-performance basic router works everywhere.

[![tag](https://img.shields.io/github/tag/zhmushan/router.svg)](https://github.com/zhmushan/router)
[![Build Status](https://github.com/zhmushan/router/workflows/ci/badge.svg?branch=master)](https://github.com/zhmushan/router/actions)
[![license](https://img.shields.io/github/license/zhmushan/router.svg)](https://github.com/zhmushan/router)

Server: [See zhmushan/abc](https://github.com/zhmushan/abc)

Browser:

```html
<body>
  <button id="btn">Change Path</button>
  <script type="module">
    import { Node } from "https://deno.land/x/router/mod.js";

    const root = new Node();
    root.addRoute("/print_:info", c => {
      console.log(c.info);
    });

    btn.onclick = () => {
      const path = `/print_${randomStr()}`;
      const [func, params, _] = root.getValue(path);
      if (func) {
        const p = {};
        for (const { key, value } of params) {
          p[key] = value;
        }
        func(p);
        history.replaceState(undefined, "", path);
      }
    }

    function randomStr() {
      return Math.random().toString(32).split(".")[1];
    }
  </script>
</body>
```
