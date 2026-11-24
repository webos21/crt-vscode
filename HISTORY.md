# HISTORY: CRT for VS Code Completed Work

Dated record of completed work, newest first. [TODO](TODO.md) owns the active
and planned queue. [STATUS](STATUS.md) summarizes the evidence at its review
baseline. Entries link to the source revision and relevant acceptance evidence
and state the scope of the checks performed.

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
