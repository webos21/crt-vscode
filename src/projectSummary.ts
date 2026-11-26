import { isRecord } from "./cliProtocol";

function stringField(value: unknown, key: string): string | undefined {
  const field = isRecord(value) ? value[key] : undefined;
  return typeof field === "string" ? field : undefined;
}

export function projectSummary(data: Record<string, unknown>): string {
  const project = isRecord(data.project) ? data.project : {};
  const sdk = isRecord(data.sdk) ? data.sdk : {};
  const target = [stringField(sdk.target, "os"), stringField(sdk.target, "arch")].filter(Boolean).join("/");
  const version = stringField(data.selection, "version");
  const profile = stringField(data.sdk, "profile");
  const lockPath = stringField(data.lock, "path");
  const lock = lockPath ? `${stringField(data.lock, "state") ?? "present"} (${lockPath})` :
    data.state === "unresolved" && data.lock === null ? "Missing" : "Unavailable";
  const lines = [
    `Project  ${stringField(project.package, "name") ?? stringField(project, "root") ?? "Unavailable"}`,
    `State    ${data.state}`,
    `SDK      ${version ? [version, profile].filter(Boolean).join(" ") : "No verified selection"}`,
    `Target   ${target || stringField(project.sdk_request, "target") || "Unavailable"}`,
    `Lock     ${lock}`,
  ];
  const sdkRoot = stringField(data.sdk, "root");
  if (sdkRoot) lines.push(`SDK root ${sdkRoot}`);
  const content = stringField(data.selection, "sdk_content_sha256");
  if (content) lines.push(`SDK SHA-256  ${content}`);

  if (Array.isArray(data.targets)) {
    const names = data.targets.map(item => stringField(item, "name")).filter(Boolean);
    if (names.length) lines.push(`Targets  ${names.join(", ")}`);
  }
  if (Array.isArray(data.diagnostics)) {
    for (const diagnostic of data.diagnostics) {
      const message = stringField(diagnostic, "message");
      if (message) lines.push(`- ${message}`);
    }
  }
  return lines.join("\n");
}
