import { vlyPlugin } from "@vly-ai/integrations";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [vlyPlugin(), react()],
})
