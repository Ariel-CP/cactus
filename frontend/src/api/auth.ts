import type { TokenResponse, User } from "../types/api";
import { http } from "./client";

export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await http.get<User>("/auth/me");
  return data;
}
