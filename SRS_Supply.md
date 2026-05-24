# 医疗数据质控规则配置系统 — 前端需求规格补充说明书

**版本**：v1.0-supply  
**配套文档**：SRS_Frontend.md v1.0  
**说明**：本文档仅包含 SRS_Frontend.md 未覆盖的内容，两份文档合并阅读构成完整前端需求。

---

## 目录

1. 整体视觉与布局规范
2. 登录页详细设计
3. 首页 Dashboard 详细设计
4. Mock 数据层设计（无后端演示模式）
5. 各模块完整页面状态机
6. 规则执行手动触发页面（原文未覆盖）
7. 代码集校准页面（原文未覆盖）
8. 整改记录历史详情（原文未覆盖）
9. 全局通知系统详细设计
10. 所有弹窗/抽屉尺寸规范
11. 表单校验错误提示规范
12. 数据元选择器通用组件详细设计
13. 规则参数配置表单——各规则类型完整字段明细
14. 各模块演示数据样例

---

## 1. 整体视觉与布局规范

### 1.1 整体框架结构

```
┌──────────────────────────────────────────────────┐
│  TopBar（高度 60px，固定在顶部）                    │
├────────────┬─────────────────────────────────────┤
│            │  面包屑导航（高度 40px）               │
│  Sidebar   ├─────────────────────────────────────┤
│ （宽度     │                                      │
│  220px，   │  页面内容区                           │
│  折叠后    │  （padding: 16px，背景 #f0f2f5）      │
│  64px）    │                                      │
│            │                                      │
└────────────┴─────────────────────────────────────┘
```

### 1.2 TopBar 详细设计

TopBar 固定在顶部，高度 60px，背景色 `#001529`（深蓝黑），从左到右依次：

**左侧区域**：
- 系统 Logo 图标（SVG，医疗十字图标，白色，24×24px）
- 系统名称文字："医疗数据质控平台"（白色，font-size 16px，font-weight 600）
- 侧边栏折叠/展开按钮（汉堡图标，白色，点击切换 Sidebar 宽度 220px ↔ 64px，动画 300ms ease）

**右侧区域**（从右到左排列）：
- 用户头像 + 下拉菜单（点击展开：个人信息、修改密码、退出登录）
- 用户真实姓名（白色文字，不超过8个字符，超出省略号）
- 机构名称标签（浅蓝色小 Tag，如"达州市中医院"）
- 通知铃铛图标（白色，有未读消息时显示红色数字徽标，最大显示 99+）
- 全屏切换按钮

### 1.3 Sidebar 详细设计

**展开状态（220px）**：
```
┌──────────────────────┐
│ [图标] 数据源管理      │  ← 一级菜单（无子菜单时直接跳转）
│ [图标] 数据上传监控    │
│ ▼ [图标] 质控规则管理  │  ← 有子菜单，点击展开
│    └ 规则分类          │  ← 二级菜单
│    └ 规则列表          │
│    └ 规则模板          │
│    └ 手动执行          │  ← 注意：原文未列入路由，此处补充
│ ▼ [图标] 质控结果      │
│    └ 全局统计          │
│    └ 按规则统计        │
│    └ 问题明细          │
│ [图标] 数据质量报告    │
│ ▼ [图标] 系统管理      │
│    └ 机构管理          │
│    └ 用户管理          │
│    └ 角色管理          │
└──────────────────────┘
```

**折叠状态（64px）**：只显示一级图标，鼠标悬停时弹出子菜单浮层（Tooltip 样式）。

**菜单激活状态**：当前路由对应的菜单项背景色 `#1890ff`，文字白色；父级菜单项文字变为 `#1890ff`。

**角色与菜单可见性映射**：

| 菜单项 | 超级管理员 | 区域管理员 | 机构管理员 | 普通用户 |
|--------|-----------|-----------|-----------|---------|
| 数据源管理 | ✓ | ✗ | ✗ | ✗ |
| 数据集配置 | ✓ | ✗ | ✗ | ✗ |
| 数据上传监控 | ✓ | ✓ | ✓ | ✓ |
| 规则分类 | ✓ | ✗ | ✗ | ✗ |
| 规则列表 | ✓ | ✓ | ✓ | ✗ |
| 规则模板 | ✓ | ✓ | ✓ | ✗ |
| 手动执行 | ✓ | ✓ | ✓ | ✗ |
| 全局统计 | ✓ | ✓ | ✓ | ✓ |
| 按规则统计 | ✓ | ✓ | ✓ | ✓ |
| 问题明细 | ✓ | ✓ | ✓ | ✓ |
| 数据质量报告 | ✓ | ✓ | ✓ | ✓ |
| 机构管理 | ✓ | ✓ | ✗ | ✗ |
| 用户管理 | ✓ | ✓ | ✓ | ✗ |
| 角色管理 | ✓ | ✗ | ✗ | ✗ |
| 代码集校准 | ✓ | ✗ | ✗ | ✗ |

### 1.4 颜色规范

| 用途 | 色值 |
|------|------|
| 主色（蓝） | `#1890ff` |
| 成功（绿） | `#52c41a` |
| 警告（橙） | `#faad14` |
| 危险（红） | `#ff4d4f` |
| 文字主色 | `#262626` |
| 文字次色 | `#595959` |
| 文字辅助色 | `#8c8c8c` |
| 边框色 | `#d9d9d9` |
| 背景灰 | `#f0f2f5` |
| 卡片背景 | `#ffffff` |
| TopBar/Sidebar 背景 | `#001529` |

**规则级别颜色**：

| 级别 | 标签色 | 文字色 |
|------|--------|--------|
| 严重 | `#fff1f0` | `#ff4d4f` |
| 警告 | `#fffbe6` | `#faad14` |
| 提示 | `#e6f7ff` | `#1890ff` |

**整改状态颜色**：

| 状态 | 颜色 |
|------|------|
| 未整改 | 红色 `#ff4d4f` |
| 整改中 | 橙色 `#faad14` |
| 已整改 | 绿色 `#52c41a` |
| 无需整改 | 灰色 `#8c8c8c` |

### 1.5 字体规范

