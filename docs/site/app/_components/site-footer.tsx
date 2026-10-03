import { Footer, FooterBottom, FooterContent, FooterGroup } from "sebs7n-ui/footer"
import Link from "next/link"
import { TextLink } from "sebs7n-ui/text-link"

import { FOOTER_GROUPS } from "./site-nav-data"

// El pie de la landing de referencia: la marca con su frase y los grupos de links.
export function SiteFooter() {
  return (
    <Footer>
      <FooterContent maxWidth={1080}>
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex max-w-xs flex-col items-start gap-3 sm:col-span-2 lg:col-span-1">
            <p className="text-headline text-label">sebs7n-ui</p>
            <p className="text-callout text-label-secondary">El design system de una sola dependencia, con la forma de iCloud web.</p>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <FooterGroup key={group.title} title={group.title}>
              {group.links.map((link) =>
                link.href.startsWith("http") ? (
                  <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} key={link.label}>
                    {link.label}
                  </Link>
                )
              )}
            </FooterGroup>
          ))}
        </div>
        <FooterBottom>
          <span>MIT · © 2026 sebs7n-ui</span>
          <TextLink href="#top" variant="subtle">
            Volver arriba
          </TextLink>
        </FooterBottom>
      </FooterContent>
    </Footer>
  )
}
