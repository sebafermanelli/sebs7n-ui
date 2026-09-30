// Cómo esquivan el borde los popups anclados. Aparte de `adaptive-popover` para que los menús no
// arrastren el Drawer a su subpath.

/**
 * Un menú o un popover pedido al costado (`side="right"`) en un teléfono no tiene lugar al costado.
 * Base UI, para los menús de arriba/abajo, no lo deja pasar al otro eje (`fallbackAxisSide: "none"`,
 * así un menú largo scrollea en vez de saltar al costado); al costado sí tiene que poder caer arriba
 * o abajo. Arriba o abajo se deja lo de Base UI.
 */
export function lateralCollision(side: string | undefined) {
  return side && side !== "top" && side !== "bottom" ? { fallbackAxisSide: "end" as const } : undefined
}
