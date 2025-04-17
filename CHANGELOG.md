# Changelog

## v0.3.0

[compare changes](https://github.com/unjs/srvx/compare/v0.2.8...v0.3.0)

### 💅 Refactors

- ⚠️ Move extended request context under `request.x.*` ([#50](https://github.com/unjs/srvx/pull/50))

### 📖 Documentation

- Improve quick start ([#49](https://github.com/unjs/srvx/pull/49))

### 🏡 Chore

- Update editorconfig to include typescript files ([#47](https://github.com/unjs/srvx/pull/47))

#### ⚠️ Breaking Changes

- ⚠️ Move extended request context under `request.x.*` ([#50](https://github.com/unjs/srvx/pull/50))

### ❤️ Contributors

- Daniel Perez <danielpza@protonmail.com>
- Pooya Parsa ([@pi0](https://github.com/pi0))
- Sébastien Chopin <seb@nuxtlabs.com>

## v0.2.8

[compare changes](https://github.com/unjs/srvx/compare/v0.2.7...v0.2.8)

### 🚀 Enhancements

- **node:** Expose internal proxy classes ([0cdfa22](https://github.com/unjs/srvx/commit/0cdfa22))
- **node:** Support Response static methods ([b9976a4](https://github.com/unjs/srvx/commit/b9976a4))

### 🩹 Fixes

- **node:** Use `null` for unset headers ([#45](https://github.com/unjs/srvx/pull/45))

### 💅 Refactors

- Remove unused symbols ([c726e40](https://github.com/unjs/srvx/commit/c726e40))
- Accept node ctx for `NodeResponseHeaders` constructor ([8fe9241](https://github.com/unjs/srvx/commit/8fe9241))

### 📦 Build

- Add types condition to top ([82e7fcc](https://github.com/unjs/srvx/commit/82e7fcc))

### 🏡 Chore

- Update node tests ([#42](https://github.com/unjs/srvx/pull/42))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Benny Yen ([@benny123tw](https://github.com/benny123tw))

## v0.2.7

[compare changes](https://github.com/unjs/srvx/compare/v0.2.6...v0.2.7)

### 🚀 Enhancements

- **node:** Expose `node` context to proxy interfaces ([5f20d9e](https://github.com/unjs/srvx/commit/5f20d9e))

### 🩹 Fixes

- **node:** Make sure response constructor name is `Response` ([782ee13](https://github.com/unjs/srvx/commit/782ee13))
- **node:** Make sure all proxies mimic global name and instance ([5883995](https://github.com/unjs/srvx/commit/5883995))
- **node:** Use global Response for cloing ([effa940](https://github.com/unjs/srvx/commit/effa940))
- **node:** Avoid conflict with undici prototype ([40cacf2](https://github.com/unjs/srvx/commit/40cacf2))

### 💅 Refactors

- **types:** Fix typo for `BunFetchHandler` ([#41](https://github.com/unjs/srvx/pull/41))

### 📦 Build

- Add `engines` field ([ea8a9c9](https://github.com/unjs/srvx/commit/ea8a9c9))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Benny Yen ([@benny123tw](https://github.com/benny123tw))

## v0.2.6

[compare changes](https://github.com/unjs/srvx/compare/v0.2.5...v0.2.6)

### 🚀 Enhancements

- Support `tls` and `protocol` ([#38](https://github.com/unjs/srvx/pull/38))

### 🔥 Performance

- **adapters/node:** Check `req._hasBody` once ([978a27d](https://github.com/unjs/srvx/commit/978a27d))

### 🩹 Fixes

- **node:** Flatten headers to handle node slow path ([#40](https://github.com/unjs/srvx/pull/40))

### 🏡 Chore

- Update readme ([#39](https://github.com/unjs/srvx/pull/39))
- Update deps ([2b1f9f7](https://github.com/unjs/srvx/commit/2b1f9f7))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Oskar Lebuda <oskar.lebuda@enp.pl>
- Markthree ([@markthree](https://github.com/markthree))
- Alexander Lichter ([@TheAlexLichter](https://github.com/TheAlexLichter))

## v0.2.5

[compare changes](https://github.com/unjs/srvx/compare/v0.2.3...v0.2.5)

### 🩹 Fixes

- Fix `Response` type export ([e8d25e9](https://github.com/unjs/srvx/commit/e8d25e9))
- **node:** Set `Response` prototype for `NodeFastResponse` ([2e6a8a0](https://github.com/unjs/srvx/commit/2e6a8a0))

### 🏡 Chore

- **release:** V0.2.4 ([d001e87](https://github.com/unjs/srvx/commit/d001e87))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v0.2.4

[compare changes](https://github.com/unjs/srvx/compare/v0.2.3...v0.2.4)

### 🩹 Fixes

- Fix `Response` type export ([e8d25e9](https://github.com/unjs/srvx/commit/e8d25e9))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v0.2.3

[compare changes](https://github.com/unjs/srvx/compare/v0.2.2...v0.2.3)

### 🩹 Fixes

- **node:** Use `headers.entries` when full Headers is set as init ([7f8cac8](https://github.com/unjs/srvx/commit/7f8cac8))
- **node:** Make `req instanceof Request` working ([24b3f83](https://github.com/unjs/srvx/commit/24b3f83))

### 📦 Build

- Fix types export ([#36](https://github.com/unjs/srvx/pull/36))
- Add types export for `.` ([#37](https://github.com/unjs/srvx/pull/37))

### 🏡 Chore

- **release:** V0.2.2 ([f015aa3](https://github.com/unjs/srvx/commit/f015aa3))
- Lint ([f043d58](https://github.com/unjs/srvx/commit/f043d58))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Oskar Lebuda ([@OskarLebuda](https://github.com/OskarLebuda))

## v0.2.2

[compare changes](https://github.com/unjs/srvx/compare/v0.2.1...v0.2.2)

### 🚀 Enhancements

- **node:** Support node readable stream ([bc72436](https://github.com/unjs/srvx/commit/bc72436))

### 🩹 Fixes

- **node:** Don't send headers if already sent ([bbf6b86](https://github.com/unjs/srvx/commit/bbf6b86))
- Add `Response` export type ([e63919b](https://github.com/unjs/srvx/commit/e63919b))
- **node:** Use `headers.entries` when full Headers is set as init ([7f8cac8](https://github.com/unjs/srvx/commit/7f8cac8))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v0.2.1

[compare changes](https://github.com/unjs/srvx/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- **node:** Export `toNodeHandler` ([5df69b6](https://github.com/unjs/srvx/commit/5df69b6))
- Export handler types ([54a01e4](https://github.com/unjs/srvx/commit/54a01e4))

### 🏡 Chore

- Apply automated updates ([5a1caf0](https://github.com/unjs/srvx/commit/5a1caf0))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v0.2.0

[compare changes](https://github.com/unjs/srvx/compare/v0.1.4...v0.2.0)

### 🚀 Enhancements

- Initial cloudflare support ([cab127c](https://github.com/unjs/srvx/commit/cab127c))
- Expose `server.node.handler` ([c84d604](https://github.com/unjs/srvx/commit/c84d604))
- `manual` mode ([ef6f9ed](https://github.com/unjs/srvx/commit/ef6f9ed))

### 💅 Refactors

- ⚠️ Update exports ([7153090](https://github.com/unjs/srvx/commit/7153090))
- ⚠️ Overhaul internal implementation ([d444c74](https://github.com/unjs/srvx/commit/d444c74))

### 📦 Build

- Remove extra files ([0f655b1](https://github.com/unjs/srvx/commit/0f655b1))

### 🏡 Chore

- Update deps ([0b8494a](https://github.com/unjs/srvx/commit/0b8494a))
- Update ci ([4b59db0](https://github.com/unjs/srvx/commit/4b59db0))
- Apply automated updates ([06d094c](https://github.com/unjs/srvx/commit/06d094c))
- Apply automated updates ([0dc2044](https://github.com/unjs/srvx/commit/0dc2044))

### ✅ Tests

- Fix coverage report ([1f8ba79](https://github.com/unjs/srvx/commit/1f8ba79))

### 🤖 CI

- Update to node 22 ([2e3044e](https://github.com/unjs/srvx/commit/2e3044e))

#### ⚠️ Breaking Changes

- ⚠️ Update exports ([7153090](https://github.com/unjs/srvx/commit/7153090))
- ⚠️ Overhaul internal implementation ([d444c74](https://github.com/unjs/srvx/commit/d444c74))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))

## v0.1.4

[compare changes](https://github.com/unjs/srvx/compare/v0.1.3...v0.1.4)

### 🩹 Fixes

- **node:** Access req headers with lowerCase ([#21](https://github.com/unjs/srvx/pull/21))

### 💅 Refactors

- **node:** Improve body streaming ([#26](https://github.com/unjs/srvx/pull/26))

### 🏡 Chore

- Update deps ([b74f68a](https://github.com/unjs/srvx/commit/b74f68a))
- Lint ([011d381](https://github.com/unjs/srvx/commit/011d381))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Alex ([@alexfriesen](http://github.com/alexfriesen))

## v0.1.3

[compare changes](https://github.com/unjs/srvx/compare/v0.1.1...v0.1.3)

### 🚀 Enhancements

- **node:** Add `NodeFastResponse.bytes()` ([#16](https://github.com/unjs/srvx/pull/16))
- **node:** Add `NodeRequestProxy.bytes()` ([07863f6](https://github.com/unjs/srvx/commit/07863f6))

### 🩹 Fixes

- **node:** Compute `hasBody` when accessing `req.body` ([a002185](https://github.com/unjs/srvx/commit/a002185))
- **node:** Body utils should respect buffer view offset ([5e4ec69](https://github.com/unjs/srvx/commit/5e4ec69))

### 💅 Refactors

- **node:** Expose `request._url` ([8eb8f5d](https://github.com/unjs/srvx/commit/8eb8f5d))

### 📖 Documentation

- Minor tweaks ([#9](https://github.com/unjs/srvx/pull/9))

### 🏡 Chore

- Apply automated updates ([7def381](https://github.com/unjs/srvx/commit/7def381))
- Update dev dependencies ([5bc0dce](https://github.com/unjs/srvx/commit/5bc0dce))
- **release:** V0.1.2 ([4bf7261](https://github.com/unjs/srvx/commit/4bf7261))

### ✅ Tests

- Update ip regex ([6885842](https://github.com/unjs/srvx/commit/6885842))
- Add additional tests for req body handling ([e00b4c9](https://github.com/unjs/srvx/commit/e00b4c9))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Emil ([@bergold](http://github.com/bergold))
- Johann Schopplich ([@johannschopplich](http://github.com/johannschopplich))

## v0.1.2

[compare changes](https://github.com/unjs/srvx/compare/v0.1.1...v0.1.2)

### 🚀 Enhancements

- **node:** Add `NodeFastResponse.bytes()` ([#16](https://github.com/unjs/srvx/pull/16))
- **node:** Add `NodeRequestProxy.bytes()` ([07863f6](https://github.com/unjs/srvx/commit/07863f6))

### 📖 Documentation

- Minor tweaks ([#9](https://github.com/unjs/srvx/pull/9))

### 🏡 Chore

- Apply automated updates ([7def381](https://github.com/unjs/srvx/commit/7def381))
- Update dev dependencies ([5bc0dce](https://github.com/unjs/srvx/commit/5bc0dce))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Emil ([@bergold](http://github.com/bergold))
- Johann Schopplich ([@johannschopplich](http://github.com/johannschopplich))

## v0.1.1

### 🚀 Enhancements

- Plugin support ([53874f0](https://github.com/unjs/srvx/commit/53874f0))

### 🩹 Fixes

- **node:** Send body with `NodeFastResponse` ([ac689ef](https://github.com/unjs/srvx/commit/ac689ef))

### 💅 Refactors

- Update deno types ([9598308](https://github.com/unjs/srvx/commit/9598308))

### 📖 Documentation

- Remove extra `await` ([#2](https://github.com/unjs/srvx/pull/2))
- Update diff explainer ([fbd81af](https://github.com/unjs/srvx/commit/fbd81af))

### 🏡 Chore

- Small fixes ([592b97c](https://github.com/unjs/srvx/commit/592b97c))
- Update undocs ([45613b7](https://github.com/unjs/srvx/commit/45613b7))
- Update docs ([2b0d96b](https://github.com/unjs/srvx/commit/2b0d96b))
- Update deps ([4eb6a8c](https://github.com/unjs/srvx/commit/4eb6a8c))
- Update docs ([768075d](https://github.com/unjs/srvx/commit/768075d))
- Fix types ([1bd4a38](https://github.com/unjs/srvx/commit/1bd4a38))
- Apply automated updates ([98e7af7](https://github.com/unjs/srvx/commit/98e7af7))
- Bump to 0.1.0 ([59fa1db](https://github.com/unjs/srvx/commit/59fa1db))
- Update playground ([fa1a776](https://github.com/unjs/srvx/commit/fa1a776))
- Update playground ([98eb941](https://github.com/unjs/srvx/commit/98eb941))
- Fix readme ([00e3f7d](https://github.com/unjs/srvx/commit/00e3f7d))
- **playground:** Set charset in content-type header ([#4](https://github.com/unjs/srvx/pull/4))
- Fix typo ([#5](https://github.com/unjs/srvx/pull/5))

### 🤖 CI

- Update deno to v2 ([2e2245b](https://github.com/unjs/srvx/commit/2e2245b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Andrei Luca ([@iamandrewluca](http://github.com/iamandrewluca))
- Florens Verschelde ([@fvsch](http://github.com/fvsch))
- Sébastien Chopin <seb@nuxtlabs.com>
