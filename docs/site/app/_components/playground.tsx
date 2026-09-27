"use client"

import { BellIcon, MoreHorizontalIcon, PlusIcon, RotateCcwIcon, SearchIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useId, useState } from "react"
import { toast } from "sonner"
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
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "sebs7n-ui/toolbar"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"

import { cssOfOklch, hexOfOklch, oklchOfHex, type Oklch } from "../_lib/color"
import { CodeBlock } from "./code-block"
import { Veredicto } from "./color-picker"
import { variables, useGlassConfig, type Radios } from "./glass-config"

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

export function Playground() {
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
      <section
        aria-label="Configuración"
        className="sticky top-16 z-30 flex flex-col gap-5 rounded-panel border border-gray-alpha-400 glass glass-thick p-5 shadow-menu lg:top-4"
      >
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          <Slider
            format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
            label="Glass"
            locale="es-AR"
            max={1}
            min={0}
            onValueChange={(valor) => set({ glass: Number((valor as number).toFixed(2)) })}
            showValue
            step={0.05}
            value={config.glass}
          />
          <Slider
            format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
            label="Tinte de marca"
            locale="es-AR"
            max={1}
            min={0}
            onValueChange={(valor) => set({ tint: Number((valor as number).toFixed(2)) })}
            showValue
            step={0.05}
            value={config.tint}
          />
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-label-14 text-gray-1000">Color de marca · tema {oscuro ? "oscuro" : "claro"}</span>
            <ColorPicker
              aria-label={`Color de marca (tema ${oscuro ? "oscuro" : "claro"})`}
              className="w-40"
              footer={(color) => <Veredicto color={color} superficie={oscuro ? "#0a0a0a" : "#ffffff"} />}
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
            <span className="text-label-14 text-gray-1000" id="pg-radios">
              Radios
            </span>
            <ToggleGroup
              aria-labelledby="pg-radios"
              onValueChange={(valor) => valor[0] && set({ radios: valor[0] as Radios })}
              value={[config.radios]}
            >
              <ToggleGroupItem value="apple">Apple</ToggleGroupItem>
              <ToggleGroupItem value="geist">Geist</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label-14 text-gray-1000">Tema</span>
            <ThemeSwitcher />
          </div>
          <div className="flex h-8 items-center gap-2">
            <Switch checked={config.ambient} id="pg-ambient" onCheckedChange={(ambient) => set({ ambient })} />
            <Label htmlFor="pg-ambient">Luz ambiente</Label>
          </div>
          <Button className="ml-auto" disabled={esDefault} onClick={reset} variant="ghost">
            <RotateCcwIcon />
            Volver al default
          </Button>
        </div>
      </section>

      <section aria-labelledby="pg-css" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-heading-24 text-gray-1000" id="pg-css">
            Tu configuración
          </h2>
          <p className="text-copy-14 text-gray-900">
            Pegala en el <code className="text-copy-13-mono">globals.css</code> de la app, después del{" "}
            <code className="text-copy-13-mono">@import &quot;sebs7n-ui/theme.css&quot;</code>. Queda guardada en este
            navegador: el resto del sitio se ve con ella.
          </p>
        </div>
        <CodeBlock code={cssDe(pisadas)} label="Copiar la configuración" />
        {/* La luz ambiente no es una variable: es una prop del AppShell (o `bg-ambient` en el body). */}
        {config.ambient && <CodeBlock code={`<AppShell ambient sidebar={…}>`} label="Copiar la prop de la luz ambiente" />}
      </section>

      <Muestra />
    </div>
  )
}

const CONTRATOS = [
  { id: "0012", propiedad: "Pellegrini 1420, 3° B", inquilino: "M. Ferreyra", estado: "Pagado", color: "green", monto: "$ 480.000" },
  { id: "0013", propiedad: "Oroño 905, PB", inquilino: "L. Giménez", estado: "Activo", color: "brand", monto: "$ 612.500" },
  { id: "0014", propiedad: "San Martín 2210, 7° A", inquilino: "R. Acosta", estado: "Mora", color: "amber", monto: "$ 395.000" },
] as const

const TIPOS = { tradicional: "Alquiler tradicional", temporario: "Temporario", comercial: "Comercial" }

