# CMP ChateaPro — MCP Servers

Suite de servidores MCP (Model Context Protocol) para automatizar la creación de productos en ChateaPro usando IA, búsqueda web Brave y búsqueda visual AliExpress.

## Arquitectura

```
┌──────────────────────────────────────────┐
│              Cliente MCP                  │
│    (Claude Desktop / Cursor / OpenCode)   │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│         Unified MCP Server        │
│          (servidor único)         │
├──────────────────────────────────┤
│  ChateaPro (220 tools)            │
│  Brave Search (8 tools)           │
│  AliExpress Image (1 tool)        │
└──────┬────────┬────────┬─────────┘
       │        │        │
       ▼        ▼        ▼
   ChateaPro  Brave    Thieve
      API      API     (AliExpr)
```

## Servidores

| Servidor | Tools | Transporte | Auth | Build |
|---|---|---|---|---|
| **unified-mcp-server** | 229+ | stdio | `CHATEAPRO_API_TOKEN` + `BRAVE_API_KEY` | No (JS puro) |
| chateapro-mcp-server | 220 | stdio | `CHATEAPRO_API_TOKEN` | No |
| brave-search-mcp-server | 8 | stdio/http | `BRAVE_API_KEY` | Sí |
| aliexpress-image-search-mcp-server | 1 | stdio | Ninguna | No |
| dropi-mcp-server | 20+ | stdio | `DROPI_INTEGRATION_KEY` | Sí |

> **Recomendación:** Usa `unified-mcp-server` como servidor único. Incluye ChateaPro (220), Brave Search (8) y AliExpress (1) en un solo proceso.

---

## Instalación

### 1. Clonar

```bash
git clone https://github.com/FaidersAltamar/cmp-chateapro-mcp.git
cd cmp-chateapro-mcp
```

### 2. Configurar variables de entorno

```bash
cp .env.sample .env
```

Edita `.env` con tus credenciales:

```env
CHATEAPRO_API_TOKEN=tu-token-de-chateapro
BRAVE_API_KEY=tu-brave-api-key
```

### 3. Instalar

```bash
cd unified-mcp-server && npm install && cd ..
```

---

## Configuración del cliente MCP

```json
{
  "mcpServers": {
    "unified": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro-mcp/unified-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "tu-token",
        "BRAVE_API_KEY": "tu-brave-key"
      }
    }
  }
}
```

---

## Flujo de creación de producto

```
Usuario: "Crea producto: Hydrocare, $41,000, imagen.url, asesor Wilson..."
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
  Datos manual   Brave Search    AliExpress
  ───────────    ────────────    ──────────
  nombre            contexto        similares
  precio            mercado         por imagen
  imágenes          keywords        precios ref
    │               │               │
    └───────────────┼───────────────┘
                    ▼
              IA ensambla
         JSON con 8 secciones
                    │
                    ▼
    ┌───────────────────────────────┐
    │  flow_create_bot_field        │
    │  [Producto Ventas Wp] 109     │
    │  (UN solo campo con todo)     │
    └───────────────────────────────┘
                    │
                    ▼
            shop_create_product
         shop_create_product_variant
                    │
                    ▼
           Producto creado ✓
```

### Detalle de cada fase

| # | Fase | Fuente | Tools clave |
|---|---|---|---|
| 1 | Recibir datos | Usuario (manual) | Pedir: nombre, precio, imagen, asesor, tipo |
| 2 | Investigar (opcional) | Brave | `brave_web_search`, `brave_image_search` |
| 3 | Similares (opcional) | AliExpress | `aliexpress_image_search` |
| 4 | Armar JSON 8 secciones | IA | Estructura exacta en SKILL.md |
| 5 | Inyectar campo único | ChateaPro | `flow_create_bot_field` → `[Producto Ventas Wp] {N}` |
| 6 | Crear en shop | ChateaPro | `shop_create_product`, `shop_create_product_variant` |

---

## Tools disponibles (229+)

### ChateaPro (220 tools)

| Categoría | Tools destacadas |
|---|---|
| Ecommerce | `shop_products`, `shop_create_product`, `shop_update_product`, `shop_delete_product`, `shop_product_variants`, `shop_create_product_variant`, `shop_orders`, `shop_create_order`, `shop_discount_codes`, `subscriber_cart`, `subscriber_add_to_cart`, `subscriber_cart_paid` |
| Flow | `flow_subflows`, `flow_agents`, `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_ai_agents`, `flow_ai_tasks` |
| Subscriber | `subscribers_list`, `subscriber_get_info`, `subscriber_create`, `subscriber_update`, `subscriber_add_tag`, `subscriber_set_user_field`, `subscriber_send_sub_flow` |
| Sending | `subscriber_broadcast`, `subscriber_broadcast_by_tag`, `subscriber_send_text`, `subscriber_send_sms`, `subscriber_send_email`, `subscriber_send_whatsapp_template` |
| Integration | `integration_get_shopify`, `integration_update_shopify`, `integration_get_dropi`, `integration_update_dropi`, `integration_get_openai`, `integration_update_openai` |
| Workspace | `team_info`, `team_flows`, `team_members`, `flow_summary`, `workspace_settings_channels` |
| + 15 categorías más | Agent Groups, Bot Fields, Custom Events, Labels, Tags, Segments, Tickets, Templates, WhatsApp Templates, OpenAI Embeddings... |

### Brave Search (8 tools)

| Tool | Descripción |
|---|---|
| `brave_web_search` | Búsqueda web + FAQ + discusiones + noticias + videos |
| `brave_image_search` | Búsqueda de imágenes |
| `brave_video_search` | Búsqueda de videos |
| `brave_news_search` | Búsqueda de noticias |
| `brave_local_search` | Lugares, restaurantes, negocios |
| `brave_summarizer` | Resúmenes AI de resultados web |
| `brave_llm_context` | Contenido optimizado para RAG/grounding |
| `brave_place_search` | POIs, ciudades, direcciones |

### AliExpress (1 tool)

| Tool | Descripción |
|---|---|
| `aliexpress_image_search` | Busca productos en AliExpress por imagen (hasta 8 resultados) |

---

## Variables de entorno

| Variable | Servidor | Requerida | Descripción |
|---|---|---|---|
| `CHATEAPRO_API_TOKEN` | Unified | Sí | Token Bearer de ChateaPro |
| `CHATEAPRO_API_URL` | Unified | No | URL personalizada (default: `https://chateapro.app/api`) |
| `BRAVE_API_KEY` | Unified | No | API key de Brave Search |
| `SHOPIFY_STORE_URL` | ChateaPro | No | URL de tienda Shopify |
| `SHOPIFY_ACCESS_TOKEN` | ChateaPro | No | Token de acceso Shopify |

---

## Requisitos

- **Node.js** >= 18
- **npm** >= 9

---

## Estructura del repositorio

```
cmp-chateapro-mcp/
├── .env.sample
├── .gitignore
├── README.md
├── SKILL.md
├── unified-mcp-server/          ← 🚀 Servidor principal (229+ tools)
├── chateapro-mcp-server/        ← ChateaPro standalone
├── dropi-mcp-server/            ← Dropi (opcional, TypeScript)
├── brave-search-mcp-server/     ← Brave Search (TypeScript)
└── aliexpress-image-search-mcp-server/ ← AliExpress image search
```

---

## Licencia

MIT
