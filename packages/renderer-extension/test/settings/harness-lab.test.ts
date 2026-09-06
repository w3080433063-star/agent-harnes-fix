import { expect, it, vi } from "vitest";
import { harnessIdSchema, type HarnessInspection } from "@codexhost/shared-contracts";
import { inspectHarnessLab, harnessLabReport } from "../../src/settings/harness-lab.js";

const plugin = { id: harnessIdSchema.parse("new-custom-agent"), name: "Custom", version: "1.0.0" };
const ready: HarnessInspection = {
  status: "ready",
  catalog: { models: [], thinkingOptions: [] },
  capabilities: {
    configuration: {
      selectModel: true,
      selectThinkingOption: false,
      selectPermissionMode: false,
      permissionModeScope: "live",
    },
    history: { fork: false, forkAcrossCwd: false, rollbackLastTurn: false },
  },
};
it("inspects an unknown installed plugin ID without static routing", async () => {
  const inspectHarness = vi.fn().mockResolvedValue(ready);
  const result = await inspectHarnessLab({ inspectHarness }, plugin, new AbortController().signal);
  expect(inspectHarness).toHaveBeenCalledWith({ harnessId: plugin.id, refresh: true });
  expect(result.inspection).toEqual(ready);
  expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
});
it("keeps timeout and native unsupported capability distinct", async () => {
  const result = await inspectHarnessLab(
    { inspectHarness: () => new Promise(() => {}) },
    plugin,
    new AbortController().signal,
    5,
  );
  expect(result.failed).toBe(true);
  expect(result.inspection).toBeUndefined();
});
it("does not start a check when page has already closed", async () => {
  const controller = new AbortController();
  controller.abort();
  const inspectHarness = vi.fn();
  const result = await inspectHarnessLab({ inspectHarness }, plugin, controller.signal);
  expect(inspectHarness).not.toHaveBeenCalled();
  expect(result.failed).toBe(true);
});
it("report only exports capability metadata, excluding account/model/error strings", () => {
  const report = harnessLabReport([
    {
      plugin: {
        ...plugin,
        name: "PRIVATE_NAME",
        links: { documentation: "https://example.com/private" },
      },
      elapsedMs: 10,
      inspection: {
        status: "error",
        error: { code: "PRIVATE_ERROR", message: "SECRET_TOKEN", retryable: false },
      },
    },
  ]);
  expect(report).toContain("new-custom-agent");
  expect(report).not.toMatch(/PRIVATE|SECRET/);
  const result = JSON.parse(harnessLabReport([{ plugin, inspection: ready, elapsedMs: 9 }]));
  expect(result.harnesses[0].capabilities.history.fork).toBe(false);
  expect(result.harnesses[0].modelCount).toBe(0);
});
