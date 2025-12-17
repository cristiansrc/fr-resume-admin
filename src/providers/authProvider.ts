import type { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";
const API_URL = import.meta.env.VITE_API_URL;

const getValidToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  // Por ahora asumimos que el token es JWT (tres segmentos separados por ".")
  if (token.split(".").length !== 3) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return token;
};

const createError = (message: string) => {
  const error = new Error(message);
  error.name = "LoginError";
  return error;
};

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    if (!username || !password) {
      return {
        success: false,
        error: createError("Usuario y contraseña son obligatorios"),
      };
    }

    if (!API_URL) {
      return {
        success: false,
        error: createError("No se encontró la URL base de la API"),
      };
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: username,
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.message || "Hay un problema al iniciar sesión";
        return {
          success: false,
          error: createError(message),
        };
      }

      const data = await response.json();
      const token = data?.token;

      if (!token) {
        return {
          success: false,
          error: createError("El servidor no devolvió un token válido"),
        };
      }

      localStorage.setItem(TOKEN_KEY, token);
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: createError(
          error instanceof Error ? error.message : "Error en la conexión",
        ),
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = getValidToken();
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = getValidToken();
    if (token) {
      return {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/300",
      };
    }

    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
