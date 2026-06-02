# CMP ChateaPro — MCP Server Unificado

Servidor MCP único con **229+ tools** para crear productos en ChateaPro investigando con Brave Search y buscando imágenes en AliExpress.

---

## Inicio rápido

```bash
# 1. Clonar
git clone https://github.com/FaidersAltamar/cmp-chateapro-mcp.git
cd cmp-chateapro-mcp

# 2. Instalar dependencias
cd unified-mcp-server && npm install && cd ..

# 3. Configurar credenciales
cp .env.sample .env
# Edita .env con tu token (obligatorio) y Brave key (opcional)

# 4. Verificar que arranca
node -e "import('./unified-mcp-server/index.js').then(()=>{console.error('OK');process.exit(0)}).catch(e=>{console.error('FALLO:',e.message);process.exit(1)})"
# Debe mostrar: Unified MCP Server running on stdio — ChateaPro + AliExpress + Brave[enabled/disabled]
```

---

## Arquitectura

```
Cliente MCP (Claude Desktop / OpenCode / Cursor)
          │
          ▼
┌─────────────────────────────────┐
│     Unified MCP Server           │
│     1 solo proceso stdio         │
├─────────────────────────────────┤
│  ChateaPro      220 tools        │
│  Brave Search     8 tools        │
│  AliExpress       1 tool         │
└──────┬────────┬────────┬────────┘
       │        │        │
       ▼        ▼        ▼
   ChateaPro  Brave    Thieve
      API      API     (AliExpr)
```

---

## Configuración del cliente MCP

Reemplaza `<RUTA>` con la ruta absoluta donde clonaste el repo. Usa `pwd` para obtenerla.

```json
{
  "mcpServers": {
    "unified": {
      "command": "node",
      "args": ["<RUTA>/cmp-chateapro-mcp/unified-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "tu-token-aqui",
        "BRAVE_API_KEY": "tu-brave-key-aqui"
      }
    }
  }
}
```

### Archivos de configuración por cliente

| Cliente | SO | Ruta del archivo |
|---|---|---|
| Claude Desktop | macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop | Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| OpenCode | macOS | `~/.config/opencode/opencode.json` |
| OpenCode | Windows | `%USERPROFILE%\.config\opencode\opencode.json` |
| Cursor | macOS | `~/.cursor/mcp.json` |
| Cursor | Windows | `%USERPROFILE%\.cursor\mcp.json` |
| Windsurf | macOS | `~/.codeium/windsurf/mcp_config.json` |

---

## Variables de entorno

Crea un archivo `.env` en la raíz del repo copiando `.env.sample`:

```env
CHATEAPRO_API_TOKEN=tu-token   # Obligatorio — https://chateapro.app → Workspace Settings
BRAVE_API_KEY=tu-brave-key     # Opcional — https://brave.com/search/api/
```

| Variable | Requerida | Descripción |
|---|---|---|
| `CHATEAPRO_API_TOKEN` | Sí | Token Bearer de ChateaPro |
| `BRAVE_API_KEY` | No | Si no se configura, las 8 tools de Brave se ocultan |

---

## Tools disponibles (229+)

### ChateaPro — 220 tools

| Categoría | Tools destacadas |
|---|---|
| **Producto** | `shop_create_product`, `shop_update_product`, `shop_delete_product`, `shop_product_get_info`, `shop_products`, `shop_create_product_variant`, `shop_update_product_variant`, `shop_delete_product_variant`, `shop_product_variants` |
| **Órdenes** | `shop_orders`, `shop_create_order`, `shop_update_order`, `shop_order_get_info` |
| **Descuentos** | `shop_discount_codes`, `shop_create_discount_code`, `shop_update_discount_code`, `shop_delete_discount_code` |
| **Carrito** | `subscriber_cart`, `subscriber_add_to_cart`, `subscriber_remove_from_cart`, `subscriber_cart_paid` |
| **Flow / AI** | `flow_subflows`, `flow_agents`, `flow_set_default_start_flow`, `flow_set_default_ai_provider`, `flow_get_default_ai_provider`, `flow_ai_agents`, `flow_update_ai_agent_provider`, `flow_ai_tasks`, `flow_set_audio_transcription` |
| **Bot Fields** | `flow_bot_fields`, `flow_create_bot_field`, `flow_set_bot_field`, `flow_delete_bot_field`, `flow_set_bot_field_by_name`, `flow_delete_bot_field_by_name` |
| **Suscriptores** | `subscribers_list`, `subscriber_get_info`, `subscriber_create`, `subscriber_update`, `subscriber_delete`, `subscriber_add_tag`, `subscriber_remove_tag`, `subscriber_set_user_field`, `subscriber_pause_bot`, `subscriber_resume_bot`, `subscriber_move_chat_to`, `subscriber_assign_agent` |
| **Envíos** | `subscriber_send_main_flow`, `subscriber_send_sub_flow`, `subscriber_broadcast`, `subscriber_broadcast_by_tag`, `subscriber_broadcast_by_segment`, `subscriber_send_text`, `subscriber_send_sms`, `subscriber_send_email`, `subscriber_send_whatsapp_template` |
| **Integraciones** | `integration_get_shopify`, `integration_update_shopify`, `integration_get_dropi`, `integration_update_dropi`, `integration_get_openai`, `integration_update_openai`, `integration_get_woocommerce`, `integration_get_s3storage` |
| **Workspace** | `team_info`, `team_flows`, `team_members`, `flow_summary`, `flow_agent_summary`, `workspace_settings_channels`, `workspace_settings_update_channels`, `team_bot_users` |
| **Tags / Labels** | `flow_tags`, `flow_create_tag`, `flow_delete_tag`, `team_labels`, `team_create_label`, `team_delete_label` |
| **Tickets** | `team_ticket_lists`, `team_create_ticket`, `team_update_ticket`, `team_delete_ticket` |
| **Templates** | `templates_list`, `template_installs`, `whatsapp_template_list`, `whatsapp_template_create`, `whatsapp_template_delete`, `whatsapp_template_sync` |
| **Usuario** | `user_info`, `user_change_password`, `notifications_recent`, `notification_mark_read` |
| **+ más** | Segmentos, Custom Events, Agent Groups, FB Utility Templates, OpenAI Embeddings, Mini Apps, Chat Messages |

