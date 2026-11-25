import * as vscode from "vscode";
import { cliPathHelp, exportCompileCommands, projectInfo } from "./cli";
import { CrtTaskProvider, makeTask } from "./tasks";

function folder(): vscode.WorkspaceFolder | undefined {
  const f = vscode.workspace.workspaceFolders?.[0];
  if (!f) void vscode.window.showWarningMessage("CRT: open a folder containing crt.json first.");
  return f;
}

async function requireTrust(): Promise<boolean> {
  if (vscode.workspace.isTrusted) return true;
  void vscode.window.showWarningMessage("CRT: crt-cli is not run in untrusted workspaces.");
  return false;
}

export function activate(ctx: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("CRT");
  ctx.subscriptions.push(output, vscode.tasks.registerTaskProvider("crt", new CrtTaskProvider()));

  for (const command of ["build", "test", "run", "doctor"] as const) {
    ctx.subscriptions.push(vscode.commands.registerCommand(`crt.${command}`, async () => {
      const f = folder();
      if (!f || !(await requireTrust())) return;
      const task = makeTask(f, { type: "crt", command });
      if (task) await vscode.tasks.executeTask(task);
      else void vscode.window.showWarningMessage(`CRT: ${cliPathHelp}`);
    }));
  }

  const reportError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    output.appendLine(message);
    void vscode.window.showErrorMessage(`CRT: ${message.split("\n")[0]}`);
  };

  ctx.subscriptions.push(vscode.commands.registerCommand("crt.projectInfo", async () => {
    const f = folder();
    if (!f || !(await requireTrust())) return;
    try {
      const data = await projectInfo(f);
      output.appendLine(JSON.stringify(data, null, 2));
      output.show(true);
    } catch (error) {
      reportError(error);
    }
  }));

  ctx.subscriptions.push(vscode.commands.registerCommand("crt.exportCompileCommands", async () => {
    const f = folder();
    if (!f || !(await requireTrust())) return;
    const requested = vscode.workspace.getConfiguration("crt", f.uri).get<string>("compileCommands.output") ?? "compile_commands.json";
    try {
      const path = await exportCompileCommands(f, requested);
      void vscode.window.showInformationMessage(`CRT: wrote ${path}`);
    } catch (error) {
      reportError(error);
    }
  }));

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  status.text = "$(tools) CRT";
  status.command = "crt.doctor";
  status.tooltip = "CRT: run project doctor";
  status.show();
  ctx.subscriptions.push(status);
}

export function deactivate(): void {}
