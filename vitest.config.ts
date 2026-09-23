import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    // Los tests del paquete viven en test/. El sitio (docs/site) tiene los suyos,
    // con su propio entorno (node) y su propio `npm test`.
    include: ["test/**/*.test.{ts,tsx}"],
  },
})
