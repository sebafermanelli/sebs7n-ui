import type { Metadata } from "next"
import { ViewTransition } from "react"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import site from "@/.generated/site.json"
import { AllComponents } from "../../_components/all-components"
import { Playground } from "../../_components/playground"
import { allComponents } from "../../_lib/all-components"

export const metadata: Metadata = {
  title: "Playground",
  description: "La referencia viva de los defaults: elegí la marca y el wallpaper, mirá cuatro pantallas armadas con los componentes del paquete y copiá cómo se integra.",
}

export default function PlaygroundPage() {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-5xl flex-col gap-8 pb-24">
        <PageHeader>
          <PageHeaderTitle>Playground</PageHeaderTitle>
          <PageHeaderDescription>
            La referencia viva de lo que el sistema trae por defecto: una marca, el wallpaper y pantallas armadas solo con componentes del paquete.
            Cambiá los controles, abrí el panel del asistente para ver el layout responder al ancho del contenido y llevate el código.
          </PageHeaderDescription>
        </PageHeader>
        <Playground>
          <AllComponents groups={allComponents(site)} />
        </Playground>
      </div>
    </ViewTransition>
  )
}
