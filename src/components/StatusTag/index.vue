<template>
  <el-tag
    :type="tagConfig.elType"
    :effect="tagConfig.effect || 'light'"
    :style="tagConfig.style"
    disable-transitions
    size="small"
    class="status-tag"
  >
    {{ displayText }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * 状态类型标识，支持：
   * 通用：enabled | disabled | error | warning
   * 整改：unfixed | fixing | fixed | unnecessary
   * 规则级别：1 | 2 | 3  (Number or String)
   */
  type: {
    type: [String, Number],
    required: true,
  },
  /** 可选：覆盖默认文字 */
  text: {
    type: String,
    default: '',
  },
})

/** type → { label, elType, style? } */
const TYPE_MAP = {
  // 通用状态
  enabled:     { label: '启用',   elType: 'success' },
  disabled:    { label: '禁用',   elType: 'info' },
  error:       { label: '异常',   elType: 'danger' },
  warning:     { label: '警告',   elType: 'warning' },

  // 整改状态
  unfixed:     { label: '未整改', elType: 'danger' },
  fixing:      { label: '整改中', elType: 'warning' },
  fixed:       { label: '已整改', elType: 'success' },
  unnecessary: { label: '无需整改', elType: 'info' },

  // 规则级别（数字键，转字符串处理）
  1:  { label: '严重', elType: 'danger' },
  2:  { label: '警告', elType: 'warning' },
  3:  { label: '提示', elType: '', style: { color: '#409eff', borderColor: '#b3d8ff', background: '#ecf5ff' } },
}

const tagConfig = computed(() => {
  const key = String(props.type)
  return TYPE_MAP[key] || TYPE_MAP[props.type] || { label: String(props.type), elType: 'info' }
})

const displayText = computed(() => props.text || tagConfig.value.label)
</script>

<style scoped>
.status-tag {
  font-size: 12px;
  font-weight: 500;
}
</style>
