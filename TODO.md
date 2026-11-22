# TODO

This queue owns the current focus and planned work for V0-V4.
[HISTORY](HISTORY.md) records completed work and its verification.

## Notice

- Follow [AGENTS.md](AGENTS.md). Take one bounded, authorized increment at a
  time and update In Progress before changing focus.
- Check an item after validating its stated scope and recording the outcome in
  HISTORY. Keep checked steps until the section is complete. Retire a complete
  section only when the owner asks.
- Keep detailed results and per-host evidence in HISTORY or the owning
  acceptance document. Refresh [STATUS](STATUS.md) only when explicitly asked.

Reviewed on 2026-11-20 against local extension `b547406`, CLI `e362a51` and CRT
`278c5d9`: source/document inspection only, not an Extension Development Host
run or a new SDK/CLI adoption. [STATUS](STATUS.md) retains the existing evidence.
The first editor workflow uses a qualified SDK/CLI combination. CLI API
implementation and extension scaffold verification can proceed with the
existing SDK modes that have native evidence.

Task IDs are scoped to their topic heading. Refer to the repository and topic
when a prefix such as `P1` or `V1` appears under multiple headings.

## In Progress

### Prerequisite - Windows/arm64 replay of the pure C shared provider handoff (owned by `../crt` and `../crt-cli`)

