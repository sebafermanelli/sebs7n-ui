import type { Metadata } from "next"
import { ViewTransition } from "react"

import site from "@/.generated/site.json"
import { AllComponents } from "../../_components/all-components"
import { Playground } from "../../_components/playground"
import { allComponents } from "../../_lib/all-components"

export const metadata: Metadata = {
  title: "Playground",
  description: "Regulá el vidrio, el tinte, el color de marca y los radios, mirá los componentes cambiar y copiá el CSS.",
}

export default function PlaygroundPage() {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-5xl flex-col gap-8 pb-24">
        <header className="flex flex-col gap-3">
          <h1 className="text-heading-40 text-gray-1000">Playground</h1>
          <p className="text-copy-18 text-gray-900">
            Todo el material sale de dos números y un color. Movelos, mirá cómo cambian los componentes y llevate el CSS.
          </p>
        </header>
        <Playground />
        <AllComponents groups={allComponents(site)} />
      </div>
    </ViewTransition>
  )
}
