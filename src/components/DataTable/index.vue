<template>
  <div class="data-table-wrap">
    <!-- ── State: init skeleton ── -->
    <template v-if="isInit">
      <el-skeleton :rows="pageSize" animated class="table-skeleton" />
    </template>

    <!-- ── State: error card ── -->
    <template v-else-if="error">
      <div class="error-card">
        <el-icon size="48" color="#F56C6C"><WarningFilled /></el-icon>
        <p class="error-msg">{{ typeof error === 'string' ? error : '数据加载失败，请重试' }}</p>
        <el-button type="primary" :icon="Refresh" @click="emit('retry')">重试</el-button>
      </div>
    </template>

    <!-- ── Normal table ── -->
    <template v-else>
      <div v-loading="loading" class="table-container">
        <!-- el-table -->
        <el-table
          ref="tableRef"
          :data="data"
          v-bind="$attrs"
          border
          stripe
          highlight-current-row
          style="width: 100%"
          @column-width-change="onColumnWidthChange"
        >
          <!-- Dynamic columns from prop -->
          <template v-for="col in columns" :key="col.field || col.prop">
            <el-table-column
              v-bind="buildColAttrs(col)"
              :resizable="col.resizable !== false"
            >
              <!-- Custom cell slot -->
              <template v-if="col.slot" #default="scope">
                <slot :name="col.slot" v-bind="scope" />
              </template>
              <!-- Default render -->
              <template v-else-if="col.render" #default="scope">
                <component :is="col.render(scope.row, scope.$index)" />
              </template>
            </el-table-column>
          </template>

          <!-- Pass-through slot for extra columns (e.g., action column) -->
          <slot />

          <!-- Empty slot -->
          <template #empty>
            <el-empty :description="emptyText || '暂无数据'" />
          </template>
        </el-table>

        <!-- Pagination -->
        <div v-if="total > 0" class="table-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="onPageChange"
            @size-change="onSizeChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Refresh, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  /** 表格数据 */
  data: {
    type: Array,
    default: () => [],
  },
  /** 加载状态（接口请求中） */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否处于初始化状态（首次加载前，显示骨架屏） */
  isInit: {
    type: Boolean,
    default: false,
  },
  /** 错误状态（字符串 = 错误信息，true = 通用错误） */
  error: {
    type: [String, Boolean],
    default: null,
  },
  /** 总记录数 */
  total: {
    type: Number,
    default: 0,
  },
  /** 当前页码（v-model:page） */
  page: {
    type: Number,
    default: 1,
  },
  /** 每页条数（v-model:pageSize） */
  pageSize: {
    type: Number,
    default: 20,
  },
  /**
   * 列配置数组，每项：
   * { field, label, width?, minWidth?, fixed?, align?, slot?, formatter?, sortable? }
   */
  columns: {
    type: Array,
    default: () => [],
  },
  /** 空数据提示文字 */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
})

const emit = defineEmits([
  'update:page',
  'update:pageSize',
  'page-change',
  'size-change',
  'retry',
])

const route = useRoute()
const tableRef = ref(null)

// Local controlled page & size (sync with props)
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

watch(() => props.page, v => { currentPage.value = v })
watch(() => props.pageSize, v => { currentPageSize.value = v })

/* ── Column width memory (localStorage) ─────────────────────────── */
const colWidthKey = computed(() => `col-widths:${route.path}`)

function loadColWidths() {
  try {
    return JSON.parse(localStorage.getItem(colWidthKey.value) || '{}')
  } catch {
    return {}
  }
}

function saveColWidths(widths) {
  localStorage.setItem(colWidthKey.value, JSON.stringify(widths))
}

let storedWidths = {}
onMounted(() => {
  storedWidths = loadColWidths()
})

function onColumnWidthChange({ prop, width }) {
  if (!prop) return
  storedWidths[prop] = width
  saveColWidths(storedWidths)
}

/** Build el-table-column attrs from column config */
function buildColAttrs(col) {
  const stored = storedWidths[col.field || col.prop]
  return {
    prop: col.field || col.prop,
    label: col.label,
    width: stored || col.width,
    minWidth: col.minWidth,
    fixed: col.fixed,
    align: col.align || 'left',
    sortable: col.sortable || false,
    formatter: col.formatter,
    showOverflowTooltip: col.tooltip !== false,
  }
}

/* ── Pagination handlers ─────────────────────────────────────────── */
function onPageChange(page) {
  emit('update:page', page)
  emit('page-change', page)
}

function onSizeChange(size) {
  emit('update:pageSize', size)
  emit('size-change', size)
}
</script>

<style scoped>
.data-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.table-skeleton {
  padding: 12px 0;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 0;
  background: var(--color-bg-white, #fff);
  border-radius: var(--border-radius-base, 4px);
  border: 1px solid var(--color-border, #ebeef5);
}

.error-msg {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, #909399);
}

.table-container {
  position: relative;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

/* Zebra stripe override for medical theme */
.data-table-wrap :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #f9fbff;
}
</style>
