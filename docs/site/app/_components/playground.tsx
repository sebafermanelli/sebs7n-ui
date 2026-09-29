"use client"

import { BellIcon, MoreHorizontalIcon, PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react"
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
import { Slider } from "sebs7n-ui/slider"
import { Stat } from "sebs7n-ui/stat"
import { Switch } from "sebs7n-ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "sebs7n-ui/toolbar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "sebs7n-ui/tooltip"

import { cssOfOklch, hexOfOklch, oklchOfHex, type Oklch } from "../_lib/color"
import { CodeBlock } from "./code-block"
import { Veredicto } from "./color-picker"
import { variables, useGlassConfig } from "./glass-config"
import { Showcase } from "./showcase"

/** El brand del sitio, que es el del paquete. Es de donde arranca el selector. */
const BRAND_DEL_SITIO: Oklch = [0.573, 0.214, 258]

const numero = (valor: number) => valor.toFixed(2).replace(".", ",")

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

  const brand = (oscuro ? (config.brandDark ?? config.brand) : config.brand) ?? BRAND_DEL_SITIO
  const pisadas = variables(config)

  return (
    <div className="flex flex-col gap-10">
      {/* Desde `md` se pega debajo de la barra del AppShell (44): con un `top` fijo quedaba tapado
          por la barra, que está en una capa superior. En un celular no: el panel ocupa casi toda la
          pantalla y pegado tapaba las vistas que configura; ahí se va con el scroll. */}
      <section
        aria-label="Configuración"
        className="md:sticky md:top-[calc(var(--app-shell-header,0px)+--spacing(3))] md:z-30 flex flex-col gap-5 rounded-panel border border-separator bg-surface p-5 shadow-menu"
      >
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
          <Button className="ml-auto" disabled={esDefault} onClick={reset} variant="ghost">
            <RotateCcwIcon />
            Volver al default
          </Button>
        </div>
      </section>

      <section aria-labelledby="pg-css" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-title-2 text-label" id="pg-css">
            Tu configuración
          </h2>
          <p className="text-callout text-label-secondary">
            Pegala en el <code className="text-mono-body">globals.css</code> de la app, después del{" "}
            <code className="text-mono-body">@import &quot;sebs7n-ui/theme.css&quot;</code>. Queda guardada en este
            navegador: el resto del sitio se ve con ella.
          </p>
        </div>
        <CodeBlock code={cssDe(pisadas)} label="Copiar la configuración" />
        {/* Prender el wallpaper no es una variable: es una prop del AppShell (o `bg-ambient` con
            `data-ambient` en el contenedor de la página). Cuánto color, sí: `--ambient`, que sale
            arriba con el resto. */}
        {config.ambient && <CodeBlock code={`<AppShell ambient sidebar={…}>`} label="Copiar la prop del wallpaper" />}
      </section>

      <Showcase />
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
      <section aria-labelledby="pg-muestra" className="flex flex-col gap-4">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Card size="sm">
            <CardContent>
              <Stat delta="+12,4 %" hint="vs. mes anterior" label="Facturado" trend="up" value="$ 4.820.300" />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col gap-3">
              <Stat hint="Meta 95 %" label="Cobrado" value="91,6 %" />
              <Progress aria-label="Cobrado" value={91.6} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <Stat delta="+2" hint="facturas" label="Vencen esta semana" trend="down" value="7" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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
                  <Button>Guardar</Button>
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
export { cssDe, cssOfOklch, oklchOfHex }
