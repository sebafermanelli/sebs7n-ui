import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"

import { Inline } from "./inline"

type Prop = { name: string; type: string; required: boolean; default: string | null; description: string; inherited?: boolean }
type Exportado = { name: string; bases: string[]; alias: string | null; props: Prop[] }

export function PropsTable({ exports }: { exports: Exportado[] }) {
  return (
    <div className="flex flex-col gap-8">
      {exports.map((exportado) => (
        <div className="flex flex-col gap-3" key={exportado.name}>
          <h3 className="scroll-mt-24 text-headline text-label" id={`props-${exportado.name}`}>
            {exportado.name}
          </h3>
          {exportado.bases.length > 0 && (
            <p className="text-callout text-label-secondary">
              Hereda las props de{" "}
              {exportado.bases.map((base, indice) => (
                <span key={base}>
                  {indice > 0 && " y "}
                  <code className="rounded-sm bg-fill-2 px-1 py-0.5 text-mono-body text-label">{base}</code>
                </span>
              ))}
              .
            </p>
          )}
          {exportado.props.length === 0 ? (
            <p className="text-callout text-label-secondary">Sin props propias: pasa todo al primitivo.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table density="compact">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-36">Prop</TableHead>
                    <TableHead className="min-w-48">Tipo</TableHead>
                    <TableHead className="min-w-28">Por defecto</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportado.props.map((prop) => (
                    <TableRow key={prop.name}>
                      <TableCell className="py-3 align-top whitespace-normal">
                        <code className="text-mono-body text-label">{prop.name}</code>
                        {prop.required && (
                          <span className="ml-1 text-callout text-red-900" title="Obligatoria">
                            *
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 align-top whitespace-normal">
                        <code className="text-mono-body break-words text-label-secondary">{prop.type}</code>
                      </TableCell>
                      <TableCell className="py-3 align-top whitespace-normal">
                        {prop.default ? (
                          <code className="text-mono-body text-label-secondary">{prop.default}</code>
                        ) : (
                          <span className="text-label-tertiary">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 align-top whitespace-normal text-label-secondary">
                        {/* La procedencia va acá y no en una columna propia: es una nota, no un dato
                            que se compare fila contra fila. */}
                        {prop.inherited && <strong className="font-medium text-label">Heredada de Base UI. </strong>}
                        <Inline text={prop.description} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