### Brave Search — 8 tools (requiere `BRAVE_API_KEY`)

| Tool | Descripción |
|---|---|
| `brave_web_search` | Búsqueda web con FAQ, discusiones, noticias y videos |
| `brave_image_search` | Búsqueda de imágenes |
| `brave_video_search` | Búsqueda de videos |
| `brave_news_search` | Búsqueda de noticias |
| `brave_local_search` | Negocios, restaurantes, lugares |
| `brave_summarizer` | Resúmenes AI de resultados web |
| `brave_llm_context` | Contenido web para RAG / grounding |
| `brave_place_search` | POIs, ciudades, direcciones |

### AliExpress — 1 tool (sin autenticación)

| Tool | Descripción |
|---|---|
| `aliexpress_image_search` | Busca productos por imagen. Hasta 8 resultados con título, precio, rating, órdenes. |

---

## Flujo de creación de producto

```
Usuario da: nombre, precio, moneda, asesor, imagen, tipo
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
  Brave Search    AliExpress      Datos manual
  ────────────    ──────────      ────────────
  mercado          similares       nombre
  keywords         por imagen      precio
  competencia      precios ref     asesor
    │               │               │
    └───────────────┼───────────────┘
                    ▼
         IA construye JSON (8 secciones)
                    │
                    ▼
    ┌──────────────────────────────────┐
    │  flow_create_bot_field            │
    │  → [Producto Ventas Wp] {N}       │
    │  (UN solo campo con todo el JSON) │
    └──────────────────────────────────┘
                    │
                    ▼
            shop_create_product
         shop_create_product_variant
                    │
                    ▼
           Producto creado ✓
```

---

## Estructura del repositorio

```
cmp-chateapro-mcp/
├── .env.sample               ← Template de credenciales
├── .gitignore
├── README.md                  ← Este archivo
├── SKILL.md                   ← Flujo detallado para agentes IA
│
├── unified-mcp-server/        ← 🚀 Servidor principal (229+ tools)
│   ├── index.js               ← Entry point (JS puro, sin build)
│   ├── package.json           ← Solo depende de @modelcontextprotocol/sdk
│   └── AGENTS.md              ← Documentación técnica interna
│
├── chateapro-mcp-server/      ← ChateaPro API wrapper
│   ├── tools.js               ← apiRequest() + 220 TOOLS (módulo compartido)
│   ├── index.js               ← Standalone server (53 líneas)
│   └── package.json
│
├── brave-search-mcp-server/   ← Brave Search API (TypeScript, referencia)
│   ├── src/                   ← Código fuente TS
│   └── package.json
│
└── aliexpress-image-search-mcp-server/  ← AliExpress image search
    ├── index.js               ← 1 tool, JS puro, sin auth
    └── package.json
```

---

## Requisitos

- **Node.js** >= 18
- **npm** >= 9
- Conexión a internet

---

## Troubleshooting

### El servidor no aparece en el cliente MCP

1. ¿Ejecutaste `npm install` dentro de `unified-mcp-server/`?
2. ¿Existe `.env` en la raíz con `CHATEAPRO_API_TOKEN`?
3. ¿La ruta en la config MCP es **absoluta** (no `~`, no relativa)?
4. ¿Reiniciaste el cliente MCP después de configurarlo?

### `Cannot find package @modelcontextprotocol/sdk`

```bash
cd unified-mcp-server
rm -rf node_modules package-lock.json
npm install
```

### `CHATEAPRO_API_TOKEN environment variable is required`

El `.env` debe estar en la raíz (`cmp-chateapro-mcp/.env`), no dentro de `unified-mcp-server/`.

### `Cannot find module ../chateapro-mcp-server/tools.js`

No muevas las carpetas. La estructura debe mantenerse como en el repo.

### Brave tools no aparecen

`BRAVE_API_KEY` no está configurado en `.env`. Sin esta variable, las 8 tools de Brave se ocultan automáticamente.

### Verificar instalación

```bash
cd cmp-chateapro-mcp
node -e "import('./unified-mcp-server/index.js').then(()=>{console.error('OK');process.exit(0)}).catch(e=>{console.error('FALLO:',e.message);process.exit(1)})"
```

---

## Licencia

MIT
