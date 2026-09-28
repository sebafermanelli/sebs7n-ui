import { describe, expect, it } from "vitest"

import { issueLinks, issueUrl, REPO } from "../app/_lib/github"

describe("issueUrl", () => {
  it("abre el formulario del tipo pedido", () => {
    const url = new URL(issueUrl("bug"))
    expect(`${url.origin}${url.pathname}`).toBe(`${REPO}/issues/new`)
    expect(url.searchParams.get("template")).toBe("bug.yml")
  })

  it("precarga componente y versión, codificados", () => {
    const url = new URL(issueUrl("enhancement", { component: "date picker&x", version: "1.13.0" }))
    expect(url.searchParams.get("template")).toBe("enhancement.yml")
    expect(url.searchParams.get("component")).toBe("date picker&x")
    expect(url.searchParams.get("version")).toBe("1.13.0")
  })

  it("no agrega parámetros vacíos", () => {
    const url = new URL(issueUrl("component-request", { component: "", version: undefined }))
    expect([...url.searchParams.keys()]).toEqual(["template"])
  })
})

describe("issueLinks", () => {
  it("da la mejora y el bug de un componente, con su versión", () => {
    const links = issueLinks("date-picker", "1.13.0")
    expect(links.map((link) => link.kind)).toEqual(["enhancement", "bug"])
    for (const link of links) {
      const url = new URL(link.href)
      expect(url.searchParams.get("component")).toBe("date-picker")
    }
    expect(new URL(links[1]!.href).searchParams.get("version")).toBe("1.13.0")
  })
})
