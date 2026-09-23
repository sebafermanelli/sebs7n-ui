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
