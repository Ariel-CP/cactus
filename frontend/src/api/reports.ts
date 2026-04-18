import type { DashboardSummary, SalesSummary, StockAlert } from "../types/api";
import { http } from "./client";

export async function getLowStock(): Promise<StockAlert[]> {
  const { data } = await http.get<StockAlert[]>("/reports/low-stock");
  return data;
}

export async function getSalesSummary(
  start?: string,
  end?: string
): Promise<SalesSummary> {
  const { data } = await http.get<SalesSummary>("/reports/sales-summary", {
    params: { start, end },
  });
  return data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>("/reports/dashboard");
  return data;
}
