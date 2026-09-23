import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(root, "src/styles/colors.css")

export function renderColors(tokens) {
  const scales = Object.keys(tokens.light)
  const vars = (theme) =>
    scales
      .flatMap((scale) =>
        Object.entries(tokens[theme][scale]).map(
          ([step, hex]) => `    --sf-${scale}-${step}: ${hex};`
        )
      )
      .join("\n")
  const mapping = scales
    .flatMap((scale) =>
      Object.keys(tokens.light[scale]).map(
        (step) => `  --color-${scale}-${step}: var(--sf-${scale}-${step});`
      )
    )
    .join("\n")

  return `/* GENERADO por scripts/gen-colors.mjs desde tokens/geist.json. No editar a mano. */
/* Fuente: ${tokens.source} */

@theme inline {
${mapping}
}

@layer base {
  :root {
${vars("light")}
  }

  .dark {
${vars("dark")}
  }
}
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tokens = JSON.parse(readFileSync(join(root, "tokens/geist.json"), "utf8"))
  writeFileSync(OUT, renderColors(tokens))
  console.log(`colors.css: ${Object.keys(tokens.light).length} escalas`)
}
