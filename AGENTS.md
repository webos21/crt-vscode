# Agent Development Guidelines

## Mission

`crt-vscode` is a **VS Code extension** for developing applications with
[CRT](https://github.com/webos21/crt) (compatible with VS Code, Cursor and VSCodium). It brings the
"one C/C++ source, native builds on Linux, macOS and Windows" experience into an editor developers
already use. The implementation language is TypeScript.

It does not replace `crt-studio`, the standalone native IDE, which stays a long-term effort. This
repository is the fastest path to an integrated CRT development experience for external developers.

## Language Policy

- Documentation (AGENTS/README/STATUS/TODO, docs/, code comments, commit messages) is written in **English**.
- Progress reports and results given to the owner in conversation are in **Korean**.

## Reference Repositories (read-only)

- `../crt` produces the runtime and SDKs. `docs/design/crt_studio.md`, `docs/design/crt_cli.md` and
  `docs/design/sdk_development_contract.md` define the CLI/IDE boundary.
- `../crt-cli` is the build, SDK and port engine. Its `AGENTS.md`, `docs/design/crt_cli.md` and
  `docs/reference/bootstrap_contract.md` define the CLI contract.
- Do not modify sibling repositories. Record needed CLI features as requirements in `TODO.md` and
  pursue them in `crt-cli` separately.

## Core Principles

1. **The extension is not a build system.** It never reads `crt.json` to reconstruct compiler flags.
   SDK management, port recipes, compile/link policy and `crt.lock` belong to `crt-cli`.
2. **`compile_commands.json` generation is `crt-cli`'s job** (`crt-cli export compile-commands`).
   The extension only invokes it and wires the result to clangd, so Neovim, Zed and other editors can
   share the same environment.
3. Parse only the single final JSON envelope of `--json` (`schema: crt-cli.bootstrap-result`,
   `format: 1`). Never mix logs with JSON. Use progress events only once a separate stream/file
   contract exists.
4. Do not assume CLI commands or schemas that do not exist. Proposed commands (`export
   compile-commands`, `project info --json`, `build --json`) are checked through the capability
   probe (`supports` in `src/cli.ts`); if absent, say so clearly.
5. Never silently pick an arbitrary `crt-cli` from PATH. Prefer the `crt.cliPath` setting and show the
   CLI location/version in use.
6. **Respect Workspace Trust.** Do not run `crt-cli` in untrusted workspaces. SDK downloads and port
   recipe execution must never happen merely because a workspace was opened; they need user consent.
7. Do not claim Windows debugging support until it passes CRT ABI validation (DWARF exceptions,
   emutls, own runtime).
8. Do not assume clangd diagnostics match the real build; results depend on `--query-driver` and
   system-header settings. Verify accuracy (TODO V1) first.

## Layout and Entry Points

- `src/extension.ts`: activation, command registration, status bar.
- `src/cli.ts`: runs and parses `crt-cli --json`, capability probe.
- `src/tasks.ts`: `TaskProvider` (`crt` task type: build/test/run/doctor).
- `package.json`: contributes (commands, taskDefinitions, configuration). Keep docs in sync with it.

Build/verify: `npm install`, `npm run typecheck`, `npm run compile`. Debug with the "Run Extension"
launch configuration in `.vscode/launch.json`. There are no automated tests yet; never describe
tests or presets that do not exist.

## Documentation Rules

- [README.md](README.md): user-facing overview. List only what is implemented under "Works today".
- [STATUS.md](STATUS.md): evidence-based status snapshot. No completion claims without evidence.
- [TODO.md](TODO.md): in-progress/planned work (V0-V4) with acceptance criteria. Check items off only
  with evidence.
- Update these three together with code changes. Commit or publish (Marketplace/Open VSX) only when
  the owner asks.
