import { ref } from 'vue'
import axios from 'axios'

export function useDatasetElements() {
  const elements = ref([])
  const loadingElements = ref(false)

  const fetchElements = async (datasetId) => {
    elements.value = []
    if (!datasetId) return
    loadingElements.value = true
    try {
      const { data } = await axios.get(`/api/dataset/${datasetId}/elements`)
      elements.value = data.data?.records || data.data || []
    } finally {
      loadingElements.value = false
    }
  }

  const elementLabel = (el) => `${el.elementName || el.element_name}（${el.elementCode || el.element_code}）`

  return { elements, loadingElements, fetchElements, elementLabel }
}
