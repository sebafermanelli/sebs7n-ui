"use client"

import { Field, FieldLabel, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui"
import { CopyButton } from "sebs7n-ui/copy-button"

/**
 * Solo ícono
 * El botón `plain` de 28 de una barra de iCloud: copia, pasa a ✓ y el tooltip dice «Copiado».
 */
export function IconOnly() {
  return (
    <div className="flex w-full max-w-sm items-end gap-2">
      <Field className="flex-1">
        <FieldLabel>Link de pago</FieldLabel>
        <Input readOnly value="https://pagos.example.com/f/0012" />
      </Field>
      <CopyButton aria-label="Copiar el link de pago" className="mb-1" value="https://pagos.example.com/f/0012" />
    </div>
  )
}

/**
 * Con texto
 * Un id corto que se copia entero: el texto es el nombre del botón.
 */
export function WithText() {
  return (
    <p className="text-callout text-label-secondary">
      Factura{" "}
      <CopyButton className="font-mono" value="a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d">
        a1b2c3d4
      </CopyButton>
    </p>
  )
}

const invoices = [
  { id: "7f3a9c21-4b0e-4d8a-9e51-0c2f6a1d3b77", client: "Acme S.A.", total: "$ 184.500" },
  { id: "b21e0d94-6c3f-4a17-8d2b-5e9f1a7c4e03", client: "Globex SRL", total: "$ 92.300" },
  { id: "e5c07a18-2d9b-4f64-b3a0-8f1e6c2d9a45", client: "Initech", total: "$ 310.000" },
]

/**
 * En línea
 * `variant="inline"`: el ID en mono chico con un ícono de 14, sin el alto de un botón, para una fila densa. Muestra los primeros ocho caracteres y copia el ID entero.
 */
export function Inline() {
  return (
    <Table className="max-w-lg" density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <CopyButton aria-label={`Copiar el ID ${invoice.id.slice(0, 8)}`} translate="no" value={invoice.id} variant="inline">
                {invoice.id.slice(0, 8)}
              </CopyButton>
            </TableCell>
            <TableCell>{invoice.client}</TableCell>
            <TableCell className="text-right tabular-nums">{invoice.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