- 正文：`font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 代码/SQL：`font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`
- 数字展示（指标卡）：`font-variant-numeric: tabular-nums`（等宽数字，防止数字跳动）

### 1.6 卡片与间距规范

- 页面内容区 padding：`16px`
- 卡片内边距：`24px`
- 组件间距：`16px`（相关组件）、`24px`（不同模块）
- 表格行高：`48px`（默认），`40px`（紧凑模式）
- 弹窗圆角：`8px`
- 按钮圆角：`4px`

---

## 2. 登录页详细设计

**路由**：`/login`  
**页面背景**：左侧占 60% 宽度为系统主题图（医疗数据可视化插图，SVG背景），右侧 40% 为纯白登录卡片区。

### 2.1 登录卡片内容（从上到下）

1. 系统 Logo + 名称（"医疗数据质控平台"，居中）
2. 副标题：" 区域医疗数据质量管控系统 v1.0"（灰色小字，居中）
3. 分割线
4. 表单：
   - 用户名输入框（图标：人形图标，placeholder："请输入用户名"）
   - 密码输入框（图标：锁形图标，placeholder："请输入密码"，右侧眼睛图标切换显隐）
   - 记住我（Checkbox，勾选后将 token 存 localStorage，否则存 sessionStorage）
5. 登录按钮（全宽，主色蓝，高度 44px，文字"立即登录"）
6. 底部版权信息（"© 2025 医疗数据中心 All Rights Reserved"，灰色）

### 2.2 登录交互逻辑

```
用户点击"立即登录"
  ↓
表单校验（用户名非空、密码非空）
  ↓ 失败 → 输入框红色边框 + 错误提示文字
  ↓ 成功
调用 POST /api/user/login
  ↓ 网络错误 → "网络异常，请检查连接"
  ↓ 返回 code=401 → "用户名或密码错误"（不区分两者，安全考虑）
  ↓ 返回 code=403 → "账号已被禁用，请联系管理员"
  ↓ 返回 code=200
写入 auth store（token、userId、orgId、orgCode、orgName、roleId、dataScope、permissions）
  ↓
重定向到 /dashboard（或登录前访问的目标页，从路由 query.redirect 读取）
```

### 2.3 Mock 登录账号（演示模式，见第4章）

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `Admin@123` | 超级管理员 | 可见所有数据和菜单 |
| `region_admin` | `Admin@123` | 区域管理员 | 达州市辖区，可见本区县数据 |
| `org_admin` | `Admin@123` | 机构管理员 | 达州市中医院 |
| `user` | `Admin@123` | 普通用户 | 只读，达州市中医院 |

---

## 3. 首页 Dashboard 详细设计

**路由**：`/dashboard`  
**权限**：登录即可访问

### 3.1 页面布局（从上到下）

**第一行：欢迎横幅**
- 左侧：问候语（"早上好，{realName}！今天是{日期}{星期}"）
- 中间：机构名称标签 + 角色标签
- 右侧：当前时间（实时更新，精确到秒）

**第二行：核心指标卡片（4列）**

每个卡片包含：图标（左）、指标名称（上）、指标值（大字体中间）、环比变化（下，绿色向下箭头=问题减少=好，红色向上箭头=问题增多=差）：

| 卡片 | 图标 | 指标 |
|------|------|------|
| 卡片1 | 数据库图标，蓝色 | 本月质控总数 |
| 卡片2 | 警告图标，红色 | 本月问题总数 |
| 卡片3 | 百分比图标，橙色 | 问题占比（%） |
| 卡片4 | 勾选图标，绿色 | 整改完成率（%） |

**第三行：图表区（2列，左宽右窄）**

- 左侧（65%宽）：近7天各机构数据上传趋势折线图（多条线，每条线代表一个机构，图例可点击切换显隐）
- 右侧（35%宽）：本月问题类型分布饼图（按规则分类，点击可跳转按规则统计页）

**第四行：两列并排**

- 左侧：**机构数据质量排名表格**（列：排名、机构名称、评分、问题占比、整改率），点击机构名称跳转到该机构的按规则统计页
- 右侧：**最新问题告警列表**（展示最近10条严重级别问题，显示：时间、机构、数据集、规则名称，点击跳转问题明细页）

**第五行：快捷操作入口（仅对有权限用户显示）**

水平排列的卡片式图标按钮：
- "配置规则"→ `/rule/list`
- "查看结果"→ `/result/overview`
- "下载报告"→ `/report`
- "手动执行"→ `/rule/execute`（仅有 `rule:execute` 权限可见）

### 3.2 数据刷新策略

Dashboard 页面数据**每5分钟自动刷新一次**（`setInterval`），页面切换到后台时暂停（`visibilitychange` 事件），切回前台时立即刷新一次。右上角显示"数据更新于 HH:mm:ss"文字和手动刷新按钮。

---

## 4. Mock 数据层设计（无后端演示模式）

> **核心目标**：前端工程师可在完全无后端服务的情况下，运行一套行为真实的演示系统，产品验收、用户体验测试均基于此。

### 4.1 Mock 方案选型

使用 **`msw`（Mock Service Worker）** 实现浏览器层拦截，无需启动任何 Node 服务：

```
npm install msw --save-dev

src/
└── mocks/
    ├── browser.js        # MSW 浏览器端配置
    ├── handlers/         # 各模块接口 handler
    │   ├── auth.js
    │   ├── datasource.js
    │   ├── dataset.js
    │   ├── rule.js
    │   ├── result.js
    │   ├── report.js
    │   ├── upload.js
    │   └── system.js
    └── data/             # 静态 Mock 数据
        ├── orgs.js
        ├── users.js
        ├── rules.js
        ├── results.js
        └── ...
```

### 4.2 Mock 模式启用控制

在 `main.js` 中根据环境变量决定是否启用：

```javascript
// main.js
async function enableMocking() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass' // 未拦截的请求直接透传
    })
  }
}

enableMocking().then(() => {
  createApp(App).use(router).use(pinia).mount('#app')
})
```

`.env.development`：`VITE_MOCK=true`  
`.env.production`：`VITE_MOCK=false`

### 4.3 Mock 延迟模拟

所有 Mock 接口统一添加随机延迟，模拟真实网络环境：

```javascript
// mocks/utils.js
export const mockDelay = (min = 200, max = 800) =>
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min))

// 文件导出类接口延迟更长
export const mockExportDelay = () => mockDelay(1000, 3000)
```

### 4.4 Mock 数据持久化（浏览器内存状态）

演示系统需要支持：新增、编辑、删除操作后数据真实变化（而非每次刷新重置），使用模块级 JS 变量维护状态：

```javascript
// mocks/data/rules.js
// 初始数据
let rulesStore = [...initialRules]

