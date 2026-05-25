# 变更日志 (CHANGE_LOG)

> **约定**：凡 SRS_Frontend.md / SRS_Supply.md 未涵盖、或原设计有缺陷而在演示代码中做出增改的功能，均记录于此文件。  
> 每次变更追加一个 patch 条目，格式：`## Patch N — YYYY-MM-DD — 变更概要`

---

## Patch 1 — 2026-05-25 — 修复规则参数配置数据元选择器空白问题

**问题**：质控规则管理→规则分类，新增/编辑规则进入第二步"规则参数配置"后，选择数据集后数据元下拉框内容为空（显示"undefined（undefined）"），导致无法完成规则配置，从而无法进入第三步 SQL 预览与测试。

**根本原因**：`useDatasetElements.js` 中 `elementLabel` 函数使用 `el.element_name` / `el.element_code`（snake_case），而 Mock 数据中字段名为 `el.elementName` / `el.elementCode`（camelCase），导致取值为 `undefined`。

**变更**：
- `src/views/Rule/components/params/useDatasetElements.js`：`elementLabel` 函数兼容 camelCase 与 snake_case 两种字段命名（`el.elementName || el.element_name`）。

**偏离 SRS 说明**：原 SRS 对此函数未作字段命名约定，此处明确统一采用 camelCase 作为 Mock 数据标准格式。

---

## Patch 2 — 2026-05-25 — 数据集配置新增完整 CRUD 功能

**问题**：SRS_Frontend.md §3.5 数据集配置子页面原设计仅有"编辑"和"同步字段"操作，缺少"新增数据集"和"删除数据集"功能，且数据元（字段）无任何管理入口。演示时无法体现配置流程的完整性。

**变更**：
- `src/mocks/store/datasetStore.js`（新增）：数据集 + 数据元的内存 CRUD Store，支持新增/更新/删除数据集及其数据元，刷新页面重置为初始数据。
- `src/mocks/handlers/dataset.js`：补充 `POST /api/dataset`（创建数据集）、`DELETE /api/dataset/:id`（删除数据集）、`POST /api/dataset/:id/elements`（创建数据元）、`PUT /api/dataset/:id/elements/:elementId`（更新数据元）、`DELETE /api/dataset/:id/elements/:elementId`（删除数据元）共 5 个新接口，并为 `GET /api/dataset` 和 `GET /api/dataset/:id/elements` 增加关键词过滤。
- `src/views/DataSource/dataset/index.vue`：页面增加"新增数据集"按钮（PageContainer #actions 插槽）、操作列补充"数据元"入口和"删除"按钮，删除时弹出包含影响说明的确认框。
- `src/views/DataSource/dataset/components/DatasetFormDialog.vue`：重构为兼容新增/编辑两种模式；新增时展示数据集编码、名称、所属数据源输入项；编辑时只读显示编码/名称，仅允许修改机构代码字段、业务主键、是否必选和排序号；机构代码字段在有已同步字段时以 Select 方式展示，否则可手工输入。
- `src/views/DataSource/dataset/components/ElementManageDialog.vue`（新增）：数据元管理抽屉对话框，支持在数据集内进行数据元的增删改查（关键词搜索 + 分页），字段属性包含名称、编码、类型、是否必填、备注。

**新增接口**（与 SRS_Supply.md §4.7 部分对齐）：
- `POST /api/dataset` — 创建数据集
- `DELETE /api/dataset/:id` — 删除数据集
- `POST /api/dataset/:id/elements` — 在数据集内创建数据元
- `PUT /api/dataset/:id/elements/:elementId` — 更新数据元
- `DELETE /api/dataset/:id/elements/:elementId` — 删除数据元

---

## Patch 3 — 2026-05-25 — 质控结果全局统计概览图表支持按机构下钻

**问题**：SRS_Frontend.md §6.1.3 要求切换机构筛选后所有卡片和图表同步刷新，但原 Mock 实现中"按规则分类问题数占比"饼图和"按数据集问题数排名 Top10"柱状图的接口不接受 `orgId` 参数，导致切换机构后图表数据不变，无法体现不同机构的质控特征。

**变更**：
- `src/mocks/handlers/result.js`：
  - `GET /api/result/summary` 接口增加按 `orgId` 返回不同机构的数据（8家机构各有独立统计数据），覆盖全局/机构两种场景。
  - `GET /api/result/chart/category-pie` 接口新增 `orgId` 参数，不同机构有不同的问题类型分布权重（如达州市中医医院空值问题多，达州市中心医院值域问题多）；以确定性种子函数生成，刷新不跳变。
  - `GET /api/result/chart/dataset-ranking` 接口新增 `orgId` 参数，不同机构的数据集问题数排名有差异化分布；以确定性种子函数生成。

