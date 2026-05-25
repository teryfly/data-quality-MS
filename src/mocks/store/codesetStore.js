/**
 * Codeset in-memory CRUD store
 * Mirrors the pattern used by datasourceStore / datasetStore / ruleStore.
 * Resets to initial data on page refresh (expected demo behaviour).
 */
import { mockCodesets as initialCodesets } from '../data/codesets.js'

// Deep-copy so mutations don't bleed into the original module export
let store = initialCodesets.map(c => ({ ...c }))
let nextId = Math.max(...initialCodesets.map(c => c.id)) + 1

/** Return the full list (reference — read-only consumers should not mutate) */
export const getCodesets = () => store

/** Single codeset by id */
export const getCodeset = (id) => store.find(c => c.id === Number(id))

/**
 * Add a new codeset (manual).
 * codesetCode is auto-generated if not supplied.
 */
export const addCodeset = (data) => {
  const newCodeset = {
    codeItemCount: 0,
    items: [],
    source: 'custom',
    recognitionMethod: 'manual',
    status: 'normal',
    ...data,
    id: nextId++,
    codesetCode: data.codesetCode || `CUSTOM_${Date.now()}`,
  }
  store.push(newCodeset)
  return newCodeset
}

/**
 * Patch an existing codeset.
 * Returns the updated record, or null if not found.
 */
export const updateCodeset = (id, patch) => {
  const idx = store.findIndex(c => c.id === Number(id))
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...patch }
  return store[idx]
}

/**
 * Hard-delete a codeset from the store.
 */
export const deleteCodeset = (id) => {
  store = store.filter(c => c.id !== Number(id))
}
