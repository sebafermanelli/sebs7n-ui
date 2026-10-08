import { cn } from "sebs7n-ui/lib/utils"

/**
 * El fondo del sitio de documentación: el de la home, en una sola pieza que comparten la home, el
 * Playground, las páginas de docs y el índice de templates (no hay copias).
 *
 * Es un lavado de la marca al 7 % que se funde hacia abajo, dos focos suaves (uno detrás del titular,
 * otro del lado de la ventana) y el grano del sistema. Todo sale de variables del paquete
 * (`--sf-brand-700`, `--grain-*`), así que sigue a la marca, a `data-grain` y al tema claro/oscuro.
 * Va `fixed` y detrás de todo (`-z-10`): el contenido pasa por delante y el fondo queda quieto. Dentro
 * de una caja con `[contain:paint]` (el marco del Playground) `fixed` se ubica contra esa caja.
 *
 * Es solo del sitio. Lo que el paquete le da a una app (`bg-ambient`, el wallpaper de iCloud) no cambia.
 * La capa no lleva texto: el contraste del contenido se mide contra `bg-background` con el lavado
 * encima, que es una mezcla del 7 % (`test/site-backdrop.test.ts`).
 */
const FADE = "[-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"

export function SiteBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none fixed inset-x-0 top-0 -z-10 h-[44rem] max-h-full", FADE, className)} data-slot="site-backdrop">
      <div className="absolute inset-0 [background:linear-gradient(to_bottom,color-mix(in_oklab,var(--sf-brand-700)_7%,transparent),transparent_75%)]" data-slot="site-backdrop-wash" />
      <div
        className="absolute inset-0 [background:radial-gradient(ellipse_55%_50%_at_30%_35%,color-mix(in_oklab,var(--sf-brand-700)_9%,transparent),transparent_70%),radial-gradient(ellipse_40%_45%_at_78%_45%,color-mix(in_oklab,var(--sf-brand-700)_6%,transparent),transparent_70%)]"
        data-slot="site-backdrop-foci"
      />
      <div
        className="absolute inset-0 mix-blend-overlay [background-image:var(--grain-image)] [background-size:var(--grain-size)_var(--grain-size)] opacity-(--grain-opacity)"
        data-slot="site-backdrop-grain"
      />
    </div>
  )
}
