# AGENTS.md — Unified MCP Server

## Quick Start

```bash
npm install
cp ../.env.sample ../.env
# CHATEAPRO_API_TOKEN (requerido) + BRAVE_API_KEY (opcional)
node index.js
```

Requiere Node.js >= 18, ES modules.

## Arquitectura

- **Entry point**: `index.js` — Servidor MCP unificado (stdio) con 229+ tools
- **Chatea Pro**: 220+ tools desde `../chateapro-mcp-server/tools.js`
- **Brave Search**: 8 tools (si `BRAVE_API_KEY` está configurado)
- **AliExpress**: 1 tool (Thieve.co, sin auth)

## Flujo de creación de producto

### 1. Recibir datos del usuario
Pedir: nombre, precio, moneda, imagen (URL), asesor, tipo (fisico/digital), categoria, SKU, stock.

### 2. Investigar (opcional, requiere BRAVE_API_KEY)
```
brave_web_search   → mercado, competencia, keywords
brave_image_search → imágenes de referencia
```

### 3. AliExpress (opcional)
```
aliexpress_image_search imageUrl="<URL>"
```

### 4. Construir JSON con 8 secciones exactas
```
informacion_de_producto, embudo_de_ventas, prompt, voz_con_ia,
recordatorios, remarketing, activadores_del_flujo, meta_conversion
```
Ver SKILL.md para la estructura completa.

### 5. Inyectar en ChateaPro como UN SOLO campo
```
flow_create_bot_field
  name: "[Producto Ventas Wp] {numero}"
  var_type: "array"
  value: "<JSON serializado>"
```

### 6. Crear producto en el shop
```
shop_create_product
  name, price (entero), image, status: "active", type, vendor, sku
shop_create_product_variant → track_stock: 1, qty, allow_no_stock_sell: 0
shop_product_get_info → verificar
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CHATEAPRO_API_TOKEN` | Yes | Chatea Pro Bearer Token |
| `BRAVE_API_KEY` | No | Brave Search API key |

## Tools clave

| Categoría | Tools |
|---|---|
| Validación | `user_info`, `team_info` |
| Brave | `brave_web_search`, `brave_image_search`, `brave_video_search`, `brave_news_search`, `brave_local_search`, `brave_summarizer`, `brave_llm_context`, `brave_place_search` |
| AliExpress | `aliexpress_image_search` |
| Bot Fields | `flow_create_bot_field`, `flow_set_bot_field`, `flow_bot_fields`, `flow_delete_bot_field`, `flow_set_bot_field_by_name`, `flow_delete_bot_field_by_name` |
| Producto | `shop_create_product`, `shop_update_product`, `shop_delete_product`, `shop_product_get_info`, `shop_products`, `shop_create_product_variant`, `shop_update_product_variant` |
| Flow | `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_get_default_ai_provider`, `flow_create_tag` |
| Subscriber | `subscribers_list`, `subscriber_get_info`, `subscriber_create`, `subscriber_update` |
| Sending | `subscriber_broadcast`, `subscriber_send_text`, `subscriber_send_sms`, `subscriber_send_email` |
