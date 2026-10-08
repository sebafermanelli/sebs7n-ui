"use client"

import { RotateCcwIcon } from "lucide-react"
import { PRESETS } from "sebs7n-ui/lib/theme"
import { ColorPicker } from "sebs7n-ui/color-picker"
import { Label } from "sebs7n-ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Separator } from "sebs7n-ui/separator"
import { Slider } from "sebs7n-ui/slider"
import { Switch } from "sebs7n-ui/switch"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Button } from "sebs7n-ui/button"

import { hexOfOklch, type Oklch } from "../_lib/color"
import { Veredicto } from "./color-picker"
import { desdePreset, type GlassConfig } from "./glass-config"

/** Cinco marcas de ejemplo para probar el matiz: el tinte de neutros, el acento y los contrastes las siguen. */
export const MARCAS_DE_EJEMPLO: { id: string; nombre: string; claro: Oklch; oscuro: Oklch }[] = [
  { id: "azul", nombre: "Azul", claro: [0.573, 0.214, 258], oscuro: [0.573, 0.214, 258] },
  { id: "teal", nombre: "Teal", claro: [0.515, 0.099, 183], oscuro: [0.62, 0.11, 183] },
  { id: "terracota", nombre: "Terracota", claro: [0.55, 0.16, 35], oscuro: [0.55, 0.16, 35] },
  { id: "esmeralda", nombre: "Esmeralda", claro: [0.53, 0.13, 162], oscuro: [0.74, 0.13, 162] },
  { id: "pino", nombre: "Verde pino", claro: [0.42, 0.09, 160], oscuro: [0.7, 0.11, 160] },
]

/** El brand del sitio, que es el del paquete. Es de donde arranca el selector. */
export const BRAND_DEL_SITIO: Oklch = [0.573, 0.214, 258]

type Props = {
  config: GlassConfig
  set: (cambios: Partial<GlassConfig>) => void
  reset: () => void
  esDefault: boolean
  oscuro: boolean
  brand: Oklch
  asistente: boolean
  setAsistente: (valor: boolean) => void
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-callout text-label">{titulo}</span>
      {children}
    </div>
  )
}

