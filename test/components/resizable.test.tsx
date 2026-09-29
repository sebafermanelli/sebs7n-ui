import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../src/components/resizable"

const paneles = () => [...document.querySelectorAll<HTMLElement>("[data-slot=resizable-panel]")]

function Dos(props: Partial<React.ComponentProps<typeof ResizablePanelGroup>>) {
  return (
    <ResizablePanelGroup {...props}>
      <ResizablePanel defaultSize={30} maxSize={80} minSize={20}>
        Carpetas
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={30}>Facturas</ResizablePanel>
    </ResizablePanelGroup>
  )
}

describe("Resizable", () => {
  it("el separador es el window splitter de WAI-ARIA: tabulable, con valor, mínimo, máximo y a quién controla", () => {
    render(<Dos />)
    const separador = screen.getByRole("separator", { name: "Cambiar el tamaño" })
    expect(separador).toHaveAttribute("tabindex", "0")
    // Entre paneles lado a lado, la línea es vertical.
    expect(separador).toHaveAttribute("aria-orientation", "vertical")
    expect(separador).toHaveAttribute("aria-valuenow", "30")
    expect(separador).toHaveAttribute("aria-valuemin", "20")
    // El máximo propio es 80, pero el de al lado no baja de 30: el separador llega hasta 70.
    expect(separador).toHaveAttribute("aria-valuemax", "70")
    expect(separador).toHaveAttribute("aria-controls", paneles()[0]!.id)
  })

  it("el resto se reparte entre los paneles sin defaultSize", () => {
    render(<Dos />)
    expect(paneles().map((panel) => panel.style.flexGrow)).toEqual(["30", "70"])
  })

  it("teclado: ← → de a 5, Shift de a 10, Home y End a los extremos respetando al vecino", async () => {
    const onLayout = vi.fn()
    render(<Dos onLayout={onLayout} />)
    const separador = screen.getByRole("separator")
    separador.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(separador).toHaveAttribute("aria-valuenow", "35")
    expect(onLayout).toHaveBeenLastCalledWith([35, 65])
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(separador).toHaveAttribute("aria-valuenow", "25")
    await userEvent.keyboard("{Home}")
    expect(separador).toHaveAttribute("aria-valuenow", "20")
    await userEvent.keyboard("{End}")
    expect(separador).toHaveAttribute("aria-valuenow", "70")
    expect(paneles().map((panel) => panel.style.flexGrow)).toEqual(["70", "30"])
  })

  it("vertical: paneles apilados, separador horizontal y ↑ ↓", async () => {
    render(<Dos orientation="vertical" />)
    const separador = screen.getByRole("separator")
    expect(separador).toHaveAttribute("aria-orientation", "horizontal")
    expect(separador.parentElement).toHaveClass("flex-col")
    separador.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(separador).toHaveAttribute("aria-valuenow", "35")
    await userEvent.keyboard("{ArrowRight}")
    expect(separador).toHaveAttribute("aria-valuenow", "35")
  })

  it("RTL: el panel de antes está a la derecha, ← lo agranda", async () => {
    render(
      <div dir="rtl">
        <Dos />
      </div>
    )
    screen.getByRole("separator").focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "35")
  })

  it("con el puntero: sigue al arrastre en proporción al grupo y avisa al soltar", () => {
    const onLayout = vi.fn()
    render(<Dos onLayout={onLayout} />)
    const grupo = document.querySelector("[data-slot=resizable-panel-group]") as HTMLElement
    vi.spyOn(grupo, "getBoundingClientRect").mockReturnValue({ width: 1000, height: 500 } as DOMRect)
    const separador = screen.getByRole("separator")
    fireEvent.pointerDown(separador, { button: 0, clientX: 300, pointerId: 1 })
    expect(separador).toHaveAttribute("data-dragging")
    fireEvent.pointerMove(separador, { clientX: 400, pointerId: 1 })
    expect(separador).toHaveAttribute("aria-valuenow", "40")
    // No pasa del mínimo del vecino.
    fireEvent.pointerMove(separador, { clientX: 950, pointerId: 1 })
    expect(separador).toHaveAttribute("aria-valuenow", "70")
    expect(onLayout).not.toHaveBeenCalled()
    fireEvent.pointerUp(separador, { pointerId: 1 })
    expect(separador).not.toHaveAttribute("data-dragging")
    expect(onLayout).toHaveBeenCalledWith([70, 30])
  })

  it("defaultLayout (lo que se guardó con onLayout) le gana a defaultSize", () => {
    render(<Dos defaultLayout={[45, 55]} />)
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "45")
  })

  it("tres paneles: cada separador mueve los dos que tiene al lado", async () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={20}>Uno</ResizablePanel>
        <ResizableHandle aria-label="Ancho de las carpetas" />
        <ResizablePanel defaultSize={30}>Dos</ResizablePanel>
        <ResizableHandle aria-label="Ancho de la lista" />
        <ResizablePanel>Tres</ResizablePanel>
      </ResizablePanelGroup>
    )
    const segundo = screen.getByRole("separator", { name: "Ancho de la lista" })
    expect(segundo).toHaveAttribute("aria-valuenow", "30")
    segundo.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(paneles().map((panel) => panel.style.flexGrow)).toEqual(["20", "35", "45"])
  })

  it("withHandle dibuja la manija; en el servidor ya sale con los tamaños", () => {
    const html = renderToStaticMarkup(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={25}>A</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>B</ResizablePanel>
      </ResizablePanelGroup>
    )
    expect(html).toContain("flex-grow:25")
    expect(html).toContain('data-slot="resizable-grip"')
    // En una línea de 1 px, la manija de 6 no se tiene que achicar (se veía como una raya).
    expect(html).toMatch(/data-slot="resizable-grip"[^>]*class="[^"]*shrink-0/)
  })

  const crecimientos = (html: string) => [...html.matchAll(/flex-grow:([\d.]+)/g)].map((match) => Number(match[1]))

  it("en el servidor, un panel sin defaultSize se lleva el resto", () => {
    expect(crecimientos(renderToStaticMarkup(<Dos />))).toEqual([30, 70])
  })

  it("en el servidor, defaultLayout gana desde el primer render", () => {
    expect(crecimientos(renderToStaticMarkup(<Dos defaultLayout={[45, 55]} />))).toEqual([45, 55])
  })
})
