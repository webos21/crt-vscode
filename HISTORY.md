# HISTORY: CRT for VS Code Completed Work

Dated record of completed work, newest first. [TODO](TODO.md) owns the active
and planned queue. [STATUS](STATUS.md) summarizes the evidence at its review
baseline. Entries link to the source revision and relevant acceptance evidence
and state the scope of the checks performed.

## 2026-11-26

### Run the native Windows/arm64 Extension Development Host

VS Code 1.147.0 (`8a14f0cc1b08d531eb83255ea3764ae22aa932b5`) reports
`win32/arm64` inside the actual extension host on physical Windows build
26300. The portable ARM64 ZIP SHA-256 is
`d77737304e9856afb63ea240ddb164a065f83aad31aa4595fe4c685513755c26`. Windows
reports a valid Microsoft Authenticode signature for `Code.exe`. The
extension is version `0.0.1` from source `b272297471f700dec4a54ca990dbf363c43ad756`.
Typecheck, compilation and the three protocol tests pass with native Node
24.22.3, whose ZIP matches `SHASUMS256.txt`.

**Restricted Mode.** An isolated user-data and extensions directory and a
disposable C++ workspace exercise the source extension through the VS Code
extension tests API. The extension activates and registers all seven public
commands. Invoking all seven with `workspace.isTrusted == false` preserves
the unresolved `crt.lock` byte for byte and creates no build output. The
configured CLI for this negative control is the retained signed Windows/arm64
Preview with executable SHA-256
`132c8b5ae15f66ed9dd82fcb5a425160e4d682c008ab218353b7eed30f6d3db8`. The
observer checks filesystem effects. It does not measure child process starts.
The extension test host exits 0.

