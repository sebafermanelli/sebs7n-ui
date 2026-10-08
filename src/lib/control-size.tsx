"use client"

// Puerta pública del contexto de tamaño que ya usaban `FilterBar` y `Form`: una app que arma su
// propio contenedor de controles (una barra, una tarjeta de alta) fija el tamaño una vez acá en vez
// de escribir `size` en cada control.
export { ControlSizeProvider, useControlSize, type ControlSize } from "../internal/control-size.js"
