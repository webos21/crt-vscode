# TODO

This queue owns the current focus and planned work for V0-V4.
[HISTORY](HISTORY.md) records completed work and its verification.

## Notice

- When the same task ID appears in In Progress and Planned, record the
  verification in HISTORY and link it from both entries in the same update.
  Check both entries together once the evidence satisfies both scopes. If only
  the release scope passes, check the In Progress entry and keep the follow-up
  open with a link to the release evidence.
- Follow [AGENTS.md](AGENTS.md). Take one bounded, authorized increment at a
  time and update In Progress before changing focus.
- Check an item after validating its stated scope and recording the outcome in
  HISTORY. Keep checked steps until the section is complete. Retire a complete
  section only when the owner asks.
- Keep detailed results and per-host evidence in HISTORY or the owning
  acceptance document. Refresh [STATUS](STATUS.md) only when explicitly asked.

The completed V0 and Linux V1 evidence is linked below. The 0.5.0 queue tracks
native replays and installation of the exact VSIX release candidate.
[STATUS](STATUS.md) retains its dated evidence snapshot.

Task IDs are scoped to their topic heading. Refer to the repository and topic
when a prefix such as `P1` or `V1` appears under multiple headings.

## Done

See [`HISTORY.md`](HISTORY.md) for the full, dated, reverse-chronological
record of completed work. This section stays empty in `TODO.md` itself. Finished
top-level work moves to `HISTORY.md`; terse checked prerequisite gates may remain
under an active tranche only to make its execution order legible.

<!-- Keep the anchor used by STATUS and the CLI handoff history. -->
<a name="v0---crt-cli-contract-owned-by-crt-cli-requirements-only-here"></a>

