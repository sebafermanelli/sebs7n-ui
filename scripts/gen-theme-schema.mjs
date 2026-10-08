// Escribe `tokens/theme-config.schema.json` desde `themeConfigSchema` (`src/lib/theme.ts`, ya compilado en `dist/`).
// `npm run build && node scripts/gen-theme-schema.mjs`. `test/theme.test.ts` compara el archivo con el export.
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const { themeConfigSchema } = await import(join(root, "dist/lib/theme.js"))
writeFileSync(join(root, "tokens/theme-config.schema.json"), JSON.stringify(themeConfigSchema, null, 2) + "\n")
console.log("[theme-schema] tokens/theme-config.schema.json")
