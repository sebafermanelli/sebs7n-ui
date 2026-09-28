// La perilla de un deslizador: el Slider y la tira de matices del ColorPicker.
//
// Es la de macOS: una cápsula horizontal blanca, no un círculo. Blanca en los dos temas, como en
// AppKit, con la sombra del Tooltip para despegarla de la pista. Mientras se arrastra crece y se
// vuelve lente (`thumb-lens`): la pista se ve a través.
//
// Las dos perillas se aprietan distinto —el Slider de Base UI marca `data-dragging` en el thumb;
// el matiz es un `<input type="range">` invisible y la perilla es su hermana, así que usa
// `peer-active`—, por eso el estado va en dos cadenas. Los números son los mismos en las dos: si
// se toca uno, se tocan los dos acá.

/** Forma, material y animación. El tamaño lo pone cada uno (20 × 28 en el tamaño normal). */
export const sliderThumbClassName = "rounded-full bg-white shadow-tooltip transition-thumb"

/** Al arrastrar el thumb de Base UI. */
export const sliderThumbDraggingClassName = "data-dragging:scale-x-125 data-dragging:scale-y-135 data-dragging:thumb-lens"

/** Al apretar el `<input type="range">` que va antes, con `peer`. */
export const sliderThumbPeerActiveClassName = "peer-active:scale-x-125 peer-active:scale-y-135 peer-active:thumb-lens"
