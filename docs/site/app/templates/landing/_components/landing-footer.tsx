import { Footer, FooterBottom, FooterContent, FooterGroup } from "sebs7n-ui/footer"

import { FOOTER_GROUPS, PRODUCT } from "../_data/content"

export function LandingFooter() {
  return (
    <Footer>
      <FooterContent maxWidth={1080}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
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
        </FooterBottom>
      </FooterContent>
    </Footer>
  )
}
