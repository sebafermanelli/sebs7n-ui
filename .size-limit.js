// Guarda de peso del paquete publicado. Está en `.js` y no en `.json` porque los umbrales
// necesitan explicar de dónde salen, y JSON no tiene comentarios.
//
// Qué mide: `dist/`, o sea lo mismo que se publica, con las `dependencies` adentro
// (`tailwind-merge`, `clsx`, `class-variance-authority`, `lucide-react`) y las
// `peerDependencies` afuera —React, `@base-ui/react`, `sonner`, `next-themes`—, que es lo que
// size-limit hace por defecto con un paquete de librería: esas las pone la app, no nosotros.
// Por eso estos números son más chicos que los de la auditoría 0.4.0, que midió con esbuild
// resolviendo también Base UI (button 13-16 KB gz, barrel ~200 KB gz). Son dos varas distintas:
// esta mide lo que sebs7n-ui aporta, y es la que sirve para detectar una regresión nuestra.
//
// Por qué dos entradas: la de `button` fija el piso de un componente chico por subpath —si sube,
// es que algo pesado se coló en `lib/` o en `variants/`, que están en todos—. La del barrel
// existe por §2.2 de la auditoría: `dist/index.js` hace `export *` de los 58 componentes y
// Turbopack no lo poda en un Server Component, así que cualquier import del barrel arrastra todo.
// El umbral lo deja a la vista en el CI en vez de que aparezca en la app del consumidor.
//
// Medido el 2026-09-23 sobre el `dist/` de 0.4.0 (size-limit 14.0.0, `npx size-limit`):
//   button  11,76 KB gz  →  umbral 12,5 KB
//   barrel  32,91 KB gz  →  umbral 35 KB
// El margen es chico a propósito: si un cambio lo cruza, quiero mirarlo, no enterarme en 1.0.
export default [
  {
    name: "sebs7n-ui/button (subpath)",
    path: "dist/components/button.js",
    import: "{ Button }",
    gzip: true,
    limit: "12.5 kB",
  },
  {
    name: "sebs7n-ui (barrel completo)",
    path: "dist/index.js",
    // `*` fuerza a que se conserven los 263 exports: sin esto el bundler poda todo lo que nadie
    // usa y el barrel mide lo mismo que un componente suelto, que es justo lo que no pasa en Next.
    import: "*",
    gzip: true,
    limit: "35 kB",
  },
]
