import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Badge } from "../../src/components/badge"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardRow, CardTitle } from "../../src/components/card"
import { Stat } from "../../src/components/stat"
import { Table, TableBody, TableCell, TableGroupHeader, TableHead, TableHeader, TableRow } from "../../src/components/table"
import { Toggle } from "../../src/components/toggle"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"
import { cardVariants } from "../../src/variants/card"

describe("Toggle (chip)", () => {
  // R4: el token de iCloud (los filtros de la búsqueda, el botón de formato de Notes): gris sin
  // borde en reposo, el acento sólido prendido. Es el mismo objeto que `commandFilterClassName`.
  it("gris en reposo; prendido, el acento sólido con su color de contraste; sin borde", async () => {
    render(<Toggle>Activos</Toggle>)
    const chip = screen.getByRole("button", { name: "Activos" })
    expect(chip).toHaveClass("h-7", "rounded-control", "bg-fill-1", "text-label", "hover:bg-fill-2")
    expect(chip).toHaveClass("data-pressed:bg-brand-700", "data-pressed:text-brand-contrast", "data-pressed:focus-visible:focus-ring-inverse")
    expect(chip.className).not.toMatch(/(^|\s)border-(label|separator|gray)/)
    expect(chip).toHaveClass("data-disabled:opacity-40")
    await userEvent.click(chip)
    expect(chip).toHaveAttribute("aria-pressed", "true")
    expect(chip).toHaveAttribute("data-pressed")
  })

  it("ToggleGroup deja uno solo prendido por defecto", async () => {
    render(
      <ToggleGroup defaultValue={["a"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    await userEvent.click(screen.getByRole("button", { name: "B" }))
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false")
  })

  // R4: un ToggleGroup es el segmentado de iCloud (los B/I/U de Notes, el Día/Semana/Mes de
  // Calendar): la pista gris y cada ítem prendido se marca solo (admite varios prendidos, así que no
  // hay pastilla que se deslice). Revisión de R4 (I4): el prendido era la pastilla blanca sobre la
  // pista gris (1,16:1 en claro); ahora es el acento sólido, como un toggle de ícono de iCloud, que
  // llega a 3:1 contra la pista (lo mide contrast.test.ts). En oscuro, el paso 900 de la marca.
  it("ToggleGroup es el segmentado: pista fill-2 y el prendido en el acento sólido", () => {
    render(
      <ToggleGroup aria-label="Estilo" defaultValue={["a"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByRole("group", { name: "Estilo" })).toHaveClass("rounded-control", "bg-fill-2", "p-0.5", "w-fit")
    const b = screen.getByRole("button", { name: "B" })
    expect(b).toHaveClass("h-6", "text-callout", "text-label", "data-pressed:font-semibold")
    expect(b).toHaveClass("data-pressed:bg-brand-700", "data-pressed:text-brand-contrast", "dark:data-pressed:bg-brand-900", "dark:data-pressed:text-background")
    expect(b.className).not.toMatch(/data-pressed:(bg-segment|shadow-segment)/)
    // El anillo de foco sobre el acento va en el color del texto, que ya llega a 4,5:1 sobre él.
    expect(b).toHaveClass("data-pressed:focus-visible:focus-ring-inverse", "[--sf-focus-inverse:currentColor]")
    expect(b).toHaveClass("after:w-px", "after:bg-fill-3", "first:after:hidden", "data-pressed:after:hidden", "[[data-pressed]+&]:after:hidden")
  })

  // Revisión de R4 (M8): los segmentos miden todos lo mismo, como los de Calendar.
  it("ToggleGroup: segmentos del mismo ancho", () => {
    render(
      <ToggleGroup aria-label="Vista">
        <ToggleGroupItem value="d">Día</ToggleGroupItem>
        <ToggleGroupItem value="s">Semana</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByRole("group", { name: "Vista" })).toHaveClass("inline-grid", "grid-flow-col", "auto-cols-[minmax(0,1fr)]", "data-[orientation=vertical]:grid-flow-row")
  })
})

describe("Badge", () => {
  // 2.0: la etiqueta del Finder. Relleno sólido, sin borde, sin brillo ni vidrio, 4 px de radio.
  it("sólido por color: relleno lleno, sin borde, sin brillo, radio de etiqueta", () => {
    render(<Badge color="amber">Pendiente</Badge>)
    const badge = screen.getByText("Pendiente")
    // R4: 20 de alto (16 en sm) y texto 12: un Badge nunca mide más que un botón sm (28) ni que
    // la fila de menú (30) donde vive.
    expect(badge).toHaveClass("bg-amber-700", "text-black/85", "rounded-tag", "text-footnote", "h-5")
    expect(badge.className).not.toMatch(/(^|\s)border(\s|$|-)|sheen|shadow-|glass|material-|--sf-tint|rounded-full/)
    expect(badge).toHaveAttribute("data-variant", "solid")
  })

  it("los nueve colores son sólidos, con tinta blanca o negra según el relleno", () => {
    const esperado = {
      gray: ["bg-gray-700", "text-black/85"],
      brand: ["bg-brand-700", "text-brand-contrast"],
      red: ["bg-red-800", "text-white"],
      amber: ["bg-amber-700", "text-black/85"],
      green: ["bg-green-700", "text-black/85"],
      blue: ["bg-blue-800", "text-white"],
      teal: ["bg-teal-700", "text-black/85"],
      purple: ["bg-purple-700", "text-white"],
      pink: ["bg-pink-800", "text-white"],
    } as const
    for (const [color, clases] of Object.entries(esperado)) {
      const { unmount } = render(<Badge color={color as keyof typeof esperado}>{color}</Badge>)
      expect(screen.getByText(color), color).toHaveClass(...clases)
      unmount()
    }
  })

  // `subtle` queda por compatibilidad: se ve igual que `solid`.
  it("subtle (obsoleto) se ve igual que solid", () => {
    render(
      <>
        <Badge color="red" variant="subtle">
          Vencida
        </Badge>
        <Badge color="red" variant="solid">
          Anulada
        </Badge>
      </>
    )
    expect(screen.getByText("Vencida").className).toBe(screen.getByText("Anulada").className)
  })

  it("sm mide 16", () => {
    render(<Badge size="sm">Nuevo</Badge>)
    expect(screen.getByText("Nuevo")).toHaveClass("h-4", "text-footnote")
  })

  // El badge de app de iCloud (§2.18): un círculo de 20, 11 px, con la sombra de badge. Para un
  // número (no leídos, pendientes), no para un estado.
  it("count es el badge de app de iCloud: círculo de 20 con 11 px y sombra", () => {
    render(
      <Badge color="red" variant="count">
        3
      </Badge>
    )
    const badge = screen.getByText("3")
    expect(badge).toHaveAttribute("data-variant", "count")
    expect(badge).toHaveClass("h-5", "min-w-5", "rounded-full", "text-caption", "tabular-nums", "shadow-badge", "bg-red-800", "text-white")
    expect(badge).not.toHaveClass("rounded-tag", "text-footnote")
  })

  // Revisión de R4 (I3): un «3» suelto no dice de qué. `label` pone el texto para el lector y
  // esconde el número visible de él, así se anuncia «3 sin leer» una sola vez.
  it("label: el lector anuncia el texto con contexto y no el número suelto", () => {
    render(
      <Badge color="red" label="3 sin leer" variant="count">
        3
      </Badge>
    )
    const badge = document.querySelector("[data-slot=badge]")!
    expect(badge).toHaveTextContent("3")
    expect(screen.getByText("3")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("3 sin leer")).toHaveClass("sr-only")
  })

  it("sin label, el badge es su texto tal cual", () => {
    render(<Badge variant="count">5</Badge>)
    expect(screen.getByText("5")).toHaveAttribute("data-slot", "badge")
    expect(document.querySelector("[data-slot=badge] .sr-only")).toBeNull()
  })

  it("el punto va en el color de la tinta, así se lee sobre el relleno", () => {
    render(
      <Badge color="green" dot>
        Listo
      </Badge>
    )
    const dot = screen.getByText("Listo").querySelector("[data-slot=badge-dot]")
    expect(dot).toHaveClass("bg-current", "size-1.5")
    expect(dot!.className).not.toMatch(/bg-green/)
    expect(dot).toHaveAttribute("aria-hidden", "true")
  })

  // `render` pasó de `useRender` de Base UI a `renderElement`, que es lo que deja
  // al Badge sin `"use client"`. Esto fija que el cambio no se ve desde afuera:
  // el elemento del llamador manda, sus props sobreviven y el punto sigue adentro.
  it("render reemplaza el span y conserva las props del elemento", () => {
    render(
      <Badge color="green" dot render={<a className="underline" href="/planes" />}>
        Pro
      </Badge>
    )
    const link = screen.getByRole("link", { name: "Pro" })
    expect(link).toHaveAttribute("href", "/planes")
    expect(link).toHaveAttribute("data-slot", "badge")
    expect(link).toHaveAttribute("data-color", "green")
    expect(link).toHaveClass("bg-green-700", "underline")
    expect(link.querySelector("[data-slot=badge-dot]")).not.toBeNull()
  })
})

describe("Card", () => {
  it("el widget de iCloud: radio 11, cuerpo opaco con la sombra de widget, franja de cabecera", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>$48.200</CardContent>
        <CardFooter>pie</CardFooter>
      </Card>
    )
    const card = screen.getByText("Ingresos").closest("[data-slot=card]")!
    expect(card).toHaveClass("bg-surface", "shadow-widget", "rounded-surface", "overflow-hidden", "[--card-spacing:--spacing(5)]")
    // La cabecera es una franja de otro tono, no un bloque con padding dentro de la card.
    const header = card.querySelector("[data-slot=card-header]")!
    expect(header).toHaveClass("bg-surface-bar", "min-h-20", "px-(--card-spacing)")
    expect(screen.getByText("Ingresos")).toHaveClass("text-title-2")
    expect(screen.getByText("Últimos 30 días")).toHaveClass("text-callout", "text-label-secondary")
    // Sin franja de pie: ni línea arriba ni el padding grande de 1.x.
    const pie = screen.getByText("pie")
    expect(pie.className).not.toMatch(/(^|\s)border-t(\s|$)|pt-\(--card-spacing\)/)
  })

  it("subtle: hundida y sin sombra, para ir adentro de otra superficie", () => {
    const out = cardVariants({ variant: "subtle" })
    expect(out).toMatch(/(^|\s)bg-fill-1(\s|$)/)
    expect(out).not.toMatch(/(^|\s)shadow-widget(\s|$)/)
  })

  // Revisión de R5a: la franja de otro tono es del widget. Adentro de una card hundida (`fill-1`)
  // una banda más clara parecía un segundo control; la cabecera va sin fondo.
  it("subtle: la cabecera no lleva franja", () => {
    render(
      <Card variant="subtle">
        <CardHeader>
          <CardTitle>Consejo</CardTitle>
        </CardHeader>
      </Card>
    )
    const card = screen.getByText("Consejo").closest("[data-slot=card]")!
    expect(card).toHaveAttribute("data-variant", "subtle")
    expect(card.querySelector("[data-slot=card-header]")!.className).toContain("group-data-[variant=subtle]/card:bg-transparent")
  })

  // W: sobre el wallpaper el cuerpo es el material con blur (en la raíz, un solo blur por card) y la
  // franja es una capa encima, sin blur propio.
  it("sobre el wallpaper: cuerpo translúcido en la raíz y franja encima, sin blur propio", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
        </CardHeader>
        <CardContent>$48.200</CardContent>
      </Card>
    )
    const card = screen.getByText("Ingresos").closest("[data-slot=card]")!
    expect(card).toHaveClass("bg-surface", "in-data-ambient:material-translucent-body")
    const header = card.querySelector("[data-slot=card-header]")!
    expect(header).toHaveClass("bg-surface-bar", "in-data-ambient:group-data-[variant=default]/card:bg-translucent-strip")
    expect(header.className).not.toMatch(/material-translucent|backdrop-blur/)
  })

  it("subtle sobre el wallpaper sigue hundida: sin material", () => {
    expect(cardVariants({ variant: "subtle" })).not.toContain("material-translucent")
  })

  it("CardHeader con ícono de app: caja de 40 a la izquierda, título y subtítulo en la segunda columna", () => {
    render(
      <Card>
        <CardHeader icon={<svg data-testid="icono" />}>
          <CardTitle>Correo</CardTitle>
          <CardDescription>Entrada</CardDescription>
        </CardHeader>
      </Card>
    )
    const icono = screen.getByTestId("icono").closest("[data-slot=card-icon]")!
    expect(icono).toHaveClass("size-10", "row-span-2")
    expect(icono).toHaveAttribute("aria-hidden", "true")
    expect(icono.parentElement).toHaveAttribute("data-icon")
    expect(screen.getByText("Correo")).toHaveClass("group-data-icon/card-header:col-start-2")
  })

  it("CardContent columns={2}: dos columnas con regla vertical; CardRow con separador interior", () => {
    render(
      <Card>
        <CardContent columns={2}>
          <CardRow title="Uno" description="detalle" trailing="9:57" />
          <CardRow title="Dos" />
          <CardRow title="Tres" />
        </CardContent>
      </Card>
    )
    const content = screen.getByText("Uno").closest("[data-slot=card-content]")!
    expect(content).toHaveAttribute("data-columns", "2")
    expect(content).toHaveClass("data-[columns=2]:grid-cols-2", "data-[columns=2]:before:w-px", "data-[columns=2]:before:bg-fill-3")
    const fila = screen.getByText("Uno").closest("[data-slot=card-row]")!
    expect(fila).toHaveClass("min-h-15", "rounded-control", "px-2.5", "before:inset-x-2.5", "before:bg-separator", "first:before:hidden")
    expect(screen.getByText("Uno")).toHaveClass("text-callout", "text-label")
    expect(screen.getByText("detalle")).toHaveClass("text-footnote", "text-label-secondary")
    expect(screen.getByText("9:57")).toHaveClass("text-footnote")
    // En dos columnas, la primera fila de la segunda columna tampoco lleva separador.
    expect(content).toHaveClass("data-[columns=2]:[&>[data-slot=card-row]:nth-child(2)]:before:hidden")
  })

  it("CardAction arriba a la derecha de la franja, aunque haya ícono", () => {
    render(
      <Card>
        <CardHeader icon={<svg />}>
          <CardTitle>Notas</CardTitle>
          <CardAction>acción</CardAction>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText("acción")).toHaveClass("col-end-[-1]", "row-start-1", "self-start")
  })

  it("interactiva y seleccionada", () => {
    const interactive = cardVariants({ interactive: true })
    expect(interactive.split(" ")).toEqual(expect.arrayContaining(["hover:-translate-y-px", "active:translate-y-0", "focus-visible:focus-ring"]))
    // Apretada se oscurece con una capa encima (`background-image`) y no cambiando el fondo.
    expect(interactive).toContain("active:bg-[linear-gradient(var(--color-fill-2),var(--color-fill-2))]")
    // `translate` no está en `transition-control`: la interactiva usa la transición que sí lo incluye.
    expect(interactive).toContain("transition-surface")
    render(<Card selected>sel</Card>)
    const card = screen.getByText("sel")
    expect(card).toHaveAttribute("data-selected")
    expect(card).toHaveClass("ring-2", "ring-brand-700")
  })
})

describe("Table", () => {
  it("la lista de Drive: sin caja, cabecera 14 secundaria sin fondo, filas de 41 con hover fill-1", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead numeric>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana</TableCell>
            <TableCell numeric>$1.200</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const container = screen.getByRole("table").parentElement!
    expect(container).toHaveClass("overflow-x-auto")
    expect(container.className).not.toMatch(/(^|\s)(border|rounded-surface|bg-surface)(\s|$)/)
    expect(screen.getByRole("table")).toHaveClass("border-separate", "border-spacing-0")
    const head = screen.getByText("Cliente")
    // El terciario de iCloud no llega a 4,5:1 en 14: va el secundario.
    expect(head).toHaveClass("h-11", "text-callout", "font-normal", "text-label-secondary", "shadow-[inset_0_-1px_0_var(--color-separator)]")
    expect(screen.getByRole("table").querySelector("thead")!.className).not.toMatch(/bg-/)
    const fila = screen.getByText("Ana").closest("tr")!
    expect(fila).toHaveClass("h-[41px]", "hover:[&>td]:bg-fill-1", "[&>td:first-child]:rounded-s-item", "[&>td:last-child]:rounded-e-item")
    // Separador interior: una línea de 1 px arriba de cada celda, que arranca a 10 del borde.
    expect(fila).toHaveClass("[&>td]:bg-[length:100%_1px]", "[&>td:first-child]:bg-[length:calc(100%-10px)_1px]", "first:[&>td]:bg-none")
    // La primera celda es el nombre (17, principal); el resto, metadatos en 14 secundario.
    expect(screen.getByText("Ana")).toHaveClass("first:text-body", "first:text-label", "text-callout", "text-label-secondary", "px-2.5")
    expect(screen.getByText("$1.200")).toHaveClass("text-right", "tabular-nums")
  })

  it("TableGroupHeader: el título de grupo de Drive, 19/600 con el contador inline", () => {
    render(
      <Table>
        <TableBody>
          <TableGroupHeader colSpan={1} count="6 ítems">
            Últimos 7 días
          </TableGroupHeader>
          <TableRow>
            <TableCell>Ana</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const th = screen.getByRole("rowheader", { name: /Últimos 7 días/ })
    // Encabeza las filas de su `TableBody` (un grupo por cuerpo), no un grupo de columnas. Y ocupa
    // las columnas que tiene la tabla: con 100 el lector anunciaba una tabla de 100 columnas.
    expect(th).toHaveAttribute("scope", "rowgroup")
    expect(th).toHaveAttribute("colspan", "1")
    expect(th).toHaveClass("h-[58px]", "text-title-3", "text-label")
    expect(screen.getByText("6 ítems")).toHaveClass("text-subheadline", "font-normal", "text-label-secondary")
    // La fila que sigue al título no lleva separador arriba.
    expect(screen.getByText("Ana").closest("tr")).toHaveClass("[[data-slot=table-group-header]+&]:[&>td]:bg-none")
  })

  // Revisión de R1: la fila elegida va en acento mientras la tabla tiene el foco. Un click en una
  // celda común (sin nada enfocable) no enfocaba nada, y la fila parpadeaba a gris; en Safari un
  // click nunca enfoca un botón. Con `tabIndex={-1}` el contenedor toma el foco del click, sin
  // entrar en el orden de Tab y sin anillo (el click no es `focus-visible`).
  it("un click en una celda común deja el foco en la tabla, y la fila elegida sigue en acento", async () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Factura 0012</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const container = screen.getByRole("table").parentElement!
    expect(container).toHaveAttribute("tabindex", "-1")
    expect(container).toHaveClass("outline-none")
    await userEvent.click(screen.getByText("Factura 0012"))
    expect(container).toHaveFocus()
    expect(container.matches(":focus-within")).toBe(true)
  })

  // Revisión de R5a: el fondo de la fila pasó a las celdas (para el radio 10), y el anillo interior
  // del `<tr>` quedaba tapado por ese fondo justo en la fila con el puntero o la elegida. El anillo
  // va en las celdas: arriba y abajo en todas, y el costado en la primera y la última.
  it("el anillo de foco de una fila se pinta en las celdas, y en la elegida va el inverso", () => {
    render(
      <Table>
        <TableBody>
          <TableRow tabIndex={0}>
            <TableCell>Ana</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const fila = screen.getByText("Ana").closest("tr")!
    const clases = fila.className.split(/\s+/)
    expect(clases).toContain("focus-visible:outline-none")
    expect(clases).toContain("focus-visible:[&>td]:shadow-[inset_0_3px_0_var(--sf-focus),inset_0_-3px_0_var(--sf-focus)]")
    expect(clases).toContain(
      "focus-visible:[&>td:first-child]:shadow-[inset_3px_0_0_var(--sf-focus),inset_0_3px_0_var(--sf-focus),inset_0_-3px_0_var(--sf-focus)]"
    )
    expect(clases).toContain(
      "focus-visible:[&>td:last-child]:shadow-[inset_-3px_0_0_var(--sf-focus),inset_0_3px_0_var(--sf-focus),inset_0_-3px_0_var(--sf-focus)]"
    )
    expect(clases).toContain("focus-visible:[&>td:first-child:last-child]:shadow-[inset_0_0_0_3px_var(--sf-focus)]")
    // Sobre el acento, el anillo va en el color de contraste de la marca.
    expect(clases).toContain("data-[state=selected]:focus-visible:[--sf-focus:var(--sf-focus-inverse,var(--sf-brand-fg))]")
    // El `<tr>` no dibuja su propio anillo: quedaría debajo del fondo de las celdas.
    expect(clases).not.toContain("focus-visible:focus-ring")
  })

  it("density compact", () => {
    render(<Table density="compact"><tbody /></Table>)
    expect(screen.getByRole("table").parentElement).toHaveAttribute("data-density", "compact")
  })
})

describe("Stat", () => {
  // Es una guarda: pasa desde antes. Sobre el wallpaper la superficie la pone la Card que lo contiene
  // (y ahí el verde y el rojo llegan a 4,5:1, `test/contrast.test.ts`).
  it("no trae superficie propia", () => {
    render(<Stat delta="+12,4 %" label="Facturado" trend="up" value="$ 1.284.000" />)
    const stat = screen.getByText("Facturado").closest("[data-slot=stat]")!
    expect(stat.className).not.toMatch(/(^|\s)\S*(bg-|material-|backdrop-)/)
  })
})
