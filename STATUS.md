# Project Status

Snapshot: **2026-11-20**. Reference baselines: `../crt-cli` (STATUS reviewed at `ec498ce`) and
`../crt` (`9867851`). [TODO](TODO.md) owns the work queue.

## This Repository

| Item | State |
| --- | --- |
| Project scaffold (package.json, tsconfig, launch config) | Done; `npm run typecheck` and `npm run compile` pass |
| Build/Test/Run/Doctor commands + TaskProvider | Code written, **not exercised** (Extension Host not run) |
| `CRT: Export compile_commands.json` | Code written; works only if the CLI supports it (not implemented in CLI) |
| clangd integration / SDK and port UI / debugging / distribution | Not started |
| Automated tests | None |
| Commits/releases | None (changes since the initial commit are uncommitted) |

## CLI Dependencies (from `crt-cli`)

- Implemented: `doctor`, `env`, `sdk`, `port`, `new`, `configure`, `build`, `test`, `run`, global
  `--json`. `--json` prints one envelope `{schema: "crt-cli.bootstrap-result", format: 1, command, ok, data}`.
- Previews are public for five host pairs (Linux x86_64/aarch64, macOS arm64, Windows x64/arm64).
- **Missing (proposal stage):** `export compile-commands`, `project info --json`, structured
  `build --json` progress events. These are V0 prerequisites owned by the CLI repository and are not
  implemented here.
- The CLI's Studio/IDE integration (D7) is a separate gate and its contract is not yet documented.

## Limits

- clangd accuracy (diagnostics matching the real build) is unverified.
- Windows debugging (CRT DWARF/emutls) is unverified; no support is claimed.
- This extension runs in the VS Code extension host as TypeScript; it is not a CRT-native application.
