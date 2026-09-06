# 开源致谢与代码来源

Agent Harness Desktop 基于 [BytePioneer-AI/CodexHost](https://github.com/BytePioneer-AI/codex-host) 二次开发。

- 导入基线：`b402a4089b47ae50961c6bb033a35b045b13da7f`。
- 上游版权：Copyright (c) 2026 BytePioneer-AI。
- 许可证：[MIT LICENSE](LICENSE)，保留原始声明。
- 沿用范围：桌面启动、协议代理、原生 Harness 适配、会话映射和桌面交互扩展。
- 本分支新增：能力对比、搜索、检测计时、元数据报告导出、Windows 准备脚本及相关测试。

Windows 原生启动二进制来自 `@codexhost/cli-win32-x64@0.5.0`，准备脚本验证固定 SHA-512。相关依赖保留各自许可证。

官方 Codex Desktop 及各 Harness 由各自维护者提供。本项目的名称与文档调整不改变代码来源和版权归属。
