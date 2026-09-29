## Qué cambia y por qué

<!-- Dos o tres líneas. El qué se ve en el diff; lo que hace falta acá es el porqué. -->

## Checklist

- [ ] `npm test` y `npm run typecheck` en verde
- [ ] `cd docs/site && npm test` en verde (si toqué `src/` o `meta.mjs`)
- [ ] Si cambia algo para quien usa el paquete: ajusté la línea «sin publicar» de `CHANGELOG.md`
- [ ] Componente nuevo: entrada en `docs/site/content/meta.mjs` y demo en `app/_demos/`
- [ ] Toqué `tokens/geist.json`: corrí `npm run tokens` y commiteé `colors.css`
- [ ] Cambio incompatible: la línea del changelog lo dice (**Breaking**)
- [ ] Comentarios en español rioplatense, explicando el porqué
