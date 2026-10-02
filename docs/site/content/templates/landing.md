# Template: landing page

> El default para landings y páginas de marketing con sebs7n-ui: hero, logos, beneficios, precios, testimonios, preguntas y cierre, sobre el wallpaper. Para copiar la estructura y cambiar el texto.

En vivo: [ui.sebastianfermanelli.com/templates/landing](https://ui.sebastianfermanelli.com/templates/landing). Las reglas que sigue están en la [Guía para agentes](https://ui.sebastianfermanelli.com/docs/guia-agentes.md).

## Usarlo en una app

```bash
npx shadcn@latest add https://ui.sebastianfermanelli.com/r/landing.json
```

Copia la carpeta a `app/landing/` e instala `sebs7n-ui`, `@base-ui/react`, `lucide-react` y `next-themes`. Necesita lo de [Instalación](https://ui.sebastianfermanelli.com/docs/instalacion.md). Para que sea la home, mové `page.tsx` y `_components/`/`_data/` a `app/` (o importá la página desde `app/page.tsx`).

## Anatomía

| Archivo | Qué hace |
|---|---|
| `page.tsx` | Server Component: el wallpaper y las secciones en orden |
| `_data/content.ts` | **lo que se cambia**: todo el texto, los planes, los clientes, las preguntas y adónde van las CTA |
| `_components/landing-navbar.tsx` | `Navbar` translúcida con links a las anclas y una CTA gris |
| `_components/hero.tsx` | el `<h1>` y la única acción primaria de la primera pantalla |
| `_components/clients.tsx` | `Marquee` de clientes; tocar pausa y reanuda |
| `_components/features.tsx` | beneficios en grilla 1/2/3 de `Card` |
| `_components/pricing.tsx` | el único componente de cliente: `ToggleGroup` mensual/anual y los planes |
| `_components/testimonials.tsx` | citas en `Card` dentro de `Marquee variant="cards"` |
| `_components/faq.tsx` | `Accordion` |
| `_components/final-cta.tsx` | el cierre con la acción del hero |
| `_components/landing-footer.tsx` | `Footer` con grupos de links |
| `_components/section-header.tsx` | el `<h2>` y la bajada de cada sección |

## Qué conservar al adaptarlo

- El orden: hero → prueba social → beneficios → precios → testimonios → preguntas → cierre.
- **Un acento por pantalla**: la CTA del hero, el plan recomendado y el cierre nunca se ven juntos. La CTA de la barra y las secundarias van en gris.
- `max-w-[1080px]`, `gap-24` entre secciones, `text-large-title` solo en el hero, `text-title-1` en cada `<h2>`.
- Server Components: cliente solo lo que cambia con un click.
- Las secciones con ancla llevan `scroll-mt-20` para no quedar debajo de la barra.

## Qué cambiar

- `_data/content.ts`: textos, planes, clientes, testimonios, preguntas y `CTA_HREF` (la ruta de registro de tu app).
- Los íconos de `features.tsx` si cambian los beneficios.
