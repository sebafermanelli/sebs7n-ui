import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const raiz = (ruta: string) => fileURLToPath(new URL(`../../${ruta}`, import.meta.url))
const sitio = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url))

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
      { find: /^sebs7n-ui\/variants\/(.+)$/, replacement: raiz("src/variants/$1") },
      // Para comparar el marcado de `app/_components/theme-switcher.tsx` con el del paquete.
      { find: /^sebs7n-ui\/theme-switcher$/, replacement: raiz("src/components/theme-switcher.tsx") },
      // El componente del paquete importa React, next-themes y lucide desde la raíz del repo, y el test
      // desde el sitio: sin esto habría dos copias y los hooks y el contexto del tema no andarían.
      { find: /^(react|react-dom|next-themes|lucide-react)(\/.*)?$/, replacement: sitio("node_modules/$1$2") },
    ],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts"],
    // Pasan por Vite, y no por Node, para que el alias de React de arriba también valga adentro de ellos.
    server: { deps: { inline: [/@base-ui\//] } },
  },
})
