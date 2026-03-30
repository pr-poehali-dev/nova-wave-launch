const AUTH_URL = "https://functions.poehali.dev/75af6f5f-d1f0-448b-a287-9cfe52aaa0ec";
const TOKEN_KEY = "rusyaz_token";
const USER_KEY = "rusyaz_user";

export interface AuthUser {
  role: "teacher" | "student";
  name: string;
  user_id: number;
  token: string;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export async function loginTeacher(login: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "teacher", login, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  return data;
}

export async function loginStudent(name: string, access_code: string): Promise<AuthUser> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "student", name, access_code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  return data;
}

export async function registerTeacher(login: string, password: string, name: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/register-teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
}
