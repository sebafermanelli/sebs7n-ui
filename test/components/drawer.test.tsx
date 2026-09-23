import type * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "../../src/components/button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../src/components/drawer"

/**
 * Lo que jsdom NO puede probar de este componente, y por qué no se simula:
 *
 * - **El gesto.** El arrastre de Base UI se apoya en Pointer Events con
 *   coordenadas, en la velocidad entre dos frames y en `offsetHeight` del
 *   popup. En jsdom no hay layout (todo mide 0) ni `PointerEvent` con
 *   geometría, así que un `fireEvent.pointerMove` no ejercita el mismo camino:
 *   probaría el mock, no el swipe.
 * - **La posición de los snap points.** El offset en píxeles de cada punto
 *   sale de medir el popup y el viewport; con altura 0 todos los puntos caen
 *   en 0. Lo que sí es real y se prueba acá es el *estado*: qué punto está
 *   activo y si es el expandido.
 * - **Las transiciones.** `data-starting-style` / `data-ending-style` viven un
 *   frame y dependen de que el navegador calcule estilos.
 *
 * Todo eso va a `gstack-qa` en un navegador real. Acá se prueba lo que sí
 * decide si el drawer es usable: abrir, cerrar, teclado y foco.
 */

const popup = () => screen.getByRole("dialog")

function DrawerDePrueba(props: React.ComponentProps<typeof Drawer>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger render={<Button />}>Filtros</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtrar viajes</DrawerTitle>
          <DrawerDescription>Se aplican al listado.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <label htmlFor="drawer-cliente">Cliente</label>
          <input id="drawer-cliente" />
        </DrawerBody>
        <DrawerFooter>
          <Button variant="accent">Aplicar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe("Drawer", () => {
  it("abre con el trigger y el título es el nombre accesible", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    expect(await screen.findByRole("dialog", { name: "Filtrar viajes" })).toBeInTheDocument()
    expect(screen.getByText("Se aplican al listado.")).toHaveClass("text-gray-900")
  })

  it("se cierra con el botón visible: el gesto nunca es el único camino", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("Escape cierra y devuelve el foco al disparador", async () => {
    render(<DrawerDePrueba />)
    const trigger = screen.getByRole("button", { name: "Filtros" })
    await userEvent.click(trigger)
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it("atrapa el foco adentro mientras está abierto", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    const drawer = await screen.findByRole("dialog")
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement))
    for (let i = 0; i < 5; i++) {
      await userEvent.tab()
      // Base UI usa focus guards: el foco puede pasar un instante por el guard
      // antes de volver adentro.
      await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement))
    }
  })

  it("el lado sale de swipeDirection, y contra el borde de la pantalla no hay radio", async () => {
    const { unmount } = render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    // Por defecto es la hoja de abajo: se descarta hacia abajo.
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-swipe-direction", "down")
    // Redondeada arriba (borde de adentro) y recta abajo (borde de la pantalla).
    expect(popup().className).toContain("data-[swipe-direction=down]:rounded-t-xl")
    expect(popup().className).not.toMatch(/swipe-direction=down\]:rounded-b/)
    unmount()

    render(<DrawerDePrueba swipeDirection="right" />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-swipe-direction", "right")
  })

  it("el handle se ve pero no se anuncia ni recibe foco: no es el control de cierre", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    await screen.findByRole("dialog")
    const handle = document.querySelector("[data-slot=drawer-handle]")!
    expect(handle).toHaveAttribute("aria-hidden", "true")
    expect(handle.tagName).toBe("DIV")
    expect(handle.querySelector("button")).toBeNull()
    // Y el cierre accesible sigue estando.
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument()
  })

  it("DrawerBody marca la zona que scrollea en vez de arrastrar la hoja", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    await screen.findByRole("dialog")
    const body = document.querySelector("[data-slot=drawer-body]")!
    // El atributo es el que lee el viewport para no empezar un arrastre ahí.
    expect(body).toHaveAttribute("data-drawer-content")
    expect(body).toHaveClass("overflow-auto", "overscroll-contain")
  })

  it("el popup vive dentro del viewport, que es quien escucha el gesto", async () => {
    render(<DrawerDePrueba />)
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    const drawer = await screen.findByRole("dialog")
    expect(drawer.closest("[data-slot=drawer-viewport]")).not.toBeNull()
  })
})

describe("Drawer snap points", () => {
  it("el punto expandido se anuncia con data-expanded; uno intermedio no", async () => {
    const { unmount } = render(
      <Drawer defaultSnapPoint={1} snapPoints={[0.5, 1]}>
        <DrawerTrigger render={<Button />}>Detalle</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Detalle</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )
    await userEvent.click(screen.getByRole("button", { name: "Detalle" }))
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-expanded")
    unmount()

    render(
      <Drawer defaultSnapPoint={0.5} snapPoints={[0.5, 1]}>
        <DrawerTrigger render={<Button />}>Detalle</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Detalle</DrawerTitle>
        </DrawerContent>
      </Drawer>
    )
    await userEvent.click(screen.getByRole("button", { name: "Detalle" }))
    expect(await screen.findByRole("dialog")).not.toHaveAttribute("data-expanded")
  })

  it("controlado: el snap point lo manda quien renderiza, no el gesto", async () => {
    function Controlado() {
      return (
        <Drawer defaultOpen snapPoint={1} snapPoints={[0.4, 1]}>
          <DrawerContent>
            <DrawerTitle>Ítem</DrawerTitle>
          </DrawerContent>
        </Drawer>
      )
    }
    render(<Controlado />)
    const drawer = await screen.findByRole("dialog")
    expect(drawer).toHaveAttribute("data-expanded")
    // El offset en píxeles necesita layout real: en jsdom mide 0 y queda en 0px.
    expect(drawer.style.getPropertyValue("--drawer-snap-point-offset")).toBe("0px")
  })
})
