"use client"

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  LinkIcon,
  UnderlineIcon,
} from "lucide-react"
import { Button } from "sebs7n-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarSeparator } from "sebs7n-ui/toolbar"

/**
 * La barra del editor de texto
 * Ocho controles y una sola parada de tabulación: se entra con Tab, se recorre con ← →, se sale con Tab. Sin la barra, llegar del título al cuerpo del artículo cuesta ocho teclas.
 */
export function Formato() {
  return (
    <Toolbar aria-label="Formato del artículo">
      <ToggleGroup aria-label="Estilo" className="gap-0.5">
        <ToolbarButton aria-label="Negrita" render={<ToggleGroupItem value="bold" />}>
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Cursiva" render={<ToggleGroupItem value="italic" />}>
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Subrayado" render={<ToggleGroupItem value="underline" />}>
          <UnderlineIcon />
        </ToolbarButton>
      </ToggleGroup>

      <ToolbarSeparator />

      <ToolbarGroup aria-label="Alineación">
        <ToolbarButton aria-label="Alinear a la izquierda">
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Centrar">
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Alinear a la derecha">
          <AlignRightIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarButton aria-label="Insertar enlace">
        <LinkIcon />
      </ToolbarButton>

      <ToolbarLink className="ml-auto" href="#">
        Editado hace 5 min
      </ToolbarLink>
    </Toolbar>
  )
}

/**
 * Un menú y un campo adentro de la barra
 * `render` mete el trigger de un `DropdownMenu` en el recorrido con flechas — el `DropdownMenu` envuelve la barra porque no renderiza ningún elemento propio. `ToolbarInput` deja que ← → muevan el cursor dentro del texto en vez de saltar al control de al lado.
 */
export function Lienzo() {
  return (
    <DropdownMenu>
      <Toolbar aria-label="Herramientas del lienzo">
        <ToolbarButton render={<DropdownMenuTrigger render={<Button size="sm" variant="ghost" />} />}>
          Insertar
          <ChevronDownIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <label className="flex items-center gap-2 pl-1 text-copy-13 text-gray-900">
          Zoom
          <ToolbarInput className="w-16" defaultValue="100" inputMode="numeric" />
        </label>

        <ToolbarSeparator />

        <ToolbarButton render={<Button size="sm" variant="default" />}>Publicar</ToolbarButton>
      </Toolbar>

      <DropdownMenuContent align="start">
        <DropdownMenuItem>Imagen</DropdownMenuItem>
        <DropdownMenuItem>Tabla</DropdownMenuItem>
        <DropdownMenuItem>Gráfico</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
