#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ─── Import chateapro tools from shared module ───
import { apiRequest as chateaApiRequest, TOOLS as CHATEAPRO_TOOLS } from "../chateapro-mcp-server/tools.js";

// ─── Configuration ───
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || "";
const THIEVE_API = "https://us-central1-thieve-co.cloudfunctions.net/api/ali/image/search";
const TIMEOUT_MS = 15000;
const MAX_RESULTS = 8;

// ─── Brave Search API Helpers ───
const BRAVE_BASE = "https://api.search.brave.com";

async function braveApiRequest(endpoint, params) {
  const url = new URL(`${BRAVE_BASE}${endpoint}`);
  const queryParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      if (k === "q") queryParams.set("q", String(v));
      else if (k === "result_filter" && Array.isArray(v)) queryParams.set(k, v.join(","));
      else queryParams.set(k, String(v));
    }
  }
  const fullUrl = url.toString() + "?" + queryParams.toString();
  const res = await fetch(fullUrl, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function formatWebResults(web) {
  return (web?.results || []).map(({ url, title, description, extra_snippets }) => ({
    url, title, description, extra_snippets,
  }));
}

function formatFAQ(faq) {
  return (faq?.results || []).map(({ question, answer, title, url }) => ({
    question, answer, title, url,
  }));
}

function formatDiscussions(discussions) {
  return (discussions?.results || []).map(({ url, data }) => ({
    mutated_by_goggles: discussions?.mutated_by_goggles, url, data,
  }));
}

function formatNewsResults(news) {
  return (news?.results || []).map(({ source, breaking, is_live, age, url, title, description, extra_snippets }) => ({
    mutated_by_goggles: news?.mutated_by_goggles,
    source, breaking, is_live, age, url, title, description, extra_snippets,
  }));
}

function formatVideoResults(videos) {
  return (videos?.results || []).map(({ url, age, title, description, video, thumbnail }) => ({
    mutated_by_goggles: videos?.mutated_by_goggles,
    url, title, description, age,
    thumbnail_url: thumbnail?.src,
    duration: video?.duration,
    view_count: video?.views,
    creator: video?.creator,
    publisher: video?.publisher,
    tags: video?.tags,
  }));
}

function formatOpeningHours(openingHours) {
  if (!openingHours) return undefined;
  const today = openingHours.current_day || [];
  const response = {};
  const dayHours = [
    [`today (${today[0]?.full_name?.toLowerCase()})`, today.map(({ opens, closes }) => `${opens}-${closes}`)],
  ];
  for (let parts of openingHours.days || []) {
    if (!Array.isArray(parts)) parts = [parts];
    for (const { full_name, opens, closes } of parts) {
      const dayName = full_name?.toLowerCase();
      const existing = dayHours.find(([name]) => name === dayName);
      existing ? existing[1].push(`${opens}-${closes}`) : dayHours.push([dayName, [`${opens}-${closes}`]]);
    }
  }
  for (const [name, hours] of dayHours) response[name] = hours.join(", ");
  return response;
}

// ─── AliExpress Image Search ───
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
    if (res.status !== 200) return [];
    const data = await res.json();
    return (data.items || []).slice(0, MAX_RESULTS).map(normalizeItem);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ─── Tools Registry ───
const ALL_TOOLS = [];

// AliExpress tool
ALL_TOOLS.push({
  name: "aliexpress_image_search",
  description: "Search for products on AliExpress using an image URL. Returns up to 8 matching products with title, price, image, product URL, order count, and rating.",
  inputSchema: {
    type: "object",
    properties: {
      imageUrl: { type: "string", description: "Public URL of the product image." },
    },
    required: ["imageUrl"],
  },
  handler: async (args) => searchAliExpress(args.imageUrl),
  category: "aliexpress",
});

// Chatea Pro tools (220+)
for (const tool of CHATEAPRO_TOOLS) {
  ALL_TOOLS.push({ ...tool, category: "chateapro" });
}

// Brave Search tools (only if API key is set)
if (BRAVE_API_KEY) {
  ALL_TOOLS.push({
    name: "brave_web_search",
    description: "Performs web searches using the Brave Search API. Returns web results, FAQ, discussions, news, and videos. For local/place queries use brave_local_search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (max 400 chars, 50 words)" },
        count: { type: "integer", description: "Number of results (1-20, default 10)" },
        offset: { type: "integer", description: "Pagination offset (max 9, default 0)" },
        country: { type: "string", description: "Country code (e.g. US, DE, FR). Default US." },
        search_lang: { type: "string", description: "Search language (e.g. en, es, fr)" },
        safesearch: { type: "string", enum: ["off", "moderate", "strict"], description: "Safe search mode" },
        freshness: { type: "string", description: "pd, pw, pm, py or date range YYYY-MM-DDtoYYYY-MM-DD" },
        result_filter: {
          type: "array",
          items: { type: "string", enum: ["discussions", "faq", "news", "videos", "web", "locations"] },
          description: "Result types to include",
        },
        summary: { type: "boolean", description: "Request a summarizer key" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, ...args };
      const data = await braveApiRequest("/res/v1/web/search", params);
      const result = {
        web: data.web ? formatWebResults(data.web) : [],
        faq: data.faq ? formatFAQ(data.faq) : [],
        discussions: data.discussions ? formatDiscussions(data.discussions) : [],
        news: data.news ? formatNewsResults(data.news) : [],
        videos: data.videos ? formatVideoResults(data.videos) : [],
        summarizer: data.summarizer || null,
      };
      return result;
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_image_search",
    description: "Performs an image search using the Brave Search API. For finding pictures of people, places, things, design ideas, and art inspiration.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (max 400 chars, 50 words)" },
        count: { type: "integer", description: "Number of results (1-200, default 50)" },
        country: { type: "string", description: "Country code. Default US." },
        search_lang: { type: "string", description: "Search language. Default en." },
        safesearch: { type: "string", enum: ["off", "strict"], description: "Safe search mode" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, ...args };
      const data = await braveApiRequest("/res/v1/images/search", params);
      return {
        count: data.results?.length || 0,
        might_be_offensive: data.extra?.might_be_offensive,
        results: (data.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          page_fetched: r.page_fetched,
          properties: { url: r.properties?.url, width: r.properties?.width, height: r.properties?.height },
        })),
      };
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_video_search",
    description: "Searches for videos using Brave's Video Search API. Returns video results with metadata.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (max 400 chars, 50 words)" },
        count: { type: "integer", description: "Number of results (1-50, default 20)" },
        offset: { type: "integer", description: "Pagination offset (max 9)" },
        country: { type: "string", description: "Country code. Default US." },
        search_lang: { type: "string", description: "Search language. Default en." },
        safesearch: { type: "string", enum: ["off", "moderate", "strict"] },
        freshness: { type: "string", description: "pd, pw, pm, py or date range" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, ...args };
      const data = await braveApiRequest("/res/v1/videos/search", params);
      return formatVideoResults(data);
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_news_search",
    description: "Searches for news articles using Brave's News Search API. Use for current news, breaking updates, or articles about specific topics.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (max 400 chars, 50 words)" },
        count: { type: "integer", description: "Number of results (1-50, default 20)" },
        offset: { type: "integer", description: "Pagination offset (max 9)" },
        country: { type: "string", description: "Country code. Default US." },
        search_lang: { type: "string", description: "Search language. Default en." },
        safesearch: { type: "string", enum: ["off", "moderate", "strict"] },
        freshness: { type: "string", description: "pd, pw, pm, py or date range" },
        extra_snippets: { type: "boolean" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, ...args };
      const data = await braveApiRequest("/res/v1/news/search", params);
      return formatNewsResults(data);
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_local_search",
    description: "Searches for local businesses and places using Brave's Local Search API. Best for 'near me', specific locations, restaurants, and services. Requires Pro plan.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (max 400 chars, 50 words)" },
        count: { type: "integer", description: "Number of results (1-20, default 10)" },
        country: { type: "string", description: "Country code. Default US." },
        search_lang: { type: "string", description: "Search language. Default en." },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, result_filter: ["web", "locations"], ...args };
      const data = await braveApiRequest("/res/v1/web/search", params);
      if (!data.locations?.results?.length) {
        return { fallback_to_web: formatWebResults(data.web) };
      }
      const ids = data.locations.results.map((poi) => poi.id).slice(0, 20);
      const descData = await braveApiRequest("/res/v1/local/descriptions", { ids });
      return data.locations.results.map((poi) => ({
        name: poi.title,
        price_range: poi.price_range,
        phone: poi.contact?.telephone,
        rating: poi.rating?.ratingValue,
        rating_count: poi.rating?.reviewCount,
        hours: formatOpeningHours(poi.opening_hours),
        description: descData.results?.find(({ id }) => id === poi.id)?.description,
        address: poi.postal_address?.displayAddress,
      }));
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_summarizer",
    description: "Retrieves AI-generated summaries of web search results using Brave's Summarizer API. Requires a key from brave_web_search with summary=true.",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Summarizer key from brave_web_search response" },
        entity_info: { type: "boolean", description: "Include entity information" },
        inline_references: { type: "boolean", description: "Include inline references to source URLs" },
      },
      required: ["key"],
    },
    handler: async (args) => {
      let result = null;
      let attempts = 20;
      while (!result && attempts > 0) {
        try {
          const data = await braveApiRequest("/res/v1/summarizer/search", args);
          if (data.status === "complete") result = data;
        } catch {}
        attempts--;
        if (!result) await new Promise((r) => setTimeout(r, 50));
      }
      if (!result) return { error: "Summary could not be retrieved" };
      return { summary: result.summary || [] };
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_llm_context",
    description: "Retrieves pre-extracted, relevance-ranked web content using Brave's LLM Context API. Optimized for AI agents and RAG pipelines.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        count: { type: "integer", description: "Number of results (1-50)" },
        country: { type: "string", description: "Country code" },
        search_lang: { type: "string", description: "Search language" },
        maximum_number_of_urls: { type: "integer", description: "Max URLs to include (1-50)" },
        maximum_number_of_tokens: { type: "integer", description: "Max tokens (1024-32768)" },
        freshness: { type: "string", description: "pd, pw, pm, py or date range" },
        enable_local: { type: "boolean", description: "Enable local search boost" },
      },
      required: ["query"],
    },
    handler: async (args) => {
      const params = { q: args.query, ...args };
      const data = await braveApiRequest("/res/v1/llm/context", params);
      return data;
    },
    category: "brave",
  });

  ALL_TOOLS.push({
    name: "brave_place_search",
    description: "Searches Brave's Place Search API for POIs, cities, addresses, and streets.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        latitude: { type: "number", description: "Latitude (-90 to 90)" },
        longitude: { type: "number", description: "Longitude (-180 to 180)" },
        location: { type: "string", description: "Location string (e.g. 'san francisco ca united states')" },
        count: { type: "integer", description: "Max results (1-50, default 20)" },
        radius: { type: "number", description: "Search radius in meters" },
        country: { type: "string", description: "Country code" },
        units: { type: "string", enum: ["metric", "imperial"] },
      },
    },
    handler: async (args) => {
      const data = await braveApiRequest("/res/v1/local/place_search", args);
      return data;
    },
    category: "brave",
  });
}

// ─── MCP Server ───
const server = new Server(
  { name: "unified-mcp-server", version: "2.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ALL_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = ALL_TOOLS.find((t) => t.name === request.params.name);
  if (!tool) {
    return { content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }], isError: true };
  }
  try {
    const result = await tool.handler(request.params.arguments || {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const braveStatus = BRAVE_API_KEY ? "enabled" : "disabled (set BRAVE_API_KEY)";
  console.error(`Unified MCP Server running on stdio — ChateaPro + AliExpress + Brave[${braveStatus}]`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
