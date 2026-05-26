// Adaptador de almacenamiento. Aisla la dependencia de 'localStorage'
const TOKEN_KEY = 'saas_token';

export const TokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  destroyToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
};