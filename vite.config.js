import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Pre-bundle heavy deps used by lazy-loaded routes. Without this, Vite's dep
  // optimizer can re-run after MSW boots, returning 504 "Outdated Optimize Dep"
  // for the first /layout & /dashboard chunk requests and aborting the post-login
  // navigation.
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'echarts',
      'element-plus',
      '@element-plus/icons-vue',
    ],
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces (use 'localhost' for local only)
    port: 1580,       // Specify the port (default is 5173)
    strictPort: false, // Set to true to exit if port is already in use
//    cors: {
  //    origin: 'https://cio.fhir.store',  // 允许特定域名
      // 或者允许所有子域名和协议变体:
      // origin: /https?:\/\/.*\.fhir\.store$/
     // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    //  credentials: true,   // 允许携带 cookies
    //  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
   // },
  },
})
