const ACCESS_TOKEN_KEY = 'saas_access_token';
const REFRESH_TOKEN_KEY = 'saas_refresh_token';

export const TokenService = {
  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  saveToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  destroyTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  destroyToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
