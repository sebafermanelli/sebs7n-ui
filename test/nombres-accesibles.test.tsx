import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Avatar, AvatarImage } from "../src/components/avatar.js"
import { Button } from "../src/components/button.js"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../src/components/dialog.js"
import { Meter } from "../src/components/meter.js"
import { Progress } from "../src/components/progress.js"
import { Toolbar, ToolbarButton, ToolbarGroup } from "../src/components/toolbar.js"

/**
 * Los nombres accesibles que el sistema **sí** puede forzar.
 *
 * `accesibilidad.md` pedía estos nombres desde 0.1 en la lista de "lo que le
 * queda a la app", y la auditoría de 0.4.0 encontró que no los verificaba nadie:
 * ni un tipo, ni un test, ni un warning. Los `@ts-expect-error` de acá abajo son
 * el test: si alguien afloja un tipo, el `npm run typecheck` falla porque el
 * error que se espera dejó de existir.
 */
describe("Los tipos exigen el nombre", () => {
  it("Button: los tamaños de ícono piden aria-label o aria-labelledby", () => {
    render(
      <>
        {/* @ts-expect-error falta el nombre: el botón es solo un ícono */}
        <Button size="icon-sm" data-testid="sin-nombre" />
        <Button size="icon-sm" aria-label="Cerrar" />
        <Button size="icon-md" aria-labelledby="titulo" />
        {/* Con texto no hace falta: el nombre sale del contenido. */}
        <Button size="sm">Guardar</Button>
      </>
    )
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument()
  })

  it("Progress y Meter: label visible, aria-label o aria-labelledby", () => {
    render(
      <>
        {/* @ts-expect-error una barra sin nombre se anuncia «60 %» y nada más */}
        <Progress value={60} />
        <Progress value={60} label="Subiendo el archivo" />
        <Meter value={73} aria-label="Cupo del mes" />
      </>
    )
    expect(screen.getByRole("progressbar", { name: "Subiendo el archivo" })).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Cupo del mes" })).toBeInTheDocument()
  })

  it("AvatarImage: el alt es obligatorio, y `\"\"` es una respuesta válida", () => {
    render(
      <Avatar>
        {/* @ts-expect-error decidir el alt es parte de poner una foto */}
        <AvatarImage src="/x.png" />
      </Avatar>
    )
    render(
      <Avatar>
        <AvatarImage src="/x.png" alt="" />
      </Avatar>
    )
  })

  it("ToolbarGroup: aria-label obligatorio, como dice su propio JSDoc", () => {
    render(
      <Toolbar aria-label="Formato">
        {/* @ts-expect-error un grupo sin nombre se anuncia «grupo» y nada más */}
        <ToolbarGroup>
          <ToolbarButton aria-label="Negrita">B</ToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup aria-label="Alineación">
          <ToolbarButton aria-label="Centrar">C</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    )
    expect(screen.getByRole("group", { name: "Alineación" })).toBeInTheDocument()
  })
})

describe("Aviso de desarrollo del diálogo sin nombre", () => {
  async function abrir(children: React.ReactNode) {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    render(
      <Dialog>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    return warn
  }

  it("avisa cuando el diálogo se monta sin DialogTitle", async () => {
    const warn = await abrir(<p>Se borra y no se puede deshacer.</p>)
    await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining("<DialogContent> se montó sin nombre")))
    warn.mockRestore()
  })

  // El aviso es una sola vez por componente, así que este caso tiene que correr
  // DESPUÉS del anterior para probar algo: lo que verifica es que con título no
  // haya un segundo aviso distinto.
  it("no avisa cuando hay DialogTitle", async () => {
    const warn = await abrir(<DialogTitle>Borrar la factura</DialogTitle>)
    expect(await screen.findByRole("heading", { name: "Borrar la factura" })).toBeInTheDocument()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
