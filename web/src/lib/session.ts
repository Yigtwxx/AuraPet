const KEY = "aurapet_user_id";
const NAME_KEY = "aurapet_username";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(KEY, id);
}

export function clearUserId(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function setUsername(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}
