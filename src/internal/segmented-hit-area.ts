/**
 * El área de toque de un segmento con el dedo: 44 de alto, sin cambiar lo que se ve. Con el dedo el
 * segmentado se ve igual que en escritorio, como el botón de ícono de al lado (28 con la pista), y
 * lo que crece es un `::before` invisible (el `::after` es el separador, por eso no `touch-target-y`).
 * Solo en alto, como `touch-target-y`: los segmentos van pegados y a lo ancho se pisarían. Lo usan
 * `ToggleGroup`, `ThemeSwitcher` y `Tabs` segmentado. En `internal/` y no en `variants/`: no es API
 * (todo `variants/*` sale en el barrel, que está en su tope).
 */
export const segmentedHitAreaClassName = "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-2.5"
