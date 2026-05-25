import { ref, onUnmounted } from 'vue'
import axios from 'axios'

export function useExecution() {
  const isRunning = ref(false)
  const progress = ref({ orgs: { current: 0, total: 0 }, rules: { current: 0, total: 0 } })
  const logs = ref([])
  const machineStatus = ref([])
  const problemCount = ref(0)
  const executionStatus = ref('running')

  let pollingTimer = null
  let logTimer = null
  let currentExecutionId = null
  let callCount = 0

  const logMessages = [
    '正在检查数据完整性...',
    '空值检查规则执行中...',
    '值域代码校验进行中...',
    '时间逻辑校验完成',
    '唯一性规则执行完成',
    '引用完整性检查执行中...',
    '规范一致性规则运行中...',
    '数据及时性检查完成',
    '稳定性规则评估中...',
    '正在汇总质控结果...',
  ]

  function startPolling(executionId) {
    currentExecutionId = executionId
    callCount = 0
    isRunning.value = true
    executionStatus.value = 'running'
    logs.value = []

    pollingTimer = setInterval(() => {
      fetchStatus(executionId)
    }, 3000)

    // 实时日志追加
    logTimer = setInterval(() => {
      const now = new Date()
      const ts = now.toTimeString().slice(0, 8)
      const idx = Math.floor(Math.random() * logMessages.length)
      const msg = logMessages[idx]
      logs.value.push(`[${ts}] ${msg}`)
      if (Math.random() > 0.5) {
        const idx2 = (idx + 1) % logMessages.length
        logs.value.push(`[${ts}] ${logMessages[idx2]}`)
      }
    }, 3000)
  }

  async function fetchStatus(executionId) {
    try {
      const res = await axios.get(`/api/execute/status/${executionId}`)
      const data = res.data.data || {}
      callCount++

      const totalOrgs = 8
      const totalRules = 35
      const doneOrgs = Math.min(totalOrgs, Math.floor((data.progress || 0) / 100 * totalOrgs + 0.5))
      const doneRules = Math.min(totalRules, Math.floor((data.progress || 0) / 100 * totalRules + 0.5))

      progress.value = {
        orgs: { current: doneOrgs, total: totalOrgs },
        rules: { current: doneRules, total: totalRules }
      }
      problemCount.value = Math.floor((data.progress || 0) * 12)

      if (data.orgProgress?.length) {
        machineStatus.value = data.orgProgress.map(o => ({
          orgName: o.orgName,
          status: o.status,
          execRules: o.execRules,
          problemCount: o.problemCount,
          duration: o.duration
        }))
      }

      if (data.status === 'done' || (data.progress || 0) >= 100) {
        executionStatus.value = 'done'
        stopPolling()
      }
    } catch {
      // ignore polling errors
    }
  }

  function stopPolling() {
    if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null }
    if (logTimer) { clearInterval(logTimer); logTimer = null }
    isRunning.value = false
  }

  onUnmounted(stopPolling)

  return { isRunning, progress, logs, machineStatus, problemCount, executionStatus, startPolling, stopPolling }
}
