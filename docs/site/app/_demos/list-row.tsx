"use client"

import { FileTextIcon, FolderIcon, ImageIcon, ReceiptIcon } from "lucide-react"
import { useState } from "react"
import { List, ListRow, ListSection } from "sebs7n-ui/list-row"

const CLIENTES = [
  { id: "acme", nombre: "Acme S.A.", detalle: "3 facturas · última el 30/09", saldo: "$ 128.400" },
  { id: "nube", nombre: "Nube Digital", detalle: "1 factura · vence el 15/10", saldo: "$ 96.000" },
  { id: "ruiz", nombre: "Estudio Ruiz", detalle: "Al día", saldo: "$ 0" },
]

/**
 * La lista maestra
 * Ícono de 32, título en 17, detalle gris debajo y el saldo a la derecha. Tocá una fila: la elegida va en el acento mientras la lista tiene el foco y en gris cuando el foco se va (hacé click afuera).
 */
export function Maestra() {
  const [elegido, setElegido] = useState("nube")
  return (
    <List aria-label="Clientes" className="w-full max-w-md">
      {CLIENTES.map((cliente) => (
        <ListRow
          description={cliente.detalle}
          icon={<ReceiptIcon />}
          key={cliente.id}
          onClick={() => setElegido(cliente.id)}
          selected={elegido === cliente.id}
          title={cliente.nombre}
          trailing={cliente.saldo}
        />
      ))}
    </List>
  )
}

/**
 * El desglose de espacio
 * La lista de Almacenamiento: secciones de 19/600 con el total a la derecha, el detalle en una columna del medio (`inline`) y el punto de color de la categoría al final.
 */
export function Desglose() {
  return (
    <List aria-label="Espacio usado" className="w-full max-w-xl">
      <ListSection title="Usado por la cuenta" total="23,6 GB">
        <ListRow description="1.204 comprobantes" dot="amber" icon={<FileTextIcon />} inline title="Facturas" trailing="13,5 GB" />
        <ListRow description="Todos los archivos" dot="purple" icon={<FolderIcon />} inline title="Documentos" trailing="6,1 GB" />
        <ListRow description="Logos y firmas" dot="teal" icon={<ImageIcon />} inline title="Imágenes" trailing="4,0 GB" />
      </ListSection>
    </List>
  )
}

/**
 * Filas que navegan
 * Con `render` la fila es un link y el chevron dice que lleva a otra pantalla.
 */
export function Navegacion() {
  return (
    <List aria-label="Ajustes de facturación" className="w-full max-w-md">
      <ListRow chevron render={<a href="#datos-fiscales" />} title="Datos fiscales" />
      <ListRow chevron description="2 puntos de venta" render={<a href="#puntos-de-venta" />} title="Puntos de venta" />
      <ListRow chevron render={<a href="#numeracion" />} title="Numeración" trailing="0001-00000124" />
    </List>
  )
}
