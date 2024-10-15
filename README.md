# 💥 srvx

<!-- automd:badges color=yellow -->

[![npm version](https://img.shields.io/npm/v/srvx?color=yellow)](https://npmjs.com/package/srvx)
[![npm downloads](https://img.shields.io/npm/dm/srvx?color=yellow)](https://npm.chart.dev/srvx)

<!-- /automd -->

Universal Server API based on web platform standards. Works with [Deno](https://deno.com/), [Bun](https://bun.sh/) and [Node.js](https://nodejs.org/en).

- ✅ Seamless runtime integration with identical usage ([handler](https://srvx.unjs.io/guide/handler) and
- ✅ Zero overhead [Deno](https://deno.com/) and [Bun](https://bun.sh/) support
- ✅ [Node.js compatibility](https://srvx.unjs.io/guide/node) with ~native perf and [fast response](https://srvx.unjs.io/guide/node#fast-response) support

## Quick start

```js
import { serve } from "srvx";

const server = serve({
  port: 3000,
  fetch(request) {
    return new Response("👋 Hello there!");
  },
});

await server.ready();

console.log(`🚀 Server ready at ${server.url}`);
```

👉 **Visit the 📖 [Documentation](https://srvx.unjs.io/) to learn more.**

## Development

<details>

<summary>local development</summary>

- Clone this repository
- Install the latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

</details>

## License

<!-- automd:contributors author=pi0 license=MIT -->

Published under the [MIT](https://github.com/unjs/srvx/blob/main/LICENSE) license.
Made by [@pi0](https://github.com/pi0) and [community](https://github.com/unjs/srvx/graphs/contributors) 💛
<br><br>
<a href="https://github.com/unjs/srvx/graphs/contributors">
<img src="https://contrib.rocks/image?repo=unjs/srvx" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