**新增设计**（SRS 未细化）：
- 8家机构各有对应的问题分类权重配置，体现不同医院的质控特点差异。
- 汇总视图（orgId=0）使用加权平均分布，具有合理的全局统计含义。

---

## Patch 4 — 2026-05-25 — 问题明细演示数据扩充至 40 条，覆盖全部 8 家医院

**问题**：原问题明细 Mock 数据仅 20 条，且医院名称不够真实（仅覆盖 5 家机构），达县人民医院、宣汉县人民医院、开江县中医院、大竹县人民医院等均缺少演示数据，无法体现多机构场景。

**变更**：
- `src/mocks/data/resultDetails.js`：将演示数据从 20 条扩充至 40 条，全面覆盖 SRS_Supply.md §14.1 中 8 家机构（orgId 1-8），每家机构有 3-7 条问题记录；问题数据包含所有 `isFixed` 状态（0/1/2/3）；业务 ID 格式统一为真实格式（如 `BR20260001234`、`JZ20260045678`、`ZY20260032001`）；问题描述更详细、具有业务含义。

---

## Patch 5 — 2026-05-25 — 数据质量报告修复排名逻辑 + 新增生成报告功能

### 5a — 报告数据修复（排名不合理）

**问题**：原 Mock 报告数据中 Report ID 3、4、6 均设置 `ranking: 1`（3份报告同列第一），严重不符合业务逻辑（同月只能有1家机构排第一）。另外演示数据缺少"质量差"的医院作为反面教材，无法体现质控系统的督促意义。

**变更**：
- `src/mocks/data/report.js`：完全重构报告数据，新增 8 家机构 × 2 个月（2026-04 / 2026-05）共 15 条报告，排名唯一且合理；
  - 大竹县人民医院在两个月报告中均为末位（评分 48.2 / 无法参评），作为系统性问题的"负面教材"，分析文字中包含严重警示和具体整改要求；
  - 通川区人民医院连续两月第一，分析中建议分享经验；
  - 各机构评分、问题率、整改率均有梯度差异，从 93 分到 48 分分布合理；
  - 分析文字更具业务指导意义，包含具体整改建议和量化目标。

### 5b — 新增生成报告功能

**问题**：SRS_Frontend.md §7 描述"报告选择区"和"展示"，但未设计"生成报告"的操作入口，演示时只能查看预置的静态报告，无法体现报告是由系统质控执行后动态生成的业务流程。

**新增功能**：
- `src/api/report.js`：新增 `generateMonthlyReport(payload)` API 封装，调用 `POST /api/report/generate`。
- `src/mocks/handlers/report.js`：新增 `POST /api/report/generate` Mock 接口，接受 `orgId` + `reportMonth`，生成新报告并写入内存存储；已存在则返回 409 提示。
- `src/mocks/data/report.js`：新增 `generateMockReport()` 函数，基于机构特征生成合理的质控指标，`getAllReports()` 聚合静态数据和动态生成数据。
- `src/views/Report/index.vue`：`dataScope <= 2` 的用户（区域/超级管理员）在顶部控制栏中显示"生成报告"按钮（魔法棒图标），点击弹出对话框，选择机构 + 月份后触发生成，生成成功后自动刷新报告列表并定位到新报告；重复生成同一机构同月报告时给出友好提示而非报错。
- 引入 `MagicStick` 图标，`reactive` 的 `generateForm` 状态管理，以及 `disabledFutureMonth` 限制只能生成过去月份的报告。

---

## Patch 6 — 2026-05-25 — 修复规则表单弹窗内容显示不完整问题

**问题**：规则新增/编辑采用步骤式弹窗（860px × 85vh），第二步规则参数配置内容较多时，弹窗内容区未设置 `overflow-y: auto`，导致内容超出可视区域被截断，底部按钮可能与内容叠压；第三步测试结果表格很长时同样出现内容溢出问题。此外，弹窗 `ElMessageBox.confirm`（放弃编辑确认框）在部分情况下被弹窗遮挡。

**变更**：
- `src/views/Rule/components/RuleFormDialog.vue`：
  - 弹窗改用 CSS class `rule-form-dialog` 而非内联 style 控制高度，通过全局 `<style>` 块精确控制 `.el-dialog__body` 的 `max-height` 和 `overflow-y: auto`；
  - 弹窗容器采用 flex 纵向布局，header、body、footer 各自 flex-shrink，避免内容区撑开覆盖按钮区；
  - footer 增加顶部分割线，视觉上与内容区分离。

