// @vitest-environment node
//
// sebs7n-ui es un paquete público. Nada de lo que se publica puede nombrar las
// aplicaciones privadas de las que salió el sistema, ni al autor en primera
// persona. Este test es la red: si un nombre vuelve a entrar en src/, tokens/,
// README.md o package.json, falla acá y no en npm.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = fileURLToPath(new URL("..", import.meta.url))

/**
 * Nombres internos que no pueden aparecer en lo que se publica.
 *
 * Van en base64 a propósito: si estuvieran en texto plano, este archivo sería
 * justamente el lugar donde el repo público los lista a todos. El test los
 * decodifica en memoria y nunca los escribe en disco.
 */
const FORBIDDEN = [
  "bXVuZG90dXJpc21v",
  "cmVudG9yYQ==",
  "c2ViYXN0aWFuZmVybWFuZWxsaQ==",
  "cGRmLWNvbnZlcnQ=",
  "YnJhdWx0",
].map((encoded) => Buffer.from(encoded, "base64").toString("utf8"))

/**
 * La única excepción: el dominio del sitio de documentación.
 *
 * Contiene uno de los nombres de arriba, pero no es una fuga: es el sitio
 * oficial del paquete, y sin él quien lo instala desde npm no tiene cómo llegar
 * a la documentación. El `author` y el `homepage` del `package.json` ya dicen
 * quién lo escribe, así que prohibirlo acá no ocultaba nada — solo escondía la
 * doc. Se descuenta del texto antes de buscar, así que un nombre pegado a
 * cualquier otra cosa sigue fallando.
 *
 * En base64 por la misma razón que los de arriba.
 */
const ALLOWED = ["dWkuc2ViYXN0aWFuZmVybWFuZWxsaS5jb20="].map((encoded) =>
  Buffer.from(encoded, "base64").toString("utf8")
)

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json", ".md"])

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (EXTENSIONS.has(extname(entry))) out.push(path)
  }
  return out
}

// Todo lo que viaja en el tarball (`files` de package.json) más el README.
const files = [...walk(join(root, "src")), ...walk(join(root, "tokens")), join(root, "README.md"), join(root, "package.json")]

describe("despersonalización", () => {
  it("mira una lista de archivos no vacía", () => {
    expect(files.length).toBeGreaterThan(30)
  })

  // El título tampoco nombra: en un CI público el log del test sería otra fuga.
  FORBIDDEN.forEach((name, index) => {
    it(`el nombre interno #${index + 1} no aparece en src/, tokens/, README.md ni package.json`, () => {
      const hits = files.filter((file) => {
        const texto = ALLOWED.reduce(
          (acc, allowed) => acc.replaceAll(allowed, ""),
          readFileSync(file, "utf8").toLowerCase()
        )
        return texto.includes(name)
      })
      expect(hits.map((file) => relative(root, file))).toEqual([])
    })
  })

  it("las marcas de ejemplo de tokens/brands.json tienen nombres de color, no de producto", () => {
    const brands = JSON.parse(readFileSync(join(root, "tokens/brands.json"), "utf8")) as Record<string, unknown>
    expect(Object.keys(brands)).toEqual(["teal", "terracotta", "emerald", "blue"])
  })
})
