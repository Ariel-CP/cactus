// Tipos espejo de los schemas de FastAPI

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  kind: "ingredient" | "product" | "both";
  created_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
  unit: string;
  stock: number;
  min_stock: number;
  cost_per_unit: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  unit: string;
  stock: number;
  min_stock: number;
  sale_price: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}

// ── Production ──────────────────────────────────────────

export interface FormulaLinePublic {
  id: number;
  ingredient_id: number;
  quantity: number;
}

export interface FormulaLine {
  ingredient_id: number;
  quantity: number;
}

export interface FormulaCreate {
  product_id: number;
  lines: FormulaLine[];
}

export interface BatchPublic {
  id: number;
  product_id: number;
  quantity_produced: number;
  notes: string | null;
  produced_at: string;
  created_by_id: number | null;
}

// ── Sales & Customers ───────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  balance: number;
  created_at: string;
}

export interface CustomerCreate {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Sale {
  id: number;
  customer_id: number | null;
  payment_method: string;
  notes: string | null;
  total: number;
  sold_at: string;
  created_by_id: number | null;
  items: SaleItem[];
}

export interface SaleCreate {
  customer_id?: number | null;
  payment_method: "cash" | "transfer" | "credit";
  notes?: string;
  items: SaleItemCreate[];
}

// ── Purchases ───────────────────────────────────────────

export interface PurchaseItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseItemCreate {
  ingredient_id: number;
  quantity: number;
  unit_cost: number;
}

export interface Purchase {
  id: number;
  supplier: string | null;
  notes: string | null;
  total: number;
  purchased_at: string;
  created_by_id: number | null;
  items: PurchaseItem[];
}

export interface PurchaseCreate {
  supplier?: string;
  notes?: string;
  items: PurchaseItemCreate[];
}

// ── Reports ─────────────────────────────────────────────

export interface StockAlert {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  kind: "ingredient" | "product";
}

export interface SalesSummary {
  period_start: string;
  period_end: string;
  total_sales: number;
  total_revenue: number;
}

export interface DashboardSummary {
  low_stock_ingredients: number;
  low_stock_products: number;
  sales_this_month: number;
  revenue_this_month: number;
}
