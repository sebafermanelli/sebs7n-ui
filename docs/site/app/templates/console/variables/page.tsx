"use client"

import { CopyIcon, DownloadIcon, EyeIcon, EyeOffIcon, PencilIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { useState, type ReactNode } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { RowActions } from "sebs7n-ui/row-actions"
import { Card, CardContent } from "sebs7n-ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "sebs7n-ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"
import { EmptyState } from "sebs7n-ui/empty-state"
import { useStoredState } from "sebs7n-ui/lib/use-stored-state"
import { List, ListRow } from "sebs7n-ui/list-row"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "sebs7n-ui/menubar"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { Tag } from "sebs7n-ui/tag"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { toast } from "sonner"

import { ENV_LABEL, EnvVarDialog } from "../_components/env-var-dialog"
import type { EnvVar, Environment } from "../_data/mock"
import { groupEnvVars, toDotenv } from "../_state/mutations"
import { useProject } from "../_state/project-context"

// Importar pesa por el recuadro de archivos: se pide recién la primera vez que se abre.
const ImportEnvDialog = dynamic(() => import("../_components/import-env-dialog"), { ssr: false })

const ENVIRONMENTS: Environment[] = ["production", "staging"]
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"

/** Un botón de ícono con su nombre accesible y el mismo texto en un tooltip. Neutro: el acento es de la acción principal. */
function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button aria-label={label} onClick={onClick} size="icon-sm" variant="ghost" />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export default function VariablesPage() {
  const { project, envVars, addEnvVar, updateEnvVar, removeEnvVar, restoreEnvVar, importEnv } = useProject()
  const [environment, setEnvironment] = useState<Environment>("production")
  const [shown, setShown] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const [grouped, setGrouped] = useStoredState("sebs7n-ui:console:variables-grouped", true, isBoolean)
  const [editing, setEditing] = useState<EnvVar | null | undefined>(undefined)
  const [importing, setImporting] = useState(false)
  const [importUsed, setImportUsed] = useState(false)
  const inEnvironment = envVars.filter((v) => v.environment === environment)
  const toggle = (id: string) => setShown((previous) => (previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id]))

  const openImport = () => {
    setImportUsed(true)
    setImporting(true)
  }

  const remove = (variable: EnvVar) => {
    const removed = removeEnvVar(variable.id)
    if (removed) toast(`${removed.key} eliminada`, { action: { label: "Deshacer", onClick: () => restoreEnvVar(removed) } })
  }

  const exportEnv = () => {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([toDotenv(inEnvironment)], { type: "text/plain" }))
    link.download = `${project.name}.${environment}.env`
    link.click()
    URL.revokeObjectURL(link.href)
    toast.success(`Exportadas ${inEnvironment.length} variables.`)
  }

  const row = (variable: EnvVar) => {
    const visible = !variable.secret || showAll || shown.includes(variable.id)
    return (
      <ListRow
        description={<span className="font-mono">{visible ? variable.value : "•".repeat(16)}</span>}
        key={variable.id}
        title={<span className="font-mono">{variable.key}</span>}
        trailing={
          <span className="flex items-center gap-1">
            {variable.secret && <Tag>Secreto</Tag>}
            {variable.secret && (
              <IconButton label={visible ? `Ocultar ${variable.key}` : `Mostrar ${variable.key}`} onClick={() => toggle(variable.id)}>
                {visible ? <EyeOffIcon /> : <EyeIcon />}
              </IconButton>
            )}
            <IconButton
              label={`Copiar ${variable.key}`}
              onClick={() => {
                void navigator.clipboard?.writeText(variable.value)
                toast.success("Copiada")
              }}
            >
              <CopyIcon />
            </IconButton>
            <RowActions label={`Acciones para ${variable.key}`}>
                <DropdownMenuItem onClick={() => setEditing(variable)}>
                  <PencilIcon />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => remove(variable)} variant="destructive">
                  <Trash2Icon />
                  Eliminar
                </DropdownMenuItem>
            </RowActions>
          </span>
        }
      />
    )
  }

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Variables de entorno</PageHeaderTitle>
        <PageHeaderDescription>Las de {project.name}. Los secretos quedan ocultos hasta que los mostrás.</PageHeaderDescription>
        <PageHeaderActions>
          <Button onClick={openImport} variant="secondary">
            <UploadIcon />
            Importar .env
          </Button>
          <Button onClick={() => setEditing(null)}>
            <PlusIcon />
            Nueva variable
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <Tabs onValueChange={(value) => setEnvironment(value as Environment)} value={environment}>
        {/* Sin los 8 px que la línea de las pestañas se saca de cada lado: acá queda a ras del contenido. */}
        <TabsList className="mx-0 w-full">
          {ENVIRONMENTS.map((env) => (
            <TabsTrigger key={env} value={env}>
              {ENV_LABEL[env]}
            </TabsTrigger>
          ))}
        </TabsList>
        {ENVIRONMENTS.map((env) => (
          <TabsContent className="flex flex-col gap-3 pt-4" key={env} value={env}>
            {env === environment && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Menubar aria-label="Acciones del editor de variables">
                    <MenubarMenu>
                      <MenubarTrigger>Archivo</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem onClick={openImport}>
                          <UploadIcon />
                          Importar .env…
                        </MenubarItem>
                        <MenubarItem disabled={inEnvironment.length === 0} onClick={exportEnv}>
                          <DownloadIcon />
                          Exportar .env
                        </MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                      <MenubarTrigger>Ver</MenubarTrigger>
                      <MenubarContent>
                        <MenubarCheckboxItem checked={grouped} onCheckedChange={setGrouped}>
                          Agrupar por tipo
                        </MenubarCheckboxItem>
                        <MenubarSeparator />
                        <MenubarCheckboxItem checked={showAll} onCheckedChange={setShowAll}>
                          Mostrar todos los secretos
                        </MenubarCheckboxItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                  <p className="text-callout text-label-secondary">{`${inEnvironment.length} ${inEnvironment.length === 1 ? "variable" : "variables"}`}</p>
                </div>
                {inEnvironment.length === 0 ? (
                  <Card>
                    <CardContent>
                      <EmptyState
                        action={<Button onClick={() => setEditing(null)}>Nueva variable</Button>}
                        description="Agregá una a mano o arrastrá un .env."
                        title={`Sin variables en ${ENV_LABEL[env]}`}
                        variant="plain"
                      />
                    </CardContent>
                  </Card>
                ) : grouped ? (
                  groupEnvVars(inEnvironment).map(({ group, vars }) => (
                    <Card key={group}>
                      <CardContent>
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger chevron className="h-9 text-headline text-label">
                            {group} · {vars.length}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <List aria-label={`${group}, ${ENV_LABEL[env]}`}>{vars.map(row)}</List>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent>
                      <List aria-label={`Variables de ${ENV_LABEL[env]}`}>{inEnvironment.map(row)}</List>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <EnvVarDialog
        editing={editing}
        environment={environment}
        existingKeys={inEnvironment.map((v) => v.key)}
        onClose={() => setEditing(undefined)}
        onSave={(values, id) => {
          if (id) updateEnvVar(id, { value: values.value, secret: values.secret })
          else addEnvVar({ environment, ...values })
          toast.success(id ? `${values.key} actualizada.` : `${values.key} agregada.`)
          setEditing(undefined)
        }}
      />
      {importUsed && (
        <ImportEnvDialog
          environment={environment}
          onClose={() => setImporting(false)}
          onImport={(entries) => {
            const { added, updated } = importEnv(environment, entries)
            toast.success(`${added} nuevas y ${updated} actualizadas.`)
            setImporting(false)
          }}
          open={importing}
        />
      )}
    </AppShellContent>
  )
}
