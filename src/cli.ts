import * as cp from "child_process";
import { isAbsolute } from "path";
import * as vscode from "vscode";
import { EditorCommand, isRecord, parseFinalResult, requireEditorCapability, requireEditorPayload } from "./cliProtocol";

export const cliPathHelp = "Set crt.cliPath to the absolute path of your crt-cli executable.";

export function cliPath(uri: vscode.Uri): string | undefined {
  const path = vscode.workspace.getConfiguration("crt", uri).get<string>("cliPath")?.trim();
  return path && isAbsolute(path) ? path : undefined;
}

function runJson(executable: string, args: [string, ...string[]], cwd: string) {
  if (!vscode.workspace.isTrusted) throw new Error("Open a trusted workspace before running crt-cli.");
  return new Promise<{ data: Record<string, unknown>; ok: boolean; stderr: string }>((resolve, reject) => {
    cp.execFile(executable, ["--json", ...args], { cwd, windowsHide: true, timeout: 120_000, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && (err.killed || err.signal)) {
        reject(new Error(`crt-cli ${args[0]} was interrupted or timed out.\n${stderr.trim()}`));
        return;
      }
      if (err && typeof err.code !== "number") {
        reject(new Error(`Could not run ${executable}. ${cliPathHelp}\n${err.message}`));
        return;
      }
      try {
        const result = parseFinalResult(stdout, args[0], err ? Number(err.code) : 0);
        resolve({ ...result, stderr });
      } catch (error) {
        reject(new Error([String(error), stderr.trim()].filter(Boolean).join("\n")));
      }
    });
  });
}

async function editorQuery(folder: vscode.WorkspaceFolder, command: EditorCommand, args: [string, ...string[]]) {
  const executable = cliPath(folder.uri);
  if (!executable) throw new Error(cliPathHelp);
  const cwd = folder.uri.fsPath;
  const capabilities = await runJson(executable, ["capabilities", "--api-version", "1"], cwd);
  if (!capabilities.ok) {
    const detail = capabilities.data.message;
    throw new Error([`Select a crt-cli with editor API 1 in crt.cliPath. ${executable} could not advertise capabilities.`,
      typeof detail === "string" ? detail : "", capabilities.stderr.trim()].filter(Boolean).join("\n"));
  }
  requireEditorCapability(capabilities.data, command);
  const result = await runJson(executable, [...args, "--project", cwd, "--api-version", "1"], cwd);
  if (!result.ok) {
    const detail = result.data.message;
    throw new Error([typeof detail === "string" ? detail : `crt-cli ${command} failed.`,
      result.stderr.trim()].filter(Boolean).join("\n"));
  }
  requireEditorPayload(result.data, command);
  return result.data;
}

export async function projectInfo(folder: vscode.WorkspaceFolder) {
  const data = await editorQuery(folder, "project.info", ["project", "info"]);
  if (data.state !== "ready" && data.state !== "unresolved" && data.state !== "incompatible") {
    throw new Error("Unsupported project state from crt-cli.");
  }
  if (!Array.isArray(data.diagnostics) || !data.diagnostics.every(d =>
      isRecord(d) && typeof d.code === "string" && typeof d.message === "string")) {
    throw new Error("Invalid project diagnostics from crt-cli.");
  }
  return data;
}

export async function exportCompileCommands(folder: vscode.WorkspaceFolder, output: string): Promise<string> {
  const data = await editorQuery(folder, "export.compile-commands", ["export", "compile-commands", "--output", output]);
  if (typeof data.output !== "string" || !isAbsolute(data.output)) {
    throw new Error("Invalid compilation database path from crt-cli.");
  }
  return data.output;
}
