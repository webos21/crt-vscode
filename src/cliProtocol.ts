export interface CliResult {
  schema: "crt-cli.bootstrap-result";
  format: 1;
  command: string;
  ok: boolean;
  data: Record<string, unknown>;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFinalResult(stdout: string, command: string, exitCode: number): CliResult {
  let value: unknown;
  try {
    value = JSON.parse(stdout);
  } catch {
    throw new Error(`Expected a single JSON result from crt-cli ${command}.`);
  }
  if (!isRecord(value) || value.schema !== "crt-cli.bootstrap-result" || value.format !== 1 ||
      value.command !== command || typeof value.ok !== "boolean" || !isRecord(value.data)) {
    throw new Error(`Unsupported JSON result from crt-cli ${command}.`);
  }
  if (value.ok !== (exitCode === 0)) {
    throw new Error(`crt-cli ${command} reported an outcome inconsistent with exit ${exitCode}.`);
  }
  return { schema: value.schema, format: value.format, command, ok: value.ok, data: value.data };
}

export const editorCommands = {
  "project.info": "crt-cli.project-info",
  "export.compile-commands": "crt-cli.compile-commands-export",
} as const;
export type EditorCommand = keyof typeof editorCommands;

export function requireEditorCapability(data: Record<string, unknown>, command: EditorCommand): void {
  const entry = isRecord(data.commands) ? data.commands[command] : undefined;
  const result = data.result;
  if (data.schema !== "crt-cli.capabilities" || data.format !== 1 ||
      !Array.isArray(data.api_versions) || !data.api_versions.includes(1) ||
      !isRecord(entry) || entry.api_version !== 1 || entry.schema !== editorCommands[command] || entry.format !== 1 ||
      !isRecord(result) || result.schema !== "crt-cli.bootstrap-result" || result.format !== 1 ||
      result.stdout !== "single-final-object" || result.child_output !== "stderr" ||
      (command === "project.info" && entry.read_only !== true) ||
      (command === "export.compile-commands" && (entry.arguments !== true || entry.builds !== false ||
        entry.database_format !== "clang-json-compilation-database"))) {
    throw new Error(`The selected crt-cli does not advertise editor API 1 for ${command}. Set crt.cliPath to an executable that supports it.`);
  }
}

export function requireEditorPayload(data: Record<string, unknown>, command: EditorCommand): void {
  if (data.schema !== editorCommands[command] || data.format !== 1 || data.api_version !== 1) {
    throw new Error(`Unsupported editor API payload for ${command}.`);
  }
}
