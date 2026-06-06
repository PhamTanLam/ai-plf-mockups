import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Hai chế độ build:
//  • mặc định (`npm run build`) → gộp toàn bộ JS/CSS vào 1 file index.html (base tương đối)
//    → double-click mở được ngay, gửi 1 file là chạy. Output: dist/
//  • web (`npm run build:web`) → bản PRODUCTION chuẩn: chia chunk + asset hash (cache/CDN tốt).
//    Output: dist-web/. Base lấy từ BASE_PATH (mặc định '/'); GitHub Pages project site đặt BASE_PATH=/<repo>/.
export default defineConfig(({ mode }) => {
  const web = mode === 'web'
  return {
    base: web ? (process.env.BASE_PATH || '/') : './',
    plugins: [react(), tailwindcss(), ...(web ? [] : [viteSingleFile()])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: web ? { outDir: 'dist-web', sourcemap: false, chunkSizeWarningLimit: 900 } : {},
  }
})
