import { api } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return res.data;
}
