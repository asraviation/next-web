export interface User {
  name?: string;
  fullName?: string;
  username?: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
}