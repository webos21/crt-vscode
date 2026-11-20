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
- The `crt.cliPath` setting for selecting a CLI executable.

These contributions are implemented in source. The real CLI task workflow in
the Extension Development Host is still an acceptance gate.
[Extension MVP](TODO.md#v1---extension-mvp).

## Planned Editor Integration

The manual `CRT: Export compile_commands.json` command reports missing
support with the current CLI. Compilation database generation from the real
build plan and structured project-state queries are proposed CLI features.
The extension will use those results for clangd and SDK/target display.
[CLI contract requirements](TODO.md#v0---crt-cli-contract-owned-by-crt-cli-requirements-only-here).

The first native editor check targets Linux/x86_64. macOS/arm64, Windows/x64,
debugging and verified VSIX distribution have later gates. Cursor and
VSCodium require their own editor verification.
[Planned work](TODO.md#planned).

## Development

```bash
npm install
npm run typecheck
npm run compile
```

In VS Code, press F5 using **Run Extension** to start the Extension
Development Host. Open a trusted folder containing `crt.json` and set
`crt.cliPath` to the absolute path of your chosen CLI. Configure the project
with its selected Dev SDK and LLVM tools using the CLI guide.
[CLI Previews](https://github.com/webos21/crt-cli#download-the-previews) ·
[CLI project setup](https://github.com/webos21/crt-cli#try-the-local-workflow).

## Related Repositories

| Repository | Role |
| --- | --- |
| [crt](https://github.com/webos21/crt) | Runtime and SDK production |
| [crt-cli](https://github.com/webos21/crt-cli) | SDK, build and port engine and public command contracts |
| [crt-studio](https://github.com/webos21/crt-studio) | Long-term standalone CRT-native IDE |

License: Apache-2.0 ([LICENSE](LICENSE)).
