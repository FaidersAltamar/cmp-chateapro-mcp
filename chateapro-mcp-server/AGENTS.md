# AGENTS.md – Chatea Pro MCP Server

## Quick Start

**Single file MCP server**: `index.js` (2971 lines). No build step, no tests, no CI workflows. Pure tool definitions + MCP server.

```bash
npm install
CHATEAPRO_API_TOKEN="your-token" node index.js
```

The server requires **Node.js ≥ 18** and ES modules (`"type": "module"` in package.json).

## Architecture

- **Entry point**: `index.js:1` – Single stdio MCP server with 220 API tools
- **API integration**: Line 7–31 contains `apiRequest()` – handles Bearer token auth, URL params, JSON body, DELETE workaround with `X-HTTP-Method-Override` header
- **Tool array**: Line 33–end defines `TOOLS` array; each tool maps to one Chatea Pro API endpoint
- **MCP handlers**: Lines ~2950–2971 set up `ListToolsRequestSchema` and `CallToolRequestSchema` request handlers

## Configuration

- **API base URL**: defaults to `https://chateapro.app/api`; override via `CHATEAPRO_API_URL` env var
- **API token**: **required**; must be set in `CHATEAPRO_API_TOKEN` env var or server fails at startup (line 2963)
- **Environment file**: Use `.env` file (or `.env.sample` as template) for credentials
- **No other config files**: no .env, no config.js, no dotenv loading

## Key Implementation Details

1. **DELETE workaround** (line 25–28): DELETE requests with body are converted to POST with `X-HTTP-Method-Override: DELETE` header – this is a quirk of the Chatea Pro API
2. **Error handling**: API responses that aren't valid JSON return `{ status, body }` (line 42)
3. **Query filtering**: `apiRequest()` skips undefined/null/empty string params (line 12–14)
4. **Tool naming**: Tools are prefixed by category (e.g., `team_agent_groups`, `ecommerce_products`, `subscriber_list`)
5. **Schemas**: All tools include strict input schemas with enums and descriptions; many use arrays of objects

## Environment Variables

### Required
- `CHATEAPRO_API_TOKEN` - Your Chatea Pro API Bearer Token (get from https://chateapro.app)

### Optional
- `CHATEAPRO_API_URL` - Custom API URL (defaults to https://chateapro.app/api)
- `DROPI_STORE_ID` - Your Dropi Store ID (e.g., 915488)
- `DROPI_API_KEY` - Your Dropi API Key
- `SHOPIFY_STORE_URL` - Your Shopify store URL
- `SHOPIFY_ACCESS_TOKEN` - Your Shopify access token
- `NODE_ENV` - Environment mode (development/production)

See `.env.sample` for complete reference.

## Common Agent Workflows

- **Listing endpoints**: Most use `limit` and `page` for pagination (defaults to first 50 items)
- **ID-based actions**: Create/read/update/delete typically require an ID param
- **Nested fields**: Some endpoints accept deep objects (e.g., `data` array with strings in `workspace_settings_update_live_chat_sidebar`)
- **Enum constraints**: Many endpoints have enum fields (e.g., `assign_method: ["random", "least_assigned", "round_robin"]`); follow the schema strictly

## Debugging

- Check `CHATEAPRO_API_TOKEN` is set: server logs and exits if missing
- API errors are JSON when possible; inspect tool handler results for `{ status, body }` pairs
- Stdio transport used; output goes to stderr (line 2969)

## Endpoints by Category

**220 total endpoints** across 22 categories. Largest: Ecommerce (49), Subscriber (40), Sending (21). See README.md for full table.

## Integration Methods

### Get User/Workspace Info
```bash
GET /me  # Returns user info with ID 91539
GET /team-members  # Returns workspace members
```

### Dropi Integration
The field ID `915488` in Dropi is typically a **Store ID** or **Account ID** that uniquely identifies your store.

**Note**: This is a pure wrapper. All business logic and validation happens on the Chatea Pro API side.
