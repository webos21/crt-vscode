import { readFile, realpath, writeFile } from "fs/promises";
import { basename, dirname, join, relative, sep } from "path";
import * as vscode from "vscode";

const extensionId = "llvm-vs-code-extensions.vscode-clangd";

export async function offerClangdSetup(folder: vscode.WorkspaceFolder, database: string): Promise<void> {
  const written = `CRT: wrote ${database}`;
  if (basename(database) !== "compile_commands.json") {
    void vscode.window.showInformationMessage(`${written}. Use the filename compile_commands.json for clangd.`);
    return;
  }
  if (!vscode.extensions.getExtension(extensionId)) {
    const action = await vscode.window.showInformationMessage(`${written}. Install the clangd extension for C/C++ navigation.`, "Find clangd");
    if (action === "Find clangd") await vscode.commands.executeCommand("workbench.extensions.search", `@id:${extensionId}`);
    return;
  }

  const directory = relative(await realpath(folder.uri.fsPath), dirname(database));
  if (!directory) {
    void vscode.window.showInformationMessage(written);
    return;
  }

  const action = await vscode.window.showInformationMessage(`${written}. Point clangd at this directory with .clangd.`, "Configure clangd");
  if (action !== "Configure clangd" || !vscode.workspace.isTrusted) return;

  const location = directory.split(sep).join("/");
  const configPath = join(folder.uri.fsPath, ".clangd");
  const contents = `CompileFlags:\n  CompilationDatabase: ${JSON.stringify(location)}\n`;
  try {
    await writeFile(configPath, contents, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if (await readFile(configPath, "utf8") !== contents) {
      void vscode.window.showWarningMessage(`CRT: Set CompileFlags.CompilationDatabase to ${location} in the existing .clangd file.`);
      return;
    }
  }
  void vscode.window.showInformationMessage(`CRT: .clangd points to ${location}.`);
}
