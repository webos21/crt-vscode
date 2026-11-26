import * as vscode from "vscode";
import { offerClangdSetup } from "./clangd";
import { cliCapabilities, cliPath, cliVersion, exportCompileCommands, firstBuildDiagnosis, projectInfo, requireCliPath } from "./cli";
import { requireEditorCapability } from "./cliProtocol";
import { projectSummary } from "./projectSummary";
import { CrtTaskProvider, makeTask, registerBuildApproval } from "./tasks";

function folder(): vscode.WorkspaceFolder | undefined {
  const f = vscode.workspace.workspaceFolders?.[0];
  if (!f) void vscode.window.showWarningMessage("CRT: open a folder containing crt.json first.");
  return f;
}

function requireTrust(): boolean {
  if (vscode.workspace.isTrusted) return true;
  void vscode.window.showWarningMessage("CRT: crt-cli is not run in untrusted workspaces.");
  return false;
}

export function activate(ctx: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("CRT");
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  const resetStatus = () => {
    status.text = "$(tools) CRT";
    status.tooltip = "Show the selected CRT-CLI and check editor compatibility";
  };
  resetStatus();
  status.command = "crt.cliInfo";
  status.show();
  ctx.subscriptions.push(output, status, registerBuildApproval(), vscode.tasks.registerTaskProvider("crt", new CrtTaskProvider()),
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration("crt.cliPath")) resetStatus();
    }), vscode.workspace.onDidChangeWorkspaceFolders(resetStatus));

  const reportError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    output.appendLine(message);
    void vscode.window.showErrorMessage(`CRT: ${message.split("\n")[0]}`);
  };

  const identifyCli = async (f: vscode.WorkspaceFolder) => {
    const executable = requireCliPath(f);
    const version = await cliVersion(f, executable);
    const identity = `crt-cli ${version}\n${executable}`;
    output.appendLine(identity);
    if (vscode.workspace.workspaceFolders?.[0]?.uri.toString() === f.uri.toString() && cliPath(f.uri) === executable) {
      status.text = `$(tools) CRT ${version}`;
      status.tooltip = identity;
    }
    return executable;
  };

  ctx.subscriptions.push(vscode.commands.registerCommand("crt.cliInfo", async () => {
    const f = folder();
    if (!f || !requireTrust()) return;
    output.show(true);
    try {
      const executable = await identifyCli(f);
      const capabilities = await cliCapabilities(f, executable);
      requireEditorCapability(capabilities, "project.info");
      requireEditorCapability(capabilities, "export.compile-commands");
      output.appendLine("Editor API 1 supports Project Info and compilation database export.");
    } catch (error) {
      reportError(error);
    }
  }));

  for (const command of ["build", "test", "run", "doctor"] as const) {
    ctx.subscriptions.push(vscode.commands.registerCommand(`crt.${command}`, async () => {
      const f = folder();
      if (!f || !requireTrust()) return;
      try {
        const executable = await identifyCli(f);
        const task = makeTask(f, { type: "crt", command }, executable);
        if (task) await vscode.tasks.executeTask(task);
      } catch (error) {
        reportError(error);
      }
    }));
  }

  ctx.subscriptions.push(vscode.commands.registerCommand("crt.projectInfo", async () => {
    const f = folder();
    if (!f || !requireTrust()) return;
    try {
      const executable = requireCliPath(f);
      const data = await projectInfo(f, executable);
      let diagnosis = "";
      if (data.state === "unresolved") {
        try {
          diagnosis = await firstBuildDiagnosis(f, executable);
        } catch (error) {
          diagnosis = error instanceof Error ? error.message : String(error);
        }
      }
      output.appendLine([JSON.stringify(data, null, 2), "", projectSummary(data), diagnosis].join("\n"));
      output.show(true);
    } catch (error) {
      reportError(error);
    }
  }));

  ctx.subscriptions.push(vscode.commands.registerCommand("crt.exportCompileCommands", async () => {
    const f = folder();
    if (!f || !requireTrust()) return;
    const requested = vscode.workspace.getConfiguration("crt", f.uri).get<string>("compileCommands.output") ?? "compile_commands.json";
    try {
      const path = await exportCompileCommands(f, requested);
      void offerClangdSetup(f, path).catch(reportError);
    } catch (error) {
      reportError(error);
    }
  }));
}

export function deactivate(): void {}
