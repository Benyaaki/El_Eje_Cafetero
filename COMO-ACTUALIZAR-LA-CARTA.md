# Cómo actualizar la carta de la web

La carta de la página web se lee desde una **planilla** (el archivo
`Carta El Eje Cafetero.xlsx`, que luego vive en Google Sheets).
Cambias un precio o un producto en la planilla → la web se actualiza sola.
No hay que tocar código.

---

## Para el café (uso diario)

1. Abre la planilla **"Carta El Eje Cafetero"**.
2. Cada fila es un producto. Las columnas son:

   | Seccion | Producto | Descripcion | Precio | Etiqueta |
   |---------|----------|-------------|--------|----------|
   | Con leche | Cappuccino | | $4.450 | |
   | Dulces veganos | Brownie | Corteza crocante con nueces. | $4.450 | vegano |

   - **Seccion**: a qué parte de la carta va. Tiene un **menú desplegable**;
     elige una (Espresso & clásicos, Con leche, Especiales fríos, Jugos
     naturales, etc.). Los productos aparecen en el orden en que los pongas.
   - **Producto**: el nombre que se ve en la carta.
   - **Descripcion**: texto chico bajo el nombre (puede quedar vacía).
   - **Precio**: texto libre. Ej: `$2.500` o `$4.390 / leche $4.690`.
   - **Etiqueta** *(opcional)*: una marca junto al nombre, ej: `vegano`,
     `Colombia`. Déjala vacía si no aplica.

3. **Cambiar un precio o nombre**: escribe encima de la celda.
4. **Agregar un producto**: escribe una fila nueva (elige la Seccion).
5. **Quitar un producto**: borra su fila completa.
6. Listo. Los cambios aparecen en la web en unos minutos (refresca la página).

> No cambies la fila de **encabezados** ni los nombres de las secciones.
> Si la planilla llegara a fallar, la web muestra la última carta conocida,
> así que nunca se ve vacía.

---

## Para el desarrollador (conectar Google Sheets — una sola vez)

La web lee la dirección definida en `js/main.js`:

```js
window.CARTA_SHEET_CSV = window.CARTA_SHEET_CSV || "assets/data/carta.csv";
```

Hoy apunta a un archivo local. Para conectar Google Sheets:

1. Sube/importa `Carta El Eje Cafetero.xlsx` a Google Sheets
   (*Archivo → Importar → Subir*). Mantiene formato y el desplegable.
2. Publica la hoja **Carta** como CSV:
   **Archivo → Compartir → Publicar en la web** → hoja *Carta* →
   **CSV** → **Publicar**. Copia la URL (termina en `output=csv`).
3. Pega esa URL en `js/main.js`:
   ```js
   window.CARTA_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv";
   ```
4. Sube el cambio al repo (commit + push).

Notas:
- Google cachea el CSV publicado ~5 min; los cambios no son instantáneos.
- La estructura de la carta (bandas, títulos de sección, ilustraciones)
  vive en `carta.html`. La planilla controla **productos, descripciones,
  precios y etiquetas**; cada `.menu-list` tiene un `data-list` que hace
  match con la columna *Seccion* (normalizada).
- Para volver al modo local: deja `window.CARTA_SHEET_CSV = ""` (usa los
  ítems escritos en `carta.html`).
