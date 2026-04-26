const KEY = "aurapet_user_id";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(KEY, id);
}

export function clearUserId(): void {
  localStorage.removeItem(KEY);
}
