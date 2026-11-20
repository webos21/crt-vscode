import * as vscode from "vscode";
import { runJson, supports } from "./cli";
import { CrtTaskProvider, makeTask, CrtTaskDefinition } from "./tasks";

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
  ctx.subscriptions.push(vscode.tasks.registerTaskProvider("crt", new CrtTaskProvider()));

  for (const command of ["build", "test", "run", "doctor"] as const) {
    ctx.subscriptions.push(vscode.commands.registerCommand(`crt.${command}`, async () => {
      const f = folder();
      if (!f || !(await requireTrust())) return;
      await vscode.tasks.executeTask(makeTask(f, { type: "crt", command } as CrtTaskDefinition));
    }));
  }

  // V0 contract (proposed, not yet in crt-cli): crt-cli export compile-commands --output <file>
  ctx.subscriptions.push(vscode.commands.registerCommand("crt.exportCompileCommands", async () => {
    const f = folder();
    if (!f || !(await requireTrust())) return;
    const cwd = f.uri.fsPath;
    if (!(await supports("compile-commands", cwd))) {
      void vscode.window.showWarningMessage(
        "CRT: this crt-cli does not support 'export compile-commands' yet (see TODO.md V0).");
      return;
    }
    const out = vscode.workspace.getConfiguration("crt").get<string>("compileCommands.output") ?? "compile_commands.json";
    const r = await runJson(["export", "compile-commands", "--project", cwd, "--output", out], cwd);
    void (r.ok
      ? vscode.window.showInformationMessage(`CRT: wrote ${out}`)
      : vscode.window.showErrorMessage(`CRT: export failed: ${JSON.stringify(r.data)}`));
  }));

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  status.text = "$(tools) CRT";
  status.command = "crt.doctor";
  status.tooltip = "CRT: run project doctor";
  status.show();
  ctx.subscriptions.push(status);
}

export function deactivate(): void {}
