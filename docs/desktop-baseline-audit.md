# 桌面扩展分支

本分支直接基于 BytePioneer-AI/codex-host 源码，使用官方 Codex Desktop。
上游快照：`b402a4089b47ae50961c6bb033a35b045b13da7f`。保留上游 MIT LICENSE；这是独立修改版本。

## Windows x64

安装依赖后运行 `npm run desktop:prepare`，再双击 `Start-Desktop.cmd`。
启动会重启官方 Codex Desktop，请先完成正在执行的任务。
原生启动器、Shim 和 Updater 复用 `@codexhost/cli-win32-x64@0.5.0`，下载校验 SHA-512；Host、Harness 插件与 Renderer 从本分支源码编译。没有在本机重新编译 Rust。

## 新增：设置 → Harness 能力对比

- 动态发现本机已启用的插件，包括固定选择器名单之外的新 ID；支持名称/ID 搜索。
- 逐项检测模型数量、Thinking、权限范围、Fork、跨项目 Fork、回退、子任务观察和原生 Web UI 能力。
- 记录能力检测耗时。15 秒无响应显示检测失败，与不支持分开。它不是模型首字速度测试。
- 导出报告只保留插件 ID、版本、状态、耗时、模型数量和能力。排除账号、模型名称、工作目录及原始错误。
- 中英文界面。官方 Codex 沿用原生路径，不作为外部插件计数。

页面呈现适配器声明与检查结果，不代表所有能力都已逐项执行验证。没有新增插件安装、自动启用或动态 Composer 选择器。

## 上游差距核查

| 项目 | 已核实状态 | 处理 |
|---|---|---|
| 动态 Harness 选择器 | 插件运行时文档明确尚未完成，后端目录已存在 | 本版先补动态发现和能力对比 |
| Pi / 新版 DSH 本地历史导入 | 已有接口和设置页 | 保留，不重复开发 |
| 远程/Broker 历史导入 | 文档列为未完成 | 后续候选 |
| 外部会话置顶 | Issue 162 报告，已有未合并 PR 131 | 需验证已有修复 |
| Pi Side Chat | Issue 6 功能请求仍开放 | 后续候选 |
| 跨 Harness 同会话切换 | 术语表规定一个 Thread 属于一个 Harness | 后续采用新原生 Thread 与可查看交接记录 |
| 桌面版本兼容 | 上游有升级诊断文档 | 当前客户端完整启动尚未验收 |

来源：[源码基线](https://github.com/BytePioneer-AI/codex-host/tree/b402a4089b47ae50961c6bb033a35b045b13da7f)、[插件运行时](https://github.com/BytePioneer-AI/codex-host/blob/b402a4089b47ae50961c6bb033a35b045b13da7f/docs/harness-plugin-runtime.md)、[置顶报告](https://github.com/BytePioneer-AI/codex-host/issues/162)、[已有修复](https://github.com/BytePioneer-AI/codex-host/pull/131)、[Side Chat](https://github.com/BytePioneer-AI/codex-host/issues/6)。开放 Issue 不等于最新代码仍存在该问题。

后续特色功能候选：可审查的跨 Harness 交接；任务级启动/首字/工具耗时诊断；独立工作目录的并行任务组。这些尚未实现。

## 本轮验证

- 9 个相关测试文件、66 项测试通过；TypeScript 类型检查和改动文件 ESLint 通过。
- TypeScript、预装 Harness 插件、桌面 Renderer 构建通过；Windows 启动二进制已准备。
- 本机 Pi 原生适配器通过 `pi.cmd` 返回 ready、7 个模型，支持模型/Thinking 切换及 Fork/回退，不支持会话级权限切换。
- 未退出当前官方 Codex Desktop，因此尚未验证完整桌面注入及当前客户端版本兼容；没有执行付费模型任务。
