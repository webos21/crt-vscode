import * as vscode from "vscode";
import { cliPath } from "./cli";

export interface CrtTaskDefinition extends vscode.TaskDefinition {
  command: "build" | "test" | "run" | "doctor";
  project?: string;
}

const COMMANDS: CrtTaskDefinition["command"][] = ["build", "test", "run", "doctor"];

export function makeTask(folder: vscode.WorkspaceFolder, def: CrtTaskDefinition): vscode.Task | undefined {
  if (!vscode.workspace.isTrusted || !COMMANDS.includes(def.command)) return undefined;
  const executable = cliPath(folder.uri);
  if (!executable) return undefined;
  const args = def.command === "doctor" ? ["doctor", "--scope", "project"] : [def.command];
  args.push("--project", def.project ?? folder.uri.fsPath);
  const task = new vscode.Task(
    def, folder, def.command, "crt",
    new vscode.ProcessExecution(executable, args, { cwd: folder.uri.fsPath }));
  if (def.command === "build") task.group = vscode.TaskGroup.Build;
  if (def.command === "test") task.group = vscode.TaskGroup.Test;
  return task;
}

export class CrtTaskProvider implements vscode.TaskProvider {
  provideTasks(): vscode.Task[] {
    if (!vscode.workspace.isTrusted) return [];
    return (vscode.workspace.workspaceFolders ?? []).flatMap(f =>
      COMMANDS.flatMap(command => makeTask(f, { type: "crt", command }) ?? []));
  }
  resolveTask(task: vscode.Task): vscode.Task | undefined {
    const def = task.definition as CrtTaskDefinition;
    const folder = typeof task.scope === "object" ? task.scope : vscode.workspace.workspaceFolders?.[0];
    return folder && def.command ? makeTask(folder, def) : undefined;
  }
}
