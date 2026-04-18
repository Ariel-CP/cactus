import type { User } from "../types/api";
import { http } from "./client";

export interface UserCreatePayload {
  username: string;
  full_name: string;
  password: string;
  role: "admin" | "operator";
}

export interface UserUpdatePayload {
  full_name?: string;
  password?: string;
  role?: "admin" | "operator";
  is_active?: boolean;
}

export async function listUsers(): Promise<User[]> {
  const { data } = await http.get<User[]>("/users");
  return data;
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const { data } = await http.post<User>("/users", payload);
  return data;
}

export async function updateUser(
  id: number,
  payload: UserUpdatePayload
): Promise<User> {
  const { data } = await http.patch<User>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: number): Promise<void> {
  await http.delete(`/users/${id}`);
}

export async function restartBackend(): Promise<void> {
  await http.post("/admin/restart");
}