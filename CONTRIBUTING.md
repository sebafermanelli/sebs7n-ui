# Cómo contribuir

## Correr los tests

```bash
npm ci          # dispara `prepare`, o sea el build: tsc + tailwind
npm run typecheck
npm test        # vitest; incluye build.test.ts, que reconstruye dist/ y revisa el tarball
npm run size    # umbrales de peso, ver .size-limit.js
```

El sitio de documentación tiene su propio `package.json` y su propio lockfile:

```bash
cd docs/site
npm ci
npm test        # el `pretest` corre scripts/generate.mjs
```

`generate.mjs` **falla** —y con eso falla el test del sitio— si un componente de
`src/components/` no tiene entrada en `docs/site/content/meta.mjs`, si `meta.mjs` nombra un
componente que no existe, o si falta `docs/site/app/_demos/<slug>.tsx` con al menos una demo.
No es un olvido del generador: componente nuevo sin documentar no entra.

## El registry de `shadcn add`

`docs/site/scripts/lib/registry.mjs` arma los ítems con formato shadcn que se publican en
`/r/*.json`. Los tests del sitio cubren lo que se puede verificar sin red —el esquema, que
ningún archivo repita basename, que el ítem `theme` traiga los tokens—, pero **no** corren el
CLI de shadcn: eso pide `create-next-app`, tres `npm install` y el registry de shadcn.com, que
ni es rápido ni es determinista. Si tocás `registry.mjs`, la prueba de verdad se hace a mano y
lleva unos minutos:

```bash
# 1. Servir el registry del build local
cd docs/site && npm run build && npx next start --port 4123 &
# Las registryDependencies apuntan al dominio de producción: reescribirlas al puerto local.
node -e 'const fs=require("fs");for(const f of fs.readdirSync("public/r")){const q="public/r/"+f;fs.writeFileSync(q,fs.readFileSync(q,"utf8").replaceAll("https://ui.sebastianfermanelli.com/r/","http://localhost:4123/r/"))}'

# 2. Proyecto destino limpio
cd /tmp && npx create-next-app@latest probe --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --no-turbopack --yes
cd probe && npx shadcn@latest init --defaults --yes

# 3. El componente, y lo único que importa: que compile y que traiga los tokens
npx shadcn@latest add http://localhost:4123/r/button.json --overwrite --yes
npx tsc --noEmit                       # tiene que pasar
grep -c 'var(----' src/app/globals.css # tiene que dar 0
npx next build && grep -o '\.bg-gray-1000{[^}]*}' .next/static/chunks/*.css
```

Después, matar el `next start` por su PID. Dos trampas que ya se pagaron una vez:

- **Basenames.** El CLI resuelve cada import buscándolo entre los archivos de ese mismo `add`:
  primero por ruta exacta y, si no da, **por basename**, donde gana la extensión `.tsx`. Por eso
  las variantes se copian como `<x>-variants.ts` y los helpers como `<x>-helpers.ts`. Con
  `button.ts` al lado de `button.tsx`, el componente se importaba a sí mismo y `tsc` tiraba
  `TS2303 Circular definition of import alias 'buttonVariants'`.
- **`cssVars` vs `css`.** `@theme inline` solo funciona por `cssVars.theme` y con las claves sin
  `--`; `:root` y `.dark` solo funcionan por `css`. El porqué de cada uno está comentado en
  `registry.mjs`.

## Colores

`src/styles/colors.css` está **generado**: sale de `tokens/geist.json` con `npm run tokens`. No
se edita a mano —hay un test que compara byte a byte y te va a marcar la diferencia—. Se toca el
JSON, se corre `npm run tokens` y se commitean los dos archivos juntos.

## Comentarios

En **español rioplatense**, y explicando **el porqué, no el qué**. El qué ya está en la línea de
abajo; lo que no se puede recuperar leyendo el código es la decisión: qué se probó antes, qué
rompía, por qué esta forma y no la obvia.

```ts
// ✗ el qué: incrementa el índice
// ✓ el porqué: Base UI emite Shift+F10 con las coordenadas en cero y el menú saltaba a la
//   esquina, así que lo anclamos al rectángulo del elemento.
```

## Commits y PRs

[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat(drawer): …`,
`fix(tabs): …`, `docs: …`, `chore(deps): …`. Un commit por unidad lógica, y el cuerpo con el
porqué —mismo criterio que los comentarios—. Versionado [SemVer 2.0.0](https://semver.org/lang/es/);
mientras el paquete sea `0.x`, un minor puede traer cambios incompatibles, siempre marcados
**Breaking** en el `CHANGELOG.md`.

Cada PR suma su entrada al `CHANGELOG.md` bajo `## [Unreleased]`.
