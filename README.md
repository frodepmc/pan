# CRUX Mallorca — Web + Panel Interno

Monorepo único desplegado en Vercel. Contiene:

- **Web pública** — landing SEO en la raíz (`/`, `/servicios`, `/nosotros`, legales).
- **Panel interno** — área privada para el equipo bajo `/admin` con auth y registry de integraciones.
- **API serverless** — endpoints en `/api/*` (auth + persistencia KV).

---

## Requisitos

- `node` >= 18
- `python3` (sólo para preview estático)
- (Opcional) [`vercel`](https://vercel.com/docs/cli) CLI para `vercel dev`

## Instalación

```bash
npm install
```

## Preview local

### Web pública (sin backend)

```bash
npm run preview
```

Abre `http://127.0.0.1:3000/`. **No sirve** las rutas `/api/*` ni la auth del admin — sólo HTML/CSS/JS estático.

### Con backend y auth (requiere Vercel CLI)

```bash
npm run dev
```

Esto levanta `vercel dev` en `http://localhost:3000` con las serverless functions activas. Necesitas antes un archivo `.env.local` en la raíz (ver abajo).

## Variables de entorno (Vercel)

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `JWT_SECRET` | Cadena aleatoria larga para firmar sesiones (>= 32 chars). | `openssl rand -base64 48` |
| `ADMIN_USERS` | JSON con array de usuarios autorizados. | `[{"u":"admin@admin.es","p":"$2a$12$...","role":"admin"}]` |
| `KV_REST_API_URL` | Lo inyecta Vercel al conectar una KV store. | — |
| `KV_REST_API_TOKEN` | Lo inyecta Vercel al conectar una KV store. | — |

### Generar un hash bcrypt

```bash
npm run admin:hash -- "mi-password"
```

Te imprime por stdout el hash `$2a$12$…`. Cópialo al campo `p` del JSON de `ADMIN_USERS`.

### `.env.local` para desarrollo

```env
JWT_SECRET=<una-cadena-aleatoria-larga>
ADMIN_USERS=[{"u":"admin@admin.es","p":"$2a$12$ZONb/J6TKIorwhVoVqKPoeEp2z3UsCZqwYEmcMhgllNlxC.j1P8HO","role":"admin"}]
# KV_REST_API_URL y KV_REST_API_TOKEN se obtienen del dashboard de Vercel
```

> El hash de ejemplo corresponde al password inicial acordado (`12rPR53s`). Cámbialo cuanto antes.

## Despliegue en Vercel

1. Push del repo a GitHub.
2. Importar desde [vercel.com/new](https://vercel.com/new).
3. En **Storage** del proyecto → crear una **KV / Redis** (KV está deprecado; si empiezas de cero, la integración recomendada es Upstash Redis desde Marketplace). Conectarla al proyecto — Vercel inyecta automáticamente `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
4. En **Settings → Environment Variables**, añadir `JWT_SECRET` y `ADMIN_USERS`.
5. Redeploy.

Resultado esperado:

| Ruta | Qué sirve |
| --- | --- |
| `/` | Landing pública |
| `/servicios`, `/nosotros`, `/privacidad`, `/cookies`, `/aviso-legal` | Resto de la web pública |
| `/admin` | Login interno |
| `/admin/hub` | Hub de integraciones (tras login) |
| `/admin/integrations/financial` | Dashboard financiero |
| `/api/auth/login` POST | Autenticación |
| `/api/auth/logout` POST | Cerrar sesión |
| `/api/auth/verify` GET | Estado de sesión |
| `/api/state` GET/POST | Persistencia del dashboard |

## Estructura

```
/
├── index.html                  Landing
├── servicios.html
├── nosotros.html
├── privacidad.html, cookies.html, aviso-legal.html
├── admin/
│   ├── index.html              Login
│   ├── hub.html                Hub de integraciones
│   ├── integrations.json       Registry
│   └── integrations/
│       └── financial.html      Dashboard financiero (React inline)
├── api/
│   ├── _lib/
│   │   └── auth.js             Helpers (bcrypt + JWT + cookies)
│   ├── auth/
│   │   ├── login.js
│   │   ├── logout.js
│   │   └── verify.js
│   └── state.js                Backend del dashboard (KV)
├── assets/
│   ├── css/
│   │   ├── style.css           Web pública
│   │   ├── servicios.css
│   │   ├── nosotros.css
│   │   └── admin.css           Panel interno (editorial técnico)
│   ├── js/
│   │   ├── main.js             Web pública
│   │   ├── configurator.js
│   │   └── admin.js            Panel interno
│   ├── icons/
│   └── images/
├── scripts/
│   ├── generate-bg-variants.py
│   └── hash-password.js
├── package.json
├── vercel.json                 cleanUrls + noindex admin + no-cache api
├── robots.txt                  Disallow /admin y /api
└── sitemap.xml
```

## Añadir una nueva integración

1. Crea `admin/integrations/<id>.html`. Copia el patrón del guard de `financial.html` al principio del `<head>` para exigir sesión.
2. Si necesita backend, crea `api/<id>.js` usando `readSessionFromRequest` de `api/_lib/auth.js` para proteger el endpoint.
3. Añade una entrada al registry `admin/integrations.json`:
   ```json
   { "id": "<id>", "name": "Nombre", "description": "…", "path": "/admin/integrations/<id>", "status": "live", "roles": ["admin"], "icon": "chart", "meta": ["tag1", "tag2"] }
   ```
4. Redeploy.

## Checks rápidos

```bash
npm run check:eol
npm run check:seo
```

## Notas de mantenimiento

- Dominio canónico: `https://cruxmallorca.es/`.
- El repo fuerza `LF` vía `.editorconfig` y `.gitattributes`.
- El panel admin se excluye del indexado mediante `robots.txt` + header `X-Robots-Tag: noindex, nofollow` (configurado en `vercel.json`).
- El dashboard financiero mantiene su estética propia (React 18 inline + ApexCharts + html2pdf). Se integra al panel vía un guard de sesión en el `<head>` y un link "Hub interno" flotante.
