# CRUX Mallorca Landing

Landing estatica de CRUX Consulting desplegada en Vercel.

## Requisitos

- `python3`
- `node`

## Preview local

```bash
npm run preview
```

Abre `http://127.0.0.1:3000/`.

## Archivos clave

- `index.html`: landing completa con HTML, CSS y JS inline.
- `site.webmanifest`: metadatos de instalacion/iconos.
- `assets/images/`: fondos optimizados para la landing.
- `assets/icons/`: favicon y apple touch icon.

## Checks rapidos

```bash
npm run check:eol
npm run check:seo
```

## Notas de mantenimiento

- El dominio canonico configurado es `https://cruxmallorca.es/`.
- Los fondos se sirven como imagenes decorativas con variantes WebP para reducir peso sin alterar el layout original.
- El repo fuerza `LF` mediante `.editorconfig` y `.gitattributes` para evitar churn de CRLF.
