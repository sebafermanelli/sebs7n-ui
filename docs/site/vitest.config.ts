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
      // Una sola copia de React para todo: el test de accesibilidad (`a11y-demos.test.tsx`) renderiza con `@testing-library/react`, que trae el
      // `react-dom` de la raíz; con el `react` del sitio los hooks de los componentes verían dos Reacts.
      ...["@base-ui/react", "lucide-react", "sonner", "next-themes", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "embla-carousel-react", "recharts"].map((paquete) => ({
        find: new RegExp(`^${paquete}(/.*)?$`),
        replacement: raiz(`node_modules/${paquete}`) + "$1",
      })),
      { find: /^react-dom(\/.*)?$/, replacement: raiz("node_modules/react-dom") + "$1" },
      { find: /^react(\/.*)?$/, replacement: raiz("node_modules/react") + "$1" },
      { find: /^sebs7n-ui\/lib\/(.+)$/, replacement: raiz("src/lib/$1") },
      { find: /^sebs7n-ui\/tokens\/(.+)$/, replacement: raiz("tokens/$1") },
      // Los componentes, para los tests que renderizan las pantallas del Playground (`showcase.test.ts`).
      { find: /^sebs7n-ui$/, replacement: raiz("src/index.ts") },
      { find: /^sebs7n-ui\/labels$/, replacement: raiz("src/lib/labels.tsx") },
      { find: /^sebs7n-ui\/variants\/(.+)$/, replacement: raiz("src/variants/$1.ts") },
      { find: /^sebs7n-ui\/([a-z-]+)$/, replacement: raiz("src/components/$1.tsx") },
      // El `@/*` del tsconfig, para las páginas que leen `@/.generated/site.json`.
      { find: /^@\/(.+)$/, replacement: fileURLToPath(new URL("./$1", import.meta.url)) },
    ],
    // El código fuente del paquete resuelve sus dependencias desde la raíz del repo: sin esto React y
    // Base UI llegarían dos veces (la de la raíz y la del sitio) y los hooks se romperían.
    // Lo mismo con los peers opcionales que usa una pantalla (`SortableGrid` en Inicio): dnd-kit desde la
    // raíz traería el React de la raíz. Igual `next-themes`, que lee su contexto en el `ThemeSwitcher`.
    dedupe: ["react", "react-dom", "@base-ui/react", "lucide-react", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "next-themes"],
  },
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
  },
})
