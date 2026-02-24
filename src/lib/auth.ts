export type PlatformAccess = {
  crm: boolean;
  cdi: boolean;
  cefr_speaking: boolean;
};

export type AuthUser = {
  id: number;
  login: string;
  role: string;
  displayName?: string;
  centerId?: number;
  platformAccess?: PlatformAccess;
};

export type DevUser = {
  id: number;
  username: string;
  displayName: string;
  role: 'developer';
};

const TOKEN_KEY = 'eduflow_access_token';
const USER_KEY  = 'eduflow_user';

const DEV_TOKEN_KEY = 'eduflow_dev_token';
const DEV_USER_KEY  = 'eduflow_dev_user';

/* ── Regular admin session ── */

export const setAuthSession = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/* ── Developer session ── */

export const setDevSession = (token: string, devUser: DevUser): void => {
  localStorage.setItem(DEV_TOKEN_KEY, token);
  localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser));
};

export const getDevToken = (): string | null => localStorage.getItem(DEV_TOKEN_KEY);

export const getDevUser = (): DevUser | null => {
  const raw = localStorage.getItem(DEV_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DevUser; } catch { return null; }
};

export const clearDevSession = (): void => {
  localStorage.removeItem(DEV_TOKEN_KEY);
  localStorage.removeItem(DEV_USER_KEY);
};
