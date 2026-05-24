import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils.js'
import { mockUsers } from '../data/users.js'

export const authHandlers = [
  http.post('/api/user/login', async ({ request }) => {
    await mockDelay()
    const { username, password } = await request.json()
    const user = mockUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      return HttpResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 }
      )
    }

    const { password: _, ...userWithoutPassword } = user
    return HttpResponse.json({
      code: 200,
      message: '登录成功',
      data: {
        token: `mock-token-${user.userId}-${Date.now()}`,
        ...userWithoutPassword
      }
    })
  })
]
