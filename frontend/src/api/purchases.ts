import type { Purchase, PurchaseCreate } from "../types/api";
import { http } from "./client";

export async function listPurchases(): Promise<Purchase[]> {
  const { data } = await http.get<Purchase[]>("/purchases");
  return data;
}

export async function createPurchase(
  payload: PurchaseCreate
): Promise<Purchase> {
  const { data } = await http.post<Purchase>("/purchases", payload);
  return data;
}
