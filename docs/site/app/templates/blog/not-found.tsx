import { FileQuestionIcon } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "sebs7n-ui/empty-state"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { PageShell } from "./_components/page-shell"
import { BLOG_PATH } from "./_lib/routes"

// El 404 del blog (un slug que no existe): mantiene la barra y el pie, y ofrece una sola salida.
export default function BlogNotFound() {
  return (
    <PageShell narrow>
      <h1 className="sr-only">Página no encontrada</h1>
      <EmptyState
        action={
          <Link className={buttonVariants()} href={BLOG_PATH}>
            Ver los artículos
          </Link>
        }
        description="Puede que el enlace esté mal escrito o que el artículo ya no esté."
        icon={<FileQuestionIcon />}
        title="No encontramos esa página"
      />
    </PageShell>
  )
}
