import { FileTextIcon } from "lucide-react"
import { buttonVariants } from "sebs7n-ui/variants/button"

/** El mismo contenido en texto plano, para un agente. */
export function MdLink({ href }: { href: string }) {
  return (
    <a className={buttonVariants({ variant: "outline", size: "sm" })} href={`${href}.md`}>
      <FileTextIcon />
      Ver como .md
    </a>
  )
}
