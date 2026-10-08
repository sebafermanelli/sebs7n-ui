// Auditoría de desbordes y alineación en navegador real, componente por componente (3.0).
//
// Recorre `/docs/components/<slug>` (más las plantillas), abre los estados interactivos de cada demo (menús, selects, popovers,
// tooltips, dialogs, context menu, toasts…) y mide, con la geometría real, lo que un test de jsdom no puede ver. Usa el CLI
// `agent-browser` (Chromium) que ya tiene quien mantiene el sitio: no suma ninguna dependencia al paquete. Con el sitio en :4100:
//
//   node scripts/overflow-audit.mjs [--out dir] [--slugs a,b] [--viewports 1280,500] [--themes light,dark] [--rtl] [--shots]
//
// Escribe `<out>/findings.json` y `<out>/informe.md` (tabla componente × hallazgo × severidad × captura). Reglas:
//   a overflow-x   `scrollWidth > clientWidth` sin overflow auto/scroll ni ellipsis
//   b child-out    un hijo sale del rect de su popup/contenedor con overflow hidden
//   c truncated    texto cortado con ellipsis sin `title` ni `aria-label`
//   d off-viewport un panel flotante fuera del viewport
//   e misaligned   popup a más de 4 px del trigger en los dos ejes (ni borde ni centro)
//   f asym-padding padding o aire interno izquierda/derecha distinto en más de 1 px (popups e ítems)
//   g overlap      controles hermanos que se pisan más de 2 px
//   h small-target control de menos de 24 px de alto y de ancho (WCAG 2.5.8), contando el ::after
//   i clipped      overflow hidden que corta a un descendiente
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : (process.argv[i + 1] ?? fallback)
}
const flag = (name) => process.argv.includes(`--${name}`)
const base = arg("base", "http://localhost:4100")
const out = arg("out", "overflow-audit")
const viewports = arg("viewports", "1280,500").split(",")
const themes = arg("themes", "light,dark").split(",")
const rtl = flag("rtl")
const shots = flag("shots")
const site = JSON.parse(readFileSync(new URL("../.generated/site.json", import.meta.url), "utf8"))
const slugs = arg("slugs", "") ? arg("slugs", "").split(",") : site.components.map((c) => c.slug)
const extra = arg("extra", "/templates/landing,/templates/dashboard,/templates/console,/templates/blog,/docs/playground").split(",").filter(Boolean)
mkdirSync(`${out}/shots`, { recursive: true })