[Completed V0 editor API adoption](HISTORY.md#adopt-crt-cli-editor-api-1).

<!-- Keep the anchor used by the SDK, CLI and extension documentation. -->
<a name="v1---extension-mvp"></a>

[Completed Linux V1 editor workflow](HISTORY.md#retire-the-completed-linux-extension-mvp).

## In Progress

### Release 0.5.0 - VS Code Extension

Use the [Linux V1-10 workflow](HISTORY.md#verify-the-linux-clangd-workflow-v1-10)
as the behavior baseline. Use the exact SDK and Editor API 1 CLI candidates
selected in the
[CRT release queue](https://github.com/webos21/crt/blob/main/TODO.md#release-050---dev-sdk-and-host-tools)
and
[CLI release queue](https://github.com/webos21/crt-cli/blob/main/TODO.md#release-050---standalone-cli).

#### V1 follow-up - Native replay

- [ ] **V1-01** (R05-05) Replay the Linux workflow on macOS/arm64 first, then
  Windows/x64. Record the SDK, CLI, VS Code and clangd versions and runtimes.
  Verify Build/Test/Run/Doctor, workspace trust and acquisition consent,
  project state, the compilation database and clangd diagnostics. Record
  `--query-driver` and the effective header configuration where applicable.

#### V4 - Distribution

- [ ] **V4-01** (R05-05) Set the extension version to 0.5.0 and produce a VSIX
  with the [package script](package.json). Pin the packaging tool and check the
  manifest, built extension files and license in the archive.
- [ ] **V4-02** (R05-05) Run typecheck, protocol tests and VSIX packaging in CI.
  Install the exact candidate VSIX in a clean VS Code profile on Linux/x86_64,
  macOS/arm64 and Windows/x64. Replay the supported workflow, including the
  explicit CLI path and the no-acquisition-on-open behavior. Use that same
  verified artifact for publication.
  Linux/aarch64 is not one of these editor hosts: on that machine only the typecheck and the three protocol tests were run (Node 24.22.3), with no VS Code, clangd
  or VSIX replay ([record](https://github.com/webos21/crt/blob/main/docs/acceptance/release_qualification.md#linuxaarch64-dev-sdk-050-rc1-2026-11-26)); do not advertise it.
- [ ] **V4-03** (R05-05) Prepare the icon, extension metadata and CHANGELOG.
  State Editor API 1 and SDK requirements and list the verified editor hosts.
- [ ] **R05-06** Record VSIX identity, digest and the exercised editor
  combinations in the
  [CLI compatibility ledger](https://github.com/webos21/crt-cli/blob/main/docs/compatibility.md#adoption-and-exercised-combinations).
  Publish the approved VSIX through GitHub Releases after the corresponding
  signed SDK and CLI are public. Advertise only the verified editor hosts.

## Planned

### V2 - Project UX

Input baselines:
[D2 installed-SDK acceptance](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md)
for V2-01,
[bounded D3 port command replay](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md#port-command-d3-linuxx86_64-2026-11-09)
for V2-02 and
[the public editor API contract](https://github.com/webos21/crt-cli/blob/3733aeb108bcad5ba45f9feec234330d5c4ddbc4/docs/reference/bootstrap_contract.md#public-editor-api-version-1)
for V2-03 and V2-04. The extension still needs to verify display and refresh against the
selected CLI.

- [ ] **V2-01** SDK status from implemented `sdk list --json` results; validate its current
  envelope/data contract before presenting an installed/selected SDK view.
- [ ] **V2-02** Port list from implemented `port list --json`; represent the current bounded
  D3 scope honestly. SQLite/libpng resolution remains CLI D4 work.
- [ ] **V2-03** Detect `crt.lock` changes and offer to refresh compile_commands.
- [ ] **V2-04** Improve the presentation and recovery actions for broader
  structured CLI failures. Build on the existing Project Info diagnostics and
  Clang problem matcher.
- Principle: SDK downloads and port builds only with user consent; honor Workspace Trust.
- Acceptance: displayed state matches actual CLI state and exact project pins.

### V3 - Debugging

Coordinate executable/debug-tool discovery with
[crt-cli D7-01](https://github.com/webos21/crt-cli/blob/main/TODO.md#d7---developer-tool-integration)
. Use the
[CRT C++ runtime ABI](https://github.com/webos21/crt/blob/main/docs/design/cxx_runtime.md)
for Windows fixture requirements. Passing runtime tests are prior evidence. Verify the
actual debugger and editor session on each advertised host. Verify any formatter or
linter scope separately under V3-04.

- [ ] **V3-01** Debugger selection (Linux: LLDB/GDB, macOS: LLDB).
- [ ] **V3-02** Executable discovery and Debug Configuration provider via a reviewed CLI
  contract; do not infer output paths from `crt.json`.
- [ ] **V3-03** Windows: choose a debugger that passes CRT ABI validation (DWARF
  exceptions, emutls, own runtime); validate before claiming support.
- [ ] **V3-04** Decide clang-format / clang-tidy integration scope.
- Acceptance: native debug acceptance per OS, with the exercised tool/runtime identities.

### Publication to extension registries

- [ ] **V4-04** Publish to Marketplace / Open VSX only when the owner asks.
  The GitHub Releases VSIX is the initial 0.5.0 distribution channel.

### Verification tooling

Use the existing Node protocol tests as a baseline for a future reusable
editor acceptance harness. The release VSIX replay in V4-02 records native
evidence separately.

- [ ] **TEST-01** Add a focused test framework (e.g. `@vscode/test-electron`) and CLI mock for
  envelope/version/exit failures and untrusted-workspace behavior; keep real
  Extension Development Host and native CLI replay as separate gates.

### Long-term standalone Studio

Standalone scope and future gates are owned by the
[Studio staged goals](https://github.com/webos21/crt/blob/main/docs/design/crt_studio.md#5-staged-goals)
.

- [ ] **STUDIO-01** `crt-studio` stays Planned in its own repository. This extension is the
  first editor consumer of generic CLI APIs and does not replace the native IDE.
