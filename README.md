# CRT for VS Code (`crt-vscode`)

A TypeScript extension for building, testing and running CRT C/C++ projects
from VS Code. The CRT SDK supplies runtime and compiler policy. The extension
delegates builds, SDK selection and project state to `crt-cli`.
[CRT](https://github.com/webos21/crt) · [CRT-CLI](https://github.com/webos21/crt-cli).

**Status: 0.5.0 release candidate, not yet published.** `npm run package`
builds the VSIX. Editor integration and distribution gates are tracked in
[TODO](TODO.md). See [STATUS](STATUS.md) for recorded verification.
Completed changes are recorded in [HISTORY](HISTORY.md).

## Works Today

The scaffold contributes:

- Workspace activation for `crt.json` and a `crt` task provider.
- `CRT: CLI Info`, also available from the CRT status bar item, shows the
  selected executable's absolute path, version and editor API 1 compatibility
  in the CRT output channel. The status bar shows the last verified version
  and its tooltip shows the executable path.
- `CRT: Build`, `CRT: Test`, `CRT: Run` and `CRT: Doctor` commands verify the
  selected executable before launching a task. Doctor uses project scope.
  Clang source errors and warnings from Build, Test and Run appear in Problems.
- `CRT: Project Info` summarizes the SDK, target, lock and missing
  prerequisites alongside the read-only CLI report in the CRT output
  channel. `CRT: Export compile_commands.json` writes the compilation
  database through the CLI. Both commands require editor API 1.
- Set `crt.cliPath` to an absolute path. For Project Info and compilation
  database export, select a source-built CLI that advertises editor API 1.

Build, Test, Run and Doctor passed in the Linux/x86_64 Extension Development
Host with real C and C++ fixtures and an installed Dev SDK.
[Native task verification](HISTORY.md#verify-native-cli-tasks-in-the-development-host-v1-06).

## clangd

Use a source-built CLI that advertises editor API 1. `CRT: Project Info` can
diagnose an unresolved project. Configure its SDK and LLVM tools explicitly
before exporting a database. Run `CRT: Export compile_commands.json` again
to refresh it after changing the build inputs. clangd discovers the default
file in the project root. For a custom directory, retain the filename
`compile_commands.json` and choose **Configure clangd** after export. CRT can
create `.clangd` with the database directory or tell you which entry to set
in an existing configuration. The export offers **Find clangd** when the
clangd extension is absent.
[Public CLI contract](https://github.com/webos21/crt-cli/blob/3733aeb108bcad5ba45f9feec234330d5c4ddbc4/docs/reference/bootstrap_contract.md#public-editor-api-version-1).

The Linux/x86_64 Development Host check verified C++ completion, definition
navigation and diagnostics against a real build for the recorded fixture.
macOS/arm64, Windows/x64, Cursor, VSCodium, debugging and verified VSIX
distribution have later gates.
[Linux clangd verification](HISTORY.md#verify-the-linux-clangd-workflow-v1-10) · [Planned work](TODO.md#planned).

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
`sdk_source` in `.sdk.json`, the first build can download and install that SDK.
CRT asks for Build approval at launch, including for a `crt` build task from
`tasks.json`. Build approval is separate from Workspace Trust and VS Code's
permission to run automatic tasks. CRT commands and tasks require a trusted
workspace.
[CLI Previews](https://github.com/webos21/crt-cli#download-the-previews) ·
[CLI project setup](https://github.com/webos21/crt-cli#try-the-local-workflow).

## Related Repositories

| Repository | Role |
| --- | --- |
| [crt](https://github.com/webos21/crt) | Runtime and SDK production |
| [crt-cli](https://github.com/webos21/crt-cli) | SDK, build and port engine and public command contracts |
| [crt-studio](https://github.com/webos21/crt-studio) | Long-term standalone CRT-native IDE |

License: Apache-2.0 ([LICENSE](LICENSE)).
