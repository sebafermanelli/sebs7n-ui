// Instala sebs7n-ui como tarball: exactamente lo que se publica, no src/.
// Igual que el playground, para que el sitio documente el paquete real.
//
// En Vercel el repo se clona entero (hay que dejar prendido "Include files
// outside of the Root Directory"), pero la raíz no tiene node_modules: si falta,
// se instala antes de empacar, porque `npm pack` corre el `prepack` del paquete
// (tsc + tailwind) y necesita las devDependencies de la raíz.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = join(dirname(fileURLToPath(import.meta.url)), "..")
const repo = join(here, "..", "..")
const packDir = join(here, ".pack")

// No alcanza con mirar si hay node_modules: Vercel restaura el de la build anterior desde
// cache, y si el paquete sumó una dependencia desde entonces (recharts en 0.7.0) el directorio
// existe pero le falta esa. `npm pack` corría `tsc` contra ese node_modules viejo y moría con
// "Cannot find module 'recharts'" en Vercel, mientras en local y en CI (sin cache) pasaba.
// Se mira cada dependencia declarada: falta una, se instala todo.
const rootPkg = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"))
const declaradas = Object.keys({ ...rootPkg.dependencies, ...rootPkg.devDependencies })
const faltan = declaradas.filter((name) => !existsSync(join(repo, "node_modules", name)))
if (faltan.length) {
  console.log(`[sync-ui] a la raíz le faltan ${faltan.length} dependencias (${faltan.slice(0, 3).join(", ")}${faltan.length > 3 ? ", …" : ""}): npm ci`)
  const lock = existsSync(join(repo, "package-lock.json"))
  // `--include=dev` es obligatorio: Vercel corre el build con NODE_ENV=production y ahí npm
  // saltea las devDependencies, que es donde viven React, sus tipos y Base UI. Sin eso `npm pack`
  // dispara el `prepack` (tsc) contra un node_modules de 5 paquetes y tsc tira ~300 errores de
  // "Could not find a declaration file for module 'react'".
  execFileSync("npm", [lock ? "ci" : "install", "--include=dev", "--no-audit", "--no-fund", "--ignore-scripts"], {
    cwd: repo,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
  })
}

mkdirSync(packDir, { recursive: true })
const [{ filename }] = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--pack-destination", packDir], { cwd: repo, encoding: "utf8" })
)
// Mismo motivo que arriba, del otro lado: con NODE_ENV=production este install PODA las
// devDependencies del sitio y se lleva puesto `@tailwindcss/postcss`, así que el build de Next
// muere con "Cannot find module '@tailwindcss/postcss'".
execFileSync("npm", ["install", "--no-save", "--include=dev", "--no-audit", "--no-fund", join(packDir, filename)], {
  cwd: here,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "development" },
})
console.log(`[sync-ui] sebs7n-ui instalado desde ${filename}`)
