# Router

A high-performance basic router works anywhere.

[![tag](https://img.shields.io/github/tag/zhmushan/router.svg)](https://github.com/zhmushan/router)
[![Build Status](https://github.com/zhmushan/router/workflows/ci/badge.svg?branch=master)](https://github.com/zhmushan/router/actions)
[![license](https://img.shields.io/github/license/zhmushan/router.svg)](https://github.com/zhmushan/router)

Server: [See zhmushan/abc](https://github.com/zhmushan/abc)

React: Coming soon...

Browser:

```html
<body>
  <button id="change_path">Change Path</button>
  <button id="home">Home</button>
  <script type="module">
    import { Node } from "https://deno.land/x/router@v1.0.0-rc1/mod.js";

    const root = new Node();
    root.add("/:random_string", (c) => {
      console.log(c.get("random_string"));
    });

    change_path.onclick = () => {
      const path = `/${randomStr()}`;
      const [func, params] = root.find(path);
      if (func) {
        func(params);
        history.replaceState(undefined, "", path);
      }
    };

    home.onclick = () => {
      history.replaceState(undefined, "", "/");
    };

    function randomStr() {
      return Math.random().toString(32).split(".")[1];
    }
  </script>
</body>
```
