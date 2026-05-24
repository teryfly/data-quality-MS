import { ElMessageBox } from 'element-plus'

export const vConfirmDelete = {
  mounted(el, binding) {
    const callback = binding.value

    el.addEventListener('click', async () => {
      try {
        await ElMessageBox.confirm(
          '此操作将永久删除该项，是否继续？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
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
