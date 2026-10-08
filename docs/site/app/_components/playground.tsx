"use client"

import { BellIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, MoreHorizontalIcon, PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useId, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui/card"
import { Checkbox } from "sebs7n-ui/checkbox"
import { ColorPicker } from "sebs7n-ui/color-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "sebs7n-ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"
import { Input } from "sebs7n-ui/input"
import { Kbd } from "sebs7n-ui/kbd"
import { Label } from "sebs7n-ui/label"
import { Progress } from "sebs7n-ui/progress"
import { RadioGroup, RadioGroupItem } from "sebs7n-ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Separator } from "sebs7n-ui/separator"
import { Slider } from "sebs7n-ui/slider"
import { StatGrid } from "sebs7n-ui/stat-grid"
import { Switch } from "sebs7n-ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "sebs7n-ui/toolbar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "sebs7n-ui/tooltip"

import { cssOfOklch, hexOfOklch, oklchOfHex, type Oklch } from "../_lib/color"
import { CodeBlock } from "./code-block"
import { Veredicto } from "./color-picker"
import { variables, useGlassConfig, type GlassConfig } from "./glass-config"
import { Showcase } from "./showcase"

/** El brand del sitio, que es el del paquete. Es de donde arranca el selector. */
const BRAND_DEL_SITIO: Oklch = [0.573, 0.214, 258]

/** Cinco marcas de ejemplo para probar el matiz: el tinte de neutros, el acento y los contrastes las siguen. */
const MARCAS_DE_EJEMPLO: { id: string; nombre: string; claro: Oklch; oscuro: Oklch }[] = [
  { id: "azul", nombre: "Azul", claro: [0.573, 0.214, 258], oscuro: [0.573, 0.214, 258] },
  { id: "teal", nombre: "Teal", claro: [0.515, 0.099, 183], oscuro: [0.62, 0.11, 183] },
  { id: "terracota", nombre: "Terracota", claro: [0.55, 0.16, 35], oscuro: [0.55, 0.16, 35] },
  { id: "esmeralda", nombre: "Esmeralda", claro: [0.53, 0.13, 162], oscuro: [0.74, 0.13, 162] },
  { id: "pino", nombre: "Verde pino", claro: [0.42, 0.09, 160], oscuro: [0.7, 0.11, 160] },
]

const numero = (valor: number) => valor.toFixed(2).replace(".", ",")

/**
 * El `globals.css` completo de la app: lo que pide la instalación (`@import` de Tailwind y del paquete, en ese
 * orden) y, después, las variables que la configuración pisa. Es lo mismo que el sitio aplica a `<html>`.
 */
function globalsDe(pisadas: Record<string, string>): string {
  return ['@import "tailwindcss";', '@import "sebs7n-ui/theme.css";', "", cssDe(pisadas)].join("\n")
}

/**
 * El layout raíz equivalente: `ThemeProvider` de `next-themes` con `attribute="class"` (el paquete lee `.dark`) y
 * el `AppShell` con `ambient` si el wallpaper está prendido y con `aside` si el panel del asistente lo está. Con el
 * tinte apagado, `data-neutral-tint="off"` en `<html>`; con una serif de titulares, la fuente cargada en `--font-heading`.
 */
function layoutDe(config: Pick<GlassConfig, "ambient"> & Partial<Pick<GlassConfig, "tint" | "heading" | "grain">>, asistente: boolean): string {
  const { tint = true, heading = "inter", grain = "subtle" } = config
  const props = [config.ambient && "  ambient", asistente && "  aside={<Assistant />}\n  asideOpen={open}\n  onAsideOpenChange={setOpen}", "  sidebar={<AppSidebar />}"].filter(Boolean)
  const fuente =
    heading === "serif"
      ? ['import { Bitter, Inter } from "next/font/google"', 'const heading = Bitter({ subsets: ["latin"], variable: "--font-heading" })', 'const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })', ""]
      : []
  const html = [
    heading === "serif" ? "className={`${inter.variable} ${heading.variable}`}" : null,
    !tint ? 'data-neutral-tint="off"' : null,
    grain !== "subtle" ? `data-grain="${grain}"` : null,
  ].filter(Boolean)
  return [
    ...fuente,
    ...(html.length ? [`<html ${html.join(" ")} lang="es">`, "  <body>"] : []),
    '<ThemeProvider attribute="class" defaultTheme="system" enableSystem>',
    "  <TooltipProvider>",
    `    <AppShell\n${props.map((linea) => String(linea).replace(/^/gm, "    ")).join("\n")}\n    >`,
    "      {children}",
    "    </AppShell>",
    "  </TooltipProvider>",
    "</ThemeProvider>",
    ...(html.length ? ["  </body>", "</html>"] : []),
  ].join("\n")
}

/** El CSS que se pega en el `globals.css` de la app, después del `@import` del paquete. */
function cssDe(pisadas: Record<string, string>): string {
  const lineas = Object.entries(pisadas)
  if (!lineas.length) return "/* Todo en su default: no hace falta escribir nada. */"
  const ancho = Math.max(...lineas.map(([nombre]) => nombre.length))
  return [":root {", ...lineas.map(([nombre, valor]) => `  ${`${nombre}:`.padEnd(ancho + 1)} ${valor};`), "}"].join("\n")
}

/** `children` va dentro del mismo contenedor que el panel, para que el panel siga pegado mientras se recorre. */
export function Playground({ children }: { children?: React.ReactNode }) {
  const { config, set, reset, esDefault } = useGlassConfig()
  const { resolvedTheme } = useTheme()
  // El tema recién se conoce en el cliente. Hasta entonces se asume claro, que es lo que
  // renderizó el servidor: decidirlo antes haría que el HTML y el primer render no coincidan.
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const oscuro = montado && resolvedTheme === "dark"
  // El panel del asistente (`AppShell aside`) abierto en la pantalla de ejemplo: solo para ver cómo reacciona el layout.
  const [asistente, setAsistente] = useState(false)
  // La barra compacta (una línea) es la que se queda pegada al scrollear; expandido, el panel pasa con la página.
  const [compacto, setCompacto] = useState(false)

  const brand = (oscuro ? (config.brandDark ?? config.brand) : config.brand) ?? BRAND_DEL_SITIO
  const pisadas = variables(config)

  return (
    <div className="flex flex-col gap-10">
      {/* El panel es alto (marca, tema, wallpaper, tinte, fuente): expandido pasa con el scroll y no tapa lo que se
          recorre. Compacto —una barra de una línea— sí se pega debajo de la barra del AppShell (44), con los controles
          que más se tocan; los títulos de abajo llevan `scroll-mt` para que al saltar a un ancla no queden detrás. */}
      <section
        aria-label="Configuración"
        className={
          compacto
            ? "sticky top-[calc(var(--app-shell-header,0px)+--spacing(3))] z-30 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-panel border border-separator bg-surface px-4 py-2.5 shadow-menu"
            : "flex flex-col gap-5 rounded-panel border border-separator bg-surface p-5 shadow-menu"
        }
      >
        {compacto ? (
          <>
            <span className="text-callout font-semibold text-label">Configuración</span>
            <ThemeSwitcher />
            <span aria-hidden="true" className="size-5 rounded-full border border-separator" style={{ background: cssOfOklch(brand) }} />
            <Button className="ml-auto" onClick={() => setCompacto(false)} size="sm" variant="plain">
              <ChevronsUpDownIcon />
              Expandir
            </Button>
          </>
        ) : (
          <>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          {/* Ancho fijo: el rótulo cambia con el tema («claro», «oscuro») y, midiendo lo que mide su
              texto, la columna corría todo lo que tiene a la derecha al cambiar de tema. */}
          <div className="flex w-52 flex-col gap-2">
            <span className="text-callout whitespace-nowrap text-label">Color de marca · tema {oscuro ? "oscuro" : "claro"}</span>
            <ColorPicker
              aria-label={`Color de marca (tema ${oscuro ? "oscuro" : "claro"})`}
              className="w-40"
              footer={(color) => <Veredicto color={color} superficie={oscuro ? "#1c1c1e" : "#ffffff"} />}
              onOpenChange={(abierto) => {
                if (abierto) return
                // Lo que se probó y se dejó queda a mano para volver: el más nuevo adelante.
                set({ recientes: [brand, ...config.recientes.filter((otro) => hexOfOklch(otro) !== hexOfOklch(brand))].slice(0, 10) })
              }}
              onValueChange={(color) => set(oscuro ? { brandDark: color } : { brand: color })}
              recent={config.recientes}
              value={brand}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-callout text-label">Tema</span>
            <ThemeSwitcher />
          </div>
          <div className="flex h-8 items-center gap-2">
            <Switch checked={config.ambient} id="pg-ambient" onCheckedChange={(ambient) => set({ ambient })} />
            <Label htmlFor="pg-ambient">Wallpaper</Label>
          </div>
          <Slider
            className="w-48"
            disabled={!config.ambient}
            format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
            label="Color del wallpaper"
            locale="es-AR"
            max={1}
            min={0}
            onValueChange={(valor) => set({ luz: Number((valor as number).toFixed(2)) })}
            showValue
            step={0.05}
            value={config.luz}
          />
          <div className="flex h-8 items-center gap-2">
            <Switch checked={asistente} id="pg-aside" onCheckedChange={setAsistente} />
            <Label htmlFor="pg-aside">Panel del asistente</Label>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-callout text-label">Matiz de marca</span>
            <ToggleGroup
              aria-label="Marca de ejemplo"
              onValueChange={(valor) => {
                const marca = MARCAS_DE_EJEMPLO.find((m) => m.id === valor[0])
                if (marca) set({ brand: marca.claro, brandDark: marca.oscuro })
              }}
              value={[MARCAS_DE_EJEMPLO.find((m) => hexOfOklch(m.claro) === hexOfOklch(config.brand ?? BRAND_DEL_SITIO))?.id ?? ""]}
            >
              {MARCAS_DE_EJEMPLO.map((marca) => (
                <ToggleGroupItem key={marca.id} value={marca.id}>
                  {marca.nombre}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Slider
            className="w-48"
            label="Matiz (0–360°)"
            max={360}
            min={0}
            onValueChange={(valor) => {
              const h = valor as number
              const [l, c] = brand
              set(oscuro ? { brandDark: [l, c, h] } : { brand: [l, c, h], brandDark: config.brandDark ? [config.brandDark[0], config.brandDark[1], h] : null })
            }}
            showValue
            step={1}
            value={Math.round(brand[2])}
          />
          <div className="flex h-8 items-center gap-2">
            <Switch checked={config.tint} id="pg-tint" onCheckedChange={(tint) => set({ tint })} />
            <Label htmlFor="pg-tint">Neutros con tinte</Label>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-callout text-label">Grano de fondo</span>
            <ToggleGroup aria-label="Grano de fondo" onValueChange={(valor) => set({ grain: valor[0] === "off" || valor[0] === "strong" ? valor[0] : "subtle" })} required value={[config.grain]}>
              <ToggleGroupItem value="off">Apagado</ToggleGroupItem>
              <ToggleGroupItem value="subtle">Sutil</ToggleGroupItem>
              <ToggleGroupItem value="strong">Marcado</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-callout text-label">Fuente de titulares</span>
            <ToggleGroup aria-label="Fuente de titulares" onValueChange={(valor) => set({ heading: valor[0] === "serif" ? "serif" : "inter" })} required value={[config.heading]}>
              <ToggleGroupItem value="inter">Inter</ToggleGroupItem>
              <ToggleGroupItem value="serif">Serif (Bitter)</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setCompacto(true)} variant="ghost">
              <ChevronsDownUpIcon />
              Compactar
            </Button>
            <Button disabled={esDefault} onClick={reset} variant="ghost">
              <RotateCcwIcon />
              Volver al default
            </Button>
          </div>
        </div>
          </>
        )}
      </section>

      <section aria-labelledby="pg-css" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-title-2 text-label" id="pg-css">
            Tu configuración
          </h2>
          <p className="text-callout text-label-secondary">
            Así se integra lo que elegiste arriba: cuatro variables de marca y <code className="text-mono-body">--ambient</code> en el{" "}
            <code className="text-mono-body">globals.css</code>, y el layout con <code className="text-mono-body">ThemeProvider</code> y{" "}
            <code className="text-mono-body">AppShell</code>. Queda guardada en este navegador: el resto del sitio se ve con ella.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-callout font-semibold text-label">Copiá esto en tu globals.css</h3>
          <CodeBlock code={globalsDe(pisadas)} label="Copiar el globals.css" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-callout font-semibold text-label">Y esto en tu layout</h3>
          <CodeBlock code={layoutDe(config, asistente)} label="Copiar el layout" />
        </div>
      </section>

      <Showcase ambient={config.ambient} asideOpen={asistente} onAsideOpenChange={setAsistente} />
      <Muestra />
      {children}
    </div>
  )
}

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", concepto: "Licencias anuales", estado: "Pagada", color: "green", monto: "$ 480.000" },
  { id: "0013", cliente: "Nube Digital", concepto: "Soporte mensual", estado: "Enviada", color: "brand", monto: "$ 612.500" },
  { id: "0014", cliente: "Estudio Ruiz", concepto: "Consultoría", estado: "Vencida", color: "amber", monto: "$ 395.000" },
] as const

const CONDICIONES = { contado: "Contado", treinta: "A 30 días", sesenta: "A 60 días" }

/** Una pantalla de una app cualquiera, armada solo con componentes del paquete. */
function Muestra() {
  const cliente = useId()
  const condicion = useId()
  const copia = useId()
  const recordatorio = useId()
  const pesos = useId()
  const dolares = useId()
  const avisar = useId()
  const [descuento, setDescuento] = useState(10)

  return (
    // El `TooltipProvider` ya no es global (ver `demo-slot.tsx`): cada pantalla con tooltips pone el suyo.
    <TooltipProvider>
      <section aria-labelledby="pg-muestra" className="@container flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-title-2 text-label" id="pg-muestra">
            Cómo se ve
          </h2>
          <p className="text-callout text-label-secondary">
            Todo lo de abajo son los componentes del paquete, sin una clase de más. Abrí el menú y el diálogo, arrastrá el
            slider, tabulá por el formulario.
          </p>
        </div>

        <Toolbar aria-label="Acciones de la pantalla" className="w-fit max-w-full">
          <Tooltip>
            <TooltipTrigger render={<ToolbarButton aria-label="Buscar" />}>
              <SearchIcon />
            </TooltipTrigger>
            <TooltipContent>
              Buscar <Kbd>⌘K</Kbd>
            </TooltipContent>
          </Tooltip>
          <ToolbarButton aria-label="Notificaciones">
            <BellIcon />
          </ToolbarButton>
          <ToolbarSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger render={<ToolbarButton aria-label="Más acciones" />}>
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Factura 0013</DropdownMenuLabel>
                <DropdownMenuItem>
                  Editar
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicar</DropdownMenuItem>
                <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Anular…</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Toolbar>

        <StatGrid
          chartLayout="inset"
          items={[
            { label: "Facturado", value: "$ 4.820.300", delta: "+12,4 %", trend: "up", hint: "vs. mes anterior" },
            { label: "Cobrado", value: "91,6 %", hint: "Meta 95 %", chart: <Progress aria-label="Cobrado" value={91.6} /> },
            { label: "Vencen esta semana", value: "7", delta: "+2", trend: "down", hint: "facturas" }
          ]}
        />

        <div className="grid gap-4 @4xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Factura nueva</CardTitle>
              <CardDescription>Los controles viven adentro del vidrio: alfa, sin blur.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor={cliente}>Cliente</Label>
                <Input defaultValue="Acme S.A." id={cliente} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={condicion}>Condición de pago</Label>
                <Select defaultValue="treinta" items={CONDICIONES}>
                  <SelectTrigger id={condicion}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDICIONES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked id={copia} />
                  <Label htmlFor={copia}>Enviar copia por email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id={recordatorio} />
                  <Label htmlFor={recordatorio}>Recordar el vencimiento</Label>
                </div>
              </div>
              <RadioGroup aria-label="Moneda" className="flex flex-wrap gap-x-6 gap-y-3" defaultValue="pesos">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={pesos} value="pesos" />
                  <Label htmlFor={pesos}>Pesos</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={dolares} value="dolares" />
                  <Label htmlFor={dolares}>Dólares</Label>
                </div>
              </RadioGroup>
              <Slider label="Descuento" max={50} onValueChange={(valor) => setDescuento(valor as number)} showValue value={descuento} />
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={avisar}>Avisar al cliente</Label>
                <Switch defaultChecked id={avisar} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>El acento sólido es uno por pantalla; el resto es vidrio.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <PlusIcon />
                    Nueva factura
                  </Button>
                  <Button variant="secondary">Guardar</Button>
                  <Button variant="secondary">Exportar</Button>
                  <Button variant="secondary">Filtrar</Button>
                  <Button variant="ghost">Cancelar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger render={<Button variant="secondary" />}>Abrir un diálogo</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¿Anular la factura?</DialogTitle>
                        <DialogDescription>
                          Se anula la 0013 y se avisa al cliente. El diálogo es el material más grueso del sistema.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose render={<Button variant="ghost" />}>Cancelar</DialogClose>
                        <DialogClose render={<Button variant="destructive" />}>Anular</DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={async () => {
                      // sonner se pide al primer clic, no en el arranque: el `Toaster` ya se carga
                      // después de hidratar (ver `providers.tsx`).
                      const { toast } = await import("sonner")
                      toast("Factura guardada", {
                        description: "Se le avisó al cliente.",
                        action: { label: "Deshacer", onClick: () => toast.success("Restaurada") },
                      })
                    }}
                    variant="secondary"
                  >
                    Mostrar un toast
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Borrador</Badge>
                  <Badge color="brand">Enviada</Badge>
                  <Badge color="green" dot>
                    Pagada
                  </Badge>
                  <Badge color="amber" dot>
                    Vencida
                  </Badge>
                  <Badge color="blue">Nueva</Badge>
                  <Avatar size="sm">
                    <AvatarFallback>SF</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Alert variant="brand">
              <BellIcon />
              <AlertTitle>Vencen 7 facturas esta semana</AlertTitle>
              <AlertDescription>La franja y el ícono toman el color de marca.</AlertDescription>
            </Alert>

            <Tabs defaultValue="resumen">
              <TabsList aria-label="Período">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="cobros">Cobros</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
              </TabsList>
              <TabsContent className="text-label-secondary" value="resumen">
                La pastilla se desliza de una pestaña a otra.
              </TabsContent>
              <TabsContent className="text-label-secondary" value="cobros">
                4 cobros pendientes de conciliar.
              </TabsContent>
              <TabsContent className="text-label-secondary" value="clientes">
                23 clientes activos.
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead numeric>Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FACTURAS.map((factura) => (
              <TableRow key={factura.id}>
                <TableCell className="text-mono-body">{factura.id}</TableCell>
                <TableCell>{factura.cliente}</TableCell>
                <TableCell>{factura.concepto}</TableCell>
                <TableCell>
                  <Badge color={factura.color} size="sm">
                    {factura.estado}
                  </Badge>
                </TableCell>
                <TableCell numeric>{factura.monto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </TooltipProvider>
  )
}

// `oklchOfHex` y `cssOfOklch` se reexportan para los tests del sitio, que verifican que el CSS
// que se copia es el que el paquete entiende.
export { cssDe, cssOfOklch, globalsDe, layoutDe, oklchOfHex }
