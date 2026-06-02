const BASE_URL = process.env.CHATEAPRO_API_URL || "https://chateapro.app/api";
const API_TOKEN = process.env.CHATEAPRO_API_TOKEN || "";

async function apiRequest(method, path, query, body) {
  const url = new URL(BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const opts = { method, headers };
  if (body && method !== "GET" && method !== "DELETE") {
    opts.body = JSON.stringify(body);
  }
  if (method === "DELETE" && body) {
    opts.body = JSON.stringify(body);
    opts.method = "POST";
    headers["X-HTTP-Method-Override"] = "DELETE";
  }
  const res = await fetch(url.toString(), opts);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, body: text };
  }
}

const TOOLS = [
  // ─── AGENT GROUP ───
  {
    name: "team_agent_groups",
    description: "[Agent Group] Get list of Agent Groups. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "Number of items" },
        page: { type: "integer", description: "Page number (1-100)" },
        name: { type: "string", description: "Search for agent group name" },
      },
    },
    handler: async (args) => apiRequest("GET", "/team/agent-groups", args),
  },
  {
    name: "team_view_agent_group",
    description: "[Agent Group] Get agent group information and members. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer", description: "Agent Group Id" } },
      required: ["id"],
    },
    handler: async (args) => apiRequest("GET", `/team/agent-group/${args.id}`),
  },
  {
    name: "team_create_agent_group",
    description: "[Agent Group] Create new agent group. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Agent group name" },
        image: { type: "string", description: "Image URL" },
        assign_method: { type: "string", enum: ["random", "least_assigned", "round_robin"], description: "Assignment method" },
        online_first: { type: "integer", enum: [0, 1, 2], description: "0=Default, 1=Online First, 2=Online Only" },
        only_view_assigned_to_me: { type: "integer", enum: [0, 1], description: "0=All Conversations, 1=Only assigned to me" },
      },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/team/create-agent-group", null, args),
  },
  {
    name: "team_update_agent_group",
    description: "[Agent Group] Update agent group. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Agent Group Id" },
        name: { type: "string", description: "Agent group name" },
        image: { type: "string", description: "Image URL" },
        assign_method: { type: "string", enum: ["random", "least_assigned", "round_robin"] },
        online_first: { type: "integer", enum: [0, 1, 2] },
        only_view_assigned_to_me: { type: "integer", enum: [0, 1] },
      },
      required: ["id", "name"],
    },
    handler: async (args) => {
      const { id, ...body } = args;
      return apiRequest("PUT", `/team/update-agent-group/${id}`, null, body);
    },
  },
  {
    name: "team_delete_agent_group",
    description: "[Agent Group] Delete agent group. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer", description: "Agent Group Id" } },
      required: ["id"],
    },
    handler: async (args) => apiRequest("DELETE", `/team/delete-agent-group/${args.id}`),
  },
  {
    name: "team_update_agent_group_users",
    description: "[Agent Group] Update agent group members. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Agent Group Id" },
        members: { type: "array", items: { type: "integer" }, description: "Array of member IDs" },
      },
      required: ["id", "members"],
    },
    handler: async (args) => {
      const { id, ...body } = args;
      return apiRequest("POST", `/team/update-agent-group-users/${id}`, null, body);
    },
  },

  // ─── ECOMMERCE ───
  {
    name: "subscriber_cart",
    description: "[Ecommerce] Get subscriber shopping cart detail. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string", description: "Subscriber user_ns" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("GET", "/subscriber/cart", args),
  },
  {
    name: "subscriber_empty_cart",
    description: "[Ecommerce] Empty subscriber shopping cart items. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string", description: "Subscriber user_ns" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/empty-cart", null, args),
  },
  {
    name: "subscriber_add_to_cart",
    description: "[Ecommerce] Add item to subscriber shopping cart. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        variant_id: { type: "integer", description: "Variant ID" },
        qty: { type: "integer", description: "Quantity" },
      },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-to-cart", null, args),
  },
  {
    name: "subscriber_remove_from_cart",
    description: "[Ecommerce] Remove item from subscriber shopping cart. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        variant_id: { type: "integer", description: "Variant ID" },
      },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-from-cart", null, args),
  },
  {
    name: "subscriber_cart_paid",
    description: "[Ecommerce] Checkout subscriber shopping cart and mark as paid. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        shipping_method: { type: "string", enum: ["pickup", "delivery"] },
        payment_method: { type: "string", enum: ["cash", "card"], description: "cash, card..." },
        reference_no: { type: "string" },
        note: { type: "string" },
        phone: { type: "string", description: "Contact phone" },
        name: { type: "string", description: "Contact name" },
        email: { type: "string", description: "Contact email" },
        address: { type: "string", description: "Shipping address" },
        suburb: { type: "string" },
        state: { type: "string" },
        postcode: { type: "string" },
        country: { type: "string" },
        tracking_no: { type: "string" },
      },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/cart-paid", null, args),
  },
  {
    name: "subscriber_update_order_status",
    description: "[Ecommerce] Update order status. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        order_id: { type: "integer", description: "Order ID" },
        status: { type: "string", enum: ["paid", "ordered", "processing", "shipped", "completed", "cancelled", "refunded"] },
      },
      required: ["user_ns", "order_id", "status"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/update-order-status", null, args),
  },
  {
    name: "shop_discount_codes",
    description: "[Ecommerce] Get list of discount codes. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "Number of items" },
        page: { type: "integer", description: "Page number (1-100)" },
        code: { type: "string", description: "Search for code" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/discount-codes", args),
  },
  {
    name: "shop_discount_code_get_info",
    description: "[Ecommerce] Get discount code info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { codeId: { type: "integer", description: "Discount Code Id" } },
      required: ["codeId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/discount-codes/${args.codeId}/get-info`),
  },
  {
    name: "shop_discount_code_get_info_by_code",
    description: "[Ecommerce] Get discount code info by code. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { code: { type: "string", description: "Discount Code" } },
      required: ["code"],
    },
    handler: async (args) => apiRequest("GET", "/shop/discount-codes/get-info-by-code", args),
  },
  {
    name: "shop_create_discount_code",
    description: "[Ecommerce] Create new discount code. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Discount code" },
        type: { type: "string", enum: ["percentage", "amount", "free_shipping"] },
        discount_percentage: { type: "integer" },
        discount_amount: { type: "number" },
        once_per_order: { type: "integer" },
        min_require: { type: "string", enum: ["none", "price", "qty"] },
        min_price: { type: "number" },
        min_qty: { type: "integer" },
        has_usage_limit: { type: "integer" },
        max_usage_count: { type: "integer" },
        one_per_customer: { type: "integer" },
        start_time: { type: "string", description: "e.g. 2022-12-25 00:00:00" },
        end_time: { type: "string", description: "e.g. 2022-12-27 00:00:00" },
      },
      required: ["code", "type", "start_time", "end_time"],
    },
    handler: async (args) => apiRequest("POST", "/shop/discount-codes/create", null, args),
  },
  {
    name: "shop_update_discount_code",
    description: "[Ecommerce] Update discount code. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        codeId: { type: "integer", description: "Discount Code Id" },
        code: { type: "string" },
        type: { type: "string", enum: ["percentage", "amount", "free_shipping"] },
        discount_percentage: { type: "integer" },
        discount_amount: { type: "number" },
        once_per_order: { type: "integer" },
        min_require: { type: "string", enum: ["none", "price", "qty"] },
        min_price: { type: "number" },
        min_qty: { type: "integer" },
        has_usage_limit: { type: "integer" },
        max_usage_count: { type: "integer" },
        one_per_customer: { type: "integer" },
        start_time: { type: "string" },
        end_time: { type: "string" },
      },
      required: ["codeId"],
    },
    handler: async (args) => {
      const { codeId, ...body } = args;
      return apiRequest("PUT", `/shop/discount-codes/${codeId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_discount_code",
    description: "[Ecommerce] Delete discount code. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { codeId: { type: "integer", description: "Discount Code Id" } },
      required: ["codeId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/discount-codes/${args.codeId}/delete`),
  },
  {
    name: "shop_delete_discount_code_by_code",
    description: "[Ecommerce] Delete discount code by code string. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { code: { type: "string", description: "Discount Code" } },
      required: ["code"],
    },
    handler: async (args) => apiRequest("DELETE", "/shop/discount-codes/delete-by-code", args),
  },
  {
    name: "shop_orders",
    description: "[Ecommerce] Get list of orders. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        limit: { type: "integer", description: "Number of items" },
        page: { type: "integer", description: "Page number (1-100)" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/orders", args),
  },
  {
    name: "shop_order_get_info",
    description: "[Ecommerce] Get order info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { orderId: { type: "integer", description: "Order Id" } },
      required: ["orderId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/orders/${args.orderId}/get-info`),
  },
  {
    name: "shop_create_order",
    description: "[Ecommerce] Create new order for bot user. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string", description: "Subscriber user_ns" },
        status: { type: "string", enum: ["paid", "ordered", "processing", "shipped", "completed", "cancelled", "refunded"] },
        shipping_method: { type: "string", enum: ["pickup", "delivery"] },
        payment_method: { type: "string", enum: ["cash", "card"] },
        reference_no: { type: "string" },
        note: { type: "string" },
        address: { type: "string", description: "Shipping address" },
        suburb: { type: "string" },
        state: { type: "string" },
        postcode: { type: "string" },
        country: { type: "string" },
        tracking_no: { type: "string" },
        items: { type: "array", items: { type: "object" } },
      },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/shop/orders/create", null, args),
  },
  {
    name: "shop_update_order",
    description: "[Ecommerce] Update order. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "integer", description: "Order Id" },
        status: { type: "string", enum: ["paid", "ordered", "processing", "shipped", "completed", "cancelled", "refunded"] },
        shipping_method: { type: "string", enum: ["pickup", "delivery"] },
        payment_method: { type: "string", enum: ["cash", "card"] },
        reference_no: { type: "string" },
        note: { type: "string" },
        address: { type: "string" },
        suburb: { type: "string" },
        state: { type: "string" },
        postcode: { type: "string" },
        country: { type: "string" },
        tracking_no: { type: "string" },
        items: { type: "array", items: { type: "object" } },
      },
      required: ["orderId"],
    },
    handler: async (args) => {
      const { orderId, ...body } = args;
      return apiRequest("PUT", `/shop/orders/${orderId}/update`, null, body);
    },
  },
  {
    name: "shop_products",
    description: "[Ecommerce] Get list of products. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "Number of items" },
        page: { type: "integer", description: "Page number (1-100)" },
        name: { type: "string", description: "Search for product name" },
        product_type_id: { type: "integer", description: "Filter by product type id" },
        vendor_id: { type: "integer", description: "Filter by vendor id" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/products", args),
  },
  {
    name: "shop_product_get_info",
    description: "[Ecommerce] Get product info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "integer", description: "Product Id" } },
      required: ["productId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/products/${args.productId}/get-info`),
  },
  {
    name: "shop_create_product",
    description: "[Ecommerce] Create new product. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Product name" },
        description: { type: "string" },
        image: { type: "string", description: "Image URL" },
        note: { type: "string" },
        status: { type: "string", enum: ["active", "inactive"] },
        type: { type: "string" },
        vendor: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        use_variant: { type: "integer", enum: [0, 1] },
        price: { type: "integer", description: "e.g. 12.99" },
        compare_price: { type: "integer" },
        sku: { type: "string" },
        barcode: { type: "string" },
        track_stock: { type: "integer", enum: [0, 1] },
        allow_no_stock_sell: { type: "integer", enum: [0, 1] },
        qty: { type: "integer" },
        variant_1_name: { type: "string", description: "e.g. color" },
        variant_2_name: { type: "string", description: "e.g. size" },
        variants: { type: "array", items: { type: "object" } },
      },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/shop/products/create", null, args),
  },
  {
    name: "shop_update_product",
    description: "[Ecommerce] Update product info. To update variants use product variant tools. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        name: { type: "string" },
        description: { type: "string" },
        image: { type: "string", description: "Image URL" },
        note: { type: "string" },
        status: { type: "string", enum: ["active", "inactive"] },
        type: { type: "string" },
        vendor: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["productId"],
    },
    handler: async (args) => {
      const { productId, ...body } = args;
      return apiRequest("PUT", `/shop/products/${productId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_product",
    description: "[Ecommerce] Delete product. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "integer", description: "Product Id" } },
      required: ["productId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/products/${args.productId}/delete`),
  },
  {
    name: "shop_product_tags",
    description: "[Ecommerce] Get list of product tags. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "Number of items" },
        page: { type: "integer", description: "Page number (1-100)" },
        name: { type: "string", description: "Search for name" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/product-tags", args),
  },
  {
    name: "shop_product_tag_get_info",
    description: "[Ecommerce] Get product tag info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { tagId: { type: "integer", description: "Tag Id" } },
      required: ["tagId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/product-tags/${args.tagId}/get-info`),
  },
  {
    name: "shop_create_product_tag",
    description: "[Ecommerce] Create new product tag. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Tag name" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/shop/product-tags/create", null, args),
  },
  {
    name: "shop_update_product_tag",
    description: "[Ecommerce] Update product tag name. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        tagId: { type: "integer", description: "Tag Id" },
        name: { type: "string" },
      },
      required: ["tagId"],
    },
    handler: async (args) => {
      const { tagId, ...body } = args;
      return apiRequest("PUT", `/shop/product-tags/${tagId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_product_tag",
    description: "[Ecommerce] Delete product tag. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { tagId: { type: "integer", description: "Tag Id" } },
      required: ["tagId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/product-tags/${args.tagId}/delete`),
  },
  {
    name: "shop_product_types",
    description: "[Ecommerce] Get list of product types. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/product-types", args),
  },
  {
    name: "shop_product_type_get_info",
    description: "[Ecommerce] Get product type info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { typeId: { type: "integer", description: "Type Id" } },
      required: ["typeId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/product-types/${args.typeId}/get-info`),
  },
  {
    name: "shop_create_product_type",
    description: "[Ecommerce] Create new product type. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Type name" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/shop/product-types/create", null, args),
  },
  {
    name: "shop_update_product_type",
    description: "[Ecommerce] Update product type name. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        typeId: { type: "integer", description: "Type Id" },
        name: { type: "string" },
      },
      required: ["typeId"],
    },
    handler: async (args) => {
      const { typeId, ...body } = args;
      return apiRequest("PUT", `/shop/product-types/${typeId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_product_type",
    description: "[Ecommerce] Delete product type. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { typeId: { type: "integer", description: "Type Id" } },
      required: ["typeId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/product-types/${args.typeId}/delete`),
  },
  {
    name: "shop_product_vendors",
    description: "[Ecommerce] Get list of product vendors. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/product-vendors", args),
  },
  {
    name: "shop_product_vendor_get_info",
    description: "[Ecommerce] Get vendor info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { vendorId: { type: "integer", description: "Vendor Id" } },
      required: ["vendorId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/product-vendors/${args.vendorId}/get-info`),
  },
  {
    name: "shop_create_product_vendor",
    description: "[Ecommerce] Create new vendor. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Vendor name" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/shop/product-vendors/create", null, args),
  },
  {
    name: "shop_update_product_vendor",
    description: "[Ecommerce] Update vendor name. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: { type: "integer", description: "Vendor Id" },
        name: { type: "string" },
      },
      required: ["vendorId"],
    },
    handler: async (args) => {
      const { vendorId, ...body } = args;
      return apiRequest("PUT", `/shop/product-vendors/${vendorId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_product_vendor",
    description: "[Ecommerce] Delete vendor. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { vendorId: { type: "integer", description: "Vendor Id" } },
      required: ["vendorId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/product-vendors/${args.vendorId}/delete`),
  },
  {
    name: "shop_business_hours_info",
    description: "[Ecommerce] Get store business hours. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/shop/business-hours/info"),
  },
  {
    name: "shop_update_business_hours",
    description: "[Ecommerce] Update store business hours. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "object" },
          description: "Array of day objects with id(1-7), name(day), option(open/close/open_1/open_2), start, end, start_2, end_2",
        },
      },
      required: ["data"],
    },
    handler: async (args) => apiRequest("PUT", "/shop/business-hours/update", null, args),
  },
  {
    name: "shop_locations",
    description: "[Ecommerce] Get list of locations. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/shop/locations", args),
  },
  {
    name: "shop_location_get_info",
    description: "[Ecommerce] Get location info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { locationId: { type: "integer", description: "Location Id" } },
      required: ["locationId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/locations/${args.locationId}/get-info`),
  },
  {
    name: "shop_create_location",
    description: "[Ecommerce] Create new location. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        address: { type: "string" },
        note: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
      },
      required: ["name", "address", "lat", "lng"],
    },
    handler: async (args) => apiRequest("POST", "/shop/locations/create", null, args),
  },
  {
    name: "shop_update_location",
    description: "[Ecommerce] Update location. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "integer", description: "Location Id" },
        name: { type: "string" },
        address: { type: "string" },
        note: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
      },
      required: ["locationId"],
    },
    handler: async (args) => {
      const { locationId, ...body } = args;
      return apiRequest("PUT", `/shop/locations/${locationId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_location",
    description: "[Ecommerce] Delete location. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { locationId: { type: "integer", description: "Location Id" } },
      required: ["locationId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/locations/${args.locationId}/delete`),
  },
  {
    name: "shop_product_variants",
    description: "[Ecommerce] Get list of product variants. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        limit: { type: "integer" },
        page: { type: "integer" },
      },
      required: ["productId"],
    },
    handler: async (args) => {
      const { productId, ...query } = args;
      return apiRequest("GET", `/shop/products/${productId}/variants`, query);
    },
  },
  {
    name: "shop_product_variant_get_info",
    description: "[Ecommerce] Get product variant info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        variantId: { type: "integer", description: "Variant Id" },
      },
      required: ["productId", "variantId"],
    },
    handler: async (args) => apiRequest("GET", `/shop/products/${args.productId}/variants/${args.variantId}/get-info`),
  },
  {
    name: "shop_create_product_variant",
    description: "[Ecommerce] Create new product variant. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        image: { type: "string" },
        variant_1_value: { type: "string", description: "e.g. blue" },
        variant_2_value: { type: "string", description: "e.g. large" },
        price: { type: "integer", description: "e.g. 12.99" },
        compare_price: { type: "integer" },
        taxable: { type: "integer", enum: [0, 1] },
        sku: { type: "string" },
        barcode: { type: "string" },
        track_stock: { type: "integer", enum: [0, 1] },
        allow_no_stock_sell: { type: "integer", enum: [0, 1] },
        qty: { type: "integer" },
      },
      required: ["productId"],
    },
    handler: async (args) => {
      const { productId, ...body } = args;
      return apiRequest("POST", `/shop/products/${productId}/variants/create`, null, body);
    },
  },
  {
    name: "shop_update_product_variant",
    description: "[Ecommerce] Update product variant info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        variantId: { type: "integer", description: "Variant Id" },
        image: { type: "string" },
        variant_1_value: { type: "string" },
        variant_2_value: { type: "string" },
        price: { type: "integer" },
        compare_price: { type: "integer" },
        taxable: { type: "integer", enum: [0, 1] },
        sku: { type: "string" },
        barcode: { type: "string" },
        track_stock: { type: "integer", enum: [0, 1] },
        allow_no_stock_sell: { type: "integer", enum: [0, 1] },
        qty: { type: "integer" },
      },
      required: ["productId", "variantId"],
    },
    handler: async (args) => {
      const { productId, variantId, ...body } = args;
      return apiRequest("PUT", `/shop/products/${productId}/variants/${variantId}/update`, null, body);
    },
  },
  {
    name: "shop_delete_product_variant",
    description: "[Ecommerce] Delete product variant. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "integer", description: "Product Id" },
        variantId: { type: "integer", description: "Variant Id" },
      },
      required: ["productId", "variantId"],
    },
    handler: async (args) => apiRequest("DELETE", `/shop/products/${args.productId}/variants/${args.variantId}/delete`),
  },

  // ─── FACEBOOK UTILITY MESSAGE TEMPLATE ───
  {
    name: "facebook_utility_message_template_list",
    description: "[FB Utility] List Facebook utility message templates. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string", description: "Search for template name" },
      },
    },
    handler: async (args) => apiRequest("POST", "/facebook-utility-message-template/list", args),
  },
  {
    name: "facebook_utility_message_template_create",
    description: "[FB Utility] Create Facebook utility message template. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true,
    },
    handler: async (args) => apiRequest("POST", "/facebook-utility-message-template/create", null, args),
  },
  {
    name: "facebook_utility_message_template_delete",
    description: "[FB Utility] Delete Facebook utility message template. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Template name" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/facebook-utility-message-template/delete", null, args),
  },
  {
    name: "facebook_utility_message_template_sync",
    description: "[FB Utility] Sync Facebook utility message templates. Scope: Manage Flow.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("POST", "/facebook-utility-message-template/sync"),
  },

  // ─── FLOW ───
  {
    name: "flow_subflows",
    description: "[Flow] Get list of sub flows. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string", description: "Search for sub flow name" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/subflows", args),
  },
  {
    name: "flow_delete_sub_flow",
    description: "[Flow] Delete sub flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { sub_flow_ns: { type: "string", description: "Sub flow namespace" } },
      required: ["sub_flow_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-sub-flow", null, args),
  },
  {
    name: "flow_bot_users_count",
    description: "[Flow] Get count of bot users status. Scope: Manage Flow.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/flow/bot-users-count"),
  },
  {
    name: "flow_agents",
    description: "[Flow] Get list of agents in flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
        role: { type: "string", enum: ["owner", "admin", "member", "agent"] },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/agents", args),
  },
  {
    name: "flow_template_installs",
    description: "[Flow] Get list of template installs in this flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "integer" }, page: { type: "integer" } },
    },
    handler: async (args) => apiRequest("GET", "/flow/template-installs", args),
  },
  {
    name: "flow_set_default_start_flow",
    description: "[Flow] Set default bot start flow. Use 'main' to reset to main flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { sub_flow_ns: { type: "string", description: "Sub flow namespace or 'main'" } },
      required: ["sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/flow/set-default-start-flow", null, args),
  },
  {
    name: "flow_set_web_chat_widget_default_start_flow",
    description: "[Flow] Set default start flow for web chat widget. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { sub_flow_ns: { type: "string", description: "Sub flow namespace or 'main'" } },
      required: ["sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/flow/set-web-chat-widget-default-start-flow", null, args),
  },
  {
    name: "flow_set_audio_transcription",
    description: "[Flow] Set audio transcription model. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        stt_model: { type: "string", enum: ["none", "whisper-1", "gpt-4o-transcribe", "gpt-4o-mini-transcribe", "whisper-large-v3-turbo", "gemini-2.5-flash", "gemini-3-flash-preview"] },
      },
      required: ["stt_model"],
    },
    handler: async (args) => apiRequest("POST", "/flow/settings/set-audio-transcription", null, args),
  },
  {
    name: "flow_get_default_ai_provider",
    description: "[Flow] Get default AI provider and model. Scope: Manage Flow.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/flow/settings/get-default-ai-provider"),
  },
  {
    name: "flow_set_default_ai_provider",
    description: "[Flow] Set default AI provider and model. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        ai_provider: { type: "string", enum: ["openai", "deepseek", "xai", "claude", "gemini", "groq", "ainvented"] },
        ai_model: { type: "string", description: "e.g. gpt-4o-mini" },
      },
      required: ["ai_provider"],
    },
    handler: async (args) => apiRequest("POST", "/flow/settings/set-default-ai-provider", null, args),
  },
  {
    name: "flow_inbound_webhooks",
    description: "[Flow] Get list of inbound webhooks by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/inbound-webhooks", args),
  },
  {
    name: "flow_chat_button_widgets",
    description: "[Flow] Get list of chat button widgets. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        code: { type: "string", description: "Filter by widget code" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/chat-button-widgets", args),
  },

  // ─── FLOW AI HUB ───
  {
    name: "flow_ai_agents",
    description: "[AI Hub] Get list of AI agents by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        ai_agent_ns: { type: "string" },
        ai_provider: { type: "string", enum: ["openai", "openai-responses", "deepseek", "xai", "xai-responses", "claude", "gemini", "groq", "ainvented"] },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/ai-agents", args),
  },
  {
    name: "flow_update_ai_agent_provider",
    description: "[AI Hub] Update AI Agent provider and model. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        ai_agent_ns: { type: "string", description: "AI Agent namespace" },
        ai_provider: { type: "string", enum: ["openai", "openai-responses", "deepseek", "xai", "xai-responses", "claude", "gemini", "groq", "ainvented"] },
        ai_model: { type: "string", description: "e.g. gpt-4o-mini" },
        max_tokens: { type: "integer" },
      },
      required: ["ai_agent_ns"],
    },
    handler: async (args) => apiRequest("POST", "/flow/update-ai-agent-provider", null, args),
  },
  {
    name: "flow_ai_tasks",
    description: "[AI Hub] Get list of AI tasks by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        ai_task_ns: { type: "string" },
        ai_provider: { type: "string", enum: ["openai", "deepseek", "xai", "claude", "gemini", "groq", "ainvented"] },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/ai-tasks", args),
  },
  {
    name: "flow_update_ai_task_provider",
    description: "[AI Hub] Update AI Task provider and model. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        ai_task_ns: { type: "string", description: "AI Task namespace" },
        ai_provider: { type: "string", enum: ["openai", "deepseek", "xai", "claude", "gemini", "groq", "ainvented"] },
        ai_model: { type: "string" },
        max_tokens: { type: "integer" },
      },
      required: ["ai_task_ns"],
    },
    handler: async (args) => apiRequest("POST", "/flow/update-ai-task-provider", null, args),
  },

  // ─── FLOW BOT FIELD ───
  {
    name: "flow_bot_fields",
    description: "[Bot Field] Get list of bot fields by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/bot-fields", args),
  },
  {
    name: "flow_create_bot_field",
    description: "[Bot Field] Create new bot field. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true,
    },
    handler: async (args) => apiRequest("POST", "/flow/create-bot-field", null, args),
  },
  {
    name: "flow_set_bot_field",
    description: "[Bot Field] Update bot field value by var_ns. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        var_ns: { type: "string", description: "Bot field namespace" },
        value: { type: "string", description: "Bot field value" },
      },
      required: ["var_ns", "value"],
    },
    handler: async (args) => apiRequest("PUT", "/flow/set-bot-field", null, args),
  },
  {
    name: "flow_set_bot_field_by_name",
    description: "[Bot Field] Update bot field value by field name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Bot field name" },
        value: { type: "string" },
      },
      required: ["name", "value"],
    },
    handler: async (args) => apiRequest("PUT", "/flow/set-bot-field-by-name", null, args),
  },
  {
    name: "flow_set_bot_fields",
    description: "[Bot Field] Update multiple bot fields (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "object" }, description: "Array of {var_ns, value}" },
      },
      required: ["data"],
    },
    handler: async (args) => apiRequest("PUT", "/flow/set-bot-fields", null, args),
  },
  {
    name: "flow_set_bot_fields_by_name",
    description: "[Bot Field] Update multiple bot fields by name (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "object" }, description: "Array of {name, value}" },
      },
      required: ["data"],
    },
    handler: async (args) => apiRequest("PUT", "/flow/set-bot-fields-by-name", null, args),
  },
  {
    name: "flow_delete_bot_field",
    description: "[Bot Field] Delete bot field by var_ns. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { var_ns: { type: "string" } },
      required: ["var_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-bot-field", null, args),
  },
  {
    name: "flow_delete_bot_field_by_name",
    description: "[Bot Field] Delete bot field by name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-bot-field-by-name", null, args),
  },

  // ─── FLOW CONVERSATION ───
  {
    name: "flow_agent_activity_log_data",
    description: "[Conversation] Get flow agent activity log data. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        agent_id: { type: "integer" },
        conv_id: { type: "integer" },
        action: { type: "string", enum: ["open", "close", "assign", "reply", "note", "pending", "spam", "invalid", "add_collaborator", "remove_collaborator", "subscribe_to_bot", "unsubscribe_from_bot", "opt_in_sms", "opt_out_sms", "opt_in_email", "opt_out_email"] },
        source_type: { type: "string", enum: ["agent", "bot", "bot_user", "api", "webhook"] },
        start_time: { type: "integer", description: "Unix timestamp" },
        end_time: { type: "integer", description: "Unix timestamp" },
        limit: { type: "integer", description: "1-1000" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/agent-activity-log/data", args),
  },
  {
    name: "flow_conversations_data",
    description: "[Conversation] Get closed conversations data. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        start_time: { type: "integer", description: "Unix timestamp" },
        end_time: { type: "integer", description: "Unix timestamp" },
        start_id: { type: "integer" },
        limit: { type: "integer", description: "1-1000" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/conversations/data", args),
  },

  // ─── FLOW CUSTOM EVENTS ───
  {
    name: "flow_custom_events",
    description: "[Custom Events] Get list of custom events by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/custom-events", args),
  },
  {
    name: "flow_custom_events_summary",
    description: "[Custom Events] Get custom event summary. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["yesterday", "last_7_days", "last_week", "last_30_days", "last_month", "last_3_months"] },
        event_ns: { type: "string", description: "Custom event namespace" },
      },
      required: ["event_ns"],
    },
    handler: async (args) => apiRequest("GET", "/flow/custom-events/summary", args),
  },
  {
    name: "flow_custom_events_data",
    description: "[Custom Events] Get custom event data. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        start_time: { type: "integer", description: "Unix timestamp" },
        end_time: { type: "integer", description: "Unix timestamp" },
        event_ns: { type: "string", description: "Custom event namespace" },
        start_id: { type: "integer" },
        limit: { type: "integer", description: "1-100" },
      },
      required: ["event_ns"],
    },
    handler: async (args) => apiRequest("GET", "/flow/custom-events/data", args),
  },

  // ─── FLOW SEGMENT ───
  {
    name: "flow_segments",
    description: "[Segment] Get list of segments by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/segments", args),
  },

  // ─── FLOW TAG ───
  {
    name: "flow_tags",
    description: "[Tag] Get list of tags by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/tags", args),
  },
  {
    name: "flow_create_tag",
    description: "[Tag] Create new tag. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/flow/create-tag", null, args),
  },
  {
    name: "flow_delete_tag",
    description: "[Tag] Delete tag by namespace. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { tag_ns: { type: "string" } },
      required: ["tag_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-tag", null, args),
  },
  {
    name: "flow_delete_tag_by_name",
    description: "[Tag] Delete tag by name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-tag-by-name", null, args),
  },

  // ─── FLOW USER FIELD ───
  {
    name: "flow_user_fields",
    description: "[User Field] Get list of user fields by flow. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow/user-fields", args),
  },
  {
    name: "flow_create_user_field",
    description: "[User Field] Create new user field. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true,
    },
    handler: async (args) => apiRequest("POST", "/flow/create-user-field", null, args),
  },
  {
    name: "flow_update_user_field",
    description: "[User Field] Update user field name or display_type. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        var_ns: { type: "string" },
        name: { type: "string" },
        display_type: { type: "string", enum: ["default", "pin", "hidden"] },
      },
      required: ["var_ns"],
    },
    handler: async (args) => apiRequest("POST", "/flow/update-user-field", null, args),
  },
  {
    name: "flow_delete_user_field",
    description: "[User Field] Delete user field by namespace. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { var_ns: { type: "string" } },
      required: ["var_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-user-field", null, args),
  },
  {
    name: "flow_delete_user_field_by_name",
    description: "[User Field] Delete user field by name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/flow/delete-user-field-by-name", null, args),
  },

  // ─── INTEGRATION ───
  {
    name: "integration_get_shopify",
    description: "[Integration] Get Shopify integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/shopify"),
  },
  {
    name: "integration_update_shopify",
    description: "[Integration] Update Shopify integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "xxx.myshopify.com" },
        api_key: { type: "string", description: "API key or Client ID" },
        token: { type: "string", description: "Access Token or Client Secret" },
        wait_time: { type: "integer", description: "Abandoned cart wait time (minutes, default 30)" },
      },
      required: ["url", "api_key", "token"],
    },
    handler: async (args) => apiRequest("POST", "/integration/shopify", null, args),
  },
  {
    name: "integration_clear_shopify",
    description: "[Integration] Clear Shopify integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/shopify"),
  },
  {
    name: "integration_get_woocommerce",
    description: "[Integration] Get WooCommerce integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/woocommerce"),
  },
  {
    name: "integration_update_woocommerce",
    description: "[Integration] Update WooCommerce integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Store URL" },
        api_key: { type: "string", description: "API consumer key" },
        token: { type: "string", description: "API consumer secret" },
      },
      required: ["url", "api_key", "token"],
    },
    handler: async (args) => apiRequest("POST", "/integration/woocommerce", null, args),
  },
  {
    name: "integration_clear_woocommerce",
    description: "[Integration] Clear WooCommerce integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/woocommerce"),
  },
  {
    name: "integration_get_dropi",
    description: "[Integration] Get Dropi integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/dropi"),
  },
  {
    name: "integration_update_dropi",
    description: "[Integration] Update Dropi integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "API URL" },
        api_key: { type: "string", description: "API key" },
      },
      required: ["url", "api_key"],
    },
    handler: async (args) => apiRequest("POST", "/integration/dropi", null, args),
  },
  {
    name: "integration_clear_dropi",
    description: "[Integration] Clear Dropi integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/dropi"),
  },
  {
    name: "integration_get_meta_conversions_api",
    description: "[Integration] Get Meta Conversions API integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/meta-conversions-api"),
  },
  {
    name: "integration_update_meta_conversions_api",
    description: "[Integration] Update Meta Conversions API integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string", description: "Access Token" },
        dataset_id: { type: "string", description: "Dataset Id" },
      },
      required: ["token", "dataset_id"],
    },
    handler: async (args) => apiRequest("POST", "/integration/meta-conversions-api", null, args),
  },
  {
    name: "integration_clear_meta_conversions_api",
    description: "[Integration] Clear Meta Conversions API integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/meta-conversions-api"),
  },
  {
    name: "integration_get_openai",
    description: "[Integration] Get OpenAI integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/openai"),
  },
  {
    name: "integration_update_openai",
    description: "[Integration] Update OpenAI integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        api_key: { type: "string", description: "API Key" },
        org_id: { type: "string", description: "Organization Id" },
      },
      required: ["api_key"],
    },
    handler: async (args) => apiRequest("POST", "/integration/openai", null, args),
  },
  {
    name: "integration_clear_openai",
    description: "[Integration] Clear OpenAI integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/openai"),
  },
  {
    name: "integration_get_s3storage",
    description: "[Integration] Get S3 Storage integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/integration/s3storage"),
  },
  {
    name: "integration_update_s3storage",
    description: "[Integration] Update S3 Storage integration config. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Endpoint URL" },
        api_key: { type: "string", description: "Key" },
        secret: { type: "string", description: "Secret" },
        bucket: { type: "string", description: "Bucket Name" },
        region: { type: "string", description: "Region" },
      },
      required: ["url", "api_key", "secret", "bucket"],
    },
    handler: async (args) => apiRequest("POST", "/integration/s3storage", null, args),
  },
  {
    name: "integration_clear_s3storage",
    description: "[Integration] Clear S3 Storage integration config. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("DELETE", "/integration/s3storage"),
  },
  {
    name: "installed_mini_app_list",
    description: "[Integration] Get list of installed mini apps. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        title: { type: "string", description: "Search for app title" },
      },
    },
    handler: async (args) => apiRequest("GET", "/installed-mini-app/list", args),
  },
  {
    name: "installed_mini_app_update_api_key",
    description: "[Integration] Update mini app API key. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        app_id: { type: "integer", description: "Mini App Id" },
        api_key: { type: "string" },
      },
      required: ["app_id"],
    },
    handler: async (args) => {
      const { app_id, ...body } = args;
      return apiRequest("POST", `/installed-mini-app/update-api-key/${app_id}`, null, body);
    },
  },

  // ─── MINI-APP ───
  {
    name: "subscriber_app_trigger",
    description: "[Mini-App] Trigger an app event on subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        trigger_name: { type: "string" },
        context: { type: "object" },
      },
      required: ["user_ns", "trigger_name"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/app-trigger", null, args),
  },

  // ─── OPENAI EMBEDDINGS ───
  {
    name: "openai_embeddings_list",
    description: "[OpenAI] Get list of OpenAI Embeddings. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        heading: { type: "string" },
        text: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/openai-embeddings", args),
  },
  {
    name: "openai_embedding_get_info",
    description: "[OpenAI] Get embedding info. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer", description: "Embedding Id" } },
      required: ["id"],
    },
    handler: async (args) => apiRequest("GET", `/openai-embeddings/${args.id}/get-info`),
  },
  {
    name: "openai_embedding_create",
    description: "[OpenAI] Create new embedding. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string" },
        heading: { type: "string" },
        text: { type: "string" },
      },
      required: ["heading", "text"],
    },
    handler: async (args) => apiRequest("POST", "/openai-embeddings/create", null, args),
  },
  {
    name: "openai_embedding_update",
    description: "[OpenAI] Update embedding heading and text. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Embedding Id" },
        type: { type: "string" },
        heading: { type: "string" },
        text: { type: "string" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const { id, ...body } = args;
      return apiRequest("PUT", `/openai-embeddings/${id}/update`, null, body);
    },
  },
  {
    name: "openai_embedding_delete",
    description: "[OpenAI] Delete embedding. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer", description: "Embedding Id" } },
      required: ["id"],
    },
    handler: async (args) => apiRequest("DELETE", `/openai-embeddings/${args.id}/delete`),
  },
  {
    name: "openai_embeddings_import",
    description: "[OpenAI] Import OpenAI Embeddings (max 100, heading max 50 chars, text max 1000 chars). Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        rows: { type: "array", items: { type: "object" }, description: "Array of {heading, text, type?}" },
      },
      required: ["rows"],
    },
    handler: async (args) => apiRequest("POST", "/openai-embeddings/import", null, args),
  },
  {
    name: "openai_embeddings_generate",
    description: "[OpenAI] Regenerate embeddings. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("POST", "/openai-embeddings/generate"),
  },

  // ─── SENDING ───
  {
    name: "subscriber_send_main_flow",
    description: "[Sending] Send main flow to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-main-flow", null, args),
  },
  {
    name: "subscriber_send_sub_flow",
    description: "[Sending] Send sub flow to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        sub_flow_ns: { type: "string" },
      },
      required: ["user_ns", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-sub-flow", null, args),
  },
  {
    name: "subscriber_send_sub_flow_by_flow_name",
    description: "[Sending] Send sub flow to subscriber by flow name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        flow_name: { type: "string" },
      },
      required: ["user_ns", "flow_name"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-sub-flow-by-flow-name", null, args),
  },
  {
    name: "subscriber_send_sub_flow_by_user_id",
    description: "[Sending] Send sub flow to subscriber by user_id. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        sub_flow_ns: { type: "string" },
      },
      required: ["user_id", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-sub-flow-by-user-id", null, args),
  },
  {
    name: "subscriber_broadcast",
    description: "[Sending] Broadcast sub flow by user_ns list (up to 200). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns_list: { type: "string", description: "Comma-separated user_ns, up to 200" },
        sub_flow_ns: { type: "string" },
        type: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP_TEMPLATE", "FACEBOOK_NOTIFICATION"] },
        scheduled_time: { type: "integer", description: "Unix timestamp, leave empty to send now" },
        max_per_minute: { type: "integer", description: "Rate limit, default 60" },
      },
      required: ["user_ns_list", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast", null, args),
  },
  {
    name: "subscriber_broadcast_by_user_id",
    description: "[Sending] Broadcast sub flow by user_ids (up to 200). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id_list: { type: "string", description: "Comma-separated user_ids, up to 200" },
        sub_flow_ns: { type: "string" },
        type: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP_TEMPLATE", "FACEBOOK_NOTIFICATION"] },
        scheduled_time: { type: "integer", description: "Unix timestamp" },
        max_per_minute: { type: "integer", description: "Rate limit, default 60" },
      },
      required: ["user_id_list", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-by-user-id", null, args),
  },
  {
    name: "subscriber_broadcast_whatsapp_template_by_user_id",
    description: "[Sending] Broadcast WhatsApp template by user_ids. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id_list: { type: "string", description: "Comma-separated user_ids, up to 200" },
        wa_template: { type: "object", description: "WhatsApp template object" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
      },
      required: ["user_id_list", "wa_template"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-whatsapp-template-by-user-id", null, args),
  },
  {
    name: "subscriber_broadcast_facebook_utility_template_by_user_id",
    description: "[Sending] Broadcast Facebook utility message template by user_ids. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id_list: { type: "string" },
        facebook_utility_message_template: { type: "object" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
      },
      required: ["user_id_list", "facebook_utility_message_template"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-facebook-utility-message-template-by-user-id", null, args),
  },
  {
    name: "subscriber_broadcast_by_tag",
    description: "[Sending] Broadcast sub flow by tags (up to 10 tag ns). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string" }, description: "Array of tag ns, up to 10" },
        exclude_tags: { type: "array", items: { type: "string" }, description: "Array of tag ns to exclude" },
        sub_flow_ns: { type: "string" },
        name: { type: "string", description: "Broadcast name" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
        type: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP_TEMPLATE", "FACEBOOK_NOTIFICATION"] },
        message_tag: { type: "string", enum: ["CONFIRMED_EVENT_UPDATE", "POST_PURCHASE_UPDATE", "ACCOUNT_UPDATE", "NON_PROMOTIONAL_SUBSCRIPTION"] },
        user_fields: { type: "array", items: { type: "object" }, description: "Up to 10 user fields" },
      },
      required: ["tags", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-by-tag", null, args),
  },
  {
    name: "subscriber_broadcast_whatsapp_template_by_tag",
    description: "[Sending] Broadcast WhatsApp template by tags. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string" } },
        exclude_tags: { type: "array", items: { type: "string" } },
        wa_template: { type: "object" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
      },
      required: ["tags", "wa_template"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-whatsapp-template-by-tag", null, args),
  },
  {
    name: "subscriber_broadcast_facebook_utility_template_by_tag",
    description: "[Sending] Broadcast Facebook utility message template by tags. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string" } },
        exclude_tags: { type: "array", items: { type: "string" } },
        facebook_utility_message_template: { type: "object" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
      },
      required: ["tags", "facebook_utility_message_template"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-facebook-utility-message-template-by-tag", null, args),
  },
  {
    name: "subscriber_broadcast_by_segment",
    description: "[Sending] Broadcast sub flow by segments (up to 10). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        segment_ns: { type: "string", description: "Comma-separated segment ns, up to 10" },
        sub_flow_ns: { type: "string" },
        scheduled_time: { type: "integer" },
        max_per_minute: { type: "integer" },
        type: { type: "string", enum: ["EMAIL", "SMS", "WHATSAPP_TEMPLATE", "FACEBOOK_NOTIFICATION"] },
        message_tag: { type: "string", enum: ["CONFIRMED_EVENT_UPDATE", "POST_PURCHASE_UPDATE", "ACCOUNT_UPDATE", "NON_PROMOTIONAL_SUBSCRIPTION"] },
        bot_fields: { type: "array", items: { type: "object" }, description: "Up to 10 bot fields" },
      },
      required: ["segment_ns", "sub_flow_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/broadcast-by-segment", null, args),
  },
  {
    name: "subscriber_send_content",
    description: "[Sending] Send dynamic content to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "object" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-content", null, args),
  },
  {
    name: "subscriber_send_text",
    description: "[Sending] Send text content to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        content: { type: "string", description: "Text message content" },
      },
      required: ["user_ns", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-text", null, args),
  },
  {
    name: "subscriber_send_sms",
    description: "[Sending] Send SMS content to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        content: { type: "string", description: "SMS message content" },
      },
      required: ["user_ns", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-sms", null, args),
  },
  {
    name: "subscriber_send_email",
    description: "[Sending] Send email content to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        content: { type: "string", description: "Email content" },
        subject: { type: "string", description: "Email subject" },
      },
      required: ["user_ns", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-email", null, args),
  },
  {
    name: "subscriber_send_node",
    description: "[Sending] Send node to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        node_ns: { type: "string", description: "Node namespace" },
      },
      required: ["user_ns", "node_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-node", null, args),
  },
  {
    name: "subscriber_send_whatsapp_template",
    description: "[Sending] Send WhatsApp template to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        content: { type: "object" },
      },
      required: ["user_ns", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-whatsapp-template", null, args),
  },
  {
    name: "subscriber_send_facebook_utility_template",
    description: "[Sending] Send Facebook utility message template to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        content: { type: "object" },
      },
      required: ["user_ns", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-facebook-utility-message-template", null, args),
  },
  {
    name: "subscriber_send_facebook_utility_template_by_user_id",
    description: "[Sending] Send Facebook utility message template by user_id. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        content: { type: "object" },
      },
      required: ["user_id", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-facebook-utility-message-template-by-user-id", null, args),
  },
  {
    name: "subscriber_send_whatsapp_template_by_user_id",
    description: "[Sending] Send WhatsApp template to subscriber by user_id. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        create_if_not_found: { type: "string", enum: ["yes", "no"] },
        content: { type: "object" },
        contact: { type: "object" },
      },
      required: ["user_id", "content"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/send-whatsapp-template-by-user-id", null, args),
  },

  // ─── SUBSCRIBER ───
  {
    name: "subscribers_list",
    description: "[Subscriber] Get list of subscribers. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "1-100" },
        page: { type: "integer", description: "1-1000" },
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        is_channel: { type: "string", enum: ["facebook", "instagram", "whatsapp_cloud", "whatsapp", "google", "telegram", "tiktok", "line", "viber", "vk", "wechat", "web", "apichat"] },
        is_opt_in_email: { type: "string", enum: ["yes", "no"] },
        is_opt_in_sms: { type: "string", enum: ["yes", "no"] },
        is_interacted_in_last_24h: { type: "string", enum: ["yes", "no"] },
        is_bot_interacted_in_last_24h: { type: "string", enum: ["yes", "no"] },
        is_last_message_in_last_24h: { type: "string", enum: ["yes", "no"] },
        segment_ns: { type: "string" },
        tag_ns: { type: "string" },
        label_id: { type: "integer" },
        event_ns: { type: "string" },
        user_field_ns: { type: "string" },
        user_field_value: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/subscribers", args),
  },
  {
    name: "subscriber_get_info",
    description: "[Subscriber] Get subscriber info by user_ns. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("GET", "/subscriber/get-info", args),
  },
  {
    name: "subscriber_get_info_by_user_id",
    description: "[Subscriber] Get subscriber info by channel user_id. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_id: { type: "string" } },
      required: ["user_id"],
    },
    handler: async (args) => apiRequest("GET", "/subscriber/get-info-by-user-id", args),
  },
  {
    name: "subscriber_create",
    description: "[Subscriber] Create new subscriber (phone or email required). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        gender: { type: "string", enum: ["male", "female"] },
        image: { type: "string", description: "Profile image URL" },
      },
      required: ["phone", "email"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/create", null, args),
  },
  {
    name: "subscriber_create_many",
    description: "[Subscriber] Create new subscribers (up to 100). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        users: { type: "array", items: { type: "object" }, description: "Array of user objects, up to 100" },
      },
      required: ["users"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/create-many", null, args),
  },
  {
    name: "subscriber_update",
    description: "[Subscriber] Update subscriber data. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        gender: { type: "string", enum: ["male", "female"] },
        image: { type: "string" },
      },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("PUT", "/subscriber/update", null, args),
  },
  {
    name: "subscriber_delete",
    description: "[Subscriber] Delete subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/delete", null, args),
  },
  {
    name: "subscriber_add_tag",
    description: "[Subscriber] Add tag to subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        tag_ns: { type: "string" },
      },
      required: ["user_ns", "tag_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-tag", null, args),
  },
  {
    name: "subscriber_add_tags",
    description: "[Subscriber] Add tags to subscriber (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of tag ns" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-tags", null, args),
  },
  {
    name: "subscriber_add_tag_by_name",
    description: "[Subscriber] Add tag to subscriber by tag name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        tag_name: { type: "string" },
      },
      required: ["user_ns", "tag_name"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-tag-by-name", null, args),
  },
  {
    name: "subscriber_add_tags_by_name",
    description: "[Subscriber] Add tags by tag name to subscriber (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of tag names" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-tags-by-name", null, args),
  },
  {
    name: "subscriber_remove_tag",
    description: "[Subscriber] Remove tag from subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        tag_ns: { type: "string" },
      },
      required: ["user_ns", "tag_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-tag", null, args),
  },
  {
    name: "subscriber_remove_tags",
    description: "[Subscriber] Remove tags from subscriber (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of tag ns" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-tags", null, args),
  },
  {
    name: "subscriber_remove_tag_by_name",
    description: "[Subscriber] Remove tag from subscriber by tag name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        tag_name: { type: "string" },
      },
      required: ["user_ns", "tag_name"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-tag-by-name", null, args),
  },
  {
    name: "subscriber_remove_tags_by_name",
    description: "[Subscriber] Remove tags from subscriber by tag name (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of tag names" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-tags-by-name", null, args),
  },
  {
    name: "subscriber_add_labels_by_name",
    description: "[Subscriber] Add labels by name to subscriber (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of label names" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/add-labels-by-name", null, args),
  },
  {
    name: "subscriber_remove_labels_by_name",
    description: "[Subscriber] Remove labels from subscriber by name (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of label names" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/remove-labels-by-name", null, args),
  },
  {
    name: "subscriber_set_user_field",
    description: "[Subscriber] Set or update subscriber user field value. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        var_ns: { type: "string", description: "User field namespace" },
        value: { type: "string" },
      },
      required: ["user_ns", "var_ns", "value"],
    },
    handler: async (args) => apiRequest("PUT", "/subscriber/set-user-field", null, args),
  },
  {
    name: "subscriber_set_user_fields",
    description: "[Subscriber] Set multiple user field values (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "object" }, description: "Array of {var_ns, value}" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("PUT", "/subscriber/set-user-fields", null, args),
  },
  {
    name: "subscriber_set_user_field_by_name",
    description: "[Subscriber] Set user field value by field name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        field_name: { type: "string" },
        value: { type: "string" },
      },
      required: ["user_ns", "field_name", "value"],
    },
    handler: async (args) => apiRequest("PUT", "/subscriber/set-user-field-by-name", null, args),
  },
  {
    name: "subscriber_set_user_fields_by_name",
    description: "[Subscriber] Set multiple user field values by name (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "object" }, description: "Array of {field_name, value}" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("PUT", "/subscriber/set-user-fields-by-name", null, args),
  },
  {
    name: "subscriber_clear_user_field",
    description: "[Subscriber] Clear subscriber user field value. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        var_ns: { type: "string", description: "User field namespace" },
      },
      required: ["user_ns", "var_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/clear-user-field", null, args),
  },
  {
    name: "subscriber_clear_user_fields",
    description: "[Subscriber] Clear multiple user fields (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of var_ns" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/clear-user-fields", null, args),
  },
  {
    name: "subscriber_clear_user_field_by_name",
    description: "[Subscriber] Clear user field value by field name. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        field_name: { type: "string" },
      },
      required: ["user_ns", "field_name"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/clear-user-field-by-name", null, args),
  },
  {
    name: "subscriber_clear_user_fields_by_name",
    description: "[Subscriber] Clear multiple user fields by name (up to 20). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        data: { type: "array", items: { type: "string" }, description: "Array of field names" },
      },
      required: ["user_ns", "data"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/clear-user-fields-by-name", null, args),
  },
  {
    name: "subscriber_pause_bot",
    description: "[Subscriber] Pause bot automation for subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        minutes: { type: "integer", description: "Minutes to pause" },
      },
      required: ["user_ns", "minutes"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/pause-bot", null, args),
  },
  {
    name: "subscriber_resume_bot",
    description: "[Subscriber] Resume bot automation for subscriber. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/resume-bot", null, args),
  },
  {
    name: "subscriber_move_chat_to",
    description: "[Subscriber] Update chat status. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        status: { type: "string", enum: ["open", "pending", "spam", "done"] },
      },
      required: ["user_ns", "status"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/move-chat-to", null, args),
  },
  {
    name: "subscriber_assign_agent",
    description: "[Subscriber] Assign agent to chat. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        agent_id: { type: "integer" },
      },
      required: ["user_ns", "agent_id"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/assign-agent", null, args),
  },
  {
    name: "subscriber_assign_agent_group",
    description: "[Subscriber] Assign agent group to chat. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        agent_group_id: { type: "integer" },
      },
      required: ["user_ns", "agent_group_id"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/assign-agent-group", null, args),
  },
  {
    name: "subscriber_unassign_agent",
    description: "[Subscriber] Unassign agent from chat. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/unassign-agent", null, args),
  },
  {
    name: "subscriber_subscribe_to_bot",
    description: "[Subscriber] Subscribe to bot. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/subscribe-to-bot", null, args),
  },
  {
    name: "subscriber_unsubscribe_from_bot",
    description: "[Subscriber] Unsubscribe from bot. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/unsubscribe-from-bot", null, args),
  },
  {
    name: "subscriber_opt_in_sms",
    description: "[Subscriber] Opt-in SMS. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/opt-in-sms", null, args),
  },
  {
    name: "subscriber_opt_out_sms",
    description: "[Subscriber] Opt-out SMS. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/opt-out-sms", null, args),
  },
  {
    name: "subscriber_opt_in_email",
    description: "[Subscriber] Opt-in Email. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/opt-in-email", null, args),
  },
  {
    name: "subscriber_opt_out_email",
    description: "[Subscriber] Opt-out Email. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { user_ns: { type: "string" } },
      required: ["user_ns"],
    },
    handler: async (args) => apiRequest("DELETE", "/subscriber/opt-out-email", null, args),
  },
  {
    name: "subscriber_log_custom_event",
    description: "[Subscriber] Log custom event. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        event_name: { type: "string" },
        text_value: { type: "string" },
        price_value: { type: "integer" },
        number_value: { type: "integer" },
      },
      required: ["user_ns", "event_name"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/log-custom-event", null, args),
  },
  {
    name: "subscriber_chat_messages",
    description: "[Subscriber] Get subscriber chat messages. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        user_ns: { type: "string" },
        user_id: { type: "string" },
        include_bot: { type: "integer", description: "1 to include bot messages" },
        include_note: { type: "integer", description: "1 to include agent notes" },
        include_system: { type: "integer", description: "1 to include system messages" },
        msg_type: { type: "string", enum: ["image", "audio", "video", "file"] },
        start_time: { type: "integer", description: "Unix timestamp" },
        end_time: { type: "integer", description: "Unix timestamp" },
        limit: { type: "integer", description: "1-100" },
      },
    },
    handler: async (args) => apiRequest("GET", "/subscriber/chat-messages", args),
  },
  {
    name: "subscriber_chat_messages_by_mids",
    description: "[Subscriber] Get chat messages by multiple mids (up to 100). Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        mids: { type: "array", items: { type: "string" }, description: "Array of message IDs, up to 100" },
      },
      required: ["mids"],
    },
    handler: async (args) => apiRequest("POST", "/subscriber/chat-messages-by-mids", null, args),
  },

  // ─── TEAM LABEL ───
  {
    name: "team_labels",
    description: "[Label] Get list of labels. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/team/labels", args),
  },
  {
    name: "team_create_label",
    description: "[Label] Create new label. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("POST", "/team/create-label", null, args),
  },
  {
    name: "team_delete_label",
    description: "[Label] Delete label by id. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "integer" } },
      required: ["id"],
    },
    handler: async (args) => apiRequest("DELETE", "/team/delete-label", null, args),
  },
  {
    name: "team_delete_label_by_name",
    description: "[Label] Delete label by name. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/team/delete-label-by-name", null, args),
  },

  // ─── TEMPLATE ───
  {
    name: "templates_list",
    description: "[Template] Get list of templates. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/templates", args),
  },
  {
    name: "template_installs",
    description: "[Template] Get list of installs by template ns. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        templateNs: { type: "string", description: "Template namespace" },
        limit: { type: "integer" },
        page: { type: "integer" },
      },
      required: ["templateNs"],
    },
    handler: async (args) => {
      const { templateNs, ...query } = args;
      return apiRequest("GET", `/template/${templateNs}/installs`, query);
    },
  },
  {
    name: "template_generate_one_time_link",
    description: "[Template] Generate template one-time install link (default expires in 30 days). Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        templateNs: { type: "string", description: "Template namespace" },
        days: { type: "integer", description: "Days until expiration, default 30" },
      },
      required: ["templateNs"],
    },
    handler: async (args) => {
      const { templateNs, ...query } = args;
      return apiRequest("POST", `/template/${templateNs}/generate-one-time-link`, query);
    },
  },

  // ─── TICKET LIST ───
  {
    name: "team_ticket_lists",
    description: "[Ticket] Get list of ticket lists. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/team/ticket-lists", args),
  },
  {
    name: "team_ticket_list_fields",
    description: "[Ticket] Get list of ticket list fields. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: { listId: { type: "integer", description: "List Id" } },
      required: ["listId"],
    },
    handler: async (args) => apiRequest("GET", `/team/ticket-lists/${args.listId}/fields`),
  },
  {
    name: "team_ticket_list_items",
    description: "[Ticket] Get list of ticket list items. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "integer", description: "List Id" },
        limit: { type: "integer" },
        page: { type: "integer" },
        title: { type: "string" },
        flow_ns: { type: "string" },
        user_ns: { type: "string" },
      },
      required: ["listId"],
    },
    handler: async (args) => {
      const { listId, ...query } = args;
      return apiRequest("GET", `/team/ticket-lists/${listId}/items`, query);
    },
  },
  {
    name: "team_ticket_list_log_data",
    description: "[Ticket] Get ticket list change log data. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "integer", description: "List Id" },
        start_time: { type: "integer", description: "Unix timestamp" },
        end_time: { type: "integer", description: "Unix timestamp" },
        flow_ns: { type: "string" },
        user_ns: { type: "string" },
        list_item_id: { type: "integer" },
        column_name: { type: "string", enum: ["select1", "select2", "select3", "select4", "select5"] },
        limit: { type: "integer", description: "1-100" },
      },
      required: ["listId"],
    },
    handler: async (args) => {
      const { listId, ...query } = args;
      return apiRequest("GET", `/team/ticket-lists/${listId}/log-data`, query);
    },
  },
  {
    name: "team_create_ticket",
    description: "[Ticket] Create new ticket. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "integer", description: "List Id" },
        title: { type: "string" },
        user_ns: { type: "string" },
        description: { type: "string" },
        assignee: { type: "integer" },
        text1: { type: "string" }, text2: { type: "string" }, text3: { type: "string" }, text4: { type: "string" }, text5: { type: "string" },
        select1: { type: "string" }, select2: { type: "string" }, select3: { type: "string" }, select4: { type: "string" }, select5: { type: "string" },
        number1: { type: "integer" }, number2: { type: "integer" },
        rating1: { type: "integer" }, rating2: { type: "integer" },
        date1: { type: "string", description: "Y-m-d format, e.g. 2024-10-15" },
        date2: { type: "string", description: "Y-m-d format, e.g. 2024-10-15" },
      },
      required: ["listId", "title", "user_ns"],
    },
    handler: async (args) => {
      const { listId, ...body } = args;
      return apiRequest("POST", `/team/ticket-lists/${listId}/create`, null, body);
    },
  },
  {
    name: "team_update_ticket",
    description: "[Ticket] Update a ticket. Include only fields that need to be changed. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "integer", description: "List Id" },
        listItemId: { type: "integer", description: "List Item Id" },
        title: { type: "string" },
        description: { type: "string" },
        assignee: { type: "integer" },
        text1: { type: "string" }, text2: { type: "string" }, text3: { type: "string" }, text4: { type: "string" }, text5: { type: "string" },
        select1: { type: "string" }, select2: { type: "string" }, select3: { type: "string" }, select4: { type: "string" }, select5: { type: "string" },
        number1: { type: "integer" }, number2: { type: "integer" },
        rating1: { type: "integer" }, rating2: { type: "integer" },
        date1: { type: "string" }, date2: { type: "string" },
        comment: { type: "object", description: "Add new comment" },
      },
      required: ["listId", "listItemId"],
    },
    handler: async (args) => {
      const { listId, listItemId, ...body } = args;
      return apiRequest("PUT", `/team/ticket-lists/${listId}/update/${listItemId}`, null, body);
    },
  },
  {
    name: "team_delete_ticket",
    description: "[Ticket] Delete a ticket. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "integer", description: "List Id" },
        listItemId: { type: "integer", description: "List Item Id" },
      },
      required: ["listId", "listItemId"],
    },
    handler: async (args) => apiRequest("DELETE", `/team/ticket-lists/${args.listId}/delete/${args.listItemId}`),
  },

  // ─── USER ───
  {
    name: "user_info",
    description: "[User] Get current user info.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/me"),
  },
  {
    name: "user_change_password",
    description: "[User] Change user password.",
    inputSchema: {
      type: "object",
      properties: {
        current_password: { type: "string" },
        password: { type: "string", description: "At least 8 chars, must contain uppercase, lowercase, number, and symbol" },
        password_confirmation: { type: "string" },
      },
      required: ["current_password", "password", "password_confirmation"],
    },
    handler: async (args) => apiRequest("PUT", "/user/change-password", null, args),
  },
  {
    name: "notifications_recent",
    description: "[User] Get recent notifications and announcements.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/notifications/recent"),
  },
  {
    name: "notification_mark_read",
    description: "[User] Mark notification as read.",
    inputSchema: {
      type: "object",
      properties: { notification_id: { type: "string", description: "Notification UUID" } },
    },
    handler: async (args) => apiRequest("POST", "/notifications/read", null, args),
  },
  {
    name: "announcement_mark_read",
    description: "[User] Mark announcement as read.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("POST", "/announcements/read"),
  },

  // ─── WHATSAPP TEMPLATE ───
  {
    name: "whatsapp_template_list",
    description: "[WhatsApp] List WhatsApp templates. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("POST", "/whatsapp-template/list", args),
  },
  {
    name: "whatsapp_template_create",
    description: "[WhatsApp] Create WhatsApp template. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: true,
    },
    handler: async (args) => apiRequest("POST", "/whatsapp-template/create", null, args),
  },
  {
    name: "whatsapp_template_delete",
    description: "[WhatsApp] Delete WhatsApp template. Scope: Manage Flow.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    handler: async (args) => apiRequest("DELETE", "/whatsapp-template/delete", null, args),
  },
  {
    name: "whatsapp_template_sync",
    description: "[WhatsApp] Sync WhatsApp templates. Scope: Manage Flow.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("POST", "/whatsapp-template/sync"),
  },

  // ─── WORKSPACE ───
  {
    name: "flow_summary",
    description: "[Workspace] Get flow summary analytics. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["yesterday", "last_7_days", "last_week", "last_30_days", "last_month", "last_3_months"] },
        flow_ns: { type: "string", description: "Specific bot namespace" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow-summary", args),
  },
  {
    name: "flow_agent_summary",
    description: "[Workspace] Get flow agent summary analytics. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["yesterday", "last_7_days", "last_week", "last_30_days", "last_month", "last_3_months"] },
        flow_ns: { type: "string" },
      },
    },
    handler: async (args) => apiRequest("GET", "/flow-agent-summary", args),
  },
  {
    name: "team_bot_users",
    description: "[Workspace] Get list of bot users (workspace-wide). Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", description: "1-100" },
        page: { type: "integer", description: "1-1000" },
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        is_channel: { type: "string", enum: ["facebook", "instagram", "whatsapp_cloud", "whatsapp", "google", "telegram", "tiktok", "line", "viber", "vk", "wechat", "web", "apichat"] },
        is_opt_in_email: { type: "string", enum: ["yes", "no"] },
        is_opt_in_sms: { type: "string", enum: ["yes", "no"] },
        is_interacted_in_last_24h: { type: "string", enum: ["yes", "no"] },
        is_bot_interacted_in_last_24h: { type: "string", enum: ["yes", "no"] },
        is_last_message_in_last_24h: { type: "string", enum: ["yes", "no"] },
      },
    },
    handler: async (args) => apiRequest("GET", "/team-bot-users", args),
  },
  {
    name: "team_flows",
    description: "[Workspace] Get list of workspace bots/flows. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string", description: "Search for bot name" },
        type: { type: "string", enum: ["web", "facebook", "instagram", "whatsapp", "whatsapp_cloud", "wechat", "telegram", "google", "slack", "line", "viber", "vk", "voice", "sms", "rcs", "intercom", "jivochat", "chatwoot"] },
      },
    },
    handler: async (args) => apiRequest("GET", "/team-flows", args),
  },
  {
    name: "team_info",
    description: "[Workspace] Get workspace/team info. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/team-info"),
  },
  {
    name: "workspace_settings_channels",
    description: "[Workspace] Get workspace settings - Channels. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/workspace-settings/channels"),
  },
  {
    name: "workspace_settings_update_channels",
    description: "[Workspace] Show/Hide workspace channels. 1=show, 0=hide. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        chat: { type: "integer", enum: [0, 1] },
        facebook: { type: "integer", enum: [0, 1] },
        instagram: { type: "integer", enum: [0, 1] },
        telegram: { type: "integer", enum: [0, 1] },
        slack: { type: "integer", enum: [0, 1] },
        whatsapp: { type: "integer", enum: [0, 1] },
        whatsapp_cloud: { type: "integer", enum: [0, 1] },
        wechat: { type: "integer", enum: [0, 1] },
        voice: { type: "integer", enum: [0, 1] },
        sms: { type: "integer", enum: [0, 1] },
        rcs: { type: "integer", enum: [0, 1] },
        line: { type: "integer", enum: [0, 1] },
        viber: { type: "integer", enum: [0, 1] },
        vk: { type: "integer", enum: [0, 1] },
        intercom: { type: "integer", enum: [0, 1] },
        jivochat: { type: "integer", enum: [0, 1] },
        chatwoot: { type: "integer", enum: [0, 1] },
        tiktok: { type: "integer", enum: [0, 1] },
      },
    },
    handler: async (args) => apiRequest("POST", "/workspace-settings/update-channels", null, args),
  },
  {
    name: "workspace_settings_live_chat_sidebar",
    description: "[Workspace] Get workspace settings - Live Chat Sidebar. Scope: Manage Team.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => apiRequest("GET", "/workspace-settings/live-chat-sidebar"),
  },
  {
    name: "workspace_settings_update_live_chat_sidebar",
    description: "[Workspace] Update live chat sidebar settings. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "string" }, description: "Array of sidebar config values" },
      },
    },
    handler: async (args) => apiRequest("POST", "/workspace-settings/update-live-chat-sidebar", null, args),
  },
  {
    name: "team_members",
    description: "[Workspace] Get list of workspace members. Scope: Manage Team.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        page: { type: "integer" },
        name: { type: "string" },
        role: { type: "string", enum: ["owner", "admin", "member", "agent"] },
      },
    },
    handler: async (args) => apiRequest("GET", "/team-members", args),
  },
];

export { apiRequest, TOOLS };
