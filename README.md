# CMP ChateaPro — MCP Servers

Suite de servidores MCP (Model Context Protocol) para automatizar la creación de productos en ChateaPro usando IA, búsqueda web y búsqueda visual.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente MCP                           │
│         (Claude Desktop / Cursor / OpenCode)             │
└────┬──────────────┬──────────────┬──────────────────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌──────────────┐
│  Dropi  │  │  Unified  │  │ Brave Search │
│   MCP   │  │    MCP    │  │     MCP      │
│ (externo)│  │ (principal)│  │ (referencia) │
└────┬────┘  └─────┬─────┘  └──────┬───────┘
     │              │               │
     │    ┌─────────┼─────────┐     │
     │    │         │         │     │
     ▼    ▼         ▼         ▼     │
  Dropi  ChateaPro  AliExpr  Brave  │
   API    API       (Thieve)  API   │
```

## Servidores

| Servidor | Tools | Transporte | Auth | Build |
|---|---|---|---|---|
| **unified-mcp-server** | 229+ | stdio | `CHATEAPRO_API_TOKEN` | No (JS puro) |
| **dropi-mcp-server** | 20+ | stdio | `DROPI_INTEGRATION_KEY` | Sí (`npm run build`) |
| **chateapro-mcp-server** | 220 | stdio | `CHATEAPRO_API_TOKEN` | No |
| **brave-search-mcp-server** | 8 | stdio/http | `BRAVE_API_KEY` | Sí (`npm run build`) |
| **aliexpress-image-search-mcp-server** | 1 | stdio | Ninguna | No |

> **Recomendación:** Usa `unified-mcp-server` como servidor principal. Incluye ChateaPro (220 tools), Brave Search (8 tools) y AliExpress (1 tool) en un solo proceso. Dropi se conecta como servidor externo independiente.

---

## Instalación

### 1. Clonar

```bash
git clone <url-del-repo> cmp-chateapro
cd cmp-chateapro
```

### 2. Configurar variables de entorno

```bash
cp .env.sample .env
```

Edita `.env` con tus credenciales:

```env
# Requerido
CHATEAPRO_API_TOKEN=tu-token-de-chateapro

# Opcional — Brave Search (investigación de productos)
BRAVE_API_KEY=tu-brave-api-key

# Opcional — Dropi (integración en ChateaPro)
DROPI_STORE_ID=tu-store-id
DROPI_API_KEY=tu-api-key
```

### 3. Instalar dependencias y construir

```bash
# Servidor unificado (principal)
cd unified-mcp-server && npm install && cd ..

# Dropi MCP (externo, TypeScript)
cd dropi-mcp-server && npm install && npm run build && cd ..

# ChateaPro standalone (opcional)
cd chateapro-mcp-server && npm install && cd ..

# Brave Search (opcional, referencia)
cd brave-search-mcp-server && npm install && npm run build && cd ..
```

---

## Configuración del cliente MCP

### Opción A — Servidor unificado + Dropi (recomendado)

```json
{
  "mcpServers": {
    "unified": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/unified-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "tu-token",
        "BRAVE_API_KEY": "tu-brave-key"
      }
    },
    "dropi": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/dropi-mcp-server/dist/index.js"],
      "env": {
        "DROPI_BASE_URL": "https://api.dropi.co",
        "DROPI_INTEGRATION_KEY": "tu-dropi-key"
      }
    }
  }
}
```

### Opción B — Servidores individuales

```json
{
  "mcpServers": {
    "chateapro": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/chateapro-mcp-server/index.js"],
      "env": { "CHATEAPRO_API_TOKEN": "tu-token" }
    },
    "dropi": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/dropi-mcp-server/dist/index.js"],
      "env": {
        "DROPI_BASE_URL": "https://api.dropi.co",
        "DROPI_INTEGRATION_KEY": "tu-dropi-key"
      }
    },
    "brave": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/brave-search-mcp-server/dist/index.js"],
      "env": { "BRAVE_API_KEY": "tu-brave-key" }
    },
    "aliexpress": {
      "command": "node",
      "args": ["<ruta>/cmp-chateapro/aliexpress-image-search-mcp-server/index.js"]
    }
  }
}
```

### Archivos de configuración por plataforma

| Cliente | Archivo |
|---|---|
| Claude Desktop macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| OpenCode | `~/.config/opencode/opencode.json` |
| Cursor | `~/.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

