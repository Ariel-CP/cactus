import type {
  Customer,
  CustomerCreate,
  Sale,
  SaleCreate,
} from "../types/api";
import { http } from "./client";

export async function listCustomers(): Promise<Customer[]> {
  const { data } = await http.get<Customer[]>("/customers");
  return data;
}

export async function createCustomer(
  payload: CustomerCreate
): Promise<Customer> {
  const { data } = await http.post<Customer>("/customers", payload);
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await http.delete(`/customers/${id}`);
}

export async function listSales(customerId?: number): Promise<Sale[]> {
  const { data } = await http.get<Sale[]>("/sales", {
    params: customerId !== undefined ? { customer_id: customerId } : {},
  });
  return data;
}

export async function createSale(payload: SaleCreate): Promise<Sale> {
  const { data } = await http.post<Sale>("/sales", payload);
  return data;
}
