"use client"

import { PlusIcon } from "lucide-react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { useWidgetLayout } from "sebs7n-ui/lib/widget-layout"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { WidgetBoard, WidgetBoardEditButton } from "sebs7n-ui/widget-board"

import { consoleWidgetsKey, useConsoleWidgets } from "./_components/console-widgets"
import { ServicesView } from "./_components/services-view"
import { useProject } from "./_state/project-context"

// El Resumen de arriba es un panel de widgets que se edita (`WidgetBoard`): una grilla estática hasta que se aprieta
// «Editar», y recién ahí se pide el módulo de arrastre. Cada proyecto guarda el suyo (la clave lleva el id).
export default function ServicesPage() {
  const { project, services, deployments, loading, setNewServiceOpen } = useProject()
  const widgets = useConsoleWidgets({ services, deployments, loading })
  const layout = useWidgetLayout({ storageKey: consoleWidgetsKey(project.id), widgets, labels: { region: "Resumen del proyecto" } })
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Servicios</PageHeaderTitle>
        <PageHeaderDescription>Lo que corre en {project.name}, en la región {project.region}.</PageHeaderDescription>
        <PageHeaderActions>
          {/* «Editar» es secundario: el único acento de la pantalla es «Nuevo servicio». */}
          <WidgetBoardEditButton layout={layout} />
          <Button onClick={() => setNewServiceOpen(true)}>
            <PlusIcon />
            Nuevo servicio
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <WidgetBoard layout={layout} />
      <ServicesView />
    </AppShellContent>
  )
}
