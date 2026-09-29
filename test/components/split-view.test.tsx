import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, SplitViewSidebar, useSplitView } from "../../src/components/split-view"

function Abrir() {
  const { setPane } = useSplitView()
  return (
    <button onClick={() => setPane("detail")} type="button">
      Abrir factura
    </button>
  )
}

function Mail(props: Partial<React.ComponentProps<typeof SplitView>>) {
  return (
    <SplitView {...props}>
      <SplitViewSidebar aria-label="Carpetas">Carpetas</SplitViewSidebar>
      <SplitViewList aria-label="Facturas">
        <SplitViewBack>Carpetas</SplitViewBack>
        <Abrir />
      </SplitViewList>
      <SplitViewDetail aria-label="Factura">
        <SplitViewBack>Facturas</SplitViewBack>
        Detalle
      </SplitViewDetail>
    </SplitView>
  )
}

describe("SplitView", () => {
  it("tres paneles con nombre, separados por la línea entre paneles, con los anchos de Mail", () => {
    render(<Mail />)
    const sidebar = screen.getByRole("region", { name: "Carpetas" })
    const lista = screen.getByRole("region", { name: "Facturas" })
    const detalle = screen.getByRole("region", { name: "Factura" })
    expect(sidebar.className).toContain("@5xl/split:w-[230px]")
    expect(sidebar.className).toContain("bg-surface-secondary")
    expect(lista.className).toContain("@5xl/split:w-[380px]")
    for (const panel of [sidebar, lista]) expect(panel.className).toContain("@2xl/split:border-e")
    expect(detalle.className).toContain("flex-1")
    expect(sidebar.parentElement).toHaveClass("@container/split")
  })

  it("angosto muestra un panel: el activo, que arranca en la lista", () => {
    render(<Mail />)
    const raiz = screen.getByRole("region", { name: "Facturas" }).parentElement!
    expect(raiz).toHaveAttribute("data-pane", "list")
    expect(screen.getByRole("region", { name: "Facturas" })).toHaveAttribute("data-active")
    expect(screen.getByRole("region", { name: "Factura" })).not.toHaveAttribute("data-active")
    // Oculto de verdad en angosto (no solo corrido): `hidden` salvo el activo.
    expect(screen.getByRole("region", { name: "Factura" }).className).toContain("hidden")
    expect(screen.getByRole("region", { name: "Factura" }).className).toContain("data-active:flex")
  })

  it("elegir algo pasa al detalle y Atrás vuelve un panel", async () => {
    const onPaneChange = vi.fn()
    render(<Mail onPaneChange={onPaneChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir factura" }))
    expect(onPaneChange).toHaveBeenLastCalledWith("detail")
    expect(screen.getByRole("region", { name: "Factura" })).toHaveAttribute("data-active")
    await userEvent.click(screen.getByRole("button", { name: "Facturas" }))
    expect(screen.getByRole("region", { name: "Facturas" })).toHaveAttribute("data-active")
    await userEvent.click(screen.getByRole("button", { name: "Carpetas" }))
    expect(screen.getByRole("region", { name: "Carpetas" })).toHaveAttribute("data-active")
  })

  it("Atrás solo se ve cuando hace falta: en el detalle, solo en angosto", () => {
    render(<Mail />)
    const [aCarpetas, aFacturas] = screen.getAllByRole("button", { name: /Carpetas|Facturas/ })
    expect(aFacturas!.className).toContain("@2xl/split:hidden")
    expect(aCarpetas!.className).toContain("@5xl/split:hidden")
  })

  it("pane controlado", async () => {
    const onPaneChange = vi.fn()
    render(<Mail onPaneChange={onPaneChange} pane="detail" />)
    expect(screen.getByRole("region", { name: "Factura" })).toHaveAttribute("data-active")
    await userEvent.click(screen.getByRole("button", { name: "Facturas" }))
    expect(onPaneChange).toHaveBeenLastCalledWith("list")
    expect(screen.getByRole("region", { name: "Factura" })).toHaveAttribute("data-active")
  })
})

describe("SplitView resizable", () => {
  it("por defecto no se redimensiona, como Mail", () => {
    render(<Mail />)
    expect(screen.queryByRole("separator")).toBeNull()
  })

  it("con resizable, el sidebar y la lista llevan un separador en su borde, nombrado por el panel", () => {
    render(<Mail resizable />)
    const lista = screen.getByRole("region", { name: "Facturas" })
    const separador = screen.getByRole("separator", { name: "Cambiar el tamaño: Facturas" })
    expect(separador).toHaveAttribute("aria-orientation", "vertical")
    expect(separador).toHaveAttribute("aria-controls", lista.id)
    expect(separador).toHaveAttribute("aria-valuenow", "380")
    expect(separador).toHaveAttribute("aria-valuemin", "260")
    expect(separador).toHaveAttribute("aria-valuemax", "560")
    expect(screen.getByRole("separator", { name: "Cambiar el tamaño: Carpetas" })).toHaveAttribute("aria-valuenow", "230")
    // El ancho va por una variable, y solo manda desde que se ven dos paneles.
    expect(lista.style.getPropertyValue("--split-pane-width")).toBe("380px")
    expect(lista.className).toContain("@2xl/split:group-data-resizable/split:w-(--split-pane-width)")
    // En angosto (un panel) el separador no se ve.
    expect(separador.className).toContain("hidden")
  })

  it("teclado: → de a 10 px, Shift de a 40, Home/End a los extremos; avisa el ancho", async () => {
    const onWidthsChange = vi.fn()
    render(<Mail onWidthsChange={onWidthsChange} resizable />)
    const separador = screen.getByRole("separator", { name: /Facturas/ })
    separador.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(separador).toHaveAttribute("aria-valuenow", "390")
    expect(onWidthsChange).toHaveBeenLastCalledWith({ sidebar: 230, list: 390 })
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(separador).toHaveAttribute("aria-valuenow", "350")
    await userEvent.keyboard("{End}")
    expect(separador).toHaveAttribute("aria-valuenow", "560")
    await userEvent.keyboard("{Home}")
    expect(screen.getByRole("region", { name: "Facturas" }).style.getPropertyValue("--split-pane-width")).toBe("260px")
  })

  it("con el puntero, en píxeles; defaultWidths arranca con lo guardado", async () => {
    const { fireEvent } = await import("@testing-library/react")
    const onWidthsChange = vi.fn()
    render(<Mail defaultWidths={{ sidebar: 250 }} onWidthsChange={onWidthsChange} resizable />)
    const separador = screen.getByRole("separator", { name: /Carpetas/ })
    expect(separador).toHaveAttribute("aria-valuenow", "250")
    fireEvent.pointerDown(separador, { button: 0, clientX: 250, pointerId: 1 })
    fireEvent.pointerMove(separador, { clientX: 290, pointerId: 1 })
    expect(separador).toHaveAttribute("aria-valuenow", "290")
    fireEvent.pointerUp(separador, { pointerId: 1 })
    expect(onWidthsChange).toHaveBeenCalledWith({ sidebar: 290, list: 380 })
  })
})

// En angosto el panel que se va queda `display: none` y el foco se perdía en el <body>: quien usa
// teclado o lector tenía que volver a arrancar desde arriba.
describe("SplitView · el foco al cambiar de panel", () => {
  // Lo que hacen las clases en el navegador, sin Tailwind: solo el activo se ve (angosto).
  function Angosto() {
    return <style>{"section[data-slot^=split-view-]:not([data-active]){display:none}"}</style>
  }

  function Lista() {
    const { setPane } = useSplitView()
    return (
      <ul>
        <li aria-current="true">
          <button onClick={() => setPane("detail")} type="button">
            Acme S.A.
          </button>
        </li>
      </ul>
    )
  }

  function Correo(props: Partial<React.ComponentProps<typeof SplitView>>) {
    return (
      <>
        <Angosto />
        <SplitView {...props}>
          <SplitViewList aria-label="Facturas">
            <Lista />
          </SplitViewList>
          <SplitViewDetail aria-label="Factura">
            <SplitViewBack>Facturas</SplitViewBack>
            <h2>Factura 0012</h2>
          </SplitViewDetail>
        </SplitView>
      </>
    )
  }

  it("al abrir el detalle, el foco va a su título; al volver, a la fila elegida", async () => {
    render(<Correo />)
    await userEvent.click(screen.getByRole("button", { name: "Acme S.A." }))
    expect(screen.getByRole("heading", { name: "Factura 0012" })).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "Facturas" }))
    expect(screen.getByRole("button", { name: "Acme S.A." })).toHaveFocus()
  })

  it("si el panel de antes sigue a la vista (ancho), el foco no se mueve", async () => {
    render(
      <SplitView>
        <SplitViewList aria-label="Facturas">
          <Lista />
        </SplitViewList>
        <SplitViewDetail aria-label="Factura">
          <h2>Factura 0012</h2>
        </SplitViewDetail>
      </SplitView>
    )
    await userEvent.click(screen.getByRole("button", { name: "Acme S.A." }))
    expect(screen.getByRole("button", { name: "Acme S.A." })).toHaveFocus()
  })
})