---

## Flujo de creación de producto

Este es el flujo principal para el que está diseñado el sistema:

```
Usuario: "Crea el producto de Dropi ID 915488"
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
  Dropi MCP     Brave Search    AliExpress
  ─────────     ────────────    ──────────
  nombre          contexto        similares
  precio          mercado         por imagen
  imágenes        keywords        precios ref
  descripción     tendencias
    │               │               │
    └───────────────┼───────────────┘
                    ▼
              IA ensambla
         estructura del producto
                    │
                    ▼
            ChateaPro MCP
         ──────────────────
         shop_create_product
         shop_create_product_variant
         flow_set_default_start_flow
         flow_set_default_ai_provider
                    │
                    ▼
           Producto creado ✓
```

### Detalle de cada fase

| # | Fase | MCP Server | Tools clave |
|---|---|---|---|
| 1 | Obtener datos | Dropi | `dropi_list_products`, `dropi_get_product` |
| 2 | Investigar mercado | Brave | `brave_web_search`, `brave_image_search`, `brave_news_search` |
| 3 | Buscar similares | AliExpress | `aliexpress_image_search` |
| 4 | Armar estructura | IA | Genera `informacion_de_producto`, `embudo_de_ventas`, `prompt`, `recordatorios` |
| 5 | Crear en ChateaPro | Unified/ChateaPro | `shop_create_product`, `shop_create_product_variant` |
| 6 | Configurar flow | Unified/ChateaPro | `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_create_tag` |

---

## Tools disponibles

### Unified MCP Server (229+ tools)

#### ChateaPro (220 tools)

| Categoría | Tools |
|---|---|
| Agent Group | `team_agent_groups`, `team_view_agent_group`, `team_create_agent_group`, `team_update_agent_group`, `team_delete_agent_group` |
| Ecommerce | `shop_products`, `shop_create_product`, `shop_update_product`, `shop_delete_product`, `shop_product_variants`, `shop_create_product_variant`, `shop_orders`, `shop_create_order`, `shop_discount_codes`, `shop_create_discount_code`, `subscriber_cart`, `subscriber_add_to_cart`, `subscriber_cart_paid` |
| Flow | `flow_subflows`, `flow_agents`, `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_ai_agents`, `flow_ai_tasks` |
| Bot Field | `flow_bot_fields`, `flow_create_bot_field`, `flow_set_bot_field`, `flow_delete_bot_field` |
| Subscriber | `subscribers_list`, `subscriber_get_info`, `subscriber_create`, `subscriber_update`, `subscriber_delete`, `subscriber_add_tag`, `subscriber_set_user_field`, `subscriber_send_sub_flow` |
| Sending | `subscriber_broadcast`, `subscriber_broadcast_by_tag`, `subscriber_send_text`, `subscriber_send_sms`, `subscriber_send_email`, `subscriber_send_whatsapp_template` |
| Integration | `integration_get_shopify`, `integration_update_shopify`, `integration_get_dropi`, `integration_update_dropi`, `integration_get_openai`, `integration_update_openai` |
| Workspace | `team_info`, `team_flows`, `team_members`, `flow_summary`, `workspace_settings_channels` |
| User | `user_info`, `user_change_password`, `notifications_recent` |
| Template | `templates_list`, `template_installs`, `whatsapp_template_list`, `whatsapp_template_create` |
| Ticket | `team_ticket_lists`, `team_create_ticket`, `team_update_ticket`, `team_delete_ticket` |
| + más | OpenAI Embeddings, Segments, Tags, Labels, Custom Events, FB Utility Templates |

#### Brave Search (8 tools)

| Tool | Descripción |
|---|---|
| `brave_web_search` | Búsqueda web general + FAQ + discusiones + noticias + videos |
| `brave_image_search` | Búsqueda de imágenes |
| `brave_video_search` | Búsqueda de videos |
| `brave_news_search` | Búsqueda de noticias |
| `brave_local_search` | Lugares, restaurantes, negocios locales |
| `brave_summarizer` | Resúmenes AI de resultados (requiere key de web_search) |
| `brave_llm_context` | Contenido web optimizado para RAG/grounding |
| `brave_place_search` | POIs, ciudades, direcciones |

