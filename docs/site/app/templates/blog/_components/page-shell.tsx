import { BlogFooter } from "./blog-footer"
import { BlogNavbar } from "./blog-navbar"

// Barra, contenido y pie: lo que comparten las páginas del blog. `narrow` es la columna de lectura (720 px).
export function PageShell({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className="min-h-dvh bg-background">
      <BlogNavbar />
      <main className={`mx-auto flex w-full flex-col gap-14 px-4 py-12 md:px-6 md:py-20 ${narrow ? "max-w-[720px]" : "max-w-[1080px]"}`}>{children}</main>
      <BlogFooter />
    </div>
  )
}