**Trusted workspace.** The regular Extension Development Host uses the same
profile with a separate observer development extension. The user grants
workspace trust for the disposable project and approves the Build dialog.
The observer invokes commands through the public VS Code API and records
their task exits. It leaves the extension and CLI binaries unchanged. The
fixture is a C++ project in a path with a space and Hangul. The candidate
SDK was installed from the verified local archive before opening VS Code.
The exact CLI digest is
`b982f755d2796cd99d1f35c3fea207eb485bee07c72b69159de2f6b63789f629` and the
SDK content digest is
`7ed3afd11b02de097e524d1bb7ac60dacfca2d160bf30ccb90894707ac208b31`.
[Producer qualification](https://github.com/webos21/crt/blob/main/docs/acceptance/release_qualification.md#windowsarm64-dev-sdk-050-rc1-2026-11-26).

- Activation, CLI Info and Project Info leave the unresolved lock intact.
  Build, Test, Run and project Doctor exit 0. The first build binds the
  checked candidate. A direct warm CLI build reuses all three steps with
  zero executed and keeps the resolved lock unchanged.
- `CRT: Export compile_commands.json` produces four entries for
  `aarch64-w64-mingw32`. All source paths exist and the arguments preserve
  `-nostdinc++`. Native clangd 22.1.8 with the pinned clangd extension
  0.6.0 resolves `std::vector::size` into the installed SDK's libc++
  `__vector/vector.h`. No error diagnostics are reported in the fixture
  and `--query-driver` is unset.

The first trusted attempt used VS Code's `--extensionTestsPath` mode, which
refused the confirmation dialog. The failed run remains in `editor-host.log`.
The ordinary Development Host rerun reaches the real dialog and passes.
The fixture tests preinstalled SDK selection and the C++ workflow. Release
VSIX installation, SDK download, trust revocation, canceled builds and
debugging are separate cases.

This Development Host evidence is supplemental to the 0.5.0 editor support
matrix. An installed release VSIX remains a separate V4-02 run on the stated
hosts. Local evidence is under `C:\Users\cmjo\DevWorks\crt\out\rc050-arm64\`.
Restricted Mode receipt `editor-restricted/checks.jsonl` SHA-256 is
`bf82be4407d10232bb8868dabcfccce15bd08f77277297799b28cb8403f3d4ea7`.
Trusted receipt `editor-live-checks.jsonl` SHA-256 is
`bce2fb6dcee35433482f1217e8d2150e2f88eb3be1576ca46ca26a3426afe875`.

### Replay the editor workflow on Windows/x64 (V1-01)

Extension source at `de1f1fb` (unchanged from `cadea6e`; typecheck and the three protocol tests pass with Node 24.22.3, whose zip matches the published `SHASUMS256.txt`; the host's Node 17.9.1 cannot run `node --test`).
Host: Windows 11 Pro 10.0.26100 x64, VS Code 1.147.0 (`8a14f0cc1b08d531eb83255ea3764ae22aa932b5`), LLVM clangd extension 0.6.0 (VSIX SHA-256 `32030694fa6c0ef438f4e4219f84677cd32f603c7faa4c71a283efc1f5b51751`, equal to the Open VSX digest), upstream clangd and clang 22.1.8, Windows SDK `10.0.28000.0`.
The CLI is the CRT `v0.5.0-rc.1` Windows/x64 candidate build of CRT-CLI `2644716` (`95b6f99a355709d7d62f65575afdc59f106b4e782b5df235a5cded0008683d18`) and the installed SDK is that candidate, content `07e901ab0439d324702b298b51ff2946a3c4557976a3fc2121af367d30332831`
([CRT inputs](https://github.com/webos21/crt/blob/main/docs/acceptance/release_qualification.md#windowsx64-dev-sdk-050-rc1-2026-11-26)). It is unsigned and installed from the local handoff; first builds resolved it from the store without a download.

The Extension Development Host used a private HOME, user-data and extensions directory, with `window.dialogStyle: custom` (so the modal dialogs are window elements the driver can press), `security.workspace.trust.startupPrompt: never` and `task.allowAutomaticTasks` only for the folder-open case. Editor buttons were pressed in the live window through the Chrome DevTools protocol. A separate observer development extension invoked commands and read task exits,
diagnostics, completion and definitions through the public API; it does not stub or patch the extension under test. `crt.cliPath` named a native wrapper that records each call and its exit, then relays the unmodified CLI. Project tools came from the ignored `.sdk.json`, and `CRT_WINDOWS_SDK_LIBPATH` from the editor's environment. Paths contain a space and Hangul.
**All 47 recorded checks pass** in the main run; a second run on a never-trusted project repeats 14 of them (trust, consent and the approved first build) with the window's input trace saved.

- **Trust and consent.** In Restricted Mode the workspace override of `crt.cliPath` is ignored, all seven commands are blocked and neither CLI (nor a second recording decoy) runs; canceling VS Code's task-listing trust prompt keeps it so. Trust is granted, revoked (the extension host restarts untrusted and the commands are blocked again) and re-granted with the editor's own buttons, and granting runs nothing. `CRT: Build`, a `tasks.json` build and a folder-open build each ask first and disclose that a first build can download and install the pinned SDK; canceling runs no build (`CRT: Build` keeps its read-only version probe).
- **C and C++ tasks.** CLI Info, unresolved Project Info and the first-build Doctor leave the lock and binding alone. Approved cold builds exit 0 and bind the candidate; Test, Run (program output) and the configured Doctor exit 0, and warm builds execute nothing and reuse all three steps with the same lock (the cold receipt's three executed steps were read for C++ only).
- **Diagnostics and database.** An undeclared identifier (2:9) and a real `#warning` reach CRT Problems with paths that exist, the failed build keeps the lock and a clean build clears them. The four exported argument arrays equal the editor-launched app and test compile commands, dependency-file options aside. A nonstandard filename gets guidance; a missing output parent is refused with the CLI's `output parent must be an existing directory`; a custom directory offers **Configure clangd** and `.clangd` is written only after it; an existing `.clangd` keeps its contents and gets the exact setting; without the clangd extension the export offers **Find clangd** (C fixture, where `clangd --check` also accepts all three sources).
- **clangd.** The only argument is `--log=verbose` (`--query-driver` unset). With only the custom-directory database, a restarted clangd loads it, resolves a project symbol and `<vector>` and `<stdio.h>` into the installed SDK, completes `size` and `push_back`, reports the same undeclared identifier at 2:9 as the build and clears it. The parse command keeps `-nostdinc`, `-nostdinc++`, the SDK libc++ and C `-isystem` paths and `-resource-dir=.../LLVM/lib/clang/22`.

**Input integrity.** The main run did not save the window's input trace before closing, so it cannot by itself exclude other input. In the repeated run the trace holds exactly the driver's eight presses (task-prompt Cancel, Trust, Don't Trust, Trust, three build Cancels and one Build) and no other. The owner was asked not to touch the window.

**Excluded attempts, kept.** The first database comparison read warm build receipts, which list no compile commands; it passes with the build outputs removed so Build and Test compile. The first diagnostics run showed the Hangul path as mojibake in CRT Problems: the harness wrapper wrote the CLI's UTF-8 bytes to the task console, which Korean Windows decodes as CP949. Pointing `crt.cliPath` directly at the CLI gave a correct path to an existing file, the wrapper was fixed to write UTF-16 to a console, and the check was rerun requiring that every reported file exists. A harness edit that broke the driver module stopped one rerun attempt before any step or click.

**Limits.** Source-checkout extension, not a VSIX or a clean installed profile (V4-02). Commands were invoked through the API, not typed into the Command Palette; completion and definition were read through VS Code's provider commands. The first build's SDK download itself was not exercised (the candidate was preinstalled). Not Linux/macOS (see their records), Windows/arm64, Cursor, VSCodium or debugging.

Evidence stays outside the checkouts in `C:\Users\Lee\s15\` (`harness/` driver, observer and wrapper; `run/logs/` per-call CLI output, `checks.jsonl` SHA-256 `de02b3f7baedea907097c4d0b4ab77a090104aa32145872ea27b2f5df2d88d1a`, `checks-main.jsonl`, input traces, screenshots, `clangd.log`).

### Replay the editor workflow on macOS/arm64 (V1-01)

The extension source is `cadea6e` (compiled with Node 26.13.1; typecheck and the three protocol tests
pass; the extension source is unchanged). Host: macOS 27.2.1 (26B131) arm64, VS Code 1.148.0
(`661626d0e72f97806550790a98fb87116c9db825`), LLVM clangd extension 0.6.0, Apple clangd 21.0.0 and
Apple clang 21.0.0 (Xcode 27.2). The CLI is the CRT `v0.5.0-rc.1` candidate build of CRT-CLI `8942a35`
(`4e4b0ac317de4e9d4bd64e0017697493049fafd7562fa092a33b3ea0d9306a24`) and the installed SDK is that
candidate, content `6f64de079bdce8fc785834375711409de5dacbc7b5b7d9d99f9117ac3d57fb0f`
([CRT inputs](https://github.com/webos21/crt/blob/main/docs/acceptance/release_qualification.md#macosarm64-dev-sdk-050-rc1-2026-11-26)). It is unsigned and
installed from the local handoff; first build did not download anything.

The Extension Development Host used a private HOME, user-data and extensions directory. Dialog,
trust-editor and notification buttons were clicked in the live window through the Chrome DevTools
protocol. A separate observer development extension invoked commands and read task exits,
diagnostics, completion and definitions through the public API; it does not stub or patch the
extension under test. `crt.cliPath` named a wrapper that records each invocation and its exit and
then runs the unmodified CLI. **54/54 recorded checks pass** in paths with a space and Hangul.

- **Trust and consent.** In Restricted Mode the workspace override of `crt.cliPath` is ignored, all
  seven commands are blocked and neither CLI runs; canceling VS Code's task-listing trust prompt
  keeps it so. Trust is granted and revoked with the editor's own buttons, and granting it runs
  nothing. `CRT: Build`, a `tasks.json` build and a folder-open build each ask first; canceling runs
  no build (`CRT: Build` keeps its read-only version probe). The dialog discloses that a first build
  can download and install the pinned SDK.
- **C and C++ tasks.** CLI Info, unresolved Project Info and first-build Doctor leave the lock and
  binding alone. Approved cold builds execute three steps against the candidate; Test, Run (program
  output) and configured Doctor exit 0, and warm builds reuse all three steps with the same lock.
- **Diagnostics and database.** An undeclared identifier and a real warning reach CRT Problems and a
  clean build clears them. The four exported argument arrays equal the compile commands of the
  editor-launched app and test builds, dependency-file options aside. A nonstandard filename gets
  guidance; `.clangd` is written only after **Configure clangd**; an existing one is kept; without
  the clangd extension the export offers **Find clangd** (C fixture, where Apple clangd `--check`
  also accepts all three sources).
- **clangd.** The only argument is `--log=verbose` (`--query-driver` unset). It resolves a project
  symbol, resolves `<vector>` and `<stdio.h>` into the installed SDK, completes `size` and
  `push_back`, and reports the same undeclared identifier at 2:10 as the build, then clears. The
  parse command keeps `-nostdinc` and `-nostdinc++`, and uses Xcode's
  `-resource-dir=.../usr/lib/clang/21`. With only the custom-directory database, a restarted clangd
  still resolves the SDK headers without diagnostics.

Observation: a database output whose parent directory does not exist is refused by the CLI
(`output parent must be an existing directory`); the extension shows that error and creates nothing.

**Input integrity and excluded attempts.** In two early attempts the folder became trusted without
any driver click. The owner confirmed afterwards that they approved the trust prompt themselves in
the test window, which was visible on their working desktop and had not been announced as
driver-controlled. With input tracing added, the same `fetchTasks` call showed VS Code's trust dialog
and stayed pending without input, which agrees with that. Neither attempt is counted. In the
counted sessions the trace also holds four clicks the driver did not make (dialog body, editor
background, explorer and status bar). None was on a trust, Build or Cancel button, and the checks of
button-granted trust and of build consent require exactly the driver's click in their window. Other
discarded runs were driver errors: assuming JSON output from the editor's non-JSON tasks (the build
receipt is read instead) and a missing database output directory.

**Limits.** Source-checkout extension, not a VSIX or a clean installed profile (V4-02). Commands were
invoked through the API, not typed into the Command Palette. Completion and definition were read
through VS Code's provider commands. The Linux replay used upstream clangd 21.1.8; this one used
Apple clangd. Not Windows/x64, Cursor, VSCodium or debugging.

Evidence stays outside the checkouts in `crt-release-050-macos-arm64-20261126/vscode/` (driver,
observer, per-call CLI output, input traces, screenshots, clangd logs); `logs/checks.jsonl` SHA-256
`24adc2593e83df433ef1586d7fbaf22eedbfb654eb698e78f5efa0854da9a3f8`.

### Retire the completed Linux Extension MVP

Removed V1-01 through V1-10 from In Progress after reviewing the completion
evidence in extension `36568fc`, with CRT `584603fb` and CLI `dedd4ae` as the
synchronized reference checkouts. The Linux/x86_64 Extension Development Host
passed real Build/Test/Run/Doctor and the scoped clangd workflow. The runs
used the exact CLI and SDK recorded below.
[Native CLI task replay](#verify-native-cli-tasks-in-the-development-host-v1-06) ·
[Linux clangd replay](#verify-the-linux-clangd-workflow-v1-10).

The macOS/arm64 and Windows/x64 editor runs and VSIX distribution are tracked
in the [0.5.0 release queue](TODO.md#release-050---vs-code-extension).

### Verify the Linux clangd workflow (V1-10)

The synchronized checkouts were CRT `584603fb`, CRT-CLI `dedd4ae` and
extension `aef5016` with the local V1-07 through V1-09 changes. The native
Linux/x86_64 run used VS Code 1.105.1 (`7d842fb85a0275a4a8e4d7e040d2625abbf7f084`),
the LLVM clangd extension 0.6.0, upstream clangd 21.1.8 (`2078da43e25a`),
and the exact installed SDK, CLI and Ubuntu LLVM identities from V1-06.

In a fresh C++17 fixture, Doctor and the approved first Build passed. clangd
loaded the exported database from the configured `editor database` directory,
offered `std::vector::size` completion and resolved `greeting` to its source
definition. Test and Run exited 0. All four exported argument arrays matched
the app and test compiler invocations. For a deliberate undeclared identifier,
clangd and the build reported an error at line 8, column 12. The build exited 1
and preserved the lock. Restoring the source returned build to exit 0 and
cleared diagnostics from both sources. The first completion assertion missed
clangd's leading space in the label. The completed replay verifies the same
completion using the trimmed label.

The only clangd argument was `--log=verbose` (`--query-driver` unset). The
project configuration only set `CompileFlags.CompilationDatabase`, leaving
`BuiltinHeaders` at `Clangd`. The effective parse command retained `-nostdinc`,
`-nostdinc++`, and the exported `-isystem` paths for the SDK's libc++ and C
headers and `/usr/lib/llvm-21/lib/clang/21/include`. clangd logged its own
`-resource-dir` under the upstream 21.1.8 distribution and resolved `<vector>`
and `<cstdio>` to the installed CRT SDK. The diagnostics comparison covers this
fixture's clean and deliberate-error cases.
[clangd header configuration](https://clangd.llvm.org/config.html#builtinheaders).

The receipt, compiler arguments and verbose server log are under
`/home/syszone/crt-vscode-v1-06-20261126.yYPIW8/` in `vertical-r2-result.json`,
`vertical-r2-receipts.json` and `vertical-r2-clangd.log`.

### Connect the exported database to clangd (V1-09)

The manual export still delegates database generation and refresh to Editor
API 1. The default output works with clangd's project-root discovery. A
custom directory can be recorded in `.clangd` after approval. An existing
configuration gets the exact setting to edit and retains its contents.
If the clangd extension is absent, the export offers its extension search.

Linux/x86_64 VS Code 1.105.1 with the V1-06 CLI and SDK passed six checks
with and without the LLVM clangd extension 0.6.0. The replay covered all four
database entries, refresh, a custom directory with a space, and filename
guidance for nonstandard exports. Typecheck and all protocol tests passed.
Receipts `database-absent-result.json` and `database-installed-result.json`
are under `/home/syszone/crt-vscode-v1-06-20261126.yYPIW8/`.
[clangd compilation database configuration](https://clangd.llvm.org/config.html#compilationdatabase).

### Show project binding and missing inputs (V1-08)

Project Info adds a readable summary alongside the CLI report. The summary
shows the selected SDK and content digest, native target, declared targets,
lock state and CLI diagnostics. For an unresolved project it also runs the
read-only project Doctor check and shows the first-build guidance.

The Linux/x86_64 VS Code 1.105.1 host reused the V1-06 CLI and SDK and checked
five cases: ready, a mismatched contract digest, unresolved with valid inputs,
unresolved with a missing SDK selection, and an absent lock. The commands
preserved the lock and local binding bytes where present and left missing
files absent. Typecheck and all protocol tests passed. The receipt is
`/home/syszone/crt-vscode-v1-06-20261126.yYPIW8/summary-result.json`.

### Publish native Clang diagnostics in Problems (V1-07)

Added the CRT Clang problem matcher to Build, Test and Run tasks. It uses
the absolute filename, line, column and severity from the CLI's native output.
The Linux/x86_64 VS Code 1.105.1 replay reused the V1-06 CLI, SDK and fixture.
A command-palette build showed the compiler error at line 1, column 21. A
`tasks.json` build replaced it with the real warning at line 1, column 2.
A successful clean build cleared CRT Problems. The test waited for the new
diagnostic message before checking severity because markers update
asynchronously. Typecheck and all protocol tests passed. The replay receipt is
`/home/syszone/crt-vscode-v1-06-20261126.yYPIW8/matcher-r2-result.json`.

### Verify native CLI tasks in the Development Host (V1-06)

VS Code 1.105.1 (`7d842fb85a0275a4a8e4d7e040d2625abbf7f084`) on Linux/x86_64
exercised the four CRT commands and a Doctor task from `tasks.json` with
extension `aef5016`, CRT-CLI `0.1.0-dev` from the P1-02 replay
(`21593a77c6f0f321d9befa86e22cdea0052b2dc134c3ee3b616f014d6d9c80da`),
Ubuntu LLVM 21.1.8 (6ubuntu1), and the installed signed Dev SDK
`v0.0.1-preview.20261125.linux.x64.1`. The SDK content SHA-256 is
`d2edb36c64f8f7c6d67603763e07a83d0cb4c2858c99e7957e00dde2d54dc921`
and the compiler policy SHA-256 is
`54bb35e014c59af90c1e2b73c3f544ebc7815edc958e704e15bef097dbedd2d1`.
[CLI and SDK provenance](https://github.com/webos21/crt-cli/blob/1eddeb3b2691a23536f3351c5141f77c773aa5fb/docs/acceptance/lifecycle_acceptance.md#p1-02-first-build-diagnosis-on-linuxx86_64-2026-11-25).

Fresh C and C++ fixtures in a path with spaces and Hangul passed Doctor,
approved cold Build, Test, Run, configured Doctor and warm Build. Each cold
build executed three commands and each warm build reused all three. The
C++ fixture's missing compiler and deliberate source error both exited 1,
showed the original diagnostic in the task terminal and preserved the lock.
Restoring the source returned build to exit 0. `npm ci`, typecheck and all
three protocol tests passed. Task exit codes, terminal logs and build receipts
are under `/home/syszone/crt-vscode-v1-06-20261126.yYPIW8/`. This run reused the
installed SDK. Compiler Problems and clangd have separate V1 checks.

### Retire the completed V0 editor API work

Removed V0-01 through V0-04 from the active queue after checking the
[protocol and real CLI bridge replay](#adopt-crt-cli-editor-api-1).
The replay matched exported application and test commands against native
C++ compilation and checked read-only project inspection and failure handling.
V1-06 still owns real Build/Test/Run/Doctor execution in a Linux/x86_64
Extension Development Host.
[Extension MVP](TODO.md#v1---extension-mvp).

## 2026-11-25

### Verify Workspace Trust and gate SDK acquisition (V1-05)

Restricted Mode ignores workspace overrides of `crt.cliPath` and blocks CRT
commands, task listing and task resolution. Build approval runs at launch for
the `CRT: Build` command and the `crt` build task, including a `tasks.json`
task configured to run on folder open. The dialog discloses that the first
build can download and install the project's pinned SDK. The CLI assigns that
acquisition to first build, and its project workflows consume already-built
port artifacts. [First-build contract](https://github.com/webos21/crt-cli/blob/1eddeb3b2691a23536f3351c5141f77c773aa5fb/docs/guides/development.md#diagnose-a-first-build).

The local change is based on extension `0a9e9a8`. `npm ci`, typecheck and all
three protocol tests passed with Node 24.22.3. VS Code 1.105.1
(`7d842fb85a0275a4a8e4d7e040d2625abbf7f084`) passed eight checks in a Linux/x86_64
Extension Development Host. The replay used a CLI fixture that recorded every
invocation. It started in Restricted Mode, granted trust in the editor,
reopened the trusted folder with automatic tasks enabled and revoked trust
through the editor. Restricted Mode, canceling the folder-open build and
canceling a manually resolved build caused zero CLI invocations. Canceling
`CRT: Build` left only its read-only version probe. Approved builds received
their expected project directories, and a manually resolved Doctor task used
project scope. The receipts are `initial-result.json` and `revoke-result.json`
under `/home/syszone/crt-vscode-v1-05-20261125.Veqdq4/`.

This replay used VS Code's live dialogs and a recording CLI fixture. Real
Build/Test/Run/Doctor behavior with an SDK is tracked by V1-06.

### Show the selected CLI and editor compatibility (V1-03)

The `CRT: CLI Info` command and CRT status bar item identify the executable
configured through `crt.cliPath` and check Editor API 1 support for Project
Info and compilation database export. The workflow commands verify the chosen
executable before starting a task. CLI probes run on demand in trusted workspaces.

The local extension change is based on `2049706`. `npm ci`, typecheck and
all three protocol tests passed with Node 24.22.3 and TypeScript 5.9.3. A
Linux/x86_64 Extension Development Host run in VS Code 1.105.1
(`7d842fb85a0275a4a8e4d7e040d2625abbf7f084`) passed eight checks covering the
output channel, status bar and tooltip, settings changes, a previous CLI
without editor capabilities, and empty, relative, missing and incompatible
executables. A PATH tripwire confirmed that the extension did not fall back
to a different executable. The selected CLI was the CRT-CLI P1-02 binary
(`21593a77c6f0f321d9befa86e22cdea0052b2dc134c3ee3b616f014d6d9c80da`). The
older control was the Preview bootstrap binary
(`827d974bfcb399254efcd9325fcf7df99cebc69b9a6ada7f335f777fc5ad01d5`).
[CLI build inputs](https://github.com/webos21/crt-cli/blob/efc4321/docs/acceptance/lifecycle_acceptance.md#p1-02-first-build-diagnosis-on-linuxx86_64-2026-11-25).

The receipt is in `/home/syszone/crt-vscode-v1-03-20261125.xmqysD/result.json`.
This host run covered CLI selection and version/capability validation without
selecting a project SDK or starting clangd. Workspace Trust, manually resolved
tasks and actual Build/Test/Run/Doctor execution retain their own acceptance
checks in V1-05 and V1-06.

### Adopt CRT-CLI editor API 1

The extension selects `crt.cliPath` explicitly and checks versioned capabilities
before project-state queries or compilation database export. Manual commands
show CLI state or errors without constructing compiler flags. The parser
validates the entire final envelope and its exit status, preserving CLI and
child diagnostics. Task providers require a trusted workspace and an absolute
configured executable.

TypeScript 5.9.3 typecheck and compile and all three Node protocol tests pass.
On Linux/x86_64, a Node 24.22.3 replay with a minimal VS Code configuration mock
used the P1-02 CLI (`21593a77c6f0f321d9befa86e22cdea0052b2dc134c3ee3b616f014d6d9c80da`)
and public SDK content `d2edb36c64f8f7c6d67603763e07a83d0cb4c2858c99e7957e00dde2d54dc921`.
It passed all three upstream envelope fixtures, queried unresolved and
incompatible projects, preserved the lock and database on failures, and matched
four exported C++ argv arrays to actual cold build and test compilation. The
older published CLI, trust denial and no explicit path cases were refused.
The first replay compared only the app build to a database including tests;
the completed replay includes both actual invocations. Evidence is in
`/home/syszone/crt-cli-p1-02-20261125/extension-bridge-r3/result.json`.

V0-01 through V0-04 and the V1-04 parser work are checked. The replay used no
Extension Development Host or clangd. V1 retains the live editor acceptance.

## 2026-11-23

### Replay the Windows PAL follow-ups on native Linux/x86_64

Synchronize CRT `312fec9`, CLI `1ab78e1` and extension `4a4f7d4`; CRT's only changes since the
`52881f0` runtime tested on Windows are documentation. Host: Ubuntu 26.04.1, kernel 7.0.0-44, 12 CPUs,
Clang/LLD 21.1.8, CMake 4.2.3, Ninja 1.13.2, bubblewrap 0.11.1. No sibling repository was modified
(all three trees were clean afterwards); build trees are the ignored `out/sdk-ci` and `out/pal04-r1..r4`
in CRT. Raw logs and result files are kept in `/home/syszone/GitLocal/crt-linux-x64-replay-20261123/`.

- **Core and PAL-01 (native Linux stdio).** A fresh Release core (imported libc++ and optional
  Skia/FFmpeg/curl/LVGL off) passes all 172 CTest cases: 169 in that tree, plus the three graphics
  executables (not built there because the expat/libffi port sources cannot be staged outside the CRT
  `out/` tree) built and passed 3/3 in the SDK tree. The 23 `stdio*`, `fd_*`, `fork*`, `spawn*`,
  `eventfd`, `socket*`, `memfd` and `timerfd` cases pass 20 consecutive repetitions. The updated
  `stdio_edge_test` passes against both the old and new stdio object. `benchmark/stdio_throughput.c`
  (`crt-cc -O3`, 64 KiB, `tmpfile()` on tmpfs) compares the `0686ca5` stdio object linked ahead of
  the same `libc.a` against the current object; five interleaved runs give medians (MiB/s) of
  buffered write 305.2 to 927.3, buffered read 233.7 to 1247.4 and unbuffered write 1.4 to 3611.7
  (range 2283.5 to 3747.5). These are in-memory file copies, not device throughput.
- **Descriptor test.** The portable `windows_fd_concurrency_test.c` passes 5/5 on Linux. Linux uses
  kernel descriptors, so this is a no-regression control, not a reproduction of the Windows slot-table race.
- **SDK candidate.** `crt-dev-release` built a Linux/x86_64 Dev SDK (`v0.0.1-ci.replaylinux`); `ci_sdk_release.py
  verify` reports no problems: manifest `0d73a243...fab3` (1,655 bytes), archive `303295e1...bf35`
  (7,703,524 bytes), content `b0ef4c46...07de`. The in-build C provider check passes all five modes.
  `test_dev_sdk_external.py` passes under bubblewrap with the producer and original SDK hidden (2,618
  inventory entries unchanged; static and shared consumers, including `fstream(path)` and the Unicode
  `std::filesystem` checks). The CRT Python suites for release verification, CLI smoke, workflows, port
  environment, `create_dist`/`verify_dist` and the PAL-06 libc++ guard pass (five skips are host-specific).
  The artifact is unsigned and unpromoted; no pin changes.
- **CLI consumer (PAL-02 analogue).** The older local seed (`a6b33cbd...6039`) configured CLI `1ab78e1` with
  the extracted SDK and its portable contract (`97a87a74...c53d048`) inside a space/Hangul/U+1F600 work root.
  Selection is clean (no dirty-SDK opt-in); self-build executes 21 and reuses 0 cold, 0 and 21 warm; the
  executable is `1b445954...66f8b7a`. `test --target native-test` passes 949 checks. `sdk install` from the
  archive/manifest pin into a store under that root, then static and shared C++17 probe projects below a
  `u 한글 é 😀` directory, each build 2/0 and each run 18/18 (argv and environment bytes, U+1F600/U+20000
  directories, `fstream(path)`, stdio, `directory_iterator`, rename, copy, `canonical`, `current_path`).
  `crt-cli run` forwards no arguments, so the executables ran directly. Linux paths are bytes, so this is a
  parity check; it does not reproduce the Windows UTF-16 truncation fixed by PAL-06.
- **PAL-04 (Linux partial options, curl ON, fresh Release trees).** Four rows. **OFF/OFF/OFF** (`crt-media-dist`)
  and **OFF/OFF/ON** (`crt-ui-dist`) build and pass `verify_dist`; `libcrtmedia.so` has no curl dependency
  because the HTTP transport is compiled only with FFmpeg. **OFF/ON/ON** (`crt-ui-dist`) **fails reproducibly** at
  stage 04: `unresolved packaged binary dependencies: lib/libcrtmedia.so -> undeclared libcurl.so.4`
  (`libcurl.so.4` is a `DT_NEEDED` entry and is not copied). **ON/OFF/ON** builds and passes `verify_dist`, but
  its package ships `libcrtgfx_skia.*` and `examples/gfx-skia` without `lib/libskia.a`, so that example fails
  to configure when rebuilt from a relocated (space/Hangul) copy; the unrelocated package also lacks the file.
  `gfx-gpu`, `gfx-simple` and `ui-basic` rebuild from relocated packages in every row that produced one
  (only `ui-basic` was executed). Row 3's later stages, license/relink payloads and examples were not
  reached; the clean option-off and fully enabled controls were not rerun since nothing changed.

These are two reproduced Linux packaging gaps for CRT to decide and fix (copy and declare the curl
dependency, or exclude the unsupported combination; ship `libskia.a` or stop shipping the example);
neither is fixed or recorded in CRT's TODO here. PAL-01's Linux gate is satisfied by the results above;
the CRT-owned acceptance records and queue still need the owner's update. Not run: the extension's `npm ci`,
`typecheck` and `compile` (no Node/npm on this host), Extension Development Host, clangd or debugger.
Windows-only descriptor, UTF-16 and spawn behavior keeps its native Windows evidence. STATUS is unchanged.

Follow-up: CRT proposes settling both PAL-04 gaps by declaring partial Skia/FFmpeg/curl combinations
unsupported (only all OFF or all ON are packaged; Linux `crt-media-dist` and `crt-ui-dist` refuse the rest
up front) in [webos21/crt#24](https://github.com/webos21/crt/pull/24), open and not merged at this entry.
CRT later merged #24 and closed the focused CRT/PAL queue. The
[producer packaging evidence](https://github.com/webos21/crt/blob/88b172cf153a8b786fc98a8e17872ebce8b0efa2/docs/acceptance/crtui_acceptance.md#linux-partial-option-media-packaging-follow-up-pal-04-2026-11-23)
does not change the scope of this historical replay or close any editor gate.

### Replay the synchronized PAL prerequisites on physical Windows/x64

Synchronize extension `119e894`, CRT `52881f08` and CLI `6704aa8`, then run
`npm ci --ignore-scripts --no-audit --no-fund`, `npm run typecheck` and
`npm run compile` on Windows/x64 (Node 17.9.1, npm 8.11.0); all pass. These
checks cover the current TypeScript scaffold. No extension product or CLI
API changes, Extension Development Host, clangd or debugger run is claimed;
V0's proposed APIs and V1-06 retain their separate gates.

The owners' native x64 replay completes the ARM64/emulation follow-up for
Unicode paths and Windows descriptor ownership, with the newer CI SDK.
[CRT PAL acceptance](https://github.com/webos21/crt/blob/main/docs/acceptance/release_qualification.md#native-windowsx64-pal-replay-2026-11-23)
and [CLI consumer acceptance](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md#native-windowsx64-unicode-and-provider-replay-2026-11-23)
own the measured outcomes and exact inputs. The CLI's
[compatibility ledger](https://github.com/webos21/crt-cli/blob/main/docs/compatibility.md#native-windowsx64-pal-consumer-combination-2026-11-23)
records the exercised SDK/CLI pair. Earlier macOS/ARM64 evidence remains intact;
this adds no editor workflow qualification, release or pin adoption. Merged
CRT `cb3e0145` and CLI `76a0f1a`'s newer
[macOS PAL consumer evidence](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md#macosarm64-pal-follow-up-sdk-consumer-replay-2026-11-23)
as a distinct prerequisite result; it does not close extension/editor gates.

### Retire the Windows/arm64 pure C shared provider prerequisite

All six prerequisite steps (PRE-01 through PRE-06) were complete after syncing
CRT `2443922`, CLI `183178d` and extension `434ef96`. The native Windows/arm64
replay passed **36/36** with the clean SDK CI artifact from CRT `5325cea` and
CLI `44fbf24`. The shared executable loaded the installed SDK's `libc.dll`.
The first scheduled Integration after the CLI lock fixes passed all **15**
jobs, including `ports (win-arm64)`. The CRT and CLI work queues have closed
their provider verification items after the remaining host replays.
[ARM64 consumer acceptance](https://github.com/webos21/crt-cli/blob/183178daebee96c4ffe2395e22c8cfcc3768ef85/docs/acceptance/sdk_install_acceptance.md#windowsarm64-pure-c-shared-sdk-replay-and-integration-at-44fbf24-2026-11-22) ·
[Scheduled Integration](https://github.com/webos21/crt-cli/actions/runs/45018368929).

The original failing baselines and race investigation are preserved in the
[retired TODO section](https://github.com/webos21/crt-vscode/blob/434ef9657e8a83183ca72136d6b51382ca6c32bb/TODO.md#prerequisite---windowsarm64-replay-of-the-pure-c-shared-provider-handoff-owned-by-crt-and-crt-cli).
SDK promotion and pin adoption remain separate producer and CLI work.
[V1-06](TODO.md#v1---extension-mvp) still requires an Extension Development Host run.

### Synchronize the producer/CLI pure C shared prerequisite after macOS replay

Synchronize extension `8c13564`, CLI `01d2532` and CRT `3c8c712`, then record the owners' native Mac replay of the clean CI SDK from
CRT `5325cea`: C provider 76/76, native 984, actual static/shared zlib/provider 20/20 gates and binding audits pass. The existing public
Mac SDK also passes the C matrix, so the Windows failing baseline is not attributed to Mac. Reconcile PRE-02/PRE-05's stale uncommitted
claims with the merged lock fix, six-host-row CI/scheduled Integration and Windows clean CI SDK consumer evidence. Preserve the original
race reproduction, failed public SDK identities and the hosted-only Windows/x64 limit.

This is prerequisite/evidence synchronization only: no extension source or SDK/CLI pin changes, npm/editor/clangd/debugger run,
publisher promotion or STATUS refresh. Producer/consumer acceptance remains in
[CRT P0](https://github.com/webos21/crt/blob/main/docs/acceptance/sdk_split_acceptance.md#macosarm64-pure-c-shared-provider-replay-2026-11-23)
and [CLI P1-01](https://github.com/webos21/crt-cli/blob/main/docs/acceptance/sdk_install_acceptance.md#macosarm64-pure-c-shared-sdk-replay-2026-11-23).

## 2026-11-22

### Implement the CRT Windows C shared fix and the CLI lock replacement (PRE-05, PRE-02; sibling repositories, uncommitted)

At the owner's request, sibling repositories were changed on local branches (nothing committed or pushed):
`../crt` `fix/windows-c-shared-provider` (`crt-cc` honors the runtime linkage on Windows, a Windows provider
check, collector gate, tests) and `../crt-cli` `fix/store-lock-race` (`Lock` is an OS file lock, new
`store-lock-test`, store tests adjusted). Verified on this Windows x64 host only: the provider check passes 4/4
on a local unpromoted candidate and fails the shared cases on the unmodified SDK; `store-lock-test` passes and
reproduces the old failures against the old `Lock`; `ports --host win-x64` passes 5/5 (36/97/21/33/83). Not
done: clean SDK candidate and CLI replay on it, Linux/macOS/arm64 runs, CI, review, commits. Details and limits
are in the CRT and CLI HISTORY entries for 2026-11-22.

### Replay the CLI handoff on Windows/x64 and observe the Windows C shared baseline (PRE-04, PRE-05)

Prerequisite replay on this Windows 11 x64 machine; no extension code and no sibling repository
changed (sources: crt-vscode `0e5922a`, CRT `b966d85`, CLI `e7f0300`). CLI `e7f0300` was extracted by
`git archive` into a private-ACL checkout under `C:\crt-replay\x64-20261122`, and
`tools/ci_integration.py ports --host win-x64` ran with x64 LLVM 22.1.8 and Python 3.11.9 (CI uses
3.12). All five port suites passed with no skips: build 36, store 97, oracle 21, command 33, project
83 checks, exit 0. Inputs are the pinned bootstrap CLI `v0.1.0-preview.20261117.windows-x86_64.1`,
Dev SDK `v0.0.1-preview.20261110.windows.1` (content SHA-256 `5bb55372…7ef`), host-tools
`v0.1.0-hosttools.20261119.windows-x86_64.1` and zlib 1.3.1. `port-store-test` did not hit the
PRE-02 lock race in this single run. The project suite logged `lld: warning: parameter -rpath has
no effect on PE/COFF targets`, which did not fail the suite.

Separate baseline observation, not qualification: in that SDK's portable contract the Windows
`executable-shared.link_c` argv is identical to `executable-static.link_c` (static `libc.a`,
`libm.a`, `libdl.a`, entry `mainCRTStartup`). Linking a hello-world with each recorded argv (clang
22.1.8, Windows SDK `um/x64`) gave byte-identical executables, SHA-256 prefix `c214af27ceffa1dc`,
that import only `KERNEL32.dll` and `api-ms-win-core-synch-l1-2-0.dll` and run. So the shared mode
silently links static C, the Windows analogue of the original Linux defect. The Linux-only
correction `19bdf36` produces no Windows candidate; the requirement is PRE-05.

Limits: one machine and one run; the driver's own Windows adapter, not an isolated second SID; the
pinned SDK predates the policy fix; only a static-libc control was observed (no shared zlib, project
DLL or loaded-module check); the Windows/arm64 and Linux records are separate. Evidence is local and
unpublished: `C:\crt-replay\x64-20261122` (`run.stdout`, `p\replay`, `a3-baseline`).

### Replay the Windows/arm64 handoff and trace the CLI lock race (PRE-01, PRE-02)

Prerequisite investigation before extension work; no extension code changed (source `e2d8829`,
CLI `8374470`, CRT `42b8f7a`, none modified). On this Windows 11 ARM64 machine the CLI's
`ports (win-arm64)` integration replay passes all five suites (36/97/21/33/83 checks, no skips)
with the pinned Windows/arm64 SDK and host-tools, ARM64 LLVM 22.1.8 and Python 3.11.9. The
scheduled CI failure of 2026-11-21 did not reproduce, so it is a rare race. A stress and trace
of the unmodified CLI `Lock` reproduced two defects (fatal `create_directory` contention errors
and stealing of live locks whose owner is not yet written) and measured them. They are open in
`crt-cli` at the time of this replay. This repository recorded them under
[PRE-02](#retire-the-windowsarm64-pure-c-shared-provider-prerequisite) and
does not work around them. The Windows/arm64 replay is not C shared SDK qualification (the CRT
fix is Linux-only). Details, counts and limits (one machine and run, harsh stress loop, POSIX
untested) are in the [CLI HISTORY entry](https://github.com/webos21/crt-cli/blob/main/HISTORY.md)
for 2026-11-22 once published; the evidence files are local and unpublished.

## 2026-11-20

### Align the documentation with the editor integration plan

Organized the queue into In Progress and Planned and added topic-scoped task
IDs, acceptance criteria and links to the corresponding CRT and CLI work.
Updated the README and status snapshot to describe the scaffold, the existing
CLI JSON envelope and the proposed editor commands. This was a documentation
review. Editor and native workflow acceptance are tracked in V1.
[Documentation commit](https://github.com/webos21/crt-vscode/commit/2c61f6e3378859ee2ddb8b9f8fcdbc00c3327282) ·
[V1 acceptance](TODO.md#v1---extension-mvp).

### Add the TypeScript extension scaffold

Added the private `0.0.1` package, TypeScript build and **Run Extension**
launch configuration (V1-01). The source registers workspace activation,
Build/Test/Run/Doctor commands, the CRT status bar item and the `crt` task
provider (V1-02, source implementation). It also includes an export command
with a provisional CLI capability check.

`npm run typecheck` and `npm run compile` passed on 2026-11-20. The checks
cover the scaffold and compilation. Live CLI tasks, Workspace Trust behavior
and clangd integration have their own Extension Development Host gates.
[Scaffold commit](https://github.com/webos21/crt-vscode/commit/b547406a65e33219067d8b62623b54b6753ad58e).

## 2026-11-18

### Initialize the repository

Added the Apache License 2.0 in the initial commit.
[Initial commit](https://github.com/webos21/crt-vscode/commit/aadca47e0deea2670775cb35608488fe9b7a304a).
