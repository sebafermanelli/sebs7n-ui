"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "sebs7n-ui/badge"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { cn } from "sebs7n-ui/lib/utils"

import { SearchButton } from "./search"

const LINKS = [
  { href: "/docs/instalacion", label: "Docs" },
  { href: "/docs/components/button", label: "Componentes" },
  { href: "/docs/tokens", label: "Tokens" },
  { href: "/docs/changelog", label: "Changelog" },
]

export function SiteHeader({ version }: { version: string }) {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-gray-400 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[90rem] items-center gap-4 px-4 md:px-6">
        <Link
          className="flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:focus-ring"
          href="/"
        >
          <span className="size-5 rounded-md bg-gray-1000" />
          <span className="text-heading-16 text-gray-1000">sebs7n-ui</span>
          <Badge size="sm">{version}</Badge>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              className={cn(
                "rounded-md px-2 py-1 text-copy-14 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring",
                pathname.startsWith(link.href.split("/").slice(0, 3).join("/")) ? "text-gray-1000" : "text-gray-900"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <a
            className="hidden rounded-md px-2 py-1 text-copy-14 text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring sm:inline"
            href="https://github.com/sebafermanelli/sebs7n-ui"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
