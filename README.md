# Cerro Plata Backend

- Static Swagger UI available at `/swagger.html` (serves Swagger UI from CDN and reads OpenAPI JSON from `/api/api-docs-json`).

Deployment notes:

- Vercel will serve files in `/public` at the root. Access the docs at `https://<your-preview-url>/swagger.html`.
- If your Swagger JSON path is different, edit `public/swagger.html` and change the `url` value in the script.
