import type {
  BatchPublic,
  FormulaCreate,
  FormulaLinePublic,
} from "../types/api";
import { http } from "./client";

export async function getFormula(
  productId: number
): Promise<FormulaLinePublic[]> {
  const { data } = await http.get<FormulaLinePublic[]>(
    `/production/formula/${productId}`
  );
  return data;
}

export async function saveFormula(
  payload: FormulaCreate
): Promise<FormulaLinePublic[]> {
  const { data } = await http.put<FormulaLinePublic[]>(
    "/production/formula",
    payload
  );
  return data;
}

export async function listBatches(
  productId?: number
): Promise<BatchPublic[]> {
  const { data } = await http.get<BatchPublic[]>("/production/batches", {
    params: productId !== undefined ? { product_id: productId } : {},
  });
  return data;
}

export async function registerBatch(
  payload: Omit<BatchPublic, "id" | "produced_at" | "created_by_id">
): Promise<BatchPublic> {
  const { data } = await http.post<BatchPublic>(
    "/production/batches",
    payload
  );
  return data;
}
