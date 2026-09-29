// La perilla de un deslizador: el Slider y la tira de matices del ColorPicker.
//
// Es la de iCloud (R4, el slider de zoom de Photos, §2.14): un círculo de 14 px con un borde de 2 px
// en el label y el centro de la superficie. Mientras se arrastra crece: es la respuesta al toque.
//
// Las dos perillas se aprietan distinto —el Slider de Base UI marca `data-dragging` en el thumb;
// el matiz es un `<input type="range">` invisible y la perilla es su hermana, así que usa
// `peer-active`—, por eso el estado va en dos cadenas. Los números son los mismos en las dos: si
// se toca uno, se tocan los dos acá.

/**
 * Forma, material y animación: 14 × 14. La posición la pone cada uno.
 *
 * El borde de 2 px en el label es lo que se agarra (WCAG 1.4.11): llega a 3:1 contra la página y
 * contra el propio centro en los dos temas (test/contrast.test.ts).
 */
export const sliderThumbClassName = "size-3.5 rounded-full border-2 border-label bg-surface transition-thumb"

/** Al arrastrar el thumb de Base UI. */
export const sliderThumbDraggingClassName = "data-dragging:scale-125"

/** Al apretar el `<input type="range">` que va antes, con `peer`. */
export const sliderThumbPeerActiveClassName = "peer-active:scale-125"
