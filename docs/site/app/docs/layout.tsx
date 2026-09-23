import { AppShellContent } from "sebs7n-ui/app-shell-content"

import site from "@/.generated/site.json"
import { DocsShell } from "../_components/docs-shell"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocsShell nav={site.nav} version={site.version}>
      {/* El contenedor de página del paquete: mismo ancho y mismos márgenes que en una app real. */}
      <AppShellContent>{children}</AppShellContent>
    </DocsShell>
  )
}
