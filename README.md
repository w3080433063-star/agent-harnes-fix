# Agent Harness Desktop

在同一个桌面工作台中使用不同的本地编程 Agent，保留各自的模型、工具与会话行为。

项目使用官方 Codex Desktop 作为交互界面，当前为开发预览版。

## 当前功能

- **多 Harness 桌面接入**：沿用原生适配器连接 Pi、Claude Code、DeepSeek Harness 等引擎。
- **能力对比**：动态发现已启用插件，对比模型数量、思考强度选择、权限范围、Fork、回退和子任务能力。
- **检测与搜索**：按名称或 ID 搜索，区分检测失败与能力不支持，并记录检测耗时。
- **报告导出**：导出能力元数据，不包含账号、工作目录、模型名称与原始错误。
- **中英文界面**：能力对比入口位于桌面设置中。

能力对比、搜索、检测计时和报告导出是本分支新增功能；桌面接入与基础适配来自下方注明的开源基础。

## Windows x64 快速开始

需要官方 Codex Desktop、Node.js 22.19 或 24，以及 npm、Git 和 tar。

```powershell
git clone --branch codex/agent-harness-desktop https://github.com/w3080433063-star/agent-harnes-fix.git
cd agent-harnes-fix
npm ci --ignore-scripts
npm run desktop:prepare
npm start -- --no-build
```

准备完成后，也可双击 `Start-Desktop.cmd`。启动会重启当前 Codex Desktop，请先完成正在执行的任务。

进入桌面设置中的 **Harness 能力对比** 查看本机插件。检测耗时代表能力检查时间，不是模型生成速度。详细说明见 [桌面使用指南](DESKTOP-EXTENSIONS.md)。

## 当前边界

- 完整桌面注入与当前官方客户端版本的兼容性仍需实机验收。
- 原生适配器报告的能力不代表已逐项执行验证全部功能。
- 动态插件目录不等于插件市场；新插件自动进入输入框选择器尚未完成。
- 每个原生会话属于一个 Harness，跨 Harness 交接仍在规划中。

## 开发方向

1. 可审查的任务交接：展示目标、约束、文件变化与未完成项。
2. 任务速度诊断：区分启动、首个事件、首字、工具和总耗时。
3. 并行任务组：使用独立工作目录，检查结果后选择合并。

以上是规划，尚未实现。已有核查与验证记录见 [开发基线](docs/desktop-baseline-audit.md)。

## 开发验证

```powershell
npm run typecheck
npm run build:renderer
```

完整原生源码构建使用 `npm run build`，需要 Rust。Windows 的 `desktop:prepare` 校验并复用固定版本的原生启动二进制，再编译本分支的 Host、插件和界面扩展。

## 开源基础与许可

基于 [CodexHost](https://github.com/BytePioneer-AI/codex-host) 二次开发，保留其 MIT 许可证与版权声明。来源与修改范围见 [开源致谢](ACKNOWLEDGEMENTS.md)。本项目不是 OpenAI 或 CodexHost 的官方发行版。