#### AliExpress (1 tool)

| Tool | Descripción |
|---|---|
| `aliexpress_image_search` | Busca productos por imagen (retorna hasta 8 similares) |

### Dropi MCP Server (20+ tools)

| Categoría | Tools |
|---|---|
| Auth | `dropi_login`, `dropi_whoiam` |
| Órdenes | `dropi_list_orders`, `dropi_create_order`, `dropi_get_order`, `dropi_update_order`, `dropi_delete_order` |
| Productos | `dropi_list_products`, `dropi_create_product`, `dropi_get_product`, `dropi_update_product`, `dropi_delete_product` |
| Bodegas | `dropi_list_warehouses`, `dropi_create_warehouse`, `dropi_get_warehouse`, `dropi_update_warehouse`, `dropi_delete_warehouse` |
| Cotizaciones | `dropi_quote_shipping`, `dropi_list_shipping_quotes`, `dropi_get_shipping_quote` |
| Recogidas | `dropi_schedule_pickup`, `dropi_list_pickups`, `dropi_get_pickup`, `dropi_cancel_pickup` |
| Helpers | `dropi_validate_token`, `dropi_get_categories`, `dropi_get_departments`, `dropi_get_city_coverage` |
| Tiendas | `dropi_list_shops`, `dropi_get_shop`, `dropi_create_shop` |

---

## Requisitos

- **Node.js** >= 18
- **npm** >= 9
- Credenciales de API (ver `.env.sample`)

---

## Variables de entorno

| Variable | Servidor | Requerida | Descripción |
|---|---|---|---|
| `CHATEAPRO_API_TOKEN` | Unified / ChateaPro | Sí | Token Bearer de ChateaPro |
| `CHATEAPRO_API_URL` | Unified / ChateaPro | No | URL personalizada (default: `https://chateapro.app/api`) |
| `BRAVE_API_KEY` | Unified / Brave | No | API key de Brave Search |
| `DROPI_INTEGRATION_KEY` | Dropi | Sí | API key de integraciones Dropi |
| `DROPI_BASE_URL` | Dropi | No | URL de Dropi (default: `https://api.dropi.co`) |
| `DROPI_STORE_ID` | ChateaPro | No | Store ID para integración Dropi |
| `DROPI_API_KEY` | ChateaPro | No | API key para integración Dropi |
| `SHOPIFY_STORE_URL` | ChateaPro | No | URL de tienda Shopify |
| `SHOPIFY_ACCESS_TOKEN` | ChateaPro | No | Token de acceso Shopify |

---

## Estructura del repositorio

```
cmp-chateapro/
├── .env.sample                          # Template de variables de entorno
├── .gitignore
├── README.md                            # Este archivo
├── SKILL.md                             # Flujo de trabajo para agentes IA
│
├── unified-mcp-server/                  # 🚀 Servidor principal unificado
│   ├── index.js                         # 229+ tools en un solo proceso
│   ├── package.json
│   └── AGENTS.md                        # Documentación técnica para agentes
│
├── chateapro-mcp-server/                # ChateaPro API (220 tools)
│   ├── tools.js                         # Módulo compartido (apiRequest + TOOLS)
│   ├── index.js                         # Standalone server
│   ├── package.json
│   ├── AGENTS.md
│   ├── SKILL.md
│   └── .env.sample
│
├── dropi-mcp-server/                    # Dropi Integrations API (20+ tools)
│   ├── src/                             # TypeScript source
│   ├── dist/                            # JavaScript compilado
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── .env.example
│   └── integrations.json                # OpenAPI spec
│
├── brave-search-mcp-server/             # Brave Search API (8 tools)
│   ├── src/                             # TypeScript source
│   ├── dist/                            # JavaScript compilado
│   ├── package.json
│   └── README.md
│
└── aliexpress-image-search-mcp-server/  # AliExpress Image Search (1 tool)
    ├── index.js
    └── package.json
```

---

## Licencia

MIT
