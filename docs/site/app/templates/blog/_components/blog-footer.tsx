import { Footer, FooterBottom, FooterContent } from "sebs7n-ui/footer"

import { BLOG } from "../_data/posts"

export function BlogFooter() {
  return (
    <Footer>
      <FooterContent maxWidth={1080}>
        <FooterBottom>
          <span>© 2026 {BLOG.name}</span>
          <span>{BLOG.tagline}</span>
        </FooterBottom>
      </FooterContent>
    </Footer>
  )
}
