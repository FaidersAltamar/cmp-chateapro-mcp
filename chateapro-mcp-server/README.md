# Chatea Pro MCP Server

Un servidor completo de [Model Context Protocol (MCP)](https://modelcontextprotocol.io) para la API de **Chatea Pro**. Expone **220 endpoints** organizados en **22 categorías**, permitiendo que cualquier cliente MCP (como Claude, OpenCode, Cursor, etc.) interactúe directamente con toda la plataforma Chatea Pro.

---

## Caracteristicas

- **Cobertura total**: 220 endpoints de la API REST de Chatea Pro
- **Autenticacion OAuth 2.0 / Bearer Token**
- **Organizado por categorias**: Ecommerce, Subscriber, Sending, Integration, Flow, AI Hub, Workspace, Tickets, WhatsApp Templates, y mas
- **Tipado de schemas**: Cada herramienta incluye el schema de entrada con tipos, enums y descripciones
- **Listo para MCP stdio**: Funciona con cualquier cliente MCP compatible

---

## Requisitos

- Node.js >= 18
- Un token de API de Chatea Pro (Bearer Token)

---

## Instalacion

```bash
git clone https://github.com/faidedev/chateapro-mcp-server.git
cd chateapro-mcp-server
npm install
```

---

## Configuracion

El servidor requiere la variable de entorno `CHATEAPRO_API_TOKEN`. Puedes configurarlo de varias formas:

### Opcion 1: Variable de entorno

```bash
export CHATEAPRO_API_TOKEN="tu-token-aqui"
node index.js
```

### Opcion 2: Configuracion del cliente MCP

Ejemplo para **OpenCode** (`opencode.json`):

```json
{
  "mcpServers": {
    "chateapro": {
      "command": "node",
      "args": ["/ruta/al/chateapro-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "tu-token-aqui"
      }
    }
  }
}
```

Ejemplo para **Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "chateapro": {
      "command": "node",
      "args": ["/ruta/al/chateapro-mcp-server/index.js"],
      "env": {
        "CHATEAPRO_API_TOKEN": "tu-token-aqui"
      }
    }
  }
}
```

### URL personalizada (opcional)

Por defecto apunta a `https://chateapro.app/api`. Para usar otra URL:

```bash
export CHATEAPRO_API_URL="https://tu-instancia.com/api"
```

---

## Endpoints Cubiertos

| Categoria | # Endpoints | Descripcion |
|---|---|---|
| **Ecommerce** | 49 | Productos, variantes, ordenes, carritos, descuentos, tags, tipos, vendors, locaciones, horarios |
| **Subscriber** | 40 | CRUD de suscriptores, tags, labels, user fields, opt-in/opt-out, asignacion de agentes, mensajes |
| **Sending** | 21 | Envio de flows, textos, SMS, email, nodos, templates de WhatsApp y Facebook, broadcasts |
| **Integration** | 20 | Shopify, WooCommerce, Dropi, Meta Conversions API, OpenAI, S3 Storage, Mini Apps |
| **Flow** | 12 | Sub-flows, agentes, templates, webhooks, widgets, transcripcion de audio, proveedor AI |
| **Workspace** | 10 | Analytics, bots, miembros, configuracion de canales y sidebar |
| **Flow Bot Field** | 8 | Crear, actualizar y eliminar bot fields (por ns o nombre) |
| **Ticket List** | 7 | Listas de tickets, items, campos, logs, crear/actualizar/eliminar tickets |
| **OpenAI** | 7 | Embeddings: listar, crear, actualizar, eliminar, importar, regenerar |
| **Agent Group** | 6 | Grupos de agentes: CRUD y gestion de miembros |
| **User** | 5 | Info de usuario, cambio de password, notificaciones, anuncios |
| **Flow User Field** | 5 | User fields del flow: CRUD |
| **Flow AI Hub** | 4 | AI Agents y AI Tasks: listar y actualizar proveedor/modelo |
| **Flow Tag** | 4 | Tags del flow: listar, crear, eliminar |
| **Team Label** | 4 | Labels del equipo: listar, crear, eliminar |
| **Whatsapp Template** | 4 | Templates de WhatsApp: listar, crear, eliminar, sincronizar |
| **Facebook Utility Template** | 4 | Templates de utilidad de Facebook: listar, crear, eliminar, sincronizar |
| **Template** | 3 | Templates generales: listar, ver installs, generar link |
| **Flow Custom Events** | 3 | Eventos personalizados: listar, resumen, datos |
| **Flow Conversation** | 2 | Logs de actividad de agentes y datos de conversaciones |
| **Flow Segment** | 1 | Segmentos del flow |
| **Mini-App** | 1 | Trigger de app events en suscriptores |

**Total: 220 endpoints**

---

## Ejemplos de Uso

Una vez conectado, puedes pedirle al agente cosas como:

- *"Listame los ultimos 50 suscriptores de mi bot"*
- *"Envia un broadcast del sub-flow 'f123s456' a los usuarios con el tag 'VIP'"*
- *"Crea un nuevo producto llamado 'Camiseta Negra' con precio $29.99"*
- *"Obten la informacion de la orden #12345"*
- *"Actualiza el proveedor AI del agente 'f123ag456' a gpt-4o-mini"*

---

## Estructura del Proyecto

```
.
├── index.js          # Servidor MCP principal (220 tools)
├── package.json      # Dependencias
├── .gitignore        # Archivos ignorados
└── README.md         # Este archivo
```

---

## Licencia

MIT

---

## Disclaimer

Este proyecto no esta afiliado oficialmente con Chatea Pro. Es una integracion de comunidad construida sobre la API publica de la plataforma.

Para obtener tu token de API, accede a la configuracion de tu workspace en [chateapro.app](https://chateapro.app).
