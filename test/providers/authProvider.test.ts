import { describe, it, expect, vi, afterEach } from "vitest";

const fetchMock = vi.fn();

const setupAuthProvider = async (apiUrl = "http://localhost") => {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  localStorage.clear();
  return import("../../src/providers/authProvider");
};

describe("authProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an error when credentials are missing", async () => {
    const { authProvider } = await setupAuthProvider();

    const response = await authProvider.login({ username: "", password: "" });

    expect(response.success).toBe(false);
    expect(response.error?.message).toBe("Usuario y contraseña son obligatorios");
  });

  it("returns an error when the API URL is missing", async () => {
    const { authProvider } = await setupAuthProvider("");

    const response = await authProvider.login({
      username: "user",
      password: "pass",
    });

    expect(response.success).toBe(false);
    expect(response.error?.message).toBe("No se encontró la URL base de la API");
  });

  it("fails when API response is not ok", async () => {
    const { authProvider } = await setupAuthProvider();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "error" }),
    });

    const result = await authProvider.login({
      username: "user",
      password: "wrong",
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain("error");
  });

  it("uses the default message when the error payload cannot be parsed", async () => {
    const { authProvider } = await setupAuthProvider();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("unreadable");
      },
    });

    const result = await authProvider.login({
      username: "user",
      password: "wrong",
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("Hay un problema al iniciar sesión");
  });

  it("handles fetch failures gracefully", async () => {
    const { authProvider } = await setupAuthProvider();
    fetchMock.mockRejectedValueOnce(new Error("timeout"));

    const result = await authProvider.login({
      username: "user",
      password: "pass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("timeout");
  });

  it("returns a connection error when fetch rejects with a primitive", async () => {
    const { authProvider } = await setupAuthProvider();
    fetchMock.mockRejectedValueOnce("network issue");

    const result = await authProvider.login({
      username: "user",
      password: "pass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("Error en la conexión");
  });

  it("returns an error when the response lacks a token", async () => {
    const { authProvider } = await setupAuthProvider();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await authProvider.login({
      username: "user",
      password: "pass",
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("El servidor no devolvió un token válido");
  });

  it("stores the token and succeeds when response is ok", async () => {
    const { authProvider, TOKEN_KEY } = await setupAuthProvider();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "jwt" }),
    });

    const result = await authProvider.login({
      username: "user",
      password: "pass",
    });

    expect(result.success).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe("jwt");
  });

  it("clears token on logout", async () => {
    const { authProvider, TOKEN_KEY } = await setupAuthProvider();
    localStorage.setItem(TOKEN_KEY, "token");

    const res = await authProvider.logout();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(res.success).toBe(true);
  });

  it("returns authenticated only if token is valid", async () => {
    const { authProvider, TOKEN_KEY } = await setupAuthProvider();
    localStorage.setItem(TOKEN_KEY, "abc");

    const result = await authProvider.check();

    expect(result.authenticated).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();

    localStorage.setItem(TOKEN_KEY, "a.b.c");
    expect((await authProvider.check()).authenticated).toBe(true);
  });

  it("returns null permissions", async () => {
    const { authProvider } = await setupAuthProvider();
    expect(await authProvider.getPermissions()).toBeNull();
  });

  it("provides identity when token exists", async () => {
    const { authProvider, TOKEN_KEY } = await setupAuthProvider();
    localStorage.setItem(TOKEN_KEY, "a.b.c");

    const identity = await authProvider.getIdentity();
    expect(identity?.name).toBe("John Doe");
  });

  it("returns null identity when token is missing", async () => {
    const { authProvider } = await setupAuthProvider();
    const identity = await authProvider.getIdentity();
    expect(identity).toBeNull();
  });

  it("logs errors and returns them via onError", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { authProvider } = await setupAuthProvider();
    const error = new Error("boom");

    const result = await authProvider.onError(error);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(result.error).toBe(error);
  });
});
