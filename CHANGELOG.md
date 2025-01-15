# Changelog

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
