# Router

A high-performance basic router works anywhere.

[![tag](https://img.shields.io/github/tag/zhmushan/router.svg)](https://github.com/zhmushan/router)
[![Build Status](https://github.com/zhmushan/router/workflows/ci/badge.svg?branch=master)](https://github.com/zhmushan/router/actions)
[![license](https://img.shields.io/github/license/zhmushan/router.svg)](https://github.com/zhmushan/router)

## Features

- **Based on [radix tree](https://en.wikipedia.org/wiki/Radix_tree)**: Compared with routers based on regular expressions, we have better performance in most of the cases, which can significantly increase the speed of your project, and as the project scale increases, the performance improvement will also increase exponentially.

- **Stupid rules**: We will always match according to the rules of "Static > Param > Any". For static routes, Match only strictly equal.

## Usage

- [Deno](#deno)
- [Nodejs](#nodejs)
- [Browser](#browser)
- [React](#react)

### Deno

See [zhmushan/abc](https://github.com/zhmushan/abc)

### Nodejs

Installation:

```
npm i zhmushan/router#1.0.0
```

Create `index.js`:

```js
import { createServer } from "http";
import { Node } from "router";

const root = new Node();

root.add("/:user", (p) => {
  return p.get("user");
});

createServer((req, res) => {
  const [h, p] = root.find(req.url);

  if (h) {
    const result = h(p);
    res.end(result);
  } else {
    res.end("Not Found");
  }
}).listen(8080);

console.log("server listening on http://localhost:8080");
```

Make sure you have set `type: module` in `package.json`, then run:

```
node index.js
```

Browse to http://localhost:8080/your_name and you should see "your_name" on the page.

### Browser

```html
<body>
  <button id="change_path">Change Path</button>
  <button id="home">Home</button>
  <script type="module">
    import { Node } from "https://deno.land/x/router@1.0.0/mod.js";

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

## React

Coming soon...
