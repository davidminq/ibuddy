import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ibuddy/',
  plugins: [react()],
  server: {
    port: 3000
  }
});