#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const THIEVE_API = "https://us-central1-thieve-co.cloudfunctions.net/api/ali/image/search";
const TIMEOUT_MS = 15000;
const MAX_RESULTS = 8;

function normalizePrice(item) {
  if (item.price?.sale) return String(item.price.sale);
  if (item.price?.low) return String(item.price.low);
  if (item.price) return String(item.price);
  return "0";
}

function normalizeOrders(item) {
  if (item.orders) return String(item.orders);
  if (item.orderCount) return String(item.orderCount);
  return "0";
}

function normalizeRating(item) {
  if (item.rating) return String(item.rating);
  if (item.aggregateRating?.ratingValue) return String(item.aggregateRating.ratingValue);
  return "";
}

function normalizeImageUrl(item) {
  if (item.imageUrl) return item.imageUrl;
  if (item.featureImage) return item.featureImage;
  if (item.images?.[0]?.url) return item.images[0].url;
  return "";
}

function normalizeItem(raw) {
  return {
    productUrl: raw.productUrl || raw.url || "",
    imageUrl: normalizeImageUrl(raw),
    title: raw.title || raw.name || "",
    price: normalizePrice(raw),
    orders: normalizeOrders(raw),
    rating: normalizeRating(raw),
  };
}

async function searchAliExpress(imageUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${THIEVE_API}?imageUrl=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(url, { signal: controller.signal });

    if (res.status !== 200) {
      return [];
    }

    const data = await res.json();
    const items = (data.items || []).slice(0, MAX_RESULTS);
    return items.map(normalizeItem);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const TOOLS = [
  {
    name: "aliexpress_image_search",
    description: "Search for products on AliExpress using an image URL. Returns up to 8 matching products with title, price, image, product URL, order count, and rating. Uses the Thieve.co visual search API (no API key required).",
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "Public URL of the product image to search with. Must be accessible from the internet (no localhost or expired signed URLs).",
        },
      },
      required: ["imageUrl"],
    },
  },
];

const server = new Server(
  {
    name: "aliexpress-image-search-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    return { content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }], isError: true };
  }
  try {
    const args = request.params.arguments || {};
    const result = await searchAliExpress(args.imageUrl);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AliExpress Image Search MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
