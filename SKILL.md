# Skill: Creación de Producto en ChateaPro con IA — Flujo Completo

Este skill guía al usuario desde que clona el repo hasta tener un producto creado en ChateaPro, enriquecido con investigación de Brave Search y búsqueda visual de AliExpress.

---

## Requisitos previos

El usuario debe tener clonado el repo y configurar **2 variables** en `.env`:

| Variable | Servidor | Dónde obtenerla |
|---|---|---|
| `CHATEAPRO_API_TOKEN` | Unified MCP | https://chateapro.app → Workspace Settings |
| `BRAVE_API_KEY` | Unified MCP | https://brave.com/search/api/ |

AliExpress no requiere credenciales (API pública de Thieve.co).

```bash
cp .env.sample .env
# Edita .env con tus credenciales
cd unified-mcp-server && npm install && node index.js
```

---

## PASO 0 — Validar conexiones

```
user_info                → ChateaPro: ¿token válido?
team_info                → Workspace: ¿activo?
shop_products            → Catálogo: ¿productos existentes?
```

---

## PASO 1 — Recibir datos del producto

El usuario proporciona manualmente los datos del producto:

| Campo | Ejemplo |
|---|---|
| **Nombre** | Foam Cleaner All-In-One |
| **Precio** | 59700.00 |
| **Imágenes** (URLs) | https://cdn.shopify.com/.../producto.png, https://... |
| **Descripción** | Limpiador multisuperficies de 250ml... |
| **Tipo** | físico / digital |
| **Variantes** | Color, Talla (si aplica) |

> Si el usuario viene de Dropi u otra fuente, simplemente pega los datos. No se requiere conexión directa a Dropi.

---

## PASO 2 — Investigar el producto con Brave Search

```
brave_web_search    → contexto de mercado, competencia, precios de referencia
brave_image_search  → imágenes del producto para inspirar descripciones
brave_news_search   → tendencias o noticias sobre la categoría
```

La IA extrae:
- Descripción persuasiva del producto
- Beneficios clave
- Público objetivo
- Precios de referencia en el mercado
- Palabras clave para el embudo de ventas

---

## PASO 3 — Buscar productos similares por imagen en AliExpress

```
aliexpress_image_search  imageUrl="<URL de la imagen principal del producto>"
```

Devuelve hasta 8 productos similares con:
- Títulos alternativos
- Rangos de precio en AliExpress
- Ratings y número de órdenes
- Imágenes de productos competidores

Esto enriquece el conocimiento del producto y ayuda a posicionarlo en el mercado.

---

## PASO 4 — Armar la estructura del producto para ChateaPro

Con los datos recolectados (usuario + Brave + AliExpress), la IA construye esta estructura:

```json
{
  "informacion_de_producto": {
    "nombre": "Nombre del producto",
    "precio": "59700.00",
    "tipo": "fisico",
    "variable": "SIMPLE",
    "imagen": "URL de imagen principal",
    "estado": "activo",
    "descripcion": "Descripción generada con datos de Brave + AliExpress"
  },
  "embudo_de_ventas": {
    "mensaje_inicial": "Mensaje de bienvenida personalizado",
    "multimedia": ["URLs de imágenes del producto"],
    "pregunta_de_entrada": "Pregunta para calificar al lead"
  },
  "prompt": {
    "prompt_libre": "Prompt completo generado por IA con contextualización, ficha técnica, guion conversacional, posibles situaciones y reglas"
  },
  "recordatorios": {
    "tiempo_1": "10 minutos",
    "mensaje_1": "Mensaje de seguimiento 1",
    "tiempo_2": "20 minutos",
    "mensaje_2": "Mensaje de seguimiento 2",
    "hora_min": "08:00",
    "hora_max": "22:00"
  }
}
```

**Nota:** La estructura completa (voz_con_ia, remarketing, activadores_del_flujo, meta_conversion) se configura en el dashboard de ChateaPro. La IA genera recomendaciones.

---

## PASO 5 — Crear el producto en ChateaPro

```
shop_create_product         → Crea el producto con nombre, precio, imagen, descripción
shop_create_product_variant → Agrega variantes si el producto las tiene
shop_product_get_info       → Verifica que el producto se creó correctamente
```

---

## PASO 6 — Configurar el flow de ventas

```
flow_set_default_start_flow    → Asigna el flow de inicio
flow_set_default_ai_provider   → Configura el proveedor de IA
flow_create_tag                → Crea tags para el producto
flow_set_bot_field             → Configura campos personalizados
```

La configuración fina del prompt, recordatorios y embudo se completa en el dashboard de ChateaPro.

---

## Resumen de tools por fase

| Fase | MCP Server | Tools |
|---|---|---|
| Recibir datos | Usuario (manual) | — |
| Investigar | Unified (Brave) | `brave_web_search`, `brave_image_search`, `brave_news_search` |
| Buscar imágenes | Unified (AliExpress) | `aliexpress_image_search` |
| Crear producto | Unified (ChateaPro) | `shop_create_product`, `shop_create_product_variant`, `shop_product_get_info` |
| Configurar flow | Unified (ChateaPro) | `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_create_tag`, `flow_set_bot_field` |

---

## Catálogo actual

| Chatea ID | Nombre | Precio |
|-----------|--------|--------|
| 576451 | Foam Cleaner All-In-One | $59,700 |
| 576453 | Pendiente | — |
