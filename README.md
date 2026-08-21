# El Eje Cafetero · Encanto — Sitio web (prototipo)

Sitio web multipágina para **El Eje Cafetero / Encanto**, cafetería de especialidad colombiana
en Bellavista, Santiago de Chile.

Estética: **clara, editorial y profesional** en tonos pastel colombiano–caribeños (coral, mango,
aguamarina, verde hoja), con **ilustraciones de café tipo grabado** (rama, granos, prensa francesa),
iconos de línea (sin emojis) y sin colores fluorescentes.

## Cómo verlo
Abre **`index.html`** en cualquier navegador (doble clic). Para Google Fonts y el mapa se necesita internet.

> Recomendado: servidor local para que todo funcione perfecto:
> ```bash
> cd "El Eje Cafetero"
> python3 -m http.server 8000
> ```
> y entra a http://localhost:8000

## Componentes destacados
- **Navegación kinética** a pantalla completa (menú lateral con paneles en capas y enlaces animados).
- **Corredor de imágenes** (ImageStreamHero): dos rieles de fotos en perspectiva que concentran la
  fotografía en un solo elemento elegante en el inicio.
- **Footer editorial** con marca de agua "ENCANTO" y crédito "Hecho por Calfers".

> Nota técnica: el proyecto es HTML/CSS/JS plano (no React/shadcn). Los dos componentes React que se
> pidieron (corredor de imágenes y nav kinética) se **portaron a versiones vanilla equivalentes**
> — mismo efecto, sin cambiar el stack ni añadir un build.

## Páginas
| Archivo | Contenido |
|---|---|
| `index.html` | Inicio — ilustraciones de café, corredor de imágenes, métodos, "imprime tu foto", eventos |
| `carta.html` | Carta completa con filtros y fotografías por categoría (+80 productos) |
| `nosotros.html` | Historia, valores, línea de tiempo y galería con lightbox |
| `eventos.html` | Eventos y armador de reserva que genera un mensaje de WhatsApp |
| `contacto.html` | Ubicación, mapa, horarios y sección "Escríbenos" (WhatsApp) |

## Assets nuevos
- `assets/img/cafe1.svg` (rama de café), `cafe2.svg` (granos), `cafe3.svg` (prensa francesa) — usados en el inicio.
- Fotografías en `assets/img/*.jpg` — concentradas en la carta y en el corredor del inicio.

## Notas para producción
- **Número de WhatsApp** placeholder `56900000000` (en `data-phone` y enlaces `wa.me`).
- Dirección exacta y pin del mapa por confirmar.

Hecho por **Calfers** — https://calfers.com
