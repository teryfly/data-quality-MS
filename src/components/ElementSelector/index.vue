<template>
  <div class="element-selector">
    <!-- Cross-table mode: show dataset select first -->
    <template v-if="showDataset">
      <el-form-item :label="label + ' - 数据集'" :required="required">
        <el-select
          v-model="selectedDatasetId"
          placeholder="选择数据集"
          clearable
          filterable
          style="min-width: 180px"
          @change="onDatasetChange"
        >
          <el-option
            v-for="ds in datasets"
            :key="ds.id"
            :label="ds.name"
            :value="ds.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="label + ' - 字段'" :required="required">
        <el-select
          v-model="selectedElementId"
          placeholder="选择字段"
          clearable
          filterable
          :disabled="!selectedDatasetId"
          style="min-width: 220px"
          @change="onElementChange"
        >
          <template v-for="group in groupedElements" :key="group.type">
            <el-option-group :label="group.typeLabel">
              <el-option
                v-for="el in group.items"
                :key="el.id"
                :label="`${el.element_name}（${el.element_code}）`"
                :value="el.id"
                :disabled="excludeIds?.includes(el.id)"
              />
            </el-option-group>
          </template>
        </el-select>
      </el-form-item>
    </template>

    <!-- Single-dataset mode: only show element select -->
    <template v-else>
      <el-form-item :label="label" :required="required">
        <el-select
          v-model="selectedElementId"
          placeholder="选择字段"
          clearable
          filterable
          style="min-width: 220px"
          @change="onElementChange"
        >
          <template v-for="group in groupedElements" :key="group.type">
            <el-option-group :label="group.typeLabel">
              <el-option
                v-for="el in group.items"
                :key="el.id"
                :label="`${el.element_name}（${el.element_code}）`"
                :value="el.id"
                :disabled="excludeIds?.includes(el.id)"
              />
            </el-option-group>
          </template>
        </el-select>
      </el-form-item>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  /** 标签文字 */
  label: {
    type: String,
    default: '数据元',
  },
  /** 外部已选定的数据集ID（单数据集模式时传入） */
  datasetId: {
    type: Number,
    default: null,
  },
  /** 是否显示数据集选择（跨表规则） */
  showDataset: {
    type: Boolean,
    default: false,
  },
  /** 过滤字段类型，如 ['datetime','date'] */
  filterTypes: {
    type: Array,
    default: null,
  },
  /** 排除的 elementId 列表（防止重复） */
  excludeIds: {
    type: Array,
    default: () => [],
  },
  /** 是否必填 */
  required: {
    type: Boolean,
    default: false,
  },
  /** v-model 绑定值：{ datasetId, elementId, elementName, elementCode } */
  modelValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

/* ── State ───────────────────────────────────────────────────────── */
const datasets = ref([])
const elements = ref([])
const selectedDatasetId = ref(props.datasetId || props.modelValue?.datasetId || null)
const selectedElementId = ref(props.modelValue?.elementId || null)

/* ── Type ordering for groups ──────────────────────────────────── */
const TYPE_ORDER = ['datetime', 'date', 'time', 'string', 'varchar', 'char', 'number', 'int', 'float', 'decimal']
const TYPE_LABEL_MAP = {
  datetime: '日期时间类型', date: '日期类型', time: '时间类型',
  string: '字符串类型', varchar: '字符类型', char: '字符类型',
  number: '数值类型', int: '整数类型', float: '浮点类型', decimal: '小数类型',
}

const groupedElements = computed(() => {
  let list = elements.value
  // Filter by type if specified
  if (props.filterTypes?.length) {
    list = list.filter(el => props.filterTypes.includes(el.element_type?.toLowerCase()))
  }
  // Group by type
  const map = new Map()
  for (const el of list) {
    const t = el.element_type?.toLowerCase() || 'other'
    if (!map.has(t)) map.set(t, [])
    map.get(t).push(el)
  }
  // Sort groups: known types first, then others
  const sorted = []
  for (const t of TYPE_ORDER) {
    if (map.has(t)) sorted.push({ type: t, typeLabel: TYPE_LABEL_MAP[t] || t, items: map.get(t) })
  }
  for (const [t, items] of map) {
    if (!TYPE_ORDER.includes(t)) sorted.push({ type: t, typeLabel: t, items })
  }
  return sorted
})

/* ── API calls (mock-compatible) ────────────────────────────────── */
async function loadDatasets() {
  try {
    const { default: request } = await import('@/utils/request')
    const res = await request.get('/api/dataset/list', { params: { page: 1, size: 999 } })
    datasets.value = res?.records || res || []
  } catch {
    datasets.value = []
  }
}

async function loadElements(dsId) {
  if (!dsId) { elements.value = []; return }
  try {
    const { default: request } = await import('@/utils/request')
    const res = await request.get(`/api/dataset/${dsId}/elements`)
    elements.value = Array.isArray(res) ? res : res?.records || []
  } catch {
    elements.value = []
  }
}

/* ── Watchers ────────────────────────────────────────────────────── */
watch(() => props.datasetId, (id) => {
  if (!props.showDataset && id) {
    selectedDatasetId.value = id
    loadElements(id)
  }
})

watch(() => props.modelValue, (val) => {
  selectedDatasetId.value = val?.datasetId || null
  selectedElementId.value = val?.elementId || null
}, { deep: true })

onMounted(async () => {
  if (props.showDataset) await loadDatasets()
  const dsId = props.datasetId || selectedDatasetId.value
  if (dsId) await loadElements(dsId)
})

/* ── Handlers ────────────────────────────────────────────────────── */
function onDatasetChange(id) {
  selectedElementId.value = null
  loadElements(id)
  emitValue()
}

function onElementChange() {
  emitValue()
}

function emitValue() {
  const el = elements.value.find(e => e.id === selectedElementId.value)
  emit('update:modelValue', {
    datasetId: selectedDatasetId.value,
    elementId: selectedElementId.value,
    elementName: el?.element_name || '',
    elementCode: el?.element_code || '',
  })
}
</script>

<style scoped>
.element-selector {
  display: contents;
}
</style>
