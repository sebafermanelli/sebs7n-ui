// Reescribe el bloque de subpaths del README. Ver scripts/subpaths.mjs.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { replaceBlock, subpathsTable } from "./subpaths.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const readme = join(root, "README.md")
const nuevo = replaceBlock(readFileSync(readme, "utf8"), subpathsTable(root))
writeFileSync(readme, nuevo)
console.log("[subpaths] README.md actualizado")
