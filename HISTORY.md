# HISTORY: CRT for VS Code Completed Work

Dated record of completed work, newest first. [TODO](TODO.md) owns the active
and planned queue. [STATUS](STATUS.md) summarizes the evidence at its review
baseline. Entries link to the source revision and relevant acceptance evidence
and state the scope of the checks performed.

## 2026-11-23

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
`crt-cli`; this repository only records them as a prerequisite ([TODO PRE-02](TODO.md)) and
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
