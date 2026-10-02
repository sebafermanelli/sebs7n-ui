import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "sebs7n-ui/card"
import { buttonVariants } from "sebs7n-ui/variants/button"

interface TemplateCardProps {
  title: string
  description: string
  category: string
  /** Sin `href`, la card queda como «Próximamente». */
  href?: string
  features: string[]
}

export function TemplateCard({ title, description, category, href, features }: TemplateCardProps) {
  return (
    <Card className="justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge size="sm">{category}</Badge>
          {href ? (
            <Badge color="green" size="sm">
              Disponible
            </Badge>
          ) : (
            <Badge size="sm">Próximamente</Badge>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-footnote text-label-secondary marker:text-label-tertiary">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </CardContent>

      {href && (
        <CardFooter>
          <Link className={buttonVariants({ size: "sm" })} href={href}>
            Ver template
            <ArrowRightIcon />
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
