import type { HarnessPluginDescriptor } from "@codexhost/shared-contracts";
import type { RendererSettingsPageDefinition, RendererSettingsPageMountContext } from "./core.js";
import type { RendererSettingsMessages } from "./localization.js";
import {
  inspectHarnessLab,
  harnessLabReport,
  type HarnessLabClient,
  type HarnessLabResult,
} from "./harness-lab.js";

export function createHarnessLabPage(
  messages: RendererSettingsMessages,
  getClient: () => HarnessLabClient | null,
): RendererSettingsPageDefinition {
  const zh = messages.locale === "zh-CN";
  return Object.freeze({
    id: "harness-lab",
    label: zh ? "Harness 能力对比" : "Harness comparison",
    icon: "diagnose",
    mount(context: RendererSettingsPageMountContext) {
      const doc = context.content.ownerDocument;
      const title = doc.createElement("h2");
      title.textContent = zh ? "本机 Harness 能力对比" : "Local Harness comparison";
      const note = doc.createElement("p");
      note.className = "settings-page-description";
      note.textContent = zh
        ? "从本机已启用插件读取真实能力。检测可能启动原生进程，不提交模型任务。耗时是能力检测时间，不是模型首字速度。官方 Codex 沿用原生路径，不属于外部插件目录。"
        : "Inspect enabled local plugins. Checks may start native processes, but submit no model tasks. Timing measures inspection, not model latency. Native Codex is not an external plugin.";
      const controls = doc.createElement("div");
      controls.className = "settings-lab-controls";
      const search = doc.createElement("input");
      search.placeholder = zh ? "搜索 Harness / ID" : "Search Harness / ID";
      search.setAttribute("aria-label", search.placeholder);
      const refresh = doc.createElement("button");
      refresh.className = "settings-command-button";
      refresh.textContent = zh ? "刷新插件目录" : "Refresh plugins";
      const exportButton = doc.createElement("button");
      exportButton.className = "settings-command-button settings-command-button--secondary";
      exportButton.textContent = zh ? "导出能力报告" : "Export report";
      exportButton.disabled = true;
      const status = doc.createElement("p");
      status.setAttribute("role", "status");
      const list = doc.createElement("div");
      list.className = "settings-lab-list";
      controls.append(search, refresh, exportButton);
      context.content.append(title, note, controls, status, list);
      let plugins: readonly HarnessPluginDescriptor[] = [];
      const results = new Map<string, HarnessLabResult>();
      const busy = new Set<string>();
      let generation = 0;
      const yes = (value: boolean | undefined): string =>
        value === undefined
          ? zh
            ? "未声明"
            : "Not reported"
          : value
            ? zh
              ? "支持"
              : "Supported"
            : zh
              ? "不支持"
              : "Unsupported";
      const render = (): void => {
        refresh.disabled = busy.size > 0;
        list.replaceChildren();
        for (const plugin of plugins.filter((p) =>
          (p.name + " " + p.id).toLowerCase().includes(search.value.toLowerCase()),
        )) {
          const card = doc.createElement("section");
          card.className = "settings-lab-card";
          const heading = doc.createElement("h3");
          heading.textContent = plugin.name;
          const meta = doc.createElement("p");
          meta.textContent = `${plugin.id} · v${plugin.version}`;
          const check = doc.createElement("button");
          check.className = "settings-command-button settings-command-button--secondary";
          check.disabled = busy.has(plugin.id);
          check.textContent = busy.has(plugin.id)
            ? zh
              ? "检测中…"
              : "Checking…"
            : zh
              ? "检测原生能力"
              : "Inspect capabilities";
          check.addEventListener(
            "click",
            () => {
              const client = getClient();
              if (!client) return;
              const requested = generation;
              busy.add(plugin.id);
              render();
              void inspectHarnessLab(client, plugin, context.signal).then((result) => {
                if (context.signal.aborted || requested !== generation) return;
                busy.delete(plugin.id);
                results.set(plugin.id, result);
                exportButton.disabled = false;
                render();
              });
            },
            { signal: context.signal },
          );
          card.append(heading, meta, check);
          const result = results.get(plugin.id);
          if (result) {
            const state = doc.createElement("p");
            state.textContent = `${result.inspection?.status ?? (zh ? "检测失败或超时" : "Failed or timed out")} · ${result.elapsedMs} ms`;
            card.append(state);
            if (result.inspection?.status === "ready") {
              const info = result.inspection,
                c = info.capabilities;
              const rows: [string, string][] = [
                [zh ? "可用模型" : "Models", String(info.catalog.models.length)],
                [zh ? "切换模型" : "Model selection", yes(c.configuration.selectModel)],
                [zh ? "思考强度" : "Thinking selection", yes(c.configuration.selectThinkingOption)],
                [
                  zh ? "权限切换" : "Permission selection",
                  yes(c.configuration.selectPermissionMode),
                ],
                [
                  zh ? "权限生效范围" : "Permission scope",
                  c.configuration.selectPermissionMode
                    ? c.configuration.permissionModeScope === "atCreate"
                      ? zh
                        ? "创建时固定"
                        : "Fixed at creation"
                      : zh
                        ? "会话内切换"
                        : "Live"
                    : "—",
                ],
                ["Fork", yes(c.history.fork)],
                [zh ? "跨项目 Fork" : "Cross-project Fork", yes(c.history.forkAcrossCwd)],
                [zh ? "回退上一轮" : "Rollback", yes(c.history.rollbackLastTurn)],
                [zh ? "观察子任务" : "Observe subagents", yes(c.subagents?.observe)],
                [zh ? "读取子任务记录" : "Subagent transcript", yes(c.subagents?.readTranscript)],
                [zh ? "原生 Web 界面" : "Native Web UI", yes(info.webUi?.open)],
              ];
              const grid = doc.createElement("dl");
              for (const [label, value] of rows) {
                const dt = doc.createElement("dt"),
                  dd = doc.createElement("dd");
                dt.textContent = label;
                dd.textContent = value;
                grid.append(dt, dd);
              }
              card.append(grid);
            }
          }
          if (plugin.links?.documentation) {
            const link = doc.createElement("a");
            link.href = plugin.links.documentation;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = zh ? "原生文档 ↗" : "Documentation ↗";
            card.append(link);
          }
          list.append(card);
        }
        if (!list.childElementCount) {
          const empty = doc.createElement("p");
          empty.textContent = zh ? "没有匹配的已启用插件" : "No matching enabled plugins";
          list.append(empty);
        }
      };
      const load = (): void => {
        generation++;
        results.clear();
        busy.clear();
        exportButton.disabled = true;
        plugins = [];
        render();
        const client = getClient();
        const listPlugins = client?.listHarnessPlugins;
        if (!client || !listPlugins) {
          status.textContent = zh ? "当前 Host 不支持插件目录" : "Plugin directory unavailable";
          return;
        }
        refresh.disabled = true;
        status.textContent = zh ? "读取本机插件目录…" : "Loading local plugins…";
        void context.runLatest(() => listPlugins.call(client), {
          success(value) {
            plugins = value.plugins;
            refresh.disabled = false;
            status.textContent = zh
              ? `发现 ${plugins.length} 个已启用插件；点击检测查看能力`
              : `${plugins.length} enabled plugins; inspect to compare`;
            render();
          },
          failure() {
            refresh.disabled = false;
            status.textContent = zh
              ? "目录读取失败，请检查 Host 连接后重试"
              : "Directory request failed; check Host and retry";
          },
        });
      };
      search.addEventListener("input", render, { signal: context.signal });
      refresh.addEventListener("click", load, { signal: context.signal });
      exportButton.addEventListener(
        "click",
        () => {
          const url = URL.createObjectURL(
            new Blob([harnessLabReport([...results.values()])], { type: "application/json" }),
          );
          const link = doc.createElement("a");
          link.href = url;
          link.download = "harness-capabilities.json";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        { signal: context.signal },
      );
      load();
      return undefined;
    },
  });
}