function Opciones<T extends string>({ nombre, valor, onChange, opciones }: { nombre: string; valor: T; onChange: (valor: T) => void; opciones: readonly (readonly [T, string])[] }) {
  return (
    <ToggleGroup aria-label={nombre} className="w-fit max-w-full flex-wrap" onValueChange={(v) => v[0] && onChange(v[0] as T)} required value={[valor]}>
      {opciones.map(([id, etiqueta]) => (
        <ToggleGroupItem key={id} value={id}>
          {etiqueta}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/**
 * El constructor de tema: una perilla por cada una del motor (`createTheme`), un preset por industria y la marca. Todo lo que se mueve se
 * aplica a `<html>` al instante, así que el sistema entero reacciona (también las páginas de componentes); abajo salen el CSS, el layout y el
 * JSON para llevarse.
 */
export function ThemeBuilder({ config, set, reset, esDefault, oscuro, brand, asistente, setAsistente }: Props) {
  const marcaActiva = MARCAS_DE_EJEMPLO.find((m) => hexOfOklch(m.claro) === hexOfOklch(config.brand ?? BRAND_DEL_SITIO))?.id ?? ""
  // Tocar una perilla suelta deja de ser «el preset»: el nombre solo dice de dónde se partió.
  const tocar = (cambios: Partial<GlassConfig>) => set({ ...cambios, preset: null })
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <Grupo titulo="Preset por industria">
          <Select
            items={{ "": "Personalizado", ...Object.fromEntries(Object.values(PRESETS).map((p) => [p.id, `${p.name} · ${p.industry}`])) }}
            onValueChange={(id) => set(id ? desdePreset(id as string) : { preset: null })}
            value={config.preset ?? ""}
          >
            <SelectTrigger aria-label="Preset por industria" className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Personalizado</SelectItem>
              {Object.values(PRESETS).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} · {p.industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Grupo>
        <div className="flex w-52 flex-col gap-2">
          <span className="text-callout whitespace-nowrap text-label">Color de marca · tema {oscuro ? "oscuro" : "claro"}</span>
          <ColorPicker
            aria-label={`Color de marca (tema ${oscuro ? "oscuro" : "claro"})`}
            className="w-40"
            footer={(color) => <Veredicto color={color} superficie={oscuro ? "#1c1c1e" : "#ffffff"} />}
            onOpenChange={(abierto) => {
              if (abierto) return
              set({ recientes: [brand, ...config.recientes.filter((otro) => hexOfOklch(otro) !== hexOfOklch(brand))].slice(0, 10) })
            }}
            onValueChange={(color) => tocar(oscuro ? { brandDark: color } : { brand: color })}
            recent={config.recientes}
            value={brand}
          />
        </div>
        <Grupo titulo="Tema">
          <ThemeSwitcher />
        </Grupo>
        <div className="ml-auto flex items-center">
          <Button disabled={esDefault} onClick={reset} variant="ghost">
            <RotateCcwIcon />
            Volver al default
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-x-8 gap-y-5 @lg:grid-cols-2 @3xl:grid-cols-3">
        <Grupo titulo="Marcas de ejemplo (matiz)">
          <ToggleGroup
            aria-label="Marca de ejemplo"
            className="w-fit max-w-full flex-wrap"
            onValueChange={(valor) => {
              const marca = MARCAS_DE_EJEMPLO.find((m) => m.id === valor[0])
              if (marca) tocar({ brand: marca.claro, brandDark: marca.oscuro })
            }}
            value={[marcaActiva]}
          >
            {MARCAS_DE_EJEMPLO.map((marca) => (
              <ToggleGroupItem key={marca.id} value={marca.id}>
                {marca.nombre}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Slider
            className="w-56"
            label="Matiz (0–360°)"
            max={360}
            min={0}
            onValueChange={(valor) => {
              const h = valor as number
              const [l, c] = brand
              tocar(oscuro ? { brandDark: [l, c, h] } : { brand: [l, c, h], brandDark: config.brandDark ? [config.brandDark[0], config.brandDark[1], h] : null })
            }}
            showValue
            step={1}
            value={Math.round(brand[2])}
          />
        </Grupo>

        <Grupo titulo="Forma (radios)">
          <Opciones nombre="Forma" onChange={(shape) => tocar({ shape })} opciones={[["sharp", "Recta"], ["standard", "Estándar"], ["soft", "Suave"], ["round", "Redonda"]]} valor={config.shape} />
        </Grupo>

        <Grupo titulo="Densidad">
          <Opciones nombre="Densidad" onChange={(density) => tocar({ density })} opciones={[["compact", "Compacta"], ["standard", "Estándar"], ["comfortable", "Cómoda"]]} valor={config.density} />
        </Grupo>

        <Grupo titulo="Neutros">
          <Opciones
            nombre="Neutros"
            onChange={(kind) => tocar(kind === "none" ? { tint: false } : { tint: true, neutralsKind: kind })}
            opciones={[["none", "Sin tinte"], ["brand", "De la marca"], ["warm", "Cálido"], ["cool", "Frío"]]}
            valor={config.tint ? config.neutralsKind : "none"}
          />
          <Slider
            className="w-56"
            disabled={!config.tint}
            format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
            label="Intensidad"
            locale="es-AR"
            max={1}
            min={0}
            onValueChange={(neutralsIntensity) => tocar({ neutralsIntensity: Number((neutralsIntensity as number).toFixed(2)) })}
            showValue
            step={0.05}
            value={config.neutralsIntensity}
          />
        </Grupo>

        <Grupo titulo="Superficies">
          <Opciones nombre="Superficies" onChange={(surfaces) => tocar({ surfaces })} opciones={[["flat", "Planas"], ["raised", "Elevadas"], ["translucent", "Translúcidas"]]} valor={config.surfaces} />
        </Grupo>

        <Grupo titulo="Fondo">
          <div className="flex items-center gap-2">
            <Switch checked={config.ambient} id="pg-ambient" onCheckedChange={(ambient) => tocar({ ambient })} />
            <Label htmlFor="pg-ambient">Wallpaper</Label>
          </div>
          <Slider
            className="w-56"
            disabled={!config.ambient}
            format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
            label="Color del wallpaper"
            locale="es-AR"
            max={1}
            min={0}
            onValueChange={(valor) => tocar({ luz: Number((valor as number).toFixed(2)) })}
            showValue
            step={0.05}
            value={config.luz}
          />
          <Opciones nombre="Grano de fondo" onChange={(grain) => tocar({ grain })} opciones={[["off", "Sin grano"], ["subtle", "Sutil"], ["strong", "Marcado"]]} valor={config.grain} />
        </Grupo>

        <Grupo titulo="Tipografía">
          <Opciones nombre="Fuente de titulares" onChange={(heading) => tocar({ heading })} opciones={[["inter", "Inter"], ["serif", "Serif (Bitter)"]]} valor={config.heading} />
          <Opciones nombre="Escala de titulares" onChange={(typeScale) => tocar({ typeScale })} opciones={[["compact", "Chica"], ["standard", "Estándar"], ["large", "Grande"]]} valor={config.typeScale} />
          <Opciones nombre="Tracking de titulares" onChange={(typeTracking) => tocar({ typeTracking })} opciones={[["tight", "Cerrado"], ["standard", "Estándar"], ["airy", "Abierto"]]} valor={config.typeTracking} />
        </Grupo>

        <Grupo titulo="Movimiento">
          <Opciones nombre="Movimiento" onChange={(motion) => tocar({ motion })} opciones={[["calm", "Calmo"], ["standard", "Estándar"], ["none", "Sin"]]} valor={config.motion} />
        </Grupo>

        <Grupo titulo="Contraste">
          <Opciones nombre="Contraste" onChange={(contrast) => tocar({ contrast })} opciones={[["standard", "Estándar"], ["high", "Alto"]]} valor={config.contrast} />
        </Grupo>

        <Grupo titulo="Layout de la muestra">
          <div className="flex items-center gap-2">
            <Switch checked={asistente} id="pg-aside" onCheckedChange={setAsistente} />
            <Label htmlFor="pg-aside">Panel del asistente</Label>
          </div>
        </Grupo>
      </div>
    </div>
  )
}