/** Una pantalla de una app cualquiera, armada solo con componentes del paquete. */
function Muestra() {
  const nombre = useId()
  const tipo = useId()
  const amoblado = useId()
  const cochera = useId()
  const mensual = useId()
  const anual = useId()
  const avisar = useId()
  const [ajuste, setAjuste] = useState(60)

  return (
    <section aria-labelledby="pg-muestra" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-24 text-gray-1000" id="pg-muestra">
          Cómo se ve
        </h2>
        <p className="text-copy-14 text-gray-900">
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
              <DropdownMenuLabel>Contrato 0013</DropdownMenuLabel>
              <DropdownMenuItem>
                Editar
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">Rescindir</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent>
            <Stat delta="+12,4 %" hint="vs. mes anterior" label="Cobrado" trend="up" value="$ 4.820.300" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-3">
            <Stat hint="Meta 95 %" label="Ocupación" value="91,6 %" />
            <Progress aria-label="Ocupación" value={91.6} />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <Stat delta="+2" hint="contratos" label="Vencen este mes" trend="down" value="7" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Propiedad</CardTitle>
            <CardDescription>Los controles viven adentro del vidrio: alfa, sin blur.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor={nombre}>Nombre</Label>
              <Input defaultValue="Depto. Pellegrini 1420" id={nombre} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={tipo}>Tipo</Label>
              <Select defaultValue="tradicional" items={TIPOS}>
                <SelectTrigger id={tipo}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <Checkbox defaultChecked id={amoblado} />
                <Label htmlFor={amoblado}>Amoblado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id={cochera} />
                <Label htmlFor={cochera}>Cochera</Label>
              </div>
            </div>
            <RadioGroup aria-label="Frecuencia del ajuste" className="flex flex-wrap gap-x-6 gap-y-3" defaultValue="mensual">
              <div className="flex items-center gap-2">
                <RadioGroupItem id={mensual} value="mensual" />
                <Label htmlFor={mensual}>Mensual</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id={anual} value="anual" />
                <Label htmlFor={anual}>Anual</Label>
              </div>
            </RadioGroup>
            <Slider label="Ajuste" onValueChange={(valor) => setAjuste(valor as number)} showValue value={ajuste} />
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={avisar}>Avisar al inquilino</Label>
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
                <Button variant="accent">
                  <PlusIcon />
                  Nuevo contrato
                </Button>
                <Button>Guardar</Button>
                <Button variant="outline">Exportar</Button>
                <Button variant="secondary">Filtrar</Button>
                <Button variant="ghost">Cancelar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" />}>Abrir un diálogo</DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Rescindir el contrato?</DialogTitle>
                      <DialogDescription>
                        Se da de baja Oroño 905 y se avisa al inquilino. El diálogo es el material más grueso del sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose render={<Button variant="ghost" />}>Cancelar</DialogClose>
                      <DialogClose render={<Button variant="destructive" />}>Rescindir</DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() =>
                    toast("Contrato guardado", {
                      description: "Se notificó al inquilino.",
                      action: { label: "Deshacer", onClick: () => toast.success("Restaurado") },
                    })
                  }
                  variant="outline"
                >
                  Mostrar un toast
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Borrador</Badge>
                <Badge color="brand">Activo</Badge>
                <Badge color="green" dot>
                  Pagado
                </Badge>
                <Badge color="amber" dot>
                  Mora
                </Badge>
                <Badge color="brand" variant="solid">
                  Nuevo
                </Badge>
                <Avatar size="sm">
                  <AvatarFallback>SF</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Alert variant="brand">
            <BellIcon />
            <AlertTitle>Vencen 7 contratos este mes</AlertTitle>
            <AlertDescription>La franja y el ícono toman el color de marca.</AlertDescription>
          </Alert>

          <Tabs defaultValue="resumen">
            <TabsList aria-label="Período">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="cobros">Cobros</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
            </TabsList>
            <TabsContent className="text-gray-900" value="resumen">
              La pastilla se desliza de una pestaña a otra.
            </TabsContent>
            <TabsContent className="text-gray-900" value="cobros">
              4 cobros pendientes de conciliar.
            </TabsContent>
            <TabsContent className="text-gray-900" value="contratos">
              23 contratos vigentes.
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Propiedad</TableHead>
            <TableHead>Inquilino</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead numeric>Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CONTRATOS.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell className="text-label-13-mono">{contrato.id}</TableCell>
              <TableCell>{contrato.propiedad}</TableCell>
              <TableCell>{contrato.inquilino}</TableCell>
              <TableCell>
                <Badge color={contrato.color} size="sm">
                  {contrato.estado}
                </Badge>
              </TableCell>
              <TableCell numeric>{contrato.monto}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

// `oklchOfHex` y `cssOfOklch` se reexportan para los tests del sitio, que verifican que el CSS
// que se copia es el que el paquete entiende.
export { cssDe, cssOfOklch, oklchOfHex }
