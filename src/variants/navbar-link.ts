import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/**
 * Un link de la barra (`Navbar`): «Ayuda», «Precios», el menú de idioma. Es texto y no botón, como
 * los de la barra de icloud.com y apple.com: `label-secondary` en reposo y `label` —más blanco en
 * oscuro, más negro en claro— con el puntero y en la página actual (`aria-current="page"`). El activo
 * se lee por el color, sin subrayado ni relleno. Mide 28, el escalón de la barra, con el anillo de
 * foco del paquete.
 *
 * `icon` es el cuadrado de 28 con un ícono de 16 (la campanita, el carrito), con el mismo color: los
 * controles de una barra se leen como una sola fila. El botón con forma (el CTA «Ingresar») sigue
 * siendo un `Button`.
 */
const navbarLinkVariantsBase = cva(
  "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control text-callout whitespace-nowrap text-label-secondary outline-none select-none transition-control hover:text-label aria-[current=page]:text-label data-active:text-label focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  { variants: { icon: { true: "size-7", false: "px-2" } }, defaultVariants: { icon: false } }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const navbarLinkClassName = (props?: Parameters<typeof navbarLinkVariantsBase>[0]) => cn(navbarLinkVariantsBase(props))
