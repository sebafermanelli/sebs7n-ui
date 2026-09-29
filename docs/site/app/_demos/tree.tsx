"use client"

import { useState } from "react"
import { Tree, type TreeNode } from "sebs7n-ui/tree"

const ARCHIVOS: TreeNode[] = [
  {
    id: "facturas",
    label: "Facturas",
    columns: ["Carpeta", "—", "29/09/2026"],
    children: [
      {
        id: "facturas-2026",
        label: "2026",
        columns: ["Carpeta", "—", "29/09/2026"],
        children: [
          { id: "f-0012", label: "Factura 0012.pdf", columns: ["Documento PDF", "128 KB", "29/09/2026"] },
          { id: "f-0013", label: "Factura 0013.pdf", columns: ["Documento PDF", "96 KB", "28/09/2026"] },
        ],
      },
      { id: "f-resumen", label: "Resumen anual.xlsx", columns: ["Planilla", "44 KB", "02/01/2026"] },
    ],
  },
  {
    id: "contratos",
    label: "Contratos",
    columns: ["Carpeta", "—", "14/09/2026"],
    children: [{ id: "c-acme", label: "Acme S.A.pdf", columns: ["Documento PDF", "1,5 MB", "14/09/2026"] }],
  },
  { id: "notas", label: "Notas de cobranza.txt", columns: ["Texto", "2 KB", "20/09/2026"] },
]

/**
 * Carpetas con columnas
 * La lista de iCloud Drive con disclosure: el triángulo gira, cada nivel se corre 20 y las columnas quedan alineadas. Probá el teclado: ↑↓ recorren, → abre y entra, ← sale y cierra, y tipear salta por nombre.
 */
export function ConColumnas() {
  return (
    <Tree
      aria-label="Archivos"
      className="w-full"
      columns={[{ header: "Tipo", width: 180 }, { header: "Tamaño", width: 100, numeric: true }, { header: "Fecha", width: 120 }]}
      defaultExpanded={["facturas"]}
      defaultSelected="f-resumen"
      items={ARCHIVOS}
      nameHeader="Nombre"
    />
  )
}

/**
 * Hijos que llegan después
 * Una carpeta con `hasChildren` pide sus hijos al abrirse (`onLoadChildren`); mientras tanto el ítem queda `aria-busy` y el triángulo pasa a un indicador de carga.
 */
export function Perezoso() {
  const [items, setItems] = useState<TreeNode[]>([
    { id: "archivo", label: "Archivo 2025", hasChildren: true },
    { id: "borradores", label: "Borradores", children: [] },
  ])
  return (
    <Tree
      aria-label="Archivo"
      className="w-full max-w-md"
      items={items}
      onLoadChildren={async (node) => {
        await new Promise((resolve) => setTimeout(resolve, 900))
        setItems((prev) =>
          prev.map((item) =>
            item.id === node.id
              ? { ...item, children: ["Enero", "Febrero", "Marzo"].map((mes) => ({ id: `${node.id}-${mes}`, label: `Facturas de ${mes}.zip` })) }
              : item
          )
        )
      }}
    />
  )
}
