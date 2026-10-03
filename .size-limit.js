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
// El margen es chico a propósito: si un cambio lo cruza, quiero mirarlo en el PR y no
// enterarme cuando ya esté publicado.
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
    // 0.7.0: 36,52 KB. Entraron `icon` y `chart` (Recharts queda afuera: es peer).
    // 1.0.0: 39,24 KB. Entraron `calendar`, `date-picker` y `lib/dates` (+2,9 KB); el vidrio
    // casi no pesa, porque vive en el CSS. El botón por subpath no se movió: 11,87 KB.
    // Con `color-picker` y `lib/color`: 42,53 KB.
    // 1.1.0: 44,84 KB. Entraron `ai-button` y `chat` (+2,3 KB).
    //
    // El barrel crece con cada componente, y va a seguir: desde 1.0 la regla es que lo que se
    // repite en las apps pasa al paquete. El umbral no está para frenar eso sino para que un
    // salto que no se explique por un componente nuevo se vea en el PR. El que importa para una
    // app es el de arriba, el subpath, que no se movió.
    //
    // 2.0 (fase 1): 47,06 KB. Estilo macOS: roles tipográficos, `touch-target`, selección, material
    // por rol, la cápsula compartida de Slider/ColorPicker y `selectionSecondaryClassName`. Se subió
    // a 49 para las fases que siguen (Command, Tree, GroupedList…): cada una tiene que explicar su
    // salto en el PR.
    //
    // 2.0 (fase 3): 49,64 KB. Entró `Command` (+2,1 KB), la paleta estilo Spotlight. Se subió a 55
    // para toda la 2.0: cubre Command y los componentes nuevos de las fases 4 y 5 (Tree,
    // GroupedList, SectionHeader, ColorSwatches, ImageChoice). Cada salto se sigue explicando en el
    // PR; el umbral del subpath no se mueve.
    //
    // 2.0 (fase macOS 2): 55,84 KB. El selector de mes y año de `Calendar` (+0,99 KB: la grilla de
    // meses y la de años, sus seis textos en `labels`). Estaba en 54,85 de 55 y sin lugar; Sebastián
    // aprobó subir a 56 solo por esto.
    //
    // 2.1: estaba en 55,99 de 56. Sebastián aprobó subir a 58 para los arreglos de la revisión de 2.1 y
    // los huecos de los formularios de las apps que tocan componentes del barrel: el registro en `Field`
    // de DatePicker y Toggle/ToggleGroup (`internal/field-control`), `size` de Toggle, el ícono de
    // Combobox/Autocomplete y `loading` de InputGroupButton. Lo nuevo y grande (SearchField, TagsInput,
    // Rating) va solo por subpath.
    //
    // 2.4: 57,84 KB (desde 57,97). Entraron `required`, «todos» con `""` e ítems link en ToggleGroup y
    // `currency`, `locale` del provider, `autoFocus` e `inputRef` en NumberField (≈ +0,34 KB), y se
    // fueron los mensajes de los avisos de desarrollo, que viajaban a producción (≈ −0,49 KB): el
    // chequeo de `NODE_ENV` pasó a ser literal y el bundler lo poda (`test/avisos-dev.test.ts`).
    //
    // 2.5: 59,4 KB. Los popups se contienen en el viewport (`internal/collision`) y Popover, DatePicker
    // y ColorPicker pasan a hoja de abajo en pantallas angostas. La hoja se carga con `import()` solo
    // por debajo de 640 px —el desktop no la paga—, pero size-limit suma el chunk diferido. Sebastián
    // aprobó subir a 60 el 2026-09-30.
    // 61,32 kB en la 2.10.0: el panel lateral acoplado del `AppShell` (`aside`, +1,36 kB) y el desborde
    // de las pestañas con desvanecido (+0,3 kB). Sebastián aprobó subir a 62 el 2026-10-03.
    limit: "62 kB",
  },
]
