<template>
  <div class="search-form-wrap">
    <el-form
      ref="formRef"
      :model="{}"
      inline
      class="search-form"
      :class="{ 'is-collapsed': collapsible && collapsed }"
    >
      <!-- Scoped slot: caller injects el-form-item fields -->
      <div class="search-fields" ref="fieldsRef">
        <slot />
      </div>

      <!-- Fixed action buttons -->
      <div class="search-actions">
        <!-- Expand/collapse toggle (only when collapsible and has >4 fields) -->
        <el-button
          v-if="collapsible && fieldCount > 4"
          link
          type="primary"
          class="toggle-btn"
          @click="collapsed = !collapsed"
        >
          <template v-if="collapsed">
            展开 <el-icon><ArrowDown /></el-icon>
          </template>
          <template v-else>
            收起 <el-icon><ArrowUp /></el-icon>
          </template>
        </el-button>

        <el-button
          type="primary"
          :loading="loading"
          :icon="Search"
          @click="emit('search')"
        >
          查询
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Search, Refresh, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  /** 超过4个字段时显示展开/收起控件 */
  collapsible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['search', 'reset'])

const formRef = ref(null)
const fieldsRef = ref(null)
const collapsed = ref(true)
const fieldCount = ref(0)

onMounted(async () => {
  await nextTick()
  if (fieldsRef.value) {
    // 统计直接子 el-form-item 数量
    fieldCount.value = fieldsRef.value.querySelectorAll('.el-form-item').length
  }
})

function handleReset() {
  emit('reset')
}
</script>

<style scoped>
.search-form-wrap {
  background: var(--color-bg-white, #fff);
  border-radius: var(--border-radius-base, 4px);
  padding: 16px 20px 8px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm, 0 1px 4px rgba(0, 0, 0, 0.06));
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0;
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 0;
}

/* Collapsed: only show first 4 form items */
.search-form.is-collapsed .search-fields :deep(.el-form-item:nth-child(n+5)) {
  display: none;
}

.search-form :deep(.el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

.search-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: var(--color-text-secondary, #606266);
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
  margin-left: auto;
}

.toggle-btn {
  font-size: 13px;
}
</style>