Baseline:
[crt Tranche 6.4](https://github.com/webos21/crt/blob/main/TODO.md#p0---pure-c-shared-provider-policy-tranche-64--d5)
and
[crt-cli P1-01](https://github.com/webos21/crt-cli/blob/main/TODO.md#p1---producer-correctness-handoff-and-first-user-workflow-d5).
The scheduled `Integration` run
[44898897532](https://github.com/webos21/crt-cli/actions/runs/44898897532) on CLI `8374470`
failed only in `ports (win-arm64)` (`port-store-test`, concurrent publication: `cannot create lock
... Cannot create a file when that file already exists`, exit 0/1). This section records the
local replay on this Windows/arm64 machine. The extension does not own either fix.

- [x] **PRE-01** Local Windows/arm64 replay, recorded in [HISTORY](HISTORY.md) (2026-11-22). Result:
  CLI `8374470` from a clean `git archive`, the CI command
  (`tools/ci_integration.py ports --host win-arm64`) in a CI-equivalent private checkout
  (the first attempt failed `original-inputs-hidden` because the source copy had an ordinary
  ACL; that was a setup error, not a CLI/CRT result). All five port suites passed (build 36,
  store 97, oracle 21, command 33, project 83; no skips) with the pinned SDK
  `v0.0.1-preview.20261118.windows.arm64.1`, host-tools `20261119.windows-aarch64.1`, native
  ARM64 LLVM 22.1.8 and Python 3.11.9 arm64 (CI uses 3.12). The CI failure did not reproduce.
- [ ] **PRE-02** Concurrent-publication lock failure: two defects in `crt-cli` `Lock` reproduced and
  traced in isolation; the fix is open in `crt-cli`. `port-store-test` itself passed 10 of 10
  standalone repeats here, so the CI failure is a rare race. Method: the unmodified
  [store_lock.h](https://github.com/webos21/crt-cli/blob/main/include/crtcli/store_lock.h)
  `Lock` (scratch copy under `C:\crt-replay\lockstress`, pinned Windows/arm64 SDK, no change to
  any sibling repository), 2 processes x 1500 acquire/release of one lock directory with a 1 ms
  hold, an independent marker directory to detect two holders, and a per-process event log
  (timestamp, pid, event) merged by time. Result: 2977 acquisitions, 18 `create_directory`
  errors, 5 owner-write failures, 473 steals and 119 exclusion violations.
  - Defect 1, `create_directory` error treated as fatal (`require(!error, ...)`). The 18 errors
    were Win32 183 (`Cannot create a file when that file already exists`, the CI message; 7) and
    5 (`Access is denied`; 11). 15 of 18 occurred while the other process was inside its
    release `remove_all` (median 1.5 ms, p95 11 ms, max 41 ms), i.e. a create racing a delete.
  - Defect 2, `steal_if_dead` steals a live lock. All 473 steals read `owner` as unreadable or
    empty (pid 0, none from a dead owner). The creator's `create_directory` to `write_text(owner)`
    window had median 3.6 ms, p95 23 ms, max 79 ms. 284 steals landed strictly inside the
    holder's window (a live lock removed); 186 more were logged after the holder's owner write
    but the read happened earlier, so they are probably the same window (not proven); 3 had no
    other holder. 103 of the 119 violations were an acquisition made right after the violator's
    own pid-0 steal; the other 16 were not classified. The owner-write failures are the stolen
    creator noticing its directory is gone.
  - Not isolated: `release()` calls `remove_all` without checking that the directory is still
    its own (read from the code, not shown in the trace), so a holder whose lock was stolen may
    delete the new holder's lock.
  - A scratch patch (retry on `file_exists`/`permission_denied`, retry on owner-write failure, no
    steal of a young lock without a readable owner) removed all create/write errors and all
    violations at 2 processes (0 of 6000), but is not a fix: at 4 processes it still showed 1
    violation in 1600 (possibly two stealers racing remove-then-create, not traced) and runs were
    up to 7x slower (10 s grace on empty leftover directories).
  Requirement for `crt-cli` (do not work around it in the extension): choose a lock design that
  does not depend on directory-plus-pid stealing (for example an OS-held exclusive handle on
  Windows, whose release the OS handles), fix `Lock`, add a multi-process stress case to the
  tests, then rerun the scheduled Integration job. The stress loop is far harsher than real
  use; it shows the defects exist, not how often CI hits them. POSIX behavior of the same code
  was not tested, and the CLI's SDK store uses the same `Lock`. Evidence stays outside this
  repository: `C:\crt-replay\lockstress` (`merged.txt`, `analyze.py`), one machine, one run.- [ ] **PRE-03** Scope limit: this replay exercises CLI changes `f1977a2` and `d729d29` against the
  existing Windows/arm64 SDK. The CRT pure C shared fix (`19bdf36`) is Linux-only (`crt-cc`),
  so there is no new Windows SDK candidate and Tranche 6.4's macOS/Windows replay of a new
  SDK stays open in CRT/CLI. Do not cite this replay as C shared qualification on Windows.
- Acceptance: PRE-01 is in HISTORY with exact identities and limits; PRE-02 is closed by
  `crt-cli` evidence (not by this repository); only then treat the Windows/arm64 CLI baseline
  as stable for V1-06 on this host.

### V0 - CRT-CLI Contract (owned by `../crt-cli`; requirements only here)

CLI baseline:
[implemented CLI command contract](https://github.com/webos21/crt-cli/blob/main/docs/reference/bootstrap_contract.md#commands-and-results)
. Proposed APIs and acceptance fixtures are tracked by
[crt-cli P0-01 through P0-04](https://github.com/webos21/crt-cli/blob/main/TODO.md#p0---minimal-public-editor-api-d7-slice-coordinated-with-d5d6)
.

- [ ] **V0-01** Agree proposed `crt-cli export compile-commands --output <file>` with the
  [CLI queue](https://github.com/webos21/crt-cli/blob/main/TODO.md): emit C/C++
  entries from the actual build plan with working directory, source, target,
  sysroot, standard-library headers, macros and language standard; exclude
  linker options/startup objects. Refresh against exact SDK/lock changes.
- [ ] **V0-02** Agree proposed `crt-cli project info --json` for project/SDK/profile/target,
  lock identity, build output/executable and unresolved/incompatible states.
- [ ] **V0-03** Agree schema versions, capability discovery and failure/exit semantics.
  `export` and `project info` are not implemented; the current `supports()` help
  substring check is only a provisional guard, not a versioned capability API.
- [ ] **V0-04** Adopt the existing global `--json` final envelope, including `build --json`.
  Keep logs/child output on stderr; defer job/progress events until a separate
  opt-in stream/file protocol exists. Do not list final build JSON as missing.
- Acceptance: CLI-exported entries match real C/C++ compilation and queries are
  read-only. Preserve manifest/lock pins; missing SDK/tools or unsupported CLI
  capabilities produce actionable messages, not an extension-side flag builder.

### V1 - Extension MVP

Existing evidence is recorded in [HISTORY](HISTORY.md#add-the-typescript-extension-scaffold).
Run the editor gates below with the [Run Extension launch configuration](.vscode/launch.json).
V1-03 and V1-04 use the V0 capability and envelope contract. V1-08 takes project state
from
[crt-cli P0-02](https://github.com/webos21/crt-cli/blob/main/TODO.md#p0---minimal-public-editor-api-d7-slice-coordinated-with-d5d6)
, V1-09 takes the compilation database from
[crt-cli P0-01](https://github.com/webos21/crt-cli/blob/main/TODO.md#p0---minimal-public-editor-api-d7-slice-coordinated-with-d5d6)
, and V1-10 records the exact combination for
[crt-cli D7-02](https://github.com/webos21/crt-cli/blob/main/TODO.md#d7---developer-tool-integration)
.

- [x] **V1-01** Project scaffold, typecheck passes
- [x] **V1-02** Activation on `crt.json`, Build/Test/Run/Doctor commands, TaskProvider (code only)
- [ ] **V1-03** Resolve/show CLI path and version, honor `crt.cliPath`, and check supported
  capabilities; do not silently use an arbitrary PATH binary. Handle missing or
  incompatible executables with concrete setup guidance.
- [ ] **V1-04** Harden `src/cli.ts`: parse the entire single final JSON object, validate
  schema/format/command/ok, and reconcile exit/spawn errors with the result.
  Reject mixed/trailing output; surface stderr and malformed/unsupported replies.
- [ ] **V1-05** Verify Workspace Trust for command and manually resolved task paths,
  including trust changes. Opening a workspace must not download SDKs or execute
  port recipes; explicit workflow actions must disclose required acquisition.
- [ ] **V1-06** Verify Build/Test/Run/Doctor with a real `crt-cli` in an Extension
  Development Host; distinguish code presence from exercised behavior.
- [ ] **V1-07** Add a compiler problem matcher after checking real CLI task output.
- [ ] **V1-08** Show SDK/target/lock state from V0 `project info`, including missing inputs.
- [ ] **V1-09** Generate/refresh the compilation database using V0 export (manual guarded
  command exists); detect/guide clangd and configure its database location.
- [ ] **V1-10** Vertical check on Linux/x86_64 with a small C++ project: completion,
  go-to-definition, diagnostics vs real build, build, test and run. Record
  `--query-driver` and system-header settings; do not infer clangd accuracy.
- Acceptance: the Linux C/C++ workflow works in the Extension Development Host,
  selected CLI/SDK identities are visible, unsupported capabilities and untrusted
  workspaces are handled, and failures retain their actual diagnostics.

## Planned

### V1 follow-up - Native replay

Repeat the [Linux V1-10 gate](#v1---extension-mvp) on each named host. The
[CLI Preview record](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/preview_acceptance.md)
supplies candidate inputs. Link measured editor runs to
[crt-cli D7-02](https://github.com/webos21/crt-cli/blob/main/TODO.md#d7---developer-tool-integration)
.

- [ ] **V1-01** Replay the accepted vertical workflow on macOS/arm64 and Windows/x64;
  record exact SDK/CLI/clangd/editor versions and native outcomes. Other host
  pairs, Cursor and VSCodium need their own editor evidence.
- Acceptance: one-click C/C++ development on three OSes, without claiming wider
  editor/architecture coverage from the CLI's five-host Preview records.

### V2 - Project UX

Input baselines:
[D2 installed-SDK acceptance](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md)
for V2-01,
[bounded D3 port command replay](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md#port-command-d3-linuxx86_64-2026-11-09)
for V2-02 and
[crt-cli P0-01 through P0-03](https://github.com/webos21/crt-cli/blob/main/TODO.md#p0---minimal-public-editor-api-d7-slice-coordinated-with-d5d6)
for V2-03 and V2-04. The extension still needs to verify display and refresh against the
selected CLI.

- [ ] **V2-01** SDK status from implemented `sdk list --json` results; validate its current
  envelope/data contract before presenting an installed/selected SDK view.
- [ ] **V2-02** Port list from implemented `port list --json`; represent the current bounded
  D3 scope honestly. SQLite/libpng resolution remains CLI D4 work.
- [ ] **V2-03** Detect `crt.lock` changes and offer to refresh compile_commands.
- [ ] **V2-04** Error/diagnostic display, reusing the CLI's structured failure information.
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

### V4 - Distribution

The [package script](package.json) is the current entry point. V4-01 through V4-04 use
the clean install gate below before reporting distribution acceptance.

- [ ] **V4-01** VSIX packaging: `package.json` has a `vsce package` script, but the `vsce`
  dependency/tool and an installable artifact still need setup and verification.
- [ ] **V4-02** CI for typecheck/compile/package and an external-user install/run check.
- [ ] **V4-03** Icon/metadata and CHANGELOG.
- [ ] **V4-04** Publish to Marketplace / Open VSX only when the owner asks.
- Acceptance: a verified VSIX installs and runs in a clean supported editor.

### Verification tooling

Verify the proposed mock cases against the V0 envelope and V1 trust/exit handling. The
mock and native runs have separate evidence. No test runner is recorded in the scaffold
evidence.

- [ ] **TEST-01** Add a focused test framework (e.g. `@vscode/test-electron`) and CLI mock for
  envelope/version/exit failures and untrusted-workspace behavior; keep real
  Extension Development Host and native CLI replay as separate gates.

### Long-term standalone Studio

Standalone scope and future gates are owned by the
[Studio staged goals](https://github.com/webos21/crt/blob/main/docs/design/crt_studio.md#5-staged-goals)
.

- [ ] **STUDIO-01** `crt-studio` stays Planned in its own repository. This extension is the
  first editor consumer of generic CLI APIs and does not replace the native IDE.
