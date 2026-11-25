# CRT for VS Code (`crt-vscode`)

A TypeScript extension for building, testing and running CRT C/C++ projects
from VS Code. The CRT SDK supplies runtime and compiler policy. The extension
delegates builds, SDK selection and project state to `crt-cli`.
[CRT](https://github.com/webos21/crt) · [CRT-CLI](https://github.com/webos21/crt-cli).

**Status: development scaffold (0.0.1).** Use the Extension Development Host
to try the source checkout. Editor integration and distribution gates are
tracked in [TODO](TODO.md). See [STATUS](STATUS.md) for recorded verification.
Completed changes are recorded in [HISTORY](HISTORY.md).

## Works Today

The scaffold contributes:

- Workspace activation for `crt.json` and a `crt` task provider.
- `CRT: Build`, `CRT: Test`, `CRT: Run` and `CRT: Doctor` commands. Doctor uses
  the CLI's project scope and is available from the CRT status bar item.
- `CRT: Project Info` shows the CLI's read-only project report in the CRT
  output channel. `CRT: Export compile_commands.json` writes a compilation
  database through the CLI. Both commands require editor API 1.
- The `crt.cliPath` setting selects an explicit absolute CLI executable path.

These contributions are implemented in source. SDK and CLI prerequisite
replays do not verify the real CLI task workflow in the Extension Development
Host; that is still an acceptance gate.
[Extension MVP](TODO.md#v1---extension-mvp).

## Planned Editor Integration

Use a source-built CLI that advertises editor API 1. `CRT: Project Info` can
diagnose an unresolved project. Configure its SDK and LLVM tools explicitly
before exporting a database. clangd setup and the integrated editor workflow
have their own acceptance gates.
[Public CLI contract](https://github.com/webos21/crt-cli/blob/3733aeb108bcad5ba45f9feec234330d5c4ddbc4/docs/reference/bootstrap_contract.md#public-editor-api-version-1).

The first native editor check targets Linux/x86_64. macOS/arm64, Windows/x64,
debugging and verified VSIX distribution have later gates. Cursor and
VSCodium require their own editor verification.
[Planned work](TODO.md#planned).

## Development

```bash
npm ci
npm run typecheck
npm test
```

In VS Code, press F5 using **Run Extension** to start the Extension
Development Host. Open a trusted folder containing `crt.json` and set
`crt.cliPath` to the absolute path of your chosen CLI. Configure the project
with its selected Dev SDK and LLVM tools using the CLI guide. With a pinned
`sdk_source` in `.sdk.json`, an explicit first build can acquire that SDK.
[CLI Previews](https://github.com/webos21/crt-cli#download-the-previews) ·
[CLI project setup](https://github.com/webos21/crt-cli#try-the-local-workflow).

## Related Repositories

| Repository | Role |
| --- | --- |
| [crt](https://github.com/webos21/crt) | Runtime and SDK production |
| [crt-cli](https://github.com/webos21/crt-cli) | SDK, build and port engine and public command contracts |
| [crt-studio](https://github.com/webos21/crt-studio) | Long-term standalone CRT-native IDE |

License: Apache-2.0 ([LICENSE](LICENSE)).
