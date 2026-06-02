import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DropiClient } from "./client.js";

const client = new DropiClient();

function toText(data: unknown) {
  return JSON.stringify(data, null, 2);
}

const server = new McpServer({
  name: "dropi-mcp-server",
  version: "1.0.0",
});

/* ------------------- Authentication ------------------- */
server.tool(
  "dropi_login",
  "Autentica un usuario de Dropi y retorna un token JWT clásico. Se usa previo a crear una tienda de integración.",
  {
    email: z.string().email().describe("Email del usuario"),
    password: z.string().describe("Contraseña del usuario"),
    white_brand_id: z.string().describe("ID de la marca blanca o token único de la marca blanca"),
  },
  async ({ email, password, white_brand_id }) => {
    const result = await client.login({ email, password, white_brand_id });
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_whoiam",
  "Obtiene la información del usuario autenticado usando la API key de integraciones.",
  {},
  async () => {
    const result = await client.whoiam();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Orders ------------------- */
server.tool(
  "dropi_list_orders",
  "Lista las órdenes del usuario autenticado con paginación y filtros.",
  {
    page: z.number().optional().describe("Número de página"),
    per_page: z.number().optional().describe("Cantidad de items por página (máximo 100)"),
    status: z.string().optional().describe("Filtrar por estado de la orden, ejemplo: PENDIENTE"),
  },
  async ({ page, per_page, status }) => {
    const result = await client.listOrders({ page, per_page, status });
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_create_order",
  "Crea una nueva orden en Dropi.",
  {
    client_name: z.string().describe("Nombre del cliente"),
    client_phone: z.string().describe("Teléfono del cliente"),
    client_address: z.string().describe("Dirección del cliente"),
    city_id: z.number().describe("ID de la ciudad"),
    neighborhood: z.string().optional().describe("Barrio"),
    additional_info: z.string().optional().describe("Información adicional de la dirección"),
    products: z.array(z.object({
      product_id: z.number().describe("ID del producto"),
      quantity: z.number().describe("Cantidad"),
      price: z.number().optional().describe("Precio unitario"),
    })).describe("Lista de productos"),
    payment_method: z.string().optional().describe("Método de pago, ejemplo: CONTRAENTREGA"),
    observations: z.string().optional().describe("Observaciones"),
  },
  async (args) => {
    const result = await client.createOrder(args);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_get_order",
  "Obtiene los detalles de una orden específica por su ID.",
  {
    id: z.number().describe("ID de la orden"),
  },
  async ({ id }) => {
    const result = await client.getOrder(id);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_update_order",
  "Actualiza los datos de una orden existente.",
  {
    id: z.number().describe("ID de la orden"),
    client_name: z.string().optional().describe("Nombre del cliente"),
    client_phone: z.string().optional().describe("Teléfono del cliente"),
    client_address: z.string().optional().describe("Dirección del cliente"),
    observations: z.string().optional().describe("Observaciones"),
  },
  async ({ id, ...body }) => {
    const result = await client.updateOrder(id, body);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_get_order_by_guide",
  "Busca una orden por su número de guía.",
  {
    guide: z.string().describe("Número de guía, ejemplo: DRP123456"),
  },
  async ({ guide }) => {
    const result = await client.getOrderByGuide(guide);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Products ------------------- */
server.tool(
  "dropi_list_products",
  "Lista los productos del usuario con filtros y paginación.",
  {
    page: z.number().optional().describe("Número de página"),
    per_page: z.number().optional().describe("Cantidad por página"),
    search: z.string().optional().describe("Término de búsqueda"),
    category_id: z.number().optional().describe("ID de categoría"),
  },
  async ({ page, per_page, search, category_id }) => {
    const result = await client.listProducts({ page, per_page, search, category_id });
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_create_product",
  "Crea un nuevo producto en el catálogo.",
  {
    name: z.string().describe("Nombre del producto"),
    description: z.string().optional().describe("Descripción del producto"),
    price: z.number().describe("Precio del producto"),
    category_id: z.number().optional().describe("ID de la categoría"),
    stock: z.number().optional().describe("Cantidad en stock"),
  },
  async (args) => {
    const result = await client.createProduct(args);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_get_product_v2",
  "Obtiene los detalles de un producto específico usando la versión optimizada v2.",
  {
    id: z.number().describe("ID del producto"),
  },
  async ({ id }) => {
    const result = await client.getProductV2(id);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_update_product",
  "Actualiza los datos de un producto existente.",
  {
    id: z.number().describe("ID del producto"),
    name: z.string().optional().describe("Nombre del producto"),
    price: z.number().optional().describe("Precio del producto"),
    stock: z.number().optional().describe("Cantidad en stock"),
  },
  async ({ id, ...body }) => {
    const result = await client.updateProduct(id, body);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Warehouses ------------------- */
server.tool(
  "dropi_list_warehouses",
  "Lista las bodegas configuradas para el usuario.",
  {},
  async () => {
    const result = await client.listWarehouses();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_create_warehouse",
  "Crea una nueva bodega para el usuario.",
  {
    name: z.string().describe("Nombre de la bodega"),
    address: z.string().describe("Dirección de la bodega"),
    city_id: z.number().describe("ID de la ciudad"),
    phone: z.string().optional().describe("Teléfono de contacto"),
  },
  async (args) => {
    const result = await client.createWarehouse(args);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_get_warehouse",
  "Obtiene los detalles de una bodega específica.",
  {
    id: z.number().describe("ID de la bodega"),
  },
  async ({ id }) => {
    const result = await client.getWarehouse(id);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Quotations ------------------- */
server.tool(
  "dropi_quote_shipping",
  "Cotiza el envío de una orden con todas las transportadoras habilitadas.",
  {
    ciudad_destino_id: z.number().describe("ID de la ciudad de destino en Dropi"),
    ciudad_destino_cod_dane: z.string().optional().describe("Código DANE/postal de la ciudad destino (requerido para Colombia)"),
    ciudad_destino_name: z.string().optional().describe("Nombre de la ciudad de destino"),
    ciudad_remitente_id: z.number().optional().describe("ID de la ciudad de origen. Opcional: si no se envía se calcula automáticamente desde la bodega más cercana"),
    ciudad_remitente_cod_dane: z.string().optional().describe("Código DANE/postal de la ciudad origen"),
    ciudad_remitente_name: z.string().optional().describe("Nombre de la ciudad de origen"),
    products: z.array(z.object({
      id: z.number().describe("ID del producto en Dropi"),
      name: z.string().optional().describe("Nombre del producto"),
      quantity: z.number().describe("Cantidad de unidades"),
      price: z.number().describe("Precio unitario"),
      weight: z.number().describe("Peso en kilogramos por unidad"),
      type: z.string().describe("Tipo de producto: SIMPLE o VARIABLE"),
    })).describe("Lista de productos a enviar"),
    EnvioConCobro: z.string().describe("Indica si el envío es contra entrega: 'true' o 'false'"),
    dir: z.string().describe("Dirección completa del destinatario"),
    amount: z.number().describe("Valor declarado del envío (monto total a cobrar si es contra entrega)"),
    destination_name: z.string().describe("Nombre completo del destinatario"),
    destination_phone: z.string().describe("Teléfono del destinatario"),
    zip_code: z.string().optional().describe("Código postal. Requerido para MX (5 dígitos), ES (5), RO (6), AR (4)"),
    colonia: z.string().optional().describe("Barrio o colonia. Aplica para Costa Rica y México"),
    warehouse_id: z.number().optional().describe("ID de la bodega de origen. Requerido para ciertos carriers como 99MINUTOS en México"),
    insurance: z.boolean().optional().describe("Indica si se desea cotizar con seguro adicional de envío"),
  },
  async (args) => {
    const body: any = {
      ciudad_destino: {
        id: args.ciudad_destino_id,
        ...(args.ciudad_destino_cod_dane ? { cod_dane: args.ciudad_destino_cod_dane } : {}),
        ...(args.ciudad_destino_name ? { name: args.ciudad_destino_name } : {}),
      },
      products: args.products,
      EnvioConCobro: args.EnvioConCobro,
      dir: args.dir,
      amount: args.amount,
      destination_name: args.destination_name,
      destination_phone: args.destination_phone,
      ...(args.zip_code ? { zip_code: args.zip_code } : {}),
      ...(args.colonia ? { colonia: args.colonia } : {}),
      ...(args.insurance !== undefined ? { insurance: args.insurance } : {}),
    };

    if (args.ciudad_remitente_id !== undefined) {
      body.ciudad_remitente = {
        id: args.ciudad_remitente_id,
        ...(args.ciudad_remitente_cod_dane ? { cod_dane: args.ciudad_remitente_cod_dane } : {}),
        ...(args.ciudad_remitente_name ? { name: args.ciudad_remitente_name } : {}),
      };
    }

    if (args.warehouse_id !== undefined) {
      body.warehouse = { id: args.warehouse_id };
    }

    const result = await client.quoteShipping(body);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- PickUps ------------------- */
server.tool(
  "dropi_list_pickups",
  "Lista las recogidas (pick ups) programadas.",
  {},
  async () => {
    const result = await client.listPickUps();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_create_pickup",
  "Programa una nueva recogida.",
  {
    warehouse_id: z.number().describe("ID de la bodega"),
    pickup_date: z.string().describe("Fecha de recogida (YYYY-MM-DD)"),
  },
  async (args) => {
    const result = await client.createPickUp(args);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Helpers ------------------- */
server.tool(
  "dropi_validate_token",
  "Valida si el token de integración actual es válido y está activo.",
  {},
  async () => {
    const result = await client.validateToken();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_list_categories",
  "Lista las categorías de productos disponibles.",
  {},
  async () => {
    const result = await client.listCategories();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_list_distribution_companies",
  "Lista las empresas transportadoras disponibles.",
  {},
  async () => {
    const result = await client.listDistributionCompanies();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_list_departments_with_cities",
  "Lista todos los departamentos con sus respectivas ciudades.",
  {},
  async () => {
    const result = await client.listDepartmentsWithCities();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_check_city_coverage",
  "Verifica si hay cobertura de envío para una ciudad específica.",
  {
    city_id: z.number().describe("ID de la ciudad"),
  },
  async ({ city_id }) => {
    const result = await client.checkCityCoverage(city_id);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Shops ------------------- */
server.tool(
  "dropi_create_shop",
  "Crea una nueva tienda de integración. Requiere un bearer token obtenido desde dropi_login.",
  {
    bearer_token: z.string().describe("Token JWT obtenido de /integrations/login"),
    name: z.string().describe("Nombre de la tienda"),
    url: z.string().describe("URL de la tienda"),
    email: z.string().email().describe("Email de contacto de la tienda"),
    shop_type: z.string().describe("Tipo de integración, ejemplo: SHOPIFY"),
    shop_type_id: z.number().optional().describe("ID del tipo de integración (opcional)"),
    webhook: z.string().optional().describe("URL del webhook"),
    phone: z.string().optional().describe("Teléfono de contacto"),
    consumer_key: z.string().optional().describe("Consumer key (ej: WooCommerce)"),
    consumer_secret: z.string().optional().describe("Consumer secret (ej: WooCommerce)"),
    change_status_pendiente: z.boolean().optional().describe("Indica si cambia el estado a pendiente"),
    status_pendiente: z.string().optional().describe("Estado pendiente personalizado"),
    update_shipping_guide: z.boolean().optional().describe("Indica si actualiza la guía de envío"),
  },
  async (args) => {
    const { bearer_token, shop_type, shop_type_id, ...rest } = args;
    const body: any = {
      ...rest,
      shop_type: {
        shop_type,
        id: shop_type_id ?? null,
      },
    };
    const result = await client.createShop(body, bearer_token);
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

server.tool(
  "dropi_get_shop_data",
  "Obtiene la información básica de la tienda autenticada (rol del usuario).",
  {},
  async () => {
    const result = await client.getShopData();
    return { content: [{ type: "text", text: toText(result) }] };
  }
);

/* ------------------- Transport ------------------- */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
