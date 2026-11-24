# Project Status

Reviewed on **2026-11-24** at extension `e418379`, with CLI `af849da`
and CRT `88b172c` as reference checkouts. This is a documentation review,
not a new editor or native test run.
[Work queue](TODO.md) · [Completed work](HISTORY.md).

## This Repository

| Item | Evidence and scope |
| --- | --- |
| Scaffold | Private package version `0.0.1`, TypeScript and a **Run Extension** launch configuration. Typecheck and compile passed on 2026-11-20 and again in the [physical Windows/x64 prerequisite replay](HISTORY.md#replay-the-synchronized-pal-prerequisites-on-physical-windowsx64). |
| Commands and tasks | Source registers Build/Test/Run/Doctor and the `crt` task provider. The status bar opens project Doctor. Real CLI execution in the Extension Development Host remains unverified. |
| CLI selection and trust | The source honors `crt.cliPath` and falls back to `crt-cli` on PATH. Command handlers and task discovery check Workspace Trust. Manually resolved tasks, trust changes and explicit SDK-acquisition consent are V1 acceptance cases. |
| JSON and export | The export command uses a provisional help-text check. The parser currently reads the last stdout line. Strict validation of the final result and exit handling are open. Export and clangd refresh await the CLI contract. |
| Tests and distribution | No automated extension suite or verified VSIX is recorded. The manifest has a package script. Packaging, clean install and release remain V4 work. |

## CLI Dependencies (from `crt-cli`)

- The CLI implements `new`, `configure`, `build`, `test`, `run`, scoped
  `doctor`, SDK commands and the bounded D3 zlib port workflow. Global
  `--json`, including `build --json`, emits one final
  `crt-cli.bootstrap-result` object, format 1.
  [Implemented contract](https://github.com/webos21/crt-cli/blob/main/docs/reference/bootstrap_contract.md#commands-and-results).
- `export compile-commands`, `project info --json` and structured capability
  discovery remain proposed. The CLI's D6 queue owns the separate progress
  event protocol. V0 tracks the extension's requirements and fixture adoption.
  [V0](TODO.md#v0---crt-cli-contract-owned-by-crt-cli-requirements-only-here).
- The five recorded CLI Preview host pairs supply candidate CLI/SDK inputs.
  Editor verification records its own CLI, SDK, clangd and editor identities.
  [CLI Preview evidence](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/preview_acceptance.md).
- CRT closed the focused PAL queue. The PAL-04 packages and native shared
  consumer examples are producer evidence, not editor, clangd or debugger
  verification. They do not change the extension's candidate inputs.
  [Producer package replay](https://github.com/webos21/crt/blob/88b172cf153a8b786fc98a8e17872ebce8b0efa2/docs/acceptance/crtui_acceptance.md#windowsarm64-packaging-and-closure-replay-2026-11-24).

## Limits

V1 first verifies CLI selection, Workspace Trust, Build/Test/Run/Doctor and
clangd diagnostics in a Linux/x86_64 Extension Development Host. macOS and
Windows end-to-end replay follows. Windows debugging requires a separate
native debugger session covering CRT DWARF exceptions, emulated TLS and the
packaged runtime. V2 project UX, V3 debugging and V4 distribution remain
in the planned queue.
[Extension MVP](TODO.md#v1---extension-mvp) · [Planned work](TODO.md#planned).
