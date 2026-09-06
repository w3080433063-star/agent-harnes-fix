import type { HarnessInspection, HarnessPluginDescriptor } from "@codexhost/shared-contracts";
import type { RendererModelClient } from "../renderer-model-client.js";

export type HarnessLabClient = Pick<RendererModelClient, "listHarnessPlugins" | "inspectHarness">;
export interface HarnessLabResult {
  plugin: HarnessPluginDescriptor;
  elapsedMs: number;
  inspection?: HarnessInspection;
  failed?: true;
}

export async function inspectHarnessLab(
  client: HarnessLabClient,
  plugin: HarnessPluginDescriptor,
  signal: AbortSignal,
  timeoutMs = 15_000,
): Promise<HarnessLabResult> {
  const start = performance.now();
  try {
    const inspection = await new Promise<HarnessInspection>((resolve, reject) => {
      let settled = false;
      const finish = (error?: unknown, value?: HarnessInspection): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        if (error) reject(error);
        else if (value) resolve(value);
        else reject(new Error("Empty inspection result"));
      };
      const abort = (): void => finish(new Error("Aborted"));
      const timer = setTimeout(() => finish(new Error("Timed out")), timeoutMs);
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener("abort", abort, { once: true });
      void Promise.resolve()
        .then(() => client.inspectHarness({ harnessId: plugin.id, refresh: true }))
        .then(
          (value) => finish(undefined, value),
          (error) => finish(error),
        );
    });
    return { plugin, inspection, elapsedMs: Math.round(performance.now() - start) };
  } catch {
    return { plugin, failed: true, elapsedMs: Math.round(performance.now() - start) };
  }
}

// Export only an explicit metadata allowlist: never model labels, account details, paths or errors.
export function harnessLabReport(results: readonly HarnessLabResult[]): string {
  return JSON.stringify(
    {
      version: 1,
      scope: "local-host",
      checkedAt: new Date().toISOString(),
      harnesses: results.map(({ plugin, inspection, elapsedMs }) => ({
        id: plugin.id,
        version: plugin.version,
        elapsedMs,
        status: inspection?.status ?? "checkFailed",
        ...(inspection?.status === "ready"
          ? {
              modelCount: inspection.catalog.models.length,
              capabilities: inspection.capabilities,
              nativeWebUi: inspection.webUi?.open === true,
            }
          : {}),
      })),
    },
    null,
    2,
  );
}
