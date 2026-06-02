export interface LoginRequest {
  email: string;
  password: string;
  white_brand_id: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  message: string;
  status: number;
  token?: string;
}

export interface WhoAmIResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  status: string;
  urlS3_logo?: string;
  store_url?: string;
  category_id?: number;
  category_name?: string;
  wallets?: number;
}

export interface ListOrdersParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface OrderProduct {
  product_id: number;
  quantity: number;
  price?: number;
}

export interface CreateOrderRequest {
  client_name: string;
  client_phone: string;
  client_address: string;
  city_id: number;
  neighborhood?: string;
  additional_info?: string;
  products: OrderProduct[];
  payment_method?: string;
  observations?: string;
}

export interface UpdateOrderRequest {
  client_name?: string;
  client_phone?: string;
  client_address?: string;
  observations?: string;
}

export interface ListProductsRequest {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  stock?: number;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  stock?: number;
}

export interface CreateWarehouseRequest {
  name: string;
  address: string;
  city_id: number;
  phone?: string;
}

export interface CotizaProduct {
  id: number;
  name?: string;
  quantity: number;
  price: number;
  weight: number;
  type: string;
}

export interface CotizaCity {
  id: number;
  cod_dane?: string;
  name?: string;
}

export interface CotizaWarehouse {
  id: number;
}

export interface CotizaEnvioRequest {
  ciudad_remitente?: CotizaCity;
  ciudad_destino: CotizaCity;
  products: CotizaProduct[];
  EnvioConCobro: string;
  dir: string;
  amount: number;
  destination_name: string;
  destination_phone: string;
  zip_code?: string;
  colonia?: string;
  warehouse?: CotizaWarehouse;
  insurance?: boolean;
}

export interface CreatePickUpRequest {
  warehouse_id: number;
  pickup_date: string;
}

export interface CreateShopRequest {
  name: string;
  url: string;
  webhook?: string;
  email: string;
  phone?: string;
  shop_type: {
    shop_type: string;
    id?: number | null;
  };
  consumer_key?: string | null;
  consumer_secret?: string | null;
  change_status_pendiente?: boolean;
  status_pendiente?: string;
  update_shipping_guide?: boolean;
}

export interface ApiResponse<T = unknown> {
  isSuccess?: boolean;
  status?: number;
  message?: string;
  objects?: T;
  data?: T;
  [key: string]: unknown;
}
