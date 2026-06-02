const BASE_URL = process.env.DROPI_BASE_URL || "https://api.dropi.co";
const INTEGRATION_KEY = process.env.DROPI_INTEGRATION_KEY || "";

export class DropiClient {
  private baseUrl: string;
  private integrationKey: string;

  constructor(baseUrl?: string, integrationKey?: string) {
    this.baseUrl = baseUrl || BASE_URL;
    this.integrationKey = integrationKey || INTEGRATION_KEY;
  }

  private async fetch<T>(
    path: string,
    options: RequestInit = {},
    skipIntegrationKey: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (!skipIntegrationKey && this.integrationKey) {
      headers["dropi-integration-key"] = this.integrationKey;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({})) as T;
    if (!res.ok) {
      const err = new Error((data as any)?.message || `HTTP ${res.status}`) as any;
      err.status = res.status;
      err.response = data;
      throw err;
    }
    return data;
  }

  async login(body: { email: string; password: string; white_brand_id: string }) {
    return this.fetch<any>("/integrations/login", { method: "POST", body: JSON.stringify(body) }, true);
  }

  async whoiam() {
    return this.fetch<any>("/integrations/whoiam", { method: "POST" });
  }

  async listOrders(params?: { page?: number; per_page?: number; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return this.fetch<any>(`/integrations/orders/myorders${query}`, { method: "GET" });
  }

  async createOrder(body: any) {
    return this.fetch<any>("/integrations/orders/myorders", { method: "POST", body: JSON.stringify(body) });
  }

  async getOrder(id: number) {
    return this.fetch<any>(`/integrations/orders/myorders/${id}`, { method: "GET" });
  }

  async updateOrder(id: number, body: any) {
    return this.fetch<any>(`/integrations/orders/myorders/${id}`, { method: "PUT", body: JSON.stringify(body) });
  }

  async getOrderByGuide(guide: string) {
    return this.fetch<any>(`/integrations/orders/myorderbyguide/${encodeURIComponent(guide)}`, { method: "GET" });
  }

  async listProducts(body?: any) {
    return this.fetch<any>("/integrations/products/index", { method: "POST", body: JSON.stringify(body || {}) });
  }

  async createProduct(body: any) {
    return this.fetch<any>("/integrations/products", { method: "POST", body: JSON.stringify(body) });
  }

  async getProductV2(id: number) {
    return this.fetch<any>(`/integrations/products/v2/${id}`, { method: "GET" });
  }

  async updateProduct(id: number, body: any) {
    return this.fetch<any>(`/integrations/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
  }

  async listWarehouses() {
    return this.fetch<any>("/integrations/users/warehouses/index", { method: "GET" });
  }

  async createWarehouse(body: any) {
    return this.fetch<any>("/integrations/users/warehouses", { method: "POST", body: JSON.stringify(body) });
  }

  async getWarehouse(id: number) {
    return this.fetch<any>(`/integrations/users/warehouses/${id}`, { method: "GET" });
  }

  async quoteShipping(body: any) {
    return this.fetch<any>("/integrations/orders/cotizaEnvioTransportadoraV2", { method: "POST", body: JSON.stringify(body) });
  }

  async listPickUps() {
    return this.fetch<any>("/integrations/pick_ups", { method: "GET" });
  }

  async createPickUp(body: any) {
    return this.fetch<any>("/integrations/pick_ups", { method: "POST", body: JSON.stringify(body) });
  }

  async validateToken() {
    return this.fetch<any>("/integrations/helpers/validateToken", { method: "GET" });
  }

  async listCategories() {
    return this.fetch<any>("/integrations/categories", { method: "GET" });
  }

  async listDistributionCompanies() {
    return this.fetch<any>("/integrations/distribution_companies", { method: "GET" });
  }

  async listDepartmentsWithCities() {
    return this.fetch<any>("/integrations/department/all/with-cities", { method: "GET" });
  }

  async checkCityCoverage(city_id: number) {
    return this.fetch<any>(`/integrations/city/coverage/v2?city_id=${encodeURIComponent(city_id)}`, { method: "GET" });
  }

  async createShop(body: any, bearerToken: string) {
    return this.fetch<any>("/integrations/shops/store", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${bearerToken}` },
    }, true);
  }

  async getShopData() {
    return this.fetch<any>("/integrations/shops/get/shop-data", { method: "GET" });
  }
}
