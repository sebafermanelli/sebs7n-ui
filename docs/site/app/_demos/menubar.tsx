"use client"

import { useState } from "react"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "sebs7n-ui/menubar"

/**
 * El editor de informes
 * Tab entra una sola vez a la barra; ← → cambian de título y, con un menú abierto, pasar al de al lado lo abre solo. Los atajos de la derecha son el motivo de que el menubar exista: se abre una vez para descubrirlos.
 */
export function Editor() {
  const [tema, setTema] = useState("sistema")
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Archivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nuevo informe
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Abrir…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Guardar
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Exportar</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>CSV</MenubarItem>
              <MenubarItem>Planilla de cálculo</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">
            Descartar borrador
            <MenubarShortcut>⌘⌫</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Editar</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Deshacer
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Rehacer
            <MenubarShortcut>⌘⇧Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Buscar y reemplazar
            <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Ver</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Paneles</MenubarLabel>
            <MenubarCheckboxItem defaultChecked>
              Barra lateral
              <MenubarShortcut>⌘B</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarCheckboxItem>Notas al pie</MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel>Tema</MenubarLabel>
            <MenubarRadioGroup onValueChange={setTema} value={tema}>
              <MenubarRadioItem value="claro">Claro</MenubarRadioItem>
              <MenubarRadioItem value="oscuro">Oscuro</MenubarRadioItem>
              <MenubarRadioItem value="sistema">Sistema</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

/**
 * Un título deshabilitado
 * Cuando un menú entero no aplica al documento abierto, se apaga el título en vez de sacarlo: una barra que cambia de ancho según el archivo obliga a buscar de nuevo cada vez.
 */
export function Deshabilitado() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Archivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Nuevo informe</MenubarItem>
          <MenubarItem>Abrir…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu disabled>
        <MenubarTrigger>Tabla</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Insertar fila</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Ayuda</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Atajos de teclado</MenubarItem>
          <MenubarItem>Documentación</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
