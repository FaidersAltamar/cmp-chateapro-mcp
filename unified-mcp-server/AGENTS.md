# AGENTS.md — Unified MCP Server

## Quick Start

```bash
npm install
cp ../.env.sample ../.env
# Edita .env con CHATEAPRO_API_TOKEN (requerido) y BRAVE_API_KEY (opcional)
node index.js
```

Requiere **Node.js >= 18**, ES modules (`"type": "module"`).

## Arquitectura

- **Entry point**: `index.js` — Servidor MCP unificado (stdio) con 229+ tools
- **Chatea Pro**: 220+ tools importadas de `../chateapro-mcp-server/tools.js`
- **Brave Search**: 8 tools → `https://api.search.brave.com` (gated by `BRAVE_API_KEY`)
- **AliExpress**: 1 tool → Thieve.co public API (no auth)
- **Dropi**: MCP externo independiente, ya sincronizado

## Flujo principal: Crear producto desde Dropi

### Fase 1 — Obtener datos del producto (Dropi MCP externo)
El usuario da un Dropi ID. Dropi MCP devuelve: nombre, precio, imágenes, descripción.

### Fase 2 — Investigar (Brave Search)
```
brave_web_search    → contexto de mercado, competencia
brave_image_search  → imágenes de referencia  
brave_news_search   → tendencias de la categoría
```
Extraer: descripción persuasiva, beneficios, público objetivo, keywords.

### Fase 3 — Buscar similares por imagen (AliExpress)
```
aliexpress_image_search imageUrl="<URL de Dropi>"
```
Devuelve hasta 8 productos similares con títulos, precios, ratings.

### Fase 4 — Armar estructura y crear (ChateaPro)
Con datos de Dropi + Brave + AliExpress, la IA construye:
- `informacion_de_producto` (nombre, precio, imagen, descripción)
- `embudo_de_ventas` (mensaje inicial, pregunta de entrada)
- `prompt` (prompt libre completo para el agente de ventas)
- `recordatorios` (seguimiento)

Luego:
```
shop_create_product         → crea el producto
shop_create_product_variant → agrega variantes si aplica
shop_product_get_info       → verifica creación
```

### Fase 5 — Configurar flow
```
flow_set_default_start_flow  → asigna flow de inicio
flow_set_default_ai_provider → configura IA
flow_create_tag              → tags del producto
flow_set_bot_field           → campos personalizados
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CHATEAPRO_API_TOKEN` | Yes | Chatea Pro Bearer Token |
| `CHATEAPRO_API_URL` | No | Custom API URL (default: https://chateapro.app/api) |
| `BRAVE_API_KEY` | No | Brave Search API key |
| `DROPI_STORE_ID` | No | Dropi Store ID (integration) |
| `DROPI_API_KEY` | No | Dropi API Key (integration) |
| `SHOPIFY_STORE_URL` | No | Shopify store URL |
| `SHOPIFY_ACCESS_TOKEN` | No | Shopify access token |

## Servicios externos

| Servicio | MCP Server | Tools |
|---|---|---|
| Dropi | MCP externo (ya sincronizado) | `get_product`, `list_products`, etc. |

## Tools clave por categoría

### Producto
`shop_create_product`, `shop_update_product`, `shop_delete_product`, `shop_product_get_info`, `shop_products`, `shop_create_product_variant`, `shop_product_variants`, `shop_update_product_variant`, `shop_delete_product_variant`

### Flow / AI
`flow_set_default_start_flow`, `flow_set_web_chat_widget_default_start_flow`, `flow_set_audio_transcription`, `flow_get_default_ai_provider`, `flow_set_default_ai_provider`, `flow_ai_agents`, `flow_update_ai_agent_provider`, `flow_ai_tasks`, `flow_update_ai_task_provider`

### Suscriptores
`subscribers_list`, `subscriber_get_info`, `subscriber_create`, `subscriber_update`, `subscriber_delete`, `subscriber_add_tag`, `subscriber_set_user_field`

### Ecommerce
`subscriber_cart`, `subscriber_add_to_cart`, `subscriber_cart_paid`, `shop_orders`, `shop_create_order`, `shop_discount_codes`, `shop_create_discount_code`

### Sending
`subscriber_send_main_flow`, `subscriber_send_sub_flow`, `subscriber_broadcast`, `subscriber_broadcast_by_tag`, `subscriber_send_text`, `subscriber_send_sms`, `subscriber_send_email`

### Brave
`brave_web_search`, `brave_image_search`, `brave_video_search`, `brave_news_search`, `brave_local_search`, `brave_summarizer`, `brave_llm_context`, `brave_place_search`

### AliExpress
`aliexpress_image_search`
