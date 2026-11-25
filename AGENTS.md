# Agent Development Guidelines

## Mission

`crt-vscode` is a **VS Code extension** for developing applications with
[CRT](https://github.com/webos21/crt) (compatible with VS Code, Cursor and VSCodium). It brings the
"one C/C++ source, native builds on Linux, macOS and Windows" experience into an editor developers
already use. The implementation language is TypeScript.

It does not replace `crt-studio`, the standalone native IDE, which stays a long-term effort. This
repository is the fastest path to an integrated CRT development experience for external developers.

## Language Policy

- Documentation (AGENTS/README/STATUS/TODO/HISTORY, docs/, code comments, commit messages) is written in **English**.
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
4. Check the CLI contract before using a command or schema. `build --json` returns a final result.
   Use editor API 1 capability discovery for `export compile-commands` and `project info --json`.
   Report absent capabilities clearly. Streaming job events have a separate future contract.
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

Build/verify: `npm ci`, `npm run typecheck`, `npm test`. Debug with the "Run Extension"
launch configuration in `.vscode/launch.json`. The automated tests check the CLI JSON protocol;
the Extension Development Host exercises the real editor workflow separately.

## Documentation and Change Discipline

- [README.md](README.md) is the user-facing overview. Keep implemented features and usage in sync
  with the code and manifest.
- [TODO.md](TODO.md) owns the ordered In Progress and Planned work and its acceptance criteria.
  Work on one bounded, authorized increment at a time. Update the queue before changing focus.
- [HISTORY.md](HISTORY.md) owns completed work in reverse chronological order. Record the date,
  outcome, source revision, verification and its limits. Link detailed evidence in its owning
  repository. Keep the work queue concise.
- Check a TODO item only after validating its stated scope. Record completion in HISTORY. Keep
  checked items visible while their section is open. Retire a completed section only when the
  owner asks.
- [STATUS.md](STATUS.md) is a dated snapshot of verified scope and limits. Refresh it only when
  explicitly requested. Match each claim to its evidence. Typecheck and compilation cover the
  scaffold. Extension Development Host, native workflow and release acceptance have separate gates.
- Commit, push or publish (Marketplace/Open VSX) only when the owner asks.

For shared contract changes, follow the
[CLI review procedure](https://github.com/webos21/crt-cli/blob/main/docs/compatibility.md#shared-change-review).
Identify the SDK and CLI versions, implemented capabilities and affected extension paths. Record
the exact SDK, CLI, editor and clangd combination when a workflow is exercised. CRT and the CLI
own SDK/CLI contract evidence. The extension owns editor acceptance.
