# codex-desktop-compatibility-guidance Specification

## Purpose

定义 Codex Desktop 私有结构仅内部标识未评审时的可继续提示、固定操作、本地确认和脱敏诊断边界。
## Requirements
### Requirement: Recoverable Renderer installation failures SHALL NOT be compatibility guidance
Launcher compatibility guidance SHALL NOT present Title Policy structure failure、Agent routing structure failure、Draft routing structure failure或未分类inspection failure为用户可见兼容问题。这些失败 MUST NOT触发兼容弹窗、兼容专用更新入口、自动切换原版Codex或本地兼容确认写入。

#### Scenario: Controller正在恢复Renderer能力
- **WHEN** 当前Controller无法完成Title、Agent、Draft或inspection安装但保持运行重试
- **THEN** Launcher SHALL继续受管codexhost启动且不显示兼容弹窗
- **AND** SHALL NOT因该状态调用兼容专用更新检查、写入兼容确认或自动切换原版Codex

### Requirement: Production readiness SHALL omit removed blocking outcomes
当前生产Controller payload SHALL NOT序列化`incompatible`或`detection-failed`，也 SHALL NOT输出`title-isolation-structure-unavailable`、`agent-routing-structure-unavailable`、`draft-routing-structure-unavailable`或`inspection-failed`issue。

#### Scenario: 初始安装抛出结构错误
- **WHEN** Renderer Session初始安装失败
- **THEN** 该错误 SHALL成为Controller内部恢复状态而不是readiness issue
- **AND** 首个生产readiness行 SHALL不包含已删除capability或reason

### Requirement: 兼容诊断 SHALL 有界且脱敏
技术诊断 SHALL只包含 Desktop/codexhost版本、能力、稳定reason code以及必要结构状态。Launcher MUST NOT为Renderer兼容状态生成用户提示或持久化确认。诊断 MUST NOT包含Prompt、Transcript、Model值、Thread/Request ID、函数源码、凭据或用户路径。

#### Scenario: warning 被记录和展示
- **WHEN** Controller记录Renderer集成恢复失败
- **THEN** 技术日志 SHALL使用有界稳定状态定位失败阶段
- **AND** Launcher SHALL不显示兼容弹窗或保存兼容确认
- **AND** 所有未声明的运行时业务数据 SHALL被省略
