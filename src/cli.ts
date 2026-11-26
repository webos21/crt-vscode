import * as cp from "child_process";
import { isAbsolute } from "path";
import * as vscode from "vscode";
import { EditorCommand, isRecord, parseFinalResult, requireEditorCapability, requireEditorPayload } from "./cliProtocol";

const cliPathHelp = "Set crt.cliPath in Settings to the absolute path of your crt-cli executable.";

export function cliPath(uri: vscode.Uri): string | undefined {
  const path = vscode.workspace.getConfiguration("crt", uri).get<string>("cliPath")?.trim();
  return path && isAbsolute(path) ? path : undefined;
}

export function requireCliPath(folder: vscode.WorkspaceFolder): string {
  const executable = cliPath(folder.uri);
  if (!executable) throw new Error(cliPathHelp);
  return executable;
}

function runJson(executable: string, cwd: string, command: string, args: string[], timeout = 120_000) {
  if (!vscode.workspace.isTrusted) throw new Error("Open a trusted workspace before running crt-cli.");
  return new Promise<{ data: Record<string, unknown>; ok: boolean; stderr: string }>((resolve, reject) => {
    cp.execFile(executable, ["--json", ...args], { cwd, windowsHide: true, timeout, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && (err.killed || err.signal)) {
        reject(new Error(`crt-cli ${command} was interrupted or timed out.\n${stderr.trim()}`));
        return;
      }
      if (err && typeof err.code !== "number") {
        reject(new Error(`Could not run ${executable}.\n${err.message}`));
        return;
      }
      try {
        const result = parseFinalResult(stdout, command, err ? Number(err.code) : 0);
        resolve({ ...result, stderr });
      } catch (error) {
        reject(new Error([String(error), stderr.trim()].filter(Boolean).join("\n")));
      }
    });
  });
}

function replyError(result: { data: Record<string, unknown>; stderr: string }, fallback: string): Error {
  const message = typeof result.data.message === "string" ? result.data.message : fallback;
  return new Error([message, result.stderr.trim()].filter(Boolean).join("\n"));
}

export async function cliVersion(folder: vscode.WorkspaceFolder, executable: string): Promise<string> {
  try {
    const result = await runJson(executable, folder.uri.fsPath, "version", ["--version"], 10_000);
    const version = result.data.version;
    if (result.ok && typeof version === "string" && /^\S+$/.test(version)) return version;
    throw replyError(result, "Expected a CLI version.");
  } catch (error) {
    throw new Error(`Could not verify crt-cli at ${executable}. ${cliPathHelp}\n${error instanceof Error ? error.message : error}`);
  }
}

export async function cliCapabilities(folder: vscode.WorkspaceFolder, executable: string) {
  try {
    const result = await runJson(executable, folder.uri.fsPath, "capabilities", ["capabilities", "--api-version", "1"], 10_000);
    if (result.ok) return result.data;
    throw replyError(result, "Capability discovery failed.");
  } catch (error) {
    throw new Error(`Select a crt-cli with editor API 1 in crt.cliPath. Capability discovery failed for ${executable}.\n${error instanceof Error ? error.message : error}`);
  }
}

async function editorQuery(
  folder: vscode.WorkspaceFolder, command: EditorCommand, args: [string, ...string[]], executable = requireCliPath(folder),
) {
  const cwd = folder.uri.fsPath;
  requireEditorCapability(await cliCapabilities(folder, executable), command);
  const result = await runJson(executable, cwd, args[0], [...args, "--project", cwd, "--api-version", "1"]);
  if (!result.ok) throw replyError(result, `crt-cli ${command} failed.`);
  requireEditorPayload(result.data, command);
  return result.data;
}

export async function projectInfo(folder: vscode.WorkspaceFolder, executable?: string) {
  const data = await editorQuery(folder, "project.info", ["project", "info"], executable);
  if (data.state !== "ready" && data.state !== "unresolved" && data.state !== "incompatible") {
    throw new Error("Unsupported project state from crt-cli.");
  }
  if (!Array.isArray(data.diagnostics) || !data.diagnostics.every(d =>
      isRecord(d) && typeof d.code === "string" && typeof d.message === "string")) {
    throw new Error("Invalid project diagnostics from crt-cli.");
  }
  return data;
}

export async function firstBuildDiagnosis(folder: vscode.WorkspaceFolder, executable: string): Promise<string> {
  const cwd = folder.uri.fsPath;
  const result = await runJson(executable, cwd, "doctor", ["doctor", "--scope", "project", "--project", cwd]);
  if (!result.ok) throw replyError(result, "Project Doctor failed.");
  return typeof result.data.next_step === "string" ? result.data.next_step : "";
}

export async function exportCompileCommands(folder: vscode.WorkspaceFolder, output: string): Promise<string> {
  const data = await editorQuery(folder, "export.compile-commands", ["export", "compile-commands", "--output", output]);
  if (typeof data.output !== "string" || !isAbsolute(data.output)) {
    throw new Error("Invalid compilation database path from crt-cli.");
  }
  return data.output;
}
