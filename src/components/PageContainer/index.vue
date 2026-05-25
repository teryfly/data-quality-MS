<template>
  <div class="page-container">
    <!-- Page actions (if any) -->
    <div class="page-header" v-if="hasActions">
      <div class="page-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Content -->
    <div class="page-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  /** 页面标题（保留以兼容现有代码，面包屑由框架layout负责） */
  title: {
    type: String,
    required: true,
  },
})

const slots = useSlots()
const hasActions = computed(() => !!slots.actions)
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 36px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.page-body {
  flex: 1;
  min-height: 0;
}
</style>
