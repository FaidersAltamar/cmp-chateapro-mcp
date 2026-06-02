# Dropi MCP Server

Servidor MCP (Model Context Protocol) completo para la API de Dropi Integrations. Permite a Claude (y otros clientes MCP) interactuar con tu cuenta de Dropi: gestionar órdenes, productos, bodegas, cotizar envíos, programar recogidas y más.

## Requisitos

- Node.js 18 o superior
- Una API Key de integraciones de Dropi (`dropi-integration-key`)

## Instalación

1. Clona o descarga este repositorio.
2. Instala las dependencias:

```bash
npm install
```

3. Compila el proyecto:

```bash
npm run build
```

4. Configura tus variables de entorno copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y añade tu API key:

```env
DROPI_BASE_URL=https://api.dropi.co
DROPI_INTEGRATION_KEY=tu_api_key_aqui
```

## Configuración en clientes MCP

El servidor usa **transporte stdio**, el estándar MCP. Funciona en cualquier cliente compatible sin modificar nada. La configuración es la misma en todos: `command`, `args` y `env`.

### Configuración base (común a todas las plataformas)

```json
{
  "mcpServers": {
    "dropi": {
      "command": "node",
      "args": ["<ruta-a-tu-carpeta>/dist/index.js"],
      "env": {
        "DROPI_BASE_URL": "https://api.dropi.co",
        "DROPI_INTEGRATION_KEY": "tu_api_key_aqui"
      }
    }
  }
}
```

> **Nota:** Reemplaza `<ruta-a-tu-carpeta>` con la ruta real donde clonaste el proyecto (ej: `C:/Users/faide/Downloads/MCP DROPI`).

### Claude Desktop

| SO      | Archivo de configuración                                      |
|---------|---------------------------------------------------------------|
| Windows | `%APPDATA%\Claude\claude_desktop_config.json`                |
| macOS   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux   | `~/.config/Claude/claude_desktop_config.json`                 |

### Cursor

| SO      | Archivo de configuración            |
|---------|-------------------------------------|
| Windows | `%USERPROFILE%\.cursor\mcp.json`    |
| macOS   | `~/.cursor/mcp.json`                |
| Linux   | `~/.cursor/mcp.json`                |

### Windsurf

| SO      | Archivo de configuración                         |
|---------|--------------------------------------------------|
| Windows | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` |
| macOS   | `~/.codeium/windsurf/mcp_config.json`             |
| Linux   | `~/.codeium/windsurf/mcp_config.json`             |

### OpenCode

| SO      | Archivo de configuración |
|---------|--------------------------|
| Windows | `%USERPROFILE%\.config\opencode\opencode.json` |
| macOS   | `~/.config/opencode/opencode.json`              |
| Linux   | `~/.config/opencode/opencode.json`              |

### Cline (VS Code Extension)

| SO      | Archivo de configuración                         |
|---------|--------------------------------------------------|
| Windows | `%USERPROFILE%\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| macOS   | `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| Linux   | `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |

### Cualquier otro cliente MCP con stdio

Si tu cliente soporta stdio, solo necesitas apuntarlo al archivo compilado:

```bash
node <ruta-a-tu-carpeta>/dist/index.js
```

Y asegurar que las variables de entorno estén definidas:

```bash
export DROPI_BASE_URL=https://api.dropi.co
export DROPI_INTEGRATION_KEY=tu_api_key_aqui
node dist/index.js
```

## Herramientas disponibles

### Autenticación
- `dropi_login` – Login de usuario Dropi (JWT clásico, previo a crear tienda)
- `dropi_whoiam` – Obtener información del usuario autenticado

### Órdenes
- `dropi_list_orders` – Listar órdenes del usuario (paginación y filtros)
- `dropi_create_order` – Crear una nueva orden
- `dropi_get_order` – Obtener detalles de una orden por ID
- `dropi_update_order` – Actualizar una orden existente
- `dropi_get_order_by_guide` – Buscar orden por número de guía

### Productos
- `dropi_list_products` – Listar productos (paginación y búsqueda)
- `dropi_create_product` – Crear un nuevo producto
- `dropi_get_product_v2` – Obtener detalles de producto (v2 optimizado)
- `dropi_update_product` – Actualizar un producto

### Bodegas
- `dropi_list_warehouses` – Listar bodegas del usuario
- `dropi_create_warehouse` – Crear una nueva bodega
- `dropi_get_warehouse` – Obtener detalles de una bodega

### Cotizaciones
- `dropi_quote_shipping` – Cotizar envío con transportadoras habilitadas

### Pick Ups
- `dropi_list_pickups` – Listar recogidas programadas
- `dropi_create_pickup` – Programar una nueva recogida

### Helpers
- `dropi_validate_token` – Validar token de integración
- `dropi_list_categories` – Listar categorías de productos
- `dropi_list_distribution_companies` – Listar transportadoras disponibles
- `dropi_list_departments_with_cities` – Listar departamentos y ciudades
- `dropi_check_city_coverage` – Verificar cobertura de envío por ciudad

### Tiendas
- `dropi_create_shop` – Crear tienda de integración (requiere `bearer_token` de login)
- `dropi_get_shop_data` – Obtener información básica de la tienda autenticada

## Autenticación

La mayoría de los endpoints requieren la API key de integraciones configurada en la variable `DROPI_INTEGRATION_KEY`. Esta se envía automáticamente en el header `dropi-integration-key`.

El flujo especial es:
1. `dropi_login` → Obtienes un JWT clásico.
2. `dropi_create_shop` → Usas ese JWT en `bearer_token` para crear una tienda y obtener el token de integración de larga duración.
3. Configuras ese token en `DROPI_INTEGRATION_KEY` para usar el resto de herramientas.

## Desarrollo

Para compilar en modo observación:

```bash
npm run dev
```

Para ejecutar el servidor directamente:

```bash
npm start
```

## Soporte

Para dudas sobre la API de Dropi, contacta a: soporte@dropi.co
