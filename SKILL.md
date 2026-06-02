# Skill: Creación de Producto en ChateaPro con IA — Flujo Completo

Este skill guía al usuario desde que clona el repo hasta tener un producto creado en ChateaPro, enriquecido con investigación de Brave Search y búsqueda visual de AliExpress.

---

## Requisitos previos

El usuario debe tener clonado el repo y configurar **3 fuentes**:

| Fuente | MCP Server | Credencial | Dónde obtenerla |
|---|---|---|---|
| **ChateaPro** | `unified-mcp-server` | `CHATEAPRO_API_TOKEN` | https://chateapro.app → Workspace Settings |
| **Brave Search** | `unified-mcp-server` | `BRAVE_API_KEY` | https://brave.com/search/api/ |
| **AliExpress** | `unified-mcp-server` | Ninguna (API pública) | Thieve.co |
| **Dropi** | Externo (ya sincronizado) | `DROPI_STORE_ID` + `DROPI_API_KEY` | Dropi Dashboard |

```bash
cp .env.sample .env
# Edita .env con tus credenciales
cd unified-mcp-server && npm install && node index.js
```

---

## PASO 0 — Validar conexiones

```
user_info                → ChateaPro: ¿token válido?
integration_get_dropi    → Dropi: ¿integración verificada?
team_info                → Workspace: ¿activo?
shop_products            → Catálogo: ¿productos existentes?
```

---

## PASO 1 — Obtener datos del producto desde Dropi

El usuario indica un **ID de Dropi**. El MCP de Dropi (externo, ya sincronizado) devuelve:
- Nombre del producto
- Precio
- Imágenes (URLs)
- Descripción / características
- Tipo de producto (físico/digital)
- Variantes (si aplica)

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
aliexpress_image_search  imageUrl="<URL de imagen del producto desde Dropi>"
```

Devuelve hasta 8 productos similares con:
- Títulos alternativos
- Rangos de precio en AliExpress
- Ratings y número de órdenes
- Imágenes de productos competidores

Esto enriquece el conocimiento del producto y ayuda a posicionarlo en el mercado.

---

## PASO 4 — Armar la estructura del producto para ChateaPro

Con los datos recolectados (Dropi + Brave + AliExpress), la IA construye esta estructura:

```json
{
  "informacion_de_producto": {
    "nombre": "Nombre del producto (de Dropi)",
    "precio": "59700.00",
    "tipo": "fisico",
    "variable": "SIMPLE",
    "imagen": "URL de imagen principal",
    "estado": "activo",
    "descripcion": "Descripción generada con datos de Brave + Dropi"
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
shop_create_product   → Crea el producto con nombre, precio, imagen, descripción
shop_create_product_variant → Agrega variantes si el producto las tiene
shop_product_get_info → Verifica que el producto se creó correctamente
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
| Obtener datos | Dropi MCP (externo) | `get_product`, `list_products` |
| Investigar | Unified (Brave) | `brave_web_search`, `brave_image_search`, `brave_news_search` |
| Buscar imágenes | Unified (AliExpress) | `aliexpress_image_search` |
| Crear producto | Unified (ChateaPro) | `shop_create_product`, `shop_create_product_variant`, `shop_product_get_info` |
| Configurar flow | Unified (ChateaPro) | `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_create_tag`, `flow_set_bot_field` |

---

## Catálogo actual

| Chatea ID | Nombre | Dropi ID | Precio |
|-----------|--------|----------|--------|
| 576451 | Foam Cleaner All-In-One | 915488 | $59,700 |
| 576453 | Pendiente | 1583543 | — |

---

## Productos pendientes de importar

| Dropi ID | Estado |
|----------|--------|
| 1583543 | Sin datos — preguntar nombre, precio, imagen |
