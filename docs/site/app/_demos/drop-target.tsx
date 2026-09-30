"use client"

import { FileTextIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "sebs7n-ui/card"
import { DropTarget } from "sebs7n-ui/drop-target"
import { List, ListRow } from "sebs7n-ui/list-row"

/**
 * Soltar sobre una sección
 * Arrastrá un PDF sobre la card de facturas: se pinta el anillo, y al soltar se «abre el formulario» con el archivo. El botón «Agregar factura» sigue andando, y es el camino sin arrastrar.
 */
export function Section() {
  const [invoices, setInvoices] = useState(["factura-0012.pdf", "factura-0013.pdf"])
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <DropTarget accept=".pdf" className="w-full max-w-md" maxSize={5 * 1024 * 1024} onDrop={([file]) => setDraft(file!.name)}>
      <Card>
        <CardHeader>
          <CardTitle>Facturas del cliente</CardTitle>
          <CardAction>
            <Button onClick={() => setDraft("")} size="sm" variant="secondary">
              <PlusIcon aria-hidden="true" />
              Agregar factura
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <List>
            {invoices.map((name) => (
              <ListRow icon={<FileTextIcon />} key={name} title={name} />
            ))}
          </List>
          {draft !== null && (
            <div className="flex items-center justify-between gap-3 rounded-field bg-fill-1 px-3 py-2 text-callout text-label">
              <span className="truncate">{draft ? `Nueva factura con ${draft}` : "Nueva factura, sin archivo"}</span>
              <Button
                onClick={() => {
                  if (draft) setInvoices([...invoices, draft])
                  setDraft(null)
                }}
                size="sm"
              >
                Guardar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DropTarget>
  )
}