// `--session` permite correr varias pasadas en paralelo (una por viewport/tema) sin pisarse el navegador.
const session = arg("session", "") ? ["--session", arg("session", "")] : []
const run = (...args) => execFileSync("agent-browser", [...session, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
const evalStdin = (script) => execFileSync("agent-browser", [...session, "eval", "--stdin"], { encoding: "utf8", input: script, maxBuffer: 64 * 1024 * 1024 })

const PROBE = String.raw`(async (RTL) => {
  const sleep = (t) => new Promise((r) => setTimeout(r, t))
  if (RTL) document.documentElement.dir = "rtl"
  const findings = []
  const vw = innerWidth, vh = innerHeight
  const SKIP = "header, footer, nextjs-portal, [data-nextjs-toast], [data-slot=site-nav], .sr-only, [aria-hidden=true]:not([data-slot])"
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" }
  const sel = (el) => { const slot = el.closest("[data-slot]")?.getAttribute("data-slot"); const t = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30); return (el.tagName.toLowerCase() + (el.getAttribute("data-slot") ? "[" + el.getAttribute("data-slot") + "]" : slot ? "<" + slot + ">" : "") + (t ? ' "' + t + '"' : "")) }
  const push = (rule, sev, el, msg, state) => findings.push({ rule, sev, el: sel(el), msg, state })

  // Cuánto sobresalen los hijos "en flujo" del borde del elemento: un badge absoluto o un thumb con translate
  // inflan el scrollWidth a propósito y no son un desborde. Se mide la geometría real de lo que está en el flujo.
  const inflowOut = (el, r) => {
    let out = 0
    const walk = (n, depth) => {
      for (const c of n.children) {
        const cs = getComputedStyle(c)
        if (cs.position === "absolute" || cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") continue
        const cr = c.getBoundingClientRect()
        if (cr.width === 0 && cr.height === 0) continue
        if (cs.transform !== "none" && depth > 0) continue
        out = Math.max(out, cr.right - r.right, r.left - cr.left)
        if (depth < 3 && !/^(hidden|clip|auto|scroll)$/.test(cs.overflowX)) walk(c, depth + 1)
      }
    }
    walk(el, 0)
    return out
  }
  const measure = (root, state, trigger) => {
    const all = [root, ...root.querySelectorAll("*")].filter((e) => vis(e) && !e.closest(SKIP))
    for (const el of all) {
      const s = getComputedStyle(el), r = el.getBoundingClientRect()
      const ox = s.overflowX, scrolls = ox === "auto" || ox === "scroll"
      const ellipsis = s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none" && s.webkitLineClamp !== ""
      // a / c: desborde horizontal y texto cortado
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && !scrolls && s.display !== "inline" && !el.closest("[data-slot=reveal]") && (inflowOut(el, r) > 1.5 || ellipsis || el.children.length === 0)) {
        if (ellipsis && (ox === "hidden" || ox === "clip")) {
          if (!el.title && !el.getAttribute("aria-label") && !el.closest("[title],[aria-label]")) push("truncated", "med", el, "ellipsis sin title (" + el.scrollWidth + ">" + el.clientWidth + ")", state)
        } else if (ox === "hidden" || ox === "clip") {
          push("clipped", "high", el, "overflow hidden corta contenido: scrollWidth " + el.scrollWidth + " > " + el.clientWidth, state)
        } else if (!el.matches("html, body")) {
          push("overflow-x", "high", el, "scrollWidth " + el.scrollWidth + " > clientWidth " + el.clientWidth, state)
        }
      }
      // b / i: hijos que salen del rect de un contenedor que recorta (overflow hidden) o del popup
      if (el.children.length && (ox === "hidden" || ox === "clip") && !ellipsis && el.clientWidth > 0) {
        for (const c of el.children) {
          if (!vis(c) || c.closest(SKIP)) continue
          const cr = c.getBoundingClientRect()
          const cp = getComputedStyle(c).position
          if (cp === "absolute" || cp === "fixed") continue
          if (cr.right > r.right + 1.5 || cr.left < r.left - 1.5) push("child-out", "high", c, "sale del contenedor " + sel(el) + " por " + Math.round(Math.max(cr.right - r.right, r.left - cr.left)) + " px", state)
        }
      }
      // h: objetivo táctil (solo controles de verdad, con el ::after si lo hay)
      if (el.matches("button, [role=button], a[href], [role=menuitem], [role=option], [role=checkbox], [role=radio], [role=switch], [role=tab], input:not([type=hidden])") && !el.closest("[data-slot=sidebar-rail]")) {
        let w = r.width, h = r.height
        const a = getComputedStyle(el, "::after")
        if (a.position === "absolute" && a.content !== "none") { const aw = parseFloat(a.width) || 0, ah = parseFloat(a.height) || 0; w = Math.max(w, aw); h = Math.max(h, ah) }
        if (el.tagName === "A" && s.display === "inline") continue
        if (h < 24 && w < 24 && !el.matches("input[type=checkbox], input[type=radio]")) push("small-target", "low", el, Math.round(w) + "x" + Math.round(h) + " < 24", state)
      }
    }
    // f: padding y aire interno asimétricos en popups e ítems
    const items = [root, ...root.querySelectorAll("[role=menuitem],[role=option],[data-slot$=-item],[data-slot$=-link]")].filter((e) => vis(e) && !e.closest(SKIP))
    for (const el of items) {
      const s = getComputedStyle(el)
      const pl = parseFloat(s.paddingLeft), pr = parseFloat(s.paddingRight)
      if (Math.abs(pl - pr) > 1 && el.children.length) {
        // las filas con ícono/atajo/indicador tienen padding a propósito asimétrico (ps-/pe-): se mira el aire real del texto
        const r = el.getBoundingClientRect()
        const kids = [...el.querySelectorAll("*")].filter((k) => vis(k) && k.children.length === 0 && (k.textContent || "").trim())
        if (!kids.length) continue
        const l = Math.min(...kids.map((k) => k.getBoundingClientRect().left)) - r.left
        const rr = r.right - Math.max(...kids.map((k) => k.getBoundingClientRect().right))
        if (rr < 4 && rr < l - 6) push("asym-padding", "med", el, "texto a " + Math.round(rr) + " px del borde derecho y " + Math.round(l) + " px del izquierdo", state)
      }
    }
    // g: solapes entre controles hermanos
    const ctr = [...root.querySelectorAll("button, a[href], [role=menuitem], [role=option], input, [role=tab]")].filter((e) => vis(e) && !e.closest(SKIP)).slice(0, 80)
    for (let i = 0; i < ctr.length; i++) for (let j = i + 1; j < ctr.length; j++) {
      const a = ctr[i], b = ctr[j]
      if (a.contains(b) || b.contains(a) || a.parentElement !== b.parentElement) continue
      const A = a.getBoundingClientRect(), B = b.getBoundingClientRect()
      const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top)
      if (ox > 2 && oy > 2) push("overlap", "med", a, "pisa a " + sel(b) + " (" + Math.round(ox) + "x" + Math.round(oy) + ")", state)
    }
    // d / e: panel flotante vs viewport y vs trigger
    if (trigger && state !== "static") {
      const r = root.getBoundingClientRect()
      if (r.right > vw + 1 || r.left < -1 || r.bottom > vh + 1 && r.height < vh || r.top < -1) push("off-viewport", "high", root, "rect " + Math.round(r.left) + "," + Math.round(r.top) + " → " + Math.round(r.right) + "," + Math.round(r.bottom) + " en " + vw + "x" + vh, state)
      const t = trigger.getBoundingClientRect()
      const dx = Math.min(Math.abs(r.left - t.left), Math.abs(r.right - t.right), Math.abs(r.left + r.width / 2 - (t.left + t.width / 2)))
      const dy = Math.min(Math.abs(r.top - t.top), Math.abs(r.bottom - t.bottom), Math.abs(r.top + r.height / 2 - (t.top + t.height / 2)))
      const side = r.top >= t.bottom - 2 || r.bottom <= t.top + 2 ? "v" : "h"
      const d = side === "v" ? dx : dy
      // un popup más ancho que la ventana o pegado al borde por colisión se mueve a propósito
      const colision = r.left <= 17 || r.right >= vw - 17 || r.top <= 17 || r.bottom >= vh - 17
      if (d > 4 && !root.closest("[data-slot=context-menu-content]") && !colision && r.width < vw * 0.9) push("misaligned", "low", root, "a " + Math.round(d) + " px del trigger " + sel(trigger), state)
    }
  }

  const POP = "[role=menu],[role=listbox],[role=dialog],[role=alertdialog],[role=tooltip],[data-slot$=-popup],[data-slot$=-positioner],[data-sonner-toast],[data-slot=toast],[data-slot=command-dialog]"
  const mainEl = document.querySelector("main") || document.body
  const popsNow = () => new Set([...document.querySelectorAll(POP + ", [data-slot$=-content]")].filter((e) => vis(e) && (e.matches(POP) || !mainEl.contains(e))))
  const outer = (set, before) => [...set].filter((e) => !before.has(e) && ![...set].some((o) => o !== e && o.contains(e) && !before.has(o)))

  const main = document.querySelector("main") || document.body
  measure(main, "static", null)

  const triggers = [...main.querySelectorAll("button[aria-haspopup], [aria-expanded=false], [data-slot$=-trigger], [role=combobox], [data-slot=context-menu-trigger], button")]
    .filter((e) => vis(e) && !e.closest(SKIP) && !e.disabled && e.getAttribute("aria-disabled") !== "true" && e.getAttribute("role") !== "tab" && e.type !== "submit")
  const score = (e) => (e.hasAttribute("aria-haspopup") || e.getAttribute("role") === "combobox" ? 0 : /trigger/.test(e.getAttribute("data-slot") || "") ? 1 : e.hasAttribute("aria-expanded") ? 2 : 3)
  const picked = [...new Set(triggers)].sort((a, b) => score(a) - score(b)).slice(0, 14)
  let opened = 0
  for (const t of picked) {
    const before = popsNow()
    const label = (t.textContent || t.getAttribute("aria-label") || t.getAttribute("data-slot") || "").trim().slice(0, 24)
    try {
      t.scrollIntoView({ block: "center" })
      const r = t.getBoundingClientRect()
      t.focus()
      for (const ty of ["pointerover", "pointerenter", "mouseover"]) t.dispatchEvent(new MouseEvent(ty, { bubbles: true }))
      if (t.closest("[data-slot=context-menu-trigger]") || t.matches("[data-slot=context-menu-trigger]")) t.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: r.left + 10, clientY: r.top + 10 }))
      else {
        // Base UI abre con pointerdown/mousedown, no con el click suelto: se emite la secuencia completa.
        for (const ty of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) t.dispatchEvent(new (ty.startsWith("pointer") ? PointerEvent : MouseEvent)(ty, { bubbles: true, cancelable: true, button: 0, pointerType: "mouse", isPrimary: true, clientX: r.left + 4, clientY: r.top + 4 }))
      }
      await sleep(420)
      const nuevos = outer(popsNow(), before)
      for (const p of nuevos) { opened++; measure(p, "open:" + label, t) }
    } catch (e) { findings.push({ rule: "probe-error", sev: "n/a", el: label, msg: String(e).slice(0, 100), state: "open:" + label }) }
    for (let k = 0; k < 3 && popsNow().size > before.size; k++) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
      document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
      await sleep(160)
    }
    t.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }))
  }
  return JSON.stringify({ findings, triggers: picked.length, opened })
})`

const informe = []
const gravedad = { high: 0, med: 1, low: 2, "n/a": 3 }
for (const vp of viewports) {
  run("set", "viewport", vp, vp === "500" ? "900" : "900")
  for (const tema of themes) {
    run("set", "media", tema)
    for (const dir of rtl ? ["ltr", "rtl"] : ["ltr"]) {
      for (const slug of [...slugs, ...extra]) {
        const url = `${base}${slug.startsWith("/") ? slug : `/docs/components/${slug}`}`
        const combo = `${slug}@${vp}/${tema}/${dir}`
        let res
        try {
          run("open", url)
          run("wait", "900")
          res = JSON.parse(JSON.parse(evalStdin(`${PROBE}(${dir === "rtl"})`).trim()))
        } catch (error) {
          res = { findings: [{ rule: "probe-error", sev: "n/a", el: "-", msg: String(error).slice(0, 120), state: "-" }], triggers: 0, opened: 0 }
        }
        const unicos = new Map()
        for (const f of res.findings) unicos.set(`${f.rule}|${f.el}|${f.state}`, f)
        let captura = ""
        if (shots && [...unicos.values()].some((f) => f.sev === "high")) {
          captura = `shots/${slug.replaceAll("/", "_")}-${vp}-${tema}-${dir}.png`
          try { run("screenshot", `${out}/${captura}`) } catch { captura = "" }
        }
        for (const f of unicos.values()) informe.push({ slug, vp, tema, dir, captura, ...f })
        console.log(`${combo}: ${res.triggers} triggers, ${res.opened} paneles, ${unicos.size} hallazgos`)
        writeFileSync(`${out}/findings.json`, JSON.stringify(informe, null, 1))
      }
    }
  }
}

// Informe: una fila por componente × regla × estado, la peor severidad primero.
const filas = new Map()
for (const f of informe) {
  const k = `${f.slug}|${f.rule}|${f.el}|${f.state}`
  const prev = filas.get(k)
  if (prev) prev.combos.push(`${f.vp}/${f.tema}/${f.dir}`)
  else filas.set(k, { ...f, combos: [`${f.vp}/${f.tema}/${f.dir}`] })
}
const ordenadas = [...filas.values()].sort((a, b) => gravedad[a.sev] - gravedad[b.sev] || a.slug.localeCompare(b.slug))
const md = ["| Componente | Regla | Sev | Elemento | Estado | Detalle | Combos | Captura |", "|---|---|---|---|---|---|---|---|"]
for (const f of ordenadas) md.push(`| ${f.slug} | ${f.rule} | ${f.sev} | ${f.el.replaceAll("|", "/")} | ${f.state} | ${f.msg.replaceAll("|", "/")} | ${f.combos.length} | ${f.captura} |`)
writeFileSync(`${out}/informe.md`, md.join("\n") + "\n")
const porSev = {}
for (const f of ordenadas) porSev[f.sev] = (porSev[f.sev] ?? 0) + 1
console.log("\nHallazgos únicos por severidad:", porSev)
