import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const raiz = (ruta: string) => fileURLToPath(new URL(`../../${ruta}`, import.meta.url))

export default defineConfig({
  // Los tests del sitio que tocan el paquete lo leen del código fuente, no de `node_modules`.
  //
  // `sebs7n-ui` se instala en el sitio con `sync-ui`, que corre antes de `dev` y de `build` pero
  // no antes de `test`: empaquetar el paquete entero para correr cuatro archivos de test es
  // caro, y en CI el sitio llega a los tests sin él. El primer test que importó
  // `sebs7n-ui/lib/contrast` pasó en local —donde el paquete estaba de un `dev` anterior— y
  // rompió el CI de la 1.0.0.
  resolve: {
    alias: [
      { find: /^sebs7n-ui\/lib\/(.+)$/, replacement: raiz("src/lib/$1") },
      { find: /^sebs7n-ui\/tokens\/(.+)$/, replacement: raiz("tokens/$1") },
    ],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts"],
  },
})
