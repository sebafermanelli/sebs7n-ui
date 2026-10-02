import type { Metadata } from "next"

import site from "@/.generated/site.json"
import { SiteHeader } from "../_components/site-header"
import { TemplateCard } from "./_components/template-card"

export const metadata: Metadata = {
  title: "Templates",
  description: "Pantallas completas armadas con sebs7n-ui y sus reglas por defecto.",
}

export default function TemplatesPage() {
  return (
    <div className="min-h-dvh bg-ambient" data-ambient="">
      <SiteHeader version={site.version} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16 md:px-6 md:py-20">
        <header className="flex flex-col items-start gap-4">
          <h1 className="text-large-title text-label">Arquetipos de aplicación</h1>
          <p className="max-w-2xl text-body text-label-secondary">
            Pantallas completas armadas con las reglas por defecto de sebs7n-ui: superficies opacas en capas, un solo
            acento sólido, selección neutra y una sola escala de alturas.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TemplateCard
            category="SaaS y backoffice"
            description="Una app chica de facturación: inicio con gráfico, facturas, clientes y configuración, con el estado compartido entre secciones."
            features={[
              "Sidebar navegable; en el teléfono, dentro de un Sheet",
              "DataTable con búsqueda, orden, páginas y selección múltiple",
              "Detalle en Sheet con historial (Timeline)",
              "Alta con Form y Field; cobrar con «Deshacer»; anular con AlertDialog",
              "Esqueletos mientras carga y EmptyState cuando no hay resultados",
            ]}
            href="/templates/dashboard"
            title="SaaS / Dashboard operativo"
          />
          <TemplateCard
            category="Marketing"
            description="El default para landings: barra translúcida sobre el wallpaper, hero, logos, beneficios, precios, testimonios, preguntas y cierre."
            features={[
              "Material translúcido sobre el wallpaper",
              "Un acento por pantalla: hero, plan recomendado y cierre",
              "Precios con ToggleGroup mensual/anual",
              "Server Components: el único JS propio es el toggle",
            ]}
            href="/templates/landing"
            title="Landing page"
          />
          <TemplateCard
            category="Infraestructura"
            description="Panel de despliegues, variables de entorno y logs en vivo con SplitView."
            features={["Selector de proyecto en la barra", "SplitView maestro y detalle", "Visor de logs", "Command para atajos globales"]}
            title="Consola PaaS / Cloud"
          />
          <TemplateCard
            category="Contenido"
            description="Lectura primero: roles tipográficos de iCloud, índice flotante y tarjetas de artículos."
            features={["Jerarquía tipográfica editorial", "Índice de la página", "Contraste AA en todo el texto", "Filtro por etiquetas"]}
            title="Blog / Editorial"
          />
        </section>
      </main>
    </div>
  )
}
