"use client"

import * as React from "react"

/**
 * Teclado o puntero: cómo llegó el foco.
 *
 * Un botón resuelve esto solo con `:focus-visible`. Un campo de texto no: el navegador le
 * aplica `:focus-visible` también cuando se lo enfoca con un clic, porque asume que lo que
 * sigue es tipear y que el cursor solo no alcanza para ver dónde se está. Con CSS no hay forma
 * de distinguir los dos casos, y el halo de 4px del campo aparecía en cada clic.
 *
 * Esto escribe `data-sf-modality` en `<html>` y la utilidad `focus-border` lo lee: con
 * `pointer` deja el borde de color —que sigue siendo el indicador de foco y sigue llegando a
 * 3:1— y guarda el halo para quien navega con Tab.
 *
 * El default es el accesible: sin el atributo (antes de hidratar, sin JS, o con foco
 * programático antes de cualquier interacción) el halo se ve.
 */
let instalado = false

function installModality() {
  if (instalado || typeof document === "undefined") return
  instalado = true
  const root = document.documentElement
  // En captura: un componente que frene la propagación del evento no tiene por qué dejar el
  // atributo desactualizado.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") root.dataset.sfModality = "keyboard"
    },
    true
  )
  document.addEventListener("pointerdown", () => (root.dataset.sfModality = "pointer"), true)
}

/**
 * Se instala al cargar el módulo, no al montar el primer campo.
 *
 * Montando era tarde: en una página sin ningún campo a la vista —un home con un botón de
 * buscar—, el clic que abre el diálogo pasa ANTES de que exista un `Input`, así que nadie lo
 * anotaba. El campo se abría enfocado, el atributo no estaba, y aparecía el halo de teclado
 * para alguien que acababa de usar el mouse. El módulo se carga con el bundle de la página,
 * que es antes de cualquier clic.
 */
installModality()

/**
 * Lo llama cada campo del paquete. Es la red de seguridad de lo de arriba: si el módulo se
 * evaluó en el servidor y el bundler lo reusó, acá se instala en el primer montaje.
 */
function useModality() {
  React.useEffect(installModality, [])
}

export { installModality, useModality }
