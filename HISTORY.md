# HISTORY: CRT for VS Code Completed Work

Dated record of completed work, newest first. [TODO](TODO.md) owns the active
and planned queue. [STATUS](STATUS.md) summarizes the evidence at its review
baseline. Entries link to the source revision and relevant acceptance evidence
and state the scope of the checks performed.

## 2026-11-22

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
