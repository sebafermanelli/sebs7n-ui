import { Footer, FooterBottom, FooterContent, FooterGroup } from "sebs7n-ui/footer"
import { TextLink } from "sebs7n-ui/text-link"

import { FOOTER_GROUPS, PRODUCT } from "../_data/content"
import { SalesButton } from "./sales-lazy"

// El pie: la marca con su frase y la salida a ventas, y los grupos de links. Todo son anclas de la misma página.
export function LandingFooter() {
  return (
    <Footer>
      <FooterContent maxWidth={1080}>
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex max-w-xs flex-col items-start gap-3 sm:col-span-2 lg:col-span-1">
            <p className="text-headline text-label">{PRODUCT.name}</p>
            <p className="text-callout text-label-secondary">Facturá, cobrá y mirá lo que te deben en un solo lugar.</p>
            <SalesButton className="-ms-2.5" size="md" variant="plain">
              Hablar con ventas
            </SalesButton>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <FooterGroup key={group.title} title={group.title}>
              {group.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </FooterGroup>
          ))}
        </div>
        <FooterBottom>
          <span>© 2026 {PRODUCT.name}</span>
          <TextLink href="#top" variant="subtle">
            Volver arriba
          </TextLink>
        </FooterBottom>
      </FooterContent>
    </Footer>
  )
}
