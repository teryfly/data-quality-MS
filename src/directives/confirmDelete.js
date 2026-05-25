import { showDeleteConfirm } from '@/utils/dialog'

export const vConfirmDelete = {
  mounted(el, binding) {
    const callback = binding.value

    el.addEventListener('click', async () => {
      try {
        await showDeleteConfirm('此操作将永久删除该项，是否继续？')
        if (typeof callback === 'function') {
          callback()
        }
      } catch (error) {
        // User cancelled
      }
    })
  },
}

export default vConfirmDelete
