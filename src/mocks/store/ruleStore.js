import { mockRules } from '../data/rules.js'

let rulesStore = JSON.parse(JSON.stringify(mockRules))

export const getRules = () => rulesStore

export const addRule = (rule) => {
  const newRule = {
    ...rule,
    id: Math.max(...rulesStore.map(r => r.id), 0) + 1,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  rulesStore.push(newRule)
  return newRule
}

export const updateRule = (id, patch) => {
  const index = rulesStore.findIndex(r => r.id === id)
  if (index >= 0) {
    rulesStore[index] = { ...rulesStore[index], ...patch }
    return rulesStore[index]
  }
  return null
}

export const deleteRule = (id) => {
  rulesStore = rulesStore.filter(r => r.id !== id)
}

export const batchEnable = (ruleIds, isEnabled) => {
  ruleIds.forEach(id => {
    const rule = rulesStore.find(r => r.id === id)
    if (rule) rule.isEnabled = isEnabled ? 1 : 0
  })
}

export const batchDelete = (ruleIds) => {
  rulesStore = rulesStore.filter(r => !ruleIds.includes(r.id))
}
