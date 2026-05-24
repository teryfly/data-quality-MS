import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDictStore = defineStore('dict', () => {
  const dictCache = ref({})

  const getDict = (type) => {
    return dictCache.value[type] || []
  }

  const setDict = (type, list) => {
    dictCache.value[type] = list
  }

  const clearDict = () => {
    dictCache.value = {}
  }

  return {
    dictCache,
    getDict,
    setDict,
    clearDict,
  }
})
