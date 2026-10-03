# Template: blog / editorial

> Lectura primero con sebs7n-ui: una portada con búsqueda y etiquetas y un artículo con índice flotante, roles tipográficos de iCloud y artículos relacionados. Para copiar la estructura y cambiar los artículos.

En vivo: [ui.sebastianfermanelli.com/templates/blog](https://ui.sebastianfermanelli.com/templates/blog). Las reglas que sigue están en la [Guía para agentes](https://ui.sebastianfermanelli.com/docs/guia-agentes.md).

## Usarlo en una app

```bash
npx shadcn@latest add https://ui.sebastianfermanelli.com/r/blog.json
```

Copia la carpeta a `app/blog/` e instala `sebs7n-ui`, `@base-ui/react`, `sonner`, `lucide-react` y `next-themes`. Necesita lo de [Instalación](https://ui.sebastianfermanelli.com/docs/instalacion.md): el `@import` del tema, la fuente, el `ThemeProvider` y el `Toaster` montados en el layout raíz.

## Anatomía

| Archivo | Qué hace |
|---|---|
| `page.tsx` | Server Component: el título, la lista de artículos y la suscripción |
| `[slug]/page.tsx` | un artículo: migas, cabecera, cuerpo, índice y relacionados; `generateStaticParams` los prerenderiza |
| `_data/posts.ts` | **lo que se cambia**: los artículos como bloques (`h2`, `p`, `quote`, `list`, `code`), autores y el nombre del blog |
| `_lib/format.ts` | fechas (las `YYYY-MM-DD` se leen como locales, no UTC) y minutos de lectura |
| `_lib/routes.ts` | las rutas; `GALLERY_PATH` en `null` fuera del sitio |
| `_components/posts-browser.tsx` | el único JS de la portada: `FilterBar` con búsqueda y un `Select` de etiquetas |
| `_components/post-row.tsx` | la fila de un artículo: etiqueta, título como único link, extracto y una línea de meta |
| `_components/article-body.tsx` | los bloques con los roles tipográficos, a ~68 caracteres de medida |
| `_components/table-of-contents.tsx` | el índice flotante, con la sección actual marcada (`aria-current="location"`) |
| `_components/newsletter.tsx`, `newsletter-form.tsx` | la suscripción en una línea, con el formulario pedido recién cuando hace falta |
| `not-found.tsx` | el 404 de un artículo que no existe |
| `_components/theme-toggle.tsx` | el `ThemeSwitcher` pedido después de hidratar |

## Qué conservar al adaptarlo

- Los filtros sobre una lista, en `sm` y todos del mismo tamaño en la fila (búsqueda, selectores, `ToggleGroup`, botones de la barra); la acción primaria de la página, en `md`.
- Superficie lisa: una lectura no lleva wallpaper.
- Un `<h1>` por página; las secciones del artículo son `<h2>` con `id` (el índice sale de ahí).
- La medida del texto (~68 caracteres) y la interlínea de lectura de 28 px en el cuerpo.
- Un solo acento primario: «Suscribirme». Lo demás, en gris.
- Las tarjetas como un único link con el título de nombre.

## Qué cambiar

- `_data/posts.ts` por tus artículos (o por tu CMS: el cuerpo ya es una lista de bloques).
- El nombre y la bajada del blog, en `BLOG`.
- El formulario de `newsletter.tsx` por tu servicio de correo.
