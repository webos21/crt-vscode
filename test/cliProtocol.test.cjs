const assert = require("node:assert/strict");
const { test } = require("node:test");
const { parseFinalResult, requireEditorCapability, requireEditorPayload } = require("../out/cliProtocol.js");

function result(command, ok, data = {}) {
  return JSON.stringify({ schema: "crt-cli.bootstrap-result", format: 1, command, ok, data }, null, 2);
}

const projectPayload = { schema: "crt-cli.project-info", format: 1, api_version: 1 };
const capabilities = {
  schema: "crt-cli.capabilities", format: 1, api_versions: [1],
  commands: { "project.info": { ...projectPayload, read_only: true } },
  result: { schema: "crt-cli.bootstrap-result", format: 1, stdout: "single-final-object", child_output: "stderr" },
};

test("accepts one pretty-printed envelope and preserves CLI and child failures", () => {
  const diagnostic = { code: "failure", message: "An input is missing" };
  assert.deepEqual(parseFinalResult(result("doctor", false, diagnostic), "doctor", 1).data, diagnostic);
  const outcomes = { outcomes: [{ exit_code: 7 }] };
  assert.deepEqual(parseFinalResult(result("run", false, outcomes), "run", 1).data, outcomes);
  assert.equal(parseFinalResult(result("build", true), "build", 0).ok, true);
});

test("rejects mixed stdout, invalid payloads, foreign commands and exit mismatches", () => {
  const reply = result("project", true);
  for (const stdout of [`log\n${reply}`, `${reply}\nlog`, `${reply}\n${reply}`]) {
    assert.throws(() => parseFinalResult(stdout, "project", 0), /single JSON result/);
  }
  assert.throws(() => parseFinalResult(reply, "build", 0), /Unsupported JSON result/);
  assert.throws(() => parseFinalResult(result("project", true, []), "project", 0), /Unsupported JSON result/);
  assert.throws(() => parseFinalResult(reply, "project", 1), /inconsistent with exit/);
  assert.throws(() => parseFinalResult(result("project", false), "project", 0), /inconsistent with exit/);
});

test("validates editor support per command and refuses incompatible versions", () => {
  assert.doesNotThrow(() => requireEditorCapability(capabilities, "project.info"));
  assert.throws(() => requireEditorCapability(capabilities, "export.compile-commands"), /does not advertise editor API 1/);
  assert.throws(() => requireEditorCapability({ ...capabilities, api_versions: [2] }, "project.info"), /does not advertise editor API 1/);
  assert.doesNotThrow(() => requireEditorPayload(projectPayload, "project.info"));
  assert.throws(() => requireEditorPayload({ ...projectPayload, format: 2 }, "project.info"), /Unsupported editor API payload/);
});