export const getRules = () => rulesStore
export const addRule = (rule) => {
  const newRule = { ...rule, id: Date.now(), createTime: new Date().toISOString() }
  rulesStore.push(newRule)
  return newRule
}
export const updateRule = (id, patch) => {
  rulesStore = rulesStore.map(r => r.id === id ? { ...r, ...patch } : r)
}
export const deleteRule = (id) => {
  rulesStore = rulesStore.filter(r => r.id !== id)
}
```

> **注意**：刷新页面后数据重置为初始状态，这是演示模式的预期行为，无需持久化到 IndexedDB。

### 4.5 Mock 登录实现

```javascript
// mocks/handlers/auth.js
import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils'

const mockUsers = [
  {
    username: 'admin', password: 'Admin@123',
    userId: 1, orgId: 0, orgCode: '', orgName: '系统管理员',
    roleId: 1, roleName: '超级管理员', dataScope: 1,
    realName: '张超管',
    permissions: ['datasource:view','datasource:add','datasource:edit','datasource:delete',
      'datasource:sync','dataset:view','dataset:edit','dataset:sync',
      'rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user','system:role',
      'upload:view','upload:export','codeset:calibrate']
  },
  {
    username: 'region_admin', password: 'Admin@123',
    userId: 2, orgId: 0, orgCode: '', orgName: '达州市卫健委',
    roleId: 2, roleName: '区域管理员', dataScope: 2,
    realName: '李区管',
    permissions: ['rule:view','rule:add','rule:edit','rule:delete','rule:test',
      'rule:export','rule:import','rule:batch-enable','rule:execute',
      'template:apply','result:view','result:export','result:fix',
      'report:view','report:export','system:org','system:user',
      'upload:view','upload:export']
  },
  {
    username: 'org_admin', password: 'Admin@123',
    userId: 3, orgId: 1, orgCode: '511700001', orgName: '达州市中医医院',
    roleId: 3, roleName: '机构管理员', dataScope: 3,
    realName: '王机管',
    permissions: ['rule:view','rule:add','rule:edit','rule:test',
      'result:view','result:export','result:fix',
      'report:view','report:export','system:user',
      'upload:view','upload:export']
  },
  {
    username: 'user', password: 'Admin@123',
    userId: 4, orgId: 1, orgCode: '511700001', orgName: '达州市中医医院',
    roleId: 4, roleName: '普通用户', dataScope: 3,
    realName: '陈小员',
    permissions: ['result:view','report:view','upload:view']
  }
]

export const authHandlers = [
  http.post('/api/user/login', async ({ request }) => {
    await mockDelay()
    const { username, password } = await request.json()
    const user = mockUsers.find(u => u.username === username && u.password === password)
    if (!user) {
      return HttpResponse.json({ code: 401, message: '用户名或密码错误', data: null })
    }
    return HttpResponse.json({
      code: 200, message: '登录成功',
      data: { token: `mock-token-${user.userId}`, ...user }
    })
  })
]
```

### 4.6 Mock 数据规模要求

演示数据必须**足够真实、有业务含义**，不能使用无意义的占位字符串。具体要求见第14章各模块样例数据。

### 4.7 Mock 接口完整性要求

所有在 SRS_Frontend.md 中提到的接口，以及本文档新增页面的接口，全部必须有对应的 MSW handler，不允许接口 404 或返回空数据（空数据会导致演示效果差）。完整接口列表见下表（按模块）：

**认证**：POST /api/user/login

**数据源**：GET /api/datasource、POST /api/datasource、PUT /api/datasource/:id、DELETE /api/datasource/:id、POST /api/datasource/:id/test、POST /api/datasource/:id/sync、GET /api/datasource/:id/sync-status

**数据集**：GET /api/dataset、PUT /api/dataset/:id、POST /api/dataset/:id/sync、GET /api/dataset/:id/elements、POST /api/dataset/:id/elements/sync-preview、PUT /api/dataset/:id/elements/sync-confirm

**规则**：GET /api/rule/category、GET /api/rule、POST /api/rule、PUT /api/rule/:id、DELETE /api/rule/:id、POST /api/rule/:id/test、GET /api/rule/:id/preview-sql、PUT /api/rule/batch-enable、DELETE /api/rule/batch、GET /api/rule/export、POST /api/rule/import

**模板**：GET /api/template、GET /api/template/:id/items、POST /api/template/:id/apply、POST /api/template（保存为模板）

**执行**：GET /api/execute/plan（执行计划列表）、POST /api/execute/manual（手动触发）、GET /api/execute/status/:executionId（执行状态轮询）、GET /api/execute/log（执行日志列表）

**结果**：GET /api/result/summary（概览指标）、GET /api/result/by-rule、GET /api/result/detail、PUT /api/result/detail/:id/fix、PUT /api/result/detail/batch-fix、GET /api/result/detail/:id/business-data

**报告**：GET /api/report/monthly、GET /api/report/monthly/:id/export

**上传监控**：GET /api/upload/daily

**系统**：GET /api/system/org、POST /api/system/org、PUT /api/system/org/:id、GET /api/system/user、POST /api/system/user、PUT /api/system/user/:id、PUT /api/system/user/:id/reset-password、GET /api/system/role、POST /api/system/role、PUT /api/system/role/:id、GET /api/system/permission/tree

**代码集**：GET /api/codeset、PUT /api/codeset/:id/calibrate

**通知**：GET /api/notification（未读通知列表）、PUT /api/notification/:id/read

---

## 5. 各模块完整页面状态机

每个列表页/详情页必须处理以下五种状态，且有明确的 UI 表现：

### 5.1 统一状态定义

| 状态 | 触发条件 | UI 表现 |
|------|----------|---------|
| **初始化（init）** | 页面首次加载，接口未发出 | 表格区域显示骨架屏（`el-skeleton`，行数 = 默认 pageSize） |
| **加载中（loading）** | 接口请求中 | 表格覆盖半透明遮罩 + 居中旋转图标，搜索/操作按钮 disabled |
| **成功有数据（success）** | 接口返回 total > 0 | 正常展示数据 |
| **成功空数据（empty）** | 接口返回 total = 0 | `el-empty`，图标 + 说明文字 + 可选的操作按钮 |
| **失败（error）** | 接口返回非200或网络错误 | 错误提示卡片（图标+错误描述+"重试"按钮），点击重试重新请求 |

### 5.2 各页面空数据说明文字与操作

| 页面 | 空数据说明 | 空数据操作按钮 |
|------|-----------|--------------|
| 数据源管理 | "尚未配置数据源，请先添加业务中心库" | "立即添加"（`datasource:add`） |
| 数据集列表 | "暂无数据集，请先配置业务中心库并同步" | 无 |
| 规则列表 | "暂无质控规则，可通过新增规则或应用模板快速创建" | "新增规则"、"应用模板" |
| 规则模板 | "暂无模板" | 无 |
| 按规则统计 | "所选时间范围内暂无质控结果" | 无 |
| 问题明细 | "当前筛选条件下暂无问题数据，数据质量良好 ✓" | 无 |
| 上传监控 | "所选月份暂无上传记录" | 无 |
| 执行日志 | "暂无执行记录" | 无 |
| 通知列表 | "暂无通知消息" | 无 |

### 5.3 弹窗/抽屉内部的状态

弹窗打开后加载数据（如编辑弹窗回显数据）时，弹窗内容区显示骨架屏，加载完成后替换为实际表单。加载失败时显示"数据加载失败，请关闭后重试"提示，关闭按钮保持可用。

---

## 6. 规则执行手动触发页面

**路由**：`/rule/execute`  
**权限**：`rule:execute`（新增权限标识，需加入 SRS_Frontend.md 的权限清单）  
**菜单位置**：质控规则管理 → 手动执行

### 6.1 页面布局（上下两区）

**上方：触发区**

```
┌──────────────────────────────────────────────────────────────────┐
│  手动触发质控执行                                                  │
│                                                                  │
│  执行范围：  ○ 全部规则   ● 指定规则分类   ○ 指定规则              │
│                                                                  │
│  规则分类：  [空值检查 ×] [值域检查 ×] [规范检查 ×] [+ 添加]       │
│  （仅"指定规则分类"时显示）                                         │
│                                                                  │
│  执行机构：  ○ 全部机构   ● 指定机构                               │
│  机构选择：  [达州市中医院 ×] [达州市人民医院 ×] [+ 添加]           │
│                                                                  │
│  预计规则数：87 条    预计耗时：约 5-12 分钟（系统估算）             │
│                                                                  │
│                        [ 立即执行 ]  [ 清空 ]                     │
└──────────────────────────────────────────────────────────────────┘
```

**"立即执行"交互**：
1. 弹出二次确认对话框：
   ```
   确认执行？
   将对 [2] 家机构执行 [87] 条质控规则，
   预计耗时约 5-12 分钟。
   执行期间不影响系统正常使用。
   [取消]  [确认执行]
   ```
2. 确认后调用 `POST /api/execute/manual`，获取 `executionId`
3. 页面下方执行状态区域展开，开始轮询

### 6.2 下方：执行状态与进度区

**触发执行后展示**，分为三个子区域：

**A. 当前执行总进度**

```
执行批次：EXEC-20260524-001    状态：执行中 [● 动画]
开始时间：2026-05-24 14:30:00  已用时：00:03:42

