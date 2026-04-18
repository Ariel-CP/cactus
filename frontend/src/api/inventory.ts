import type { Ingredient, Product } from "../types/api";
import { http } from "./client";

export async function listIngredients(
  lowStock = false
): Promise<Ingredient[]> {
  const { data } = await http.get<Ingredient[]>("/ingredients", {
    params: { low_stock: lowStock },
  });
  return data;
}

export async function createIngredient(
  payload: Omit<Ingredient, "id" | "created_at" | "updated_at">
): Promise<Ingredient> {
  const { data } = await http.post<Ingredient>("/ingredients", payload);
  return data;
}

export async function updateIngredient(
  id: number,
  payload: Partial<Ingredient>
): Promise<Ingredient> {
  const { data } = await http.patch<Ingredient>(`/ingredients/${id}`, payload);
  return data;
}

export async function deleteIngredient(id: number): Promise<void> {
  await http.delete(`/ingredients/${id}`);
}

export async function listProducts(lowStock = false): Promise<Product[]> {
  const { data } = await http.get<Product[]>("/products", {
    params: { low_stock: lowStock },
  });
  return data;
}

export async function createProduct(
  payload: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const { data } = await http.post<Product>("/products", payload);
  return data;
}

export async function updateProduct(
  id: number,
  payload: Partial<Product>
): Promise<Product> {
  const { data } = await http.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await http.delete(`/products/${id}`);
}
