// Instala sebs7n-ui como tarball (misma semántica que `npm install github:...`),
// así el paquete resuelve react/base-ui desde el playground y no hay dos copias.
import { execFileSync } from "node:child_process"
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = join(dirname(fileURLToPath(import.meta.url)), "..")
const packDir = join(here, ".pack")
mkdirSync(packDir, { recursive: true })

const [{ filename }] = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--pack-destination", packDir], { cwd: join(here, ".."), encoding: "utf8" })
)
execFileSync("npm", ["install", "--no-save", join(packDir, filename)], { cwd: here, stdio: "inherit" })