机构进度：  ████████░░░░░░░░░  5 / 8 家机构

规则进度：  ████████████░░░░░  127 / 200 条规则

问题发现：  共 1,234 条（实时更新）

[ 取消执行 ]
```

**B. 机构维度进度表格**（实时刷新，每3秒轮询一次 `/api/execute/status/:executionId`）

| 机构名称 | 状态 | 已执行规则 | 发现问题数 | 耗时 |
|----------|------|-----------|-----------|------|
| 达州市中医院 | ✓ 完成 | 25/25 | 234 | 2m14s |
| 达州市人民医院 | ⏳ 执行中 | 18/25 | 156 | 1m43s |
| 通川区社区医院 | ⏸ 等待 | 0/25 | - | - |
| ... | | | | |

**C. 实时日志滚动区**

```
[14:30:01] 开始执行批次 EXEC-20260524-001
[14:30:02] 机构 达州市中医院 开始执行，共 25 条规则
[14:30:04] [达州市中医院] 空值检查-患者姓名 执行完成，问题数: 12
[14:30:06] [达州市中医院] 值域代码检查-性别代码 执行完成，问题数: 0
...
```

日志区高度固定 200px，内容超出时自动滚动到底部（可手动上滚查看历史，滚动后显示"↓ 跳到最新"按钮）。

### 6.3 历史执行日志列表

页面下方（非执行中时显示）展示近30次执行记录表格：

| 列 | 说明 |
|----|------|
| 执行批次ID | 文字，可点击展开详情 |
| 触发方式 | Tag：定时/手动 |
| 执行范围 | 文字（全部规则/指定分类/指定规则） |
| 开始时间 | 日期时间 |
| 耗时 | 如"4分32秒" |
| 状态 | Tag：成功/部分失败/失败/执行中 |
| 总规则数 | 数字 |
| 问题总数 | 蓝色链接，点击跳转问题明细页（携带executionId参数） |
| 操作 | 查看日志、重试失败规则（仅部分失败时显示） |

---

## 7. 代码集校准页面

**路由**：`/datasource/codeset-calibration`  
**权限**：`codeset:calibrate`（新增权限标识）  
**菜单位置**：数据源管理 → 代码集校准（超级管理员专属）  
**触发入口**：也可从数据源页面点击"代码集管理"按钮进入

### 7.1 页面布局

**顶部筛选**：代码集名称（Input模糊搜索）、来源（国家/省级/自定义）、状态（正常/误识别）

**代码集列表表格**：

| 列 | 说明 |
|----|------|
| 代码集编码 | 文字 |
| 代码集名称 | 文字 |
| 对应表名 | 数据库实际表名 |
| 代码字段 | 识别的代码字段名 |
| 名称字段 | 识别的名称字段名 |
| 代码项数量 | 数字，点击展开代码项列表 |
| 来源 | Tag（国家/省级/自定义） |
| 识别方式 | 自动识别/手动添加 |
| 操作 | 编辑映射、标记误识别、删除 |

**操作说明**：

- **编辑映射**：弹窗允许修改代码字段名、名称字段名、代码集名称
- **标记误识别**：将该代码集状态改为"已排除"，后续自动同步不会再创建此代码集
- **手动添加**：表格顶部"手动添加代码集"按钮，允许管理员从代码库中选择表并手动指定字段映射

---

## 8. 整改记录历史详情

在问题明细页（`/result/detail`）中，每条记录的"操作"列，除"标记整改"外，新增"整改历史"按钮（仅整改状态为"整改中"或"已整改"时显示）。

### 8.1 整改历史抽屉

点击"整改历史"弹出右侧抽屉（宽度 480px），标题为"整改记录 - {业务数据ID}"，内容为时间轴展示：

```
2026-05-20 14:30  王机管
  状态变更：未整改 → 整改中
  整改说明：已通知数据录入员修改，预计明日完成

