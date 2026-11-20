# TODO

Phases V0-V4 follow the design notes. Check an item only with evidence (test or execution record).

## V0 - CRT-CLI Contract (owned by `../crt-cli`; requirements only here)

- [ ] `crt-cli export compile-commands --output <file>`: extract per-source compile commands from the real build plan
  - Include `--target`, sysroot, standard-library headers, macros, language standard; exclude linker options and startup objects
  - Must be refreshable when `crt.lock` or the SDK selection changes; must match the real build flags
- [ ] `crt-cli project info --json`: project, SDK and target state plus lock identifier
- [ ] `crt-cli build --json`: separate structured results/progress events from the stdout JSON (stderr, file or explicit protocol)
- [ ] Define schema version, capability query and failure codes
- Acceptance: compile commands emitted by the CLI match the real build

## V1 - Extension MVP

- [x] Project scaffold, typecheck passes
- [x] Activation on `crt.json`, Build/Test/Run/Doctor commands, TaskProvider (code only)
- [ ] Verify Build/Test/Run/Doctor with a real `crt-cli` in an Extension Development Host
- [ ] Problem matcher for compiler errors in task output (needs CLI output format check)
- [ ] SDK/target status bar item (needs V0 `project info`)
- [ ] Compilation database generation/refresh (needs V0 export); the manual command exists
- [ ] Detect/guide the clangd extension and configure the `compile_commands.json` location (`.clangd` or settings)
- [ ] Show CLI location/version and check compatibility (avoid picking the wrong PATH binary)
- [ ] Vertical check on Linux/x86_64 with a small C++ project: completion, go-to-definition, build, run
- [ ] Then extend to macOS/arm64 and Windows/x64
- Acceptance: one-click C/C++ development on three OSes

## V2 - Project UX

- [ ] SDK status (from `sdk list`)
- [ ] Port list (`port list`)
- [ ] Detect `crt.lock` changes and offer to refresh compile_commands
- [ ] Error/diagnostic display
- Principle: SDK downloads and port builds only with user consent; honor Workspace Trust
- Acceptance: displayed state matches the CLI

## V3 - Debugging

- [ ] Debugger selection (Linux: LLDB/GDB, macOS: LLDB)
- [ ] Executable discovery and Debug Configuration provider
- [ ] Windows: choose a debugger that passes CRT ABI validation (DWARF exceptions, emutls); validation comes first
- [ ] Decide clang-format / clang-tidy integration scope
- Acceptance: native debug acceptance per OS

## V4 - Distribution

- [ ] VSIX packaging (`vsce`) and CI (typecheck/compile/package)
- [ ] Publish to Marketplace / Open VSX (needs owner approval)
- [ ] Verify install and run by an external user

## Other

- [ ] Test framework (e.g. `@vscode/test-electron`) and CLI mock
- [ ] Icon/metadata, CHANGELOG
- [ ] `crt-studio` stays Planned; this repository does not implement an IDE
