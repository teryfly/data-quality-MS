<template>
  <PageContainer title="手动执行质控">

    <!-- 触发区 -->
    <el-card style="margin-bottom:16px">
      <template #header><span style="font-weight:600">手动触发质控执行</span></template>

      <el-form label-width="90px" style="max-width:700px">
        <!-- 执行范围 -->
        <el-form-item label="执行范围">
          <el-radio-group v-model="form.scopeType">
            <el-radio value="all">全部规则</el-radio>
            <el-radio value="category">指定规则分类</el-radio>
            <el-radio value="specific">指定规则</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 规则分类（仅指定分类时显示） -->
        <el-form-item v-if="form.scopeType === 'category'" label="规则分类">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            <el-tag
              v-for="cat in form.selectedCategories"
              :key="cat.id"
              closable
              @close="removeCategory(cat)"
            >{{ cat.name }}</el-tag>
            <el-select
              v-model="addingCategoryId"
              placeholder="+ 添加分类"
              size="small"
              style="width:140px"
              @change="addCategory"
            >
              <el-option v-for="c in availableCategories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </div>
        </el-form-item>

        <!-- 执行机构 -->
        <el-form-item label="执行机构">
          <el-radio-group v-model="form.orgType">
            <el-radio value="all">全部机构</el-radio>
            <el-radio value="specific">指定机构</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 机构选择（仅指定机构时显示） -->
        <el-form-item v-if="form.orgType === 'specific'" label="机构选择">
          <el-select
            v-model="form.selectedOrgIds"
            multiple
            filterable
            placeholder="请选择机构"
            style="width:100%"
          >
            <el-option v-for="org in orgList" :key="org.id" :label="org.orgName" :value="org.id" />
          </el-select>
        </el-form-item>

        <!-- 预估信息 -->
        <el-form-item label=" ">
          <span style="color:#606266;font-size:13px">
            预计规则数 <strong>{{ estimatedRules }}</strong> 条 &nbsp;|&nbsp;
            预计耗时约 <strong>{{ estimatedTime }}</strong>（系统估算）
          </span>
        </el-form-item>

        <el-form-item label=" ">
          <el-button type="primary" @click="showConfirmDialog">立即执行</el-button>
          <el-button @click="handleClear">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 执行状态区（执行后展开） -->
    <template v-if="hasStarted">
      <!-- A. 当前总进度 -->
      <el-card style="margin-bottom:16px">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">当前执行进度</span>
            <el-button v-if="isRunning" type="danger" plain size="small" @click="handleCancelConfirm">取消执行</el-button>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="执行批次">
            <span style="font-family:monospace">{{ currentExecutionId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span v-if="isRunning" style="display:inline-flex;align-items:center;gap:6px">
              <span class="pulse-dot" />
              执行中
            </span>
            <el-tag v-else type="success">已完成</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ startTime }}</el-descriptions-item>
          <el-descriptions-item label="已用时">{{ elapsedTime }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:16px">
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;font-size:13px">
            <span>机构进度</span>
            <span>{{ progress.orgs.current }} / {{ progress.orgs.total }} 家机构</span>
          </div>
          <el-progress
            :percentage="progress.orgs.total ? Math.round(progress.orgs.current / progress.orgs.total * 100) : 0"
            :stroke-width="14"
          />
        </div>

        <div style="margin-top:16px">
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;font-size:13px">
            <span>规则进度</span>
            <span>{{ progress.rules.current }} / {{ progress.rules.total }} 条规则</span>
          </div>
          <el-progress
            :percentage="progress.rules.total ? Math.round(progress.rules.current / progress.rules.total * 100) : 0"
            :stroke-width="14"
            status="success"
          />
        </div>

        <div style="margin-top:12px;font-size:14px;color:#606266">
          发现问题数：<strong style="color:#E6A23C">{{ problemCount.toLocaleString() }}</strong> 条（实时更新）
        </div>
      </el-card>

      <!-- B. 机构维度进度表格 -->
      <el-card style="margin-bottom:16px">
        <template #header><span style="font-weight:600">机构执行明细</span></template>
        <el-table :data="machineStatus" border stripe size="small">
          <el-table-column prop="orgName" label="机构名称" min-width="160" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'done'" type="success" size="small">✓ 完成</el-tag>
              <el-tag v-else-if="row.status === 'running'" type="warning" size="small">⏳ 执行中</el-tag>
              <el-tag v-else type="info" size="small">⏸ 等待</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="execRules" label="已执行规则" width="120" align="center" />
          <el-table-column label="发现问题数" width="110" align="center">
            <template #default="{ row }">{{ row.problemCount ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="耗时" width="100" align="center">
            <template #default="{ row }">{{ row.duration || '-' }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- C. 实时日志 -->
      <el-card style="margin-bottom:16px">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">实时日志</span>
            <el-button v-if="showJumpBtn" size="small" @click="jumpToLatest">↓ 跳到最新</el-button>
          </div>
        </template>
        <div
          ref="logContainer"
          style="height:200px;overflow-y:auto;font-family:monospace;font-size:12px;color:#303133;background:#f5f7fa;padding:8px;border-radius:4px"
          @scroll="handleLogScroll"
        >
          <div v-for="(line, i) in logs" :key="i" style="line-height:1.8">{{ line }}</div>
        </div>
      </el-card>
    </template>

    <!-- 历史执行日志（非执行中时显示） -->
    <el-card v-if="!isRunning">
      <template #header><span style="font-weight:600">历史执行日志</span></template>
      <el-table v-loading="historyLoading" :data="historyData" border stripe size="small">
        <el-table-column prop="executionId" label="批次ID" width="190" />
        <el-table-column label="触发方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.triggerType === 'manual' ? 'primary' : 'success'" size="small">
              {{ row.triggerType === 'manual' ? '手动' : '定时' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scope" label="执行范围" min-width="160" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="duration" label="耗时" width="110" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalRules" label="总规则数" width="90" align="center" />
        <el-table-column label="问题总数" width="90" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row)">{{ row.problemCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openLogDrawer(row)">查看日志</el-button>
            <el-button v-if="row.status === 'partial_fail'" link type="warning" @click="retryFailed(row)">重试失败规则</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 二次确认弹窗 -->
    <el-dialog v-model="confirmVisible" title="确认执行" width="440px">
      <p style="font-size:15px;line-height:1.8">
        将对 <strong>{{ orgCount }}</strong> 家机构执行 <strong>{{ estimatedRules }}</strong> 条质控规则，
        预计耗时约 <strong>{{ estimatedTime }}</strong>。
        执行期间不影响系统正常使用。
      </p>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="triggering" @click="doExecute">确认执行</el-button>
      </template>
    </el-dialog>

    <!-- 日志抽屉 -->
    <el-drawer v-model="logDrawerVisible" title="执行日志详情" size="600px" direction="rtl">
      <div v-if="logDrawerRow">
        <el-descriptions :column="1" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="批次ID">{{ logDrawerRow.executionId }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ logDrawerRow.startTime }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ logDrawerRow.duration }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(logDrawerRow.status)" size="small">{{ statusLabel(logDrawerRow.status) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div style="font-family:monospace;font-size:12px;background:#f5f7fa;padding:12px;border-radius:4px;line-height:2">
          <div>[{{ logDrawerRow.startTime?.slice(11,19) }}] 开始执行批次 {{ logDrawerRow.executionId }}</div>
          <div>[{{ logDrawerRow.startTime?.slice(11,19) }}] 已加载 {{ logDrawerRow.totalRules }} 条规则</div>
          <div>... 机构逐一执行中 ...</div>
          <div>[--:--:--] 执行完成，发现 {{ logDrawerRow.problemCount }} 条问题</div>
        </div>
      </div>
    </el-drawer>

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { showWarningConfirm } from '@/utils/dialog'
import PageContainer from '@/components/PageContainer/index.vue'
import { useExecution } from './execute/useExecution.js'
import { mockOrgs } from '@/mocks/data/orgs.js'

const router = useRouter()
const { isRunning, progress, logs, machineStatus, problemCount, executionStatus, startPolling, stopPolling } = useExecution()

// 触发区表单
const form = ref({
  scopeType: 'all',
  orgType: 'all',
  selectedCategories: [],
  selectedOrgIds: []
})

const categoryOptions = [
  { id: 1, name: '空值检查' },
  { id: 2, name: '值域检查' },
  { id: 3, name: '格式检查' },
  { id: 4, name: '逻辑检查' },
  { id: 5, name: '引用完整性' },
  { id: 6, name: '时效性检查' },
]
const addingCategoryId = ref(null)
const orgList = ref(mockOrgs)

const availableCategories = computed(() =>
  categoryOptions.filter(c => !form.value.selectedCategories.find(s => s.id === c.id))
)

function addCategory(id) {
  const cat = categoryOptions.find(c => c.id === id)
  if (cat) form.value.selectedCategories.push(cat)
  nextTick(() => { addingCategoryId.value = null })
}
function removeCategory(cat) {
  form.value.selectedCategories = form.value.selectedCategories.filter(c => c.id !== cat.id)
}

const estimatedRules = computed(() => {
  if (form.value.scopeType === 'all') return 35
  if (form.value.scopeType === 'category') return form.value.selectedCategories.length * 8
  return 5
})

const orgCount = computed(() =>
  form.value.orgType === 'all' ? orgList.value.length : form.value.selectedOrgIds.length
)

const estimatedTime = computed(() => {
  const rules = estimatedRules.value
  const orgs = orgCount.value || 1
  const min = Math.ceil(rules * orgs / 200)
  const max = Math.ceil(rules * orgs / 120)
  return `${min}-${max} 分钟`
})

// 执行状态
const hasStarted = ref(false)
const currentExecutionId = ref('')
const startTime = ref('')
const elapsedTime = ref('00:00:00')
const confirmVisible = ref(false)
const triggering = ref(false)
let elapsedTimer = null
let elapsedSeconds = 0

function showConfirmDialog() {
  if (form.value.scopeType === 'category' && !form.value.selectedCategories.length) {
    return ElMessage.warning('请至少选择一个规则分类')
  }
  if (form.value.orgType === 'specific' && !form.value.selectedOrgIds.length) {
    return ElMessage.warning('请至少选择一家机构')
  }
  confirmVisible.value = true
}

async function doExecute() {
  triggering.value = true
  try {
    const res = await axios.post('/api/execute/manual', {
      scopeType: form.value.scopeType,
      categories: form.value.selectedCategories.map(c => c.id),
      orgIds: form.value.selectedOrgIds
    })
    const execId = res.data.data?.executionId
    currentExecutionId.value = execId
    startTime.value = new Date().toLocaleString()
    hasStarted.value = true
    confirmVisible.value = false
    elapsedSeconds = 0
    elapsedTimer = setInterval(() => {
      elapsedSeconds++
      const h = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0')
      const m = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')
      const s = String(elapsedSeconds % 60).padStart(2, '0')
      elapsedTime.value = `${h}:${m}:${s}`
    }, 1000)
    startPolling(execId)
    fetchHistory()
  } catch {
    ElMessage.error('执行触发失败')
  } finally {
    triggering.value = false
  }
}

watch(executionStatus, (val) => {
  if (val === 'done') {
    clearInterval(elapsedTimer)
    fetchHistory()
  }
})

function handleClear() {
  form.value = { scopeType: 'all', orgType: 'all', selectedCategories: [], selectedOrgIds: [] }
}

async function handleCancelConfirm() {
  await showWarningConfirm('确认取消当前执行批次？')
  stopPolling()
  clearInterval(elapsedTimer)
  ElMessage.info('已取消执行')
  fetchHistory()
}

// 日志滚动
const logContainer = ref(null)
const showJumpBtn = ref(false)
let userScrolled = false

watch(logs, async () => {
  if (!userScrolled) {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
}, { deep: true })

function handleLogScroll() {
  const el = logContainer.value
  if (!el) return
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10
  if (!atBottom) {
    userScrolled = true
    showJumpBtn.value = true
  } else {
    userScrolled = false
    showJumpBtn.value = false
  }
}

function jumpToLatest() {
  userScrolled = false
  showJumpBtn.value = false
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

// 历史记录
const historyLoading = ref(false)
const historyData = ref([])
const logDrawerVisible = ref(false)
const logDrawerRow = ref(null)

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await axios.get('/api/execute/log')
    historyData.value = res.data.data?.records || []
  } finally {
    historyLoading.value = false
  }
}

function openLogDrawer(row) {
  logDrawerRow.value = row
  logDrawerVisible.value = true
}

function goToDetail(row) {
  router.push({ path: '/result/detail', query: { executionId: row.executionId } })
}

function retryFailed(row) {
  ElMessage.info(`已触发重试 ${row.executionId} 的失败规则`)
}

function statusType(s) {
  return { success: 'success', partial_fail: 'warning', failed: 'danger', running: 'primary' }[s] || 'info'
}
function statusLabel(s) {
  return { success: '成功', partial_fail: '部分失败', failed: '失败', running: '执行中' }[s] || s
}

onMounted(fetchHistory)
</script>

<style scoped>
.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}
</style>