2026-05-21 09:15  王机管
  状态变更：整改中 → 已整改
  整改说明：已修正患者姓名字段

2026-05-21 09:16  系统自动
  自动复检：通过 ✓
  问题状态已更新为"已整改"
```

时间轴节点图标：人形图标（人工操作）、机器人图标（系统自动）。

### 8.2 自动复检失败场景

复检不通过时，时间轴末尾显示：

```
2026-05-21 09:16  系统自动
  自动复检：未通过 ✗
  问题依然存在：字段值 "张　三" 含有全角空格
  问题状态已重置为"未整改"
```

复检结果通过顶栏通知铃铛推送（见第9章），同时问题明细列表中该条记录状态实时更新（轮询或 WebSocket）。

---

## 9. 全局通知系统详细设计

### 9.1 通知铃铛交互

TopBar 右侧铃铛图标：
- 未读通知 = 0：铃铛图标，无徽标
- 未读通知 1-99：铃铛图标 + 红色圆形徽标数字
- 未读通知 > 99：显示"99+"

点击铃铛：展开通知下拉面板（宽度 360px，最高 480px，超出滚动）

### 9.2 通知下拉面板结构

```
┌──────────────────────────────────────┐
│  通知消息          [全部标为已读]      │
├──────────────────────────────────────┤
│ 🔴 [自动复检] 整改复检完成            │
│    达州市中医院 / 患者基本信息表       │
│    2026-05-24 14:32  未读             │
├──────────────────────────────────────┤
│ 🟡 [质控完成] 手动执行质控已完成       │
│    批次 EXEC-20260524-001，发现1234条  │
│    2026-05-24 14:30  未读             │
├──────────────────────────────────────┤
│ 🟢 [代码同步] 值域代码库同步完成       │
│    新增23个代码集，更新156个代码项     │
│    2026-05-24 09:00  已读             │
├──────────────────────────────────────┤
│           查看全部通知 →              │
└──────────────────────────────────────┘
```

点击单条通知：标为已读，并跳转到相关页面（复检通知 → 问题明细页，质控完成 → 执行日志，代码同步 → 代码集列表）。

### 9.3 通知类型清单

| 类型标识 | 触发时机 | 图标颜色 | 跳转目标 |
|----------|----------|---------|---------|
| `recheck_pass` | 整改复检通过 | 绿色 ✓ | 问题明细页 |
| `recheck_fail` | 整改复检不通过 | 红色 ✗ | 问题明细页 |
| `execute_done` | 质控执行完成 | 蓝色 | 执行日志页 |
| `execute_partial_fail` | 执行部分失败 | 橙色 | 执行日志页 |
| `sync_done` | 代码库同步完成 | 绿色 | 代码集页面 |
| `sync_fail` | 代码库同步失败 | 红色 | 数据源管理页 |
| `report_ready` | 月度报告已生成 | 蓝色 | 报告页 |

### 9.4 通知轮询策略（演示模式）

无 WebSocket 情况下，每 **30秒** 轮询一次 `GET /api/notification`（仅获取未读消息数量和最新5条），页面不可见时暂停轮询。

Mock 模式下，MSW handler 在第一次查询后 60 秒，自动在通知列表中插入一条"质控执行完成"通知（模拟异步推送）。

---

## 10. 所有弹窗/抽屉尺寸规范

| 场景 | 组件类型 | 宽度 | 最大高度 | 说明 |
|------|----------|------|---------|------|
| 新增/编辑数据源 | Dialog | 560px | 80vh | 超出高度内部滚动 |
| 数据集编辑 | Dialog | 480px | 60vh | |
| 字段同步预览 | Dialog | 720px | 80vh | 三列对比（旧/新/变更状态） |
| 规则新增/编辑（步骤式） | Dialog | 860px | 85vh | 三步内容区内部滚动 |
| 规则测试结果 | Dialog | 1000px | 85vh | 宽表格展示问题数据 |
| 批量导入预检结果 | Dialog | 640px | 70vh | |
| 应用模板 | Dialog | 720px | 80vh | |
| 标记整改 | Dialog | 440px | auto | |
| 业务数据详情 | Dialog | 800px | 80vh | |
| 整改历史 | Drawer | 480px | 100vh（右侧抽屉） | |
| 权限分配 | Dialog | 640px | 80vh | |
| 代码集映射编辑 | Dialog | 560px | auto | |
| 执行日志详情 | Drawer | 600px | 100vh（右侧抽屉） | |
| 用户新增/编辑 | Dialog | 480px | auto | |

**弹窗通用规范**：
- 标题区：高度 54px，`font-size 16px`，`font-weight 600`，右侧关闭按钮
- 内容区：padding `24px`
- 底部操作区：高度 62px，`padding 0 24px`，按钮右对齐，主操作按钮在最右侧
- 点击遮罩层：**不关闭弹窗**（防止误操作丢失填写内容）
- 按 ESC 键：弹出二次确认"确认放弃当前编辑？"（表单有修改时），无修改时直接关闭

---

## 11. 表单校验错误提示规范

### 11.1 触发时机

- 实时校验（`trigger: 'input'`）：字符数限制、数值范围
- 失焦校验（`trigger: 'blur'`）：格式校验（IP、手机号、邮箱）
- 提交校验（点击保存/下一步时）：必填项、联合校验

### 11.2 错误提示文案规范

| 校验类型 | 错误提示文案 |
|----------|-------------|
| 必填为空 | `{字段名}不能为空` |
| 超过最大长度 | `{字段名}不能超过{N}个字符` |
| IP格式错误 | `请输入有效的IP地址（如 192.168.1.1）` |
| 端口范围错误 | `端口号范围为 1-65535` |
| 数值范围错误 | `最大值不能小于最小值` |
| 唯一性冲突 | `{字段名}已存在，请更换` |
| 密码确认不一致 | `两次输入的密码不一致` |
| 密码强度不足 | `密码需包含大写字母、小写字母和数字，长度至少8位` |
| 机构代码格式 | `机构代码只能包含数字和字母，长度2-50位` |
| SQL语法错误（条件逻辑） | `SQL表达式语法错误：{后端返回的具体错误}` |
| 联合唯一检查字段不足 | `多字段联合唯一检查至少需要选择2个字段` |

### 11.3 特殊联动校验

**数值范围检查**：`最小值` 和 `最大值` 字段相互联动校验：
- `最大值` 字段失焦时，如果 `最大值 < 最小值`，则两个字段同时标红，提示"最大值不能小于最小值"

**字符串长度检查**：同上，`最大长度 >= 最小长度`

**日期比较**：`当前日期字段` 和 `关联日期字段` 不能选择同一字段，选中相同时弹出警告提示

**多字段联合唯一**：选择的字段列表中不能有重复，拖拽排序时检查重复

---

## 12. 数据元选择器通用组件详细设计

该组件在多个规则配置场景中复用（选择数据集+字段），需单独封装为 `<ElementSelector>` 组件。

### 12.1 组件 Props

```typescript
interface ElementSelectorProps {
  label: string           // 标签文字，如"当前日期字段"
  datasetId?: number      // 如果已在外部选定数据集，传入此值（组件不再显示数据集选择）
  showDataset: boolean    // 是否显示数据集选择（跨表规则需显示）
  filterTypes?: string[]  // 过滤字段类型，如 ['datetime','date'] 仅显示日期类型字段
  excludeIds?: number[]   // 排除的 elementId 列表（防止选重复）
  required: boolean       // 是否必填
}
```

### 12.2 组件展示形式

**单数据集内选字段**（`showDataset=false`）：
```
当前日期字段 *
[Select: 选择字段 ▾]  →  选项来自当前规则关联的数据集
```

**跨表选择**（`showDataset=true`）：
```
被引用表 *              被引用字段 *
[Select: 选择数据集 ▾]  [Select: 选择字段 ▾]  ←  数据集确定后加载字段
```

### 12.3 字段选项展示格式

Select 选项展示格式：`{element_name}（{element_code}）`  
示例：`患者姓名（XM）`、`出院日期（CYRQ）`

选项按字段类型分组：日期/时间类型排在最前，字符串、数字依次排列，Divider 分隔。

若 `filterTypes` 已指定，只显示对应类型的字段，其余类型字段不出现在选项中（不置灰，直接隐藏）。

---

## 13. 规则参数配置表单——各规则类型完整字段明细

以下补充 SRS_Frontend.md 中规则类型表格未涵盖的完整交互细节：

### 13.1 证件号检查

字段：
- 数据集 + 数据元（单选）
- 证件类型（Select）：居民身份证、军官证、护照、社保卡、出生医学证明、港澳居民来往内地通行证、台湾居民来往内地通行证、外国人永久居留身份证、其他

选择"居民身份证"时下方说明文字："将执行18位身份证格式、出生日期有效性、校验位验证"  
选择其他类型时说明文字："将执行对应证件的格式规范校验"

### 13.2 日期格式检查

日期格式下拉选项（含预览示例）：

| 格式值 | 示例 |
|--------|------|
| `yyyy-MM-dd` | 2026-05-24 |
| `yyyyMMdd` | 20260524 |
| `yyyy/MM/dd` | 2026/05/24 |
| `yyyy-MM-dd HH:mm:ss` | 2026-05-24 14:30:00 |
| `yyyyMMddHHmmss` | 20260524143000 |
| `HH:mm:ss` | 14:30:00 |
| `自定义` | 出现输入框让用户填写 |

### 13.3 条件逻辑检查（完整交互）

表单字段（按顺序）：
1. **数据集选择**（必填）
2. **条件表达式**（`condition_expr`）：
   - 组件：等宽字体 Textarea，高度 120px，可拖拽放大
   - 左上角标签："当满足以下条件时（SQL WHERE子句片段）"
   - 下方示例区（可折叠）：
     ```
     示例：t.zdmc LIKE '%肺炎%' OR t.zddm LIKE 'J18.9%'
     说明：t 为当前数据集的表别名，可直接引用字段名
     ```
   - 右侧"引用字段"辅助面板（侧边浮层，点击字段名自动插入光标位置）
3. **结果表达式**（`result_expr`）：
   - 标签："则必须满足以下条件（不满足时为问题数据）"
   - 其余同上
4. **语法校验按钮**："校验表达式"，调用后端校验接口，在按钮下方显示绿色"✓ 校验通过"或红色"✗ 错误：{reason}"
5. **校验通过后才允许进入下一步**

### 13.4 主从表记录数一致检查

字段（按顺序）：
1. **主表数据集**（Select，必填）
2. **从表数据集**（Select，必填，不能与主表相同）
3. **从表关联字段**（Select，必填，从从表字段中选，说明："从表按此字段分组统计记录数"）

配置示例展示（表单下方灰色提示框）：
> 检查逻辑：`主表.记录数 = SUM(从表按{关联字段}分组后各组记录数)`  
> 例：处方主表记录数 = 处方明细表按"处方ID(CFID)"分组后的分组数

### 13.5 必选数据集完整性检查

无参数配置，仅选择适用机构范围（已在第一步配置）。

表单第二步显示说明卡片：
> ℹ️ 此规则将检查所选机构是否上传了系统配置的全部必选数据集。  
> 当前必选数据集共 {N} 个，可在"数据集配置"页面中调整。

### 13.6 数据生成及时性检查

字段：
1. **数据集 + 数据元**（被检查字段，Select）
2. **业务时间字段**（Select，从同数据集字段中选）
3. **允许延迟天数**（InputNumber，最小值0，最大值365，单位：天）

配置示例提示：
> 检查逻辑：`{业务时间字段} 距今超过 {延迟天数} 天但 {当前字段} 仍为空`

### 13.7 字段值分布稳定性检查

字段：
1. **数据集 + 数据元**
2. **分布阈值**（InputNumber，单位%，范围1-100，如"30"表示允许波动±30%）

配置示例提示：
> 检查逻辑：统计本月该字段各取值的占比分布，与历史6个月均值对比，若任一取值占比变化超过 {阈值}%，则标记为异常。

---

## 14. 各模块演示数据样例

### 14.1 机构演示数据（8家）

```javascript
// mocks/data/orgs.js
export const mockOrgs = [
  { id: 1, orgCode: '511700001', orgName: '达州市中医医院',
    districtCode: '511700', districtName: '达州市', orgType: '三级甲等医院',
    contactPerson: '王建华', contactPhone: '0818-2345678', status: 1 },
  { id: 2, orgCode: '511700002', orgName: '达州市中心医院',
    districtCode: '511700', districtName: '达州市', orgType: '三级甲等医院',
    contactPerson: '李明辉', contactPhone: '0818-3456789', status: 1 },
  { id: 3, orgCode: '511703001', orgName: '通川区人民医院',
    districtCode: '511703', districtName: '通川区', orgType: '二级甲等医院',
    contactPerson: '张文龙', contactPhone: '0818-4567890', status: 1 },
  { id: 4, orgCode: '511703002', orgName: '通川区社区卫生服务中心',
    districtCode: '511703', districtName: '通川区', orgType: '社区卫生服务中心',
    contactPerson: '陈小兰', contactPhone: '0818-5678901', status: 1 },
  { id: 5, orgCode: '511721001', orgName: '达县人民医院',
    districtCode: '511721', districtName: '达川区', orgType: '二级甲等医院',
    contactPerson: '刘德平', contactPhone: '0818-6789012', status: 1 },
  { id: 6, orgCode: '511722001', orgName: '宣汉县人民医院',
    districtCode: '511722', districtName: '宣汉县', orgType: '二级甲等医院',
    contactPerson: '赵红梅', contactPhone: '0818-7890123', status: 1 },
  { id: 7, orgCode: '511723001', orgName: '开江县中医院',
    districtCode: '511723', districtName: '开江县', orgType: '二级甲等中医院',
    contactPerson: '周大勇', contactPhone: '0818-8901234', status: 1 },
  { id: 8, orgCode: '511724001', orgName: '大竹县人民医院',
    districtCode: '511724', districtName: '大竹县', orgType: '二级甲等医院',
    contactPerson: '黄志远', contactPhone: '0818-9012345', status: 0 }, // 禁用示例
]
```

### 14.2 数据集演示数据（20个）

```javascript
export const mockDatasets = [
  { id: 1, dataSourceId: 1, datasetCode: 'mz_jzjl', datasetName: '门诊就诊记录',
    orgCodeField: 'YLJGDM', businessKeyField: 'JZLSH',
    isRequired: 1, recordCount: 1250000, status: 1 },
  { id: 2, dataSourceId: 1, datasetCode: 'zy_ryxx', datasetName: '住院入院信息',
    orgCodeField: 'YLJGDM', businessKeyField: 'ZYH',
    isRequired: 1, recordCount: 380000, status: 1 },
  { id: 3, dataSourceId: 1, datasetCode: 'zy_cyxx', datasetName: '住院出院信息',
    orgCodeField: 'YLJGDM', businessKeyField: 'ZYH',
    isRequired: 1, recordCount: 375000, status: 1 },
  { id: 4, dataSourceId: 1, datasetCode: 'zy_basy', datasetName: '住院病案首页',
    orgCodeField: 'YLJGDM', businessKeyField: 'ZYH',
    isRequired: 1, recordCount: 375000, status: 1 },
  { id: 5, dataSourceId: 1, datasetCode: 'jbxx_brxx', datasetName: '患者基本信息',
    orgCodeField: 'YLJGDM', businessKeyField: 'BRID',
    isRequired: 1, recordCount: 520000, status: 1 },
  { id: 6, dataSourceId: 1, datasetCode: 'mz_cf_main', datasetName: '门诊处方主表',
    orgCodeField: 'YLJGDM', businessKeyField: 'CFID',
    isRequired: 1, recordCount: 2100000, status: 1 },
  { id: 7, dataSourceId: 1, datasetCode: 'mz_cf_detail', datasetName: '门诊处方明细',
    orgCodeField: 'YLJGDM', businessKeyField: 'CFID,MXXH',
    isRequired: 1, recordCount: 6300000, status: 1 },
  { id: 8, dataSourceId: 1, datasetCode: 'zy_yzxx', datasetName: '住院医嘱信息',
    orgCodeField: 'YLJGDM', businessKeyField: 'YZID',
    isRequired: 1, recordCount: 4500000, status: 1 },
  { id: 9, dataSourceId: 1, datasetCode: 'jc_jcjg', datasetName: '检查检验结果',
    orgCodeField: 'YLJGDM', businessKeyField: 'JCID',
    isRequired: 1, recordCount: 3200000, status: 1 },
  { id: 10, dataSourceId: 1, datasetCode: 'ss_ssxx', datasetName: '手术操作信息',
    orgCodeField: 'YLJGDM', businessKeyField: 'SSID',
    isRequired: 0, recordCount: 95000, status: 1 },
  // ... 更多数据集
]
```

### 14.3 质控规则演示数据（含各规则类型示例）

```javascript
export const mockRules = [
  // ① 非空检查
  { id: 1, ruleName: '患者姓名非空检查', ruleDesc: '患者姓名不能为空',
    categoryId: 1, categoryName: '空值检查', ruleLevel: 1,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 5, datasetName: '患者基本信息' }] },

  // ② 值域代码检查
  { id: 2, ruleName: '性别代码值域检查', ruleDesc: '性别代码必须符合国家标准代码',
    categoryId: 2, categoryName: '值域检查', ruleLevel: 2,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 5, datasetName: '患者基本信息' }] },

  // ③ 身份证检查
  { id: 3, ruleName: '身份证号格式检查', ruleDesc: '居民身份证需通过18位格式和校验位验证',
    categoryId: 3, categoryName: '规范检查', ruleLevel: 1,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 5, datasetName: '患者基本信息' }] },

  // ④ 日期比较
  { id: 4, ruleName: '出院日期不早于入院日期', ruleDesc: '出院日期必须大于或等于入院日期',
    categoryId: 4, categoryName: '逻辑检查', ruleLevel: 1,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 3, datasetName: '住院出院信息' }] },

  // ⑤ 外键引用
  { id: 5, ruleName: '就诊患者ID引用检查', ruleDesc: '门诊就诊记录的患者ID必须存在于患者基本信息表',
    categoryId: 7, categoryName: '关联性检查', ruleLevel: 1,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 1, datasetName: '门诊就诊记录' }] },

  // ⑥ 主从表记录数
  { id: 6, ruleName: '处方主从表记录数一致', ruleDesc: '处方主表每条记录必须在明细表中有对应的明细',
    categoryId: 6, categoryName: '完整性检查', ruleLevel: 2,
    executeFrequency: 'daily', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 6, datasetName: '门诊处方主表' }] },

  // ⑦ 数据量波动
  { id: 7, ruleName: '门诊就诊记录量波动检查', ruleDesc: '本月门诊量与上月相比波动不超过30%',
    categoryId: 10, categoryName: '稳定性检查', ruleLevel: 2,
    executeFrequency: 'monthly', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 1, datasetName: '门诊就诊记录' }] },

  // ⑧ 条件逻辑
  { id: 8, ruleName: '肺炎诊断必须有CT检查记录',
    ruleDesc: '主诊断为肺炎时，必须在检查记录中存在胸部CT项目',
    categoryId: 4, categoryName: '逻辑检查', ruleLevel: 2,
    executeFrequency: 'weekly', applyScope: 1, isEnabled: 1,
    datasets: [{ datasetId: 1, datasetName: '门诊就诊记录' }] },
  // ... 更多规则（总计约30条演示规则，覆盖10种类型各3条）
]
```

### 14.4 质控结果演示数据

**全局统计概览**：

```javascript
export const mockOverviewStats = {
  totalCheckCount: 18750000,   // 总校验数据量
  totalProblemCount: 234560,   // 问题总数
  problemRatio: 1.25,          // 问题占比 %
  fixedRate: 67.3,             // 整改率 %
  monthNewProblem: 12300,      // 本月新增问题数
  // 环比（正数=增加=差，负数=减少=好）
  problemRatioChange: -0.23,
  fixedRateChange: +5.2,
  // 近6个月趋势
  monthlyTrend: [
    { month: '2025-12', ratio: 1.85 },
    { month: '2026-01', ratio: 1.72 },
    { month: '2026-02', ratio: 1.61 },
    { month: '2026-03', ratio: 1.48 },
    { month: '2026-04', ratio: 1.35 },
    { month: '2026-05', ratio: 1.25 },
  ],
  // 按规则分类分布
  categoryDistribution: [
    { categoryName: '空值检查', count: 89430 },
    { categoryName: '值域检查', count: 56780 },
    { categoryName: '规范检查', count: 34210 },
    { categoryName: '逻辑检查', count: 28900 },
    { categoryName: '关联性检查', count: 15670 },
    { categoryName: '一致性检查', count: 9570 },
  ]
}
```

**问题明细演示数据**（20条，覆盖不同状态）：

```javascript
export const mockResultDetails = [
  { id: 1, ruleId: 1, ruleName: '患者姓名非空检查', ruleCategoryName: '空值检查',
    ruleLevel: 1, datasetId: 5, datasetName: '患者基本信息',
    elementId: 12, elementName: '患者姓名', elementCode: 'XM',
    businessId: '10023456', problemValue: '', problemDesc: '患者姓名不能为空',
    isFixed: 0, fixedTime: null, createTime: '2026-05-24 02:15:33',
    orgId: 1, orgName: '达州市中医医院' },

  { id: 2, ruleId: 2, ruleName: '性别代码值域检查', ruleCategoryName: '值域检查',
    ruleLevel: 2, datasetId: 5, datasetName: '患者基本信息',
    elementId: 13, elementName: '性别代码', elementCode: 'XBM',
    businessId: '10023457', problemValue: '3', problemDesc: "性别代码'3'不在标准值域范围内",
    isFixed: 2, fixedTime: '2026-05-23 11:30:00', createTime: '2026-05-22 02:10:11',
    orgId: 1, orgName: '达州市中医医院' },

  { id: 3, ruleId: 3, ruleName: '身份证号格式检查', ruleCategoryName: '规范检查',
    ruleLevel: 1, datasetId: 5, datasetName: '患者基本信息',
    elementId: 14, elementName: '身份证号', elementCode: 'SFZHM',
    businessId: '10023458', problemValue: '51170019901231001X',
    problemDesc: '身份证号校验位错误，应为Y', isFixed: 1,
    fixedTime: null, createTime: '2026-05-24 02:15:40',
    orgId: 2, orgName: '达州市中心医院' },
  // ... 更多记录
]
```

### 14.5 上传监控演示数据

```javascript
// 生成函数：生成指定月份的每日上传量矩阵
export function generateUploadMonitor(yearMonth) {
  const daysInMonth = new Date(yearMonth.slice(0,4), yearMonth.slice(5,7), 0).getDate()
  return mockDatasets.map(ds => {
    const dailyCounts = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${yearMonth}-${String(d).padStart(2,'0')}`
      // 模拟周末数据量低，工作日数据量正常，偶发漏报（部分日期为0）
      const isWeekend = new Date(date).getDay() % 6 === 0
      const baseCount = ds.isRequired ? (isWeekend ? 200 : 800) : (isWeekend ? 50 : 200)
      // 10%概率漏报（演示数据质量问题）
      dailyCounts[date] = Math.random() < 0.1 ? 0 : Math.floor(baseCount * (0.7 + Math.random() * 0.6))
    }
    return { ...ds, dailyCounts,
      monthTotal: Object.values(dailyCounts).reduce((a,b) => a+b, 0) }
  })
}
```

### 14.6 月度报告演示数据

```javascript
export const mockMonthlyReport = {
  id: 1, orgId: 1, orgName: '达州市中医医院',
  reportMonth: '2026-04',
  score: 87.5,
  ranking: 2, totalOrgCount: 7,   // 第2名，共7家参与排名（1家禁用）
  totalQcCount: 2340000,
  totalProblemCount: 29250,
  problemRatio: 1.25,
  lastMonthProblemRatio: 1.48,
  problemRatioGrowth: -0.23,      // 负数=改善
  mostProblemRuleType: '空值检查',
  mostProblemDataset: '患者基本信息',
  analysis: '本月数据质量总体呈改善趋势，问题占比环比下降0.23个百分点。' +
    '主要问题集中在空值检查（占问题总数38%）和值域检查（占24%），' +
    '建议重点整改患者基本信息表中的身份证号、联系电话字段的空值问题，' +
    '以及性别代码、民族代码的值域不规范问题。手术操作信息表本月数据量' +
    '波动超过阈值，请核实是否存在数据漏报情况。',
  createTime: '2026-05-01 02:30:00'
}
```

---

*文档版本：v1.0-supply | 配套 SRS_Frontend.md v1.0 | 最后更新：2026-05*
