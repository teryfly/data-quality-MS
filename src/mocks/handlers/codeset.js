import { http, HttpResponse } from 'msw'
import { mockDelay, mockPaginate } from '../utils.js'
import {
  getCodesets,
  addCodeset,
  updateCodeset,
  deleteCodeset,
} from '../store/codesetStore.js'

export const codesetHandlers = [
  // ── LIST ──────────────────────────────────────────────────────────
  http.get('/api/codeset', async ({ request }) => {
    await mockDelay()
    const url = new URL(request.url)
    const page   = Number(url.searchParams.get('page'))   || 1
    const size   = Number(url.searchParams.get('size'))   || 20
    const source = url.searchParams.get('source')
    const status = url.searchParams.get('status')
    const name   = url.searchParams.get('name')

    let codesets = getCodesets()
    if (source) codesets = codesets.filter(c => c.source === source)
    if (status) codesets = codesets.filter(c => c.status === status)
    if (name)   codesets = codesets.filter(c =>
      c.codesetName.includes(name) || c.codesetCode.includes(name)
    )

    const result = mockPaginate(codesets, page, size)
    return HttpResponse.json({ code: 200, message: '成功', data: result })
  }),

  // ── CALIBRATE / EDIT / DELETE / MARK-EXCLUDED ────────────────────
  // The UI routes all codeset mutations through PUT /api/codeset/:id/calibrate.
  // We distinguish operations by inspecting the payload shape:
  //   { deleted: true }            → hard delete
  //   { status: 'excluded' }       → mark as excluded
  //   { isNew: true, ...fields }   → create new codeset (id=0)
  //   { codesetName, ... }         → update mapping fields
  http.put('/api/codeset/:id/calibrate', async ({ params, request }) => {
    await mockDelay()
    const { id } = params
    const payload = await request.json()

    // ── Delete ──
    if (payload.deleted === true) {
      deleteCodeset(Number(id))
      return HttpResponse.json({ code: 200, message: '删除成功', data: null })
    }

    // ── Mark excluded ──
    if (payload.status === 'excluded') {
      const updated = updateCodeset(Number(id), { status: 'excluded' })
      if (!updated) {
        return HttpResponse.json({ code: 404, message: '代码集不存在', data: null })
      }
      return HttpResponse.json({ code: 200, message: '已标记为误识别', data: updated })
    }

    // ── Create new (手动添加) ──
    if (payload.isNew === true) {
      const { isNew, ...rest } = payload
      const newCodeset = addCodeset(rest)
      return HttpResponse.json({ code: 200, message: '代码集添加成功', data: newCodeset })
    }

    // ── Update mapping fields ──
    const updated = updateCodeset(Number(id), payload)
    if (!updated) {
      return HttpResponse.json({ code: 404, message: '代码集不存在', data: null })
    }
    return HttpResponse.json({ code: 200, message: '代码集校准成功', data: updated })
  }),
]
