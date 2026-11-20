# CRT for VS Code (`crt-vscode`)

An extension for building, testing and running [CRT](https://github.com/webos21/crt) applications in
VS Code (and compatible editors such as Cursor and VSCodium). All CRT-specific behavior (SDKs,
compile/link policy, ports, `crt.lock`) is performed by
[`crt-cli`](https://github.com/webos21/crt-cli); the extension is a thin UI layer on top of it.

> **Status: initial scaffold (0.0.1).** Not released and not on the Marketplace. See [STATUS.md](STATUS.md).

## Architecture

```text
VS Code / Cursor / VSCodium   editor / extension host
   └─ crt-vscode (TypeScript)  tasks, status, debug config, clangd wiring
        └─ crt-cli (C++17)     manifest, lock, build plan, SDK, ports, export
             └─ CRT Dev/Full SDK + LLVM

crt-cli export compile-commands ──► compile_commands.json ──► clangd
```

Principle: the extension is not a new build system. `crt-cli` generates `compile_commands.json` from
the real build plan; the extension only invokes it, refreshes it and connects clangd.

## Works Today

- Activates in workspaces containing `crt.json`.
- Commands: `CRT: Build`, `CRT: Test`, `CRT: Run`, `CRT: Doctor` (run `crt-cli build|test|run|doctor`
  as tasks).
- A `crt` task provider (no hand-written `tasks.json` needed).
- `CRT: Export compile_commands.json` works only when the CLI supports `export compile-commands`
  (current `crt-cli` does not; a notice is shown instead).
- Settings: `crt.cliPath`, `crt.compileCommands.output`.
- `crt-cli` is not run in untrusted workspaces.

## Not Yet Available

SDK status display, port list, lock-change detection, automatic clangd setup, debugging, packaging and
distribution. See [TODO.md](TODO.md).

## Development

```bash
npm install
npm run typecheck
npm run compile
```

Open this folder in VS Code and press F5 (`Run Extension`) to start an Extension Development Host.
Point to `crt-cli` through PATH or `crt.cliPath`
([CLI previews](https://github.com/webos21/crt-cli#download-the-previews)).

## Related Repositories

| Repository | Role |
| --- | --- |
| [webos21/crt](https://github.com/webos21/crt) | CRT runtime, Dev/Full SDK production |
| [webos21/crt-cli](https://github.com/webos21/crt-cli) | CLI, build/SDK/port engine, JSON/export API for IDEs |
| `crt-vscode` (this repository) | VS Code extension |
| [webos21/crt-studio](https://github.com/webos21/crt-studio) | Long-term standalone CRT-native IDE (stays Planned) |

License: Apache-2.0 ([LICENSE](LICENSE)).
