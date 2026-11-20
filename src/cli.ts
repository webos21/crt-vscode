import * as cp from "child_process";
import * as vscode from "vscode";

/** Final JSON envelope printed by `crt-cli --json` (schema crt-cli.bootstrap-result, format 1). */
export interface CliResult<T = Record<string, unknown>> {
  schema: string;
  format: number;
  command: string;
  ok: boolean;
  data: T;
}

export function cliPath(): string {
  return vscode.workspace.getConfiguration("crt").get<string>("cliPath")?.trim() || "crt-cli";
}

/**
 * Run crt-cli with --json and parse the single final JSON object from stdout.
 * The extension never reconstructs compiler flags itself: crt-cli is the only build engine.
 */
export function runJson(args: string[], cwd: string): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    cp.execFile(cliPath(), ["--json", ...args], { cwd, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      const line = stdout.trim().split(/\r?\n/).pop() ?? "";
      try {
        resolve(JSON.parse(line) as CliResult);
      } catch {
        reject(new Error(err ? `${err.message}\n${stderr}` : `Unparseable crt-cli output: ${line}`));
      }
    });
  });
}

/** True if `crt-cli --help` mentions the given subcommand (capability probe for V0 commands). */
export async function supports(subcommand: string, cwd: string): Promise<boolean> {
  try {
    const r = await runJson(["--help"], cwd);
    return JSON.stringify(r.data).includes(subcommand);
  } catch {
    return false;
  }
}