---

## Patch 7 — 2026-05-25 — Mock 数据全量 CRUD 能力验证与补全

**要求**：SRS_Supply.md §4.4 要求演示系统支持真实的新增、编辑、删除操作，数据随操作动态变化。

**已实现 CRUD 的模块**（本次统一验证）：

| 模块 | Store 文件 | 已支持操作 |
|------|-----------|-----------|
| 数据源管理 | `mocks/store/datasourceStore.js` | C/R/U/D + 测试连接 + 同步 |
| 数据集配置 | `mocks/store/datasetStore.js`（Patch 2 新增） | C/R/U/D（数据集 + 数据元） |
| 质控规则 | `mocks/store/ruleStore.js` | C/R/U/D + 批量启用/禁用/删除 |
| 质控结果 | `mocks/store/resultStore.js` | R/U（整改标记 + 自动复检模拟） |
| 通知消息 | `mocks/store/notificationStore.js` | R/U（已读标记） |
| 系统管理 | `mocks/store/systemStore.js` | C/R/U/D（机构/用户/角色） |
| 月度报告 | `mocks/data/report.js` | C/R（生成报告/查看报告） |
| 代码集校准 | `mocks/store/codesetStore.js`（Patch 8 新增） | C/R/U/D + 标记误识别 |
| 规则模板 | `mocks/data/templates.js`（数组直接 push） | C/R/D（Patch 8 修复 C） |

**注意**：质控结果明细和上传监控数据为"从业务系统抽取的只读原始数据"，不需要 CRUD（与 SRS §4.4 约定一致：「除抽取的原始数据外」）。

---

## Patch 8 — 2026-05-25 — 代码集校准 CRUD 补全 + 规则模板持久化修复 + 机构排名数据修正

### 8a — 代码集校准模块完整 CRUD

**问题**：代码集校准页面（`/datasource/codeset-calibration`）已完整实现 UI（"手动添加"、"编辑映射"、"标记误识别"、"删除"按钮），但 Mock handler 只返回固定的成功响应，没有内存 Store，所有变更操作（编辑/删除/标记）执行后刷新列表时数据不变，完全无法演示 CRUD 效果。同时 `GET /api/codeset` 忽略了 UI 发送的 `name` 和 `status` 过滤参数，导致搜索无效。

**变更**：
- `src/mocks/store/codesetStore.js`（新增）：代码集内存 CRUD Store，初始数据从 `data/codesets.js` 深拷贝，支持增删改查，页面刷新重置为初始状态。
- `src/mocks/handlers/codeset.js`（重写）：
  - `GET /api/codeset`：新增 `name`（代码集名称/编码模糊）、`status` 过滤，分页正确从 Store 读取。
  - `PUT /api/codeset/:id/calibrate`：通过 payload 形状区分四种操作 —— `{ deleted: true }` 执行删除；`{ status: 'excluded' }` 标记误识别；`{ isNew: true, ...fields }` 手动新增；其余字段组合执行编辑映射更新。所有操作均写入 Store，后续 GET 列表立即反映变化。

### 8b — 规则模板 POST 不持久化修复

**问题**：`POST /api/template`（规则模板→"保存为模板"功能）只返回 `{ templateId }` 但不向内存数组 push 新记录，导致保存后刷新模板列表看不到新建的用户模板。

**变更**：
- `src/mocks/handlers/template.js`：`POST /api/template` 现在将新模板 push 到 `mockTemplates` 数组（`templateType: 'user'`），并分配递增的唯一 id，保存后刷新列表即可看到新模板出现在"用户模板"tab 下。

### 8c — 机构质量排名评分倒置修复

**问题**：`GET /api/result/org-ranking` 数据中出现两处评分倒置：
- 原排名第 2（开江县中医院，88.3分）< 原排名第 3（达州市中医医院，89.8分）
- 原排名第 4（达县人民医院，74.5分）< 原排名第 5（达州市中心医院，78.6分）

评分与排名不单调，在 Dashboard 排名表格中显示时严重影响可信度。

**变更**：
- `src/mocks/handlers/result.js`：`GET /api/result/org-ranking` 数据重新排序，确保评分严格随排名递减：通川区人民医院(94.8) > 达州市中医医院(89.8) > 开江县中医院(88.3) > 达州市中心医院(78.6) > 达县人民医院(74.5) > 宣汉县人民医院(62.1) > 通川区社区卫生服务中心(55.8)。

**偏离 SRS 说明**：以上均为 SRS 未细化的 Mock 数据质量问题，非功能性修复。

---

*最后更新：2026-05-25 | 维护人：Claude Code*
