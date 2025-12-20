import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TOKEN_KEY } from "../../src/api/authProvider";

type InterceptorConfig = {
  headers: Record<string, string>;
};

const createMock = vi.fn();
const isAxiosErrorMock = vi.fn();

const buildClientMock = () => ({
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
});

vi.mock("axios", () => ({
  default: {
    create: createMock,
    isAxiosError: isAxiosErrorMock,
  },
  isAxiosError: isAxiosErrorMock,
}));

const setupModule = async () => {
  vi.resetModules();
  const client = buildClientMock();
  createMock.mockReturnValue(client);
  const module = await import("../../src/api/axiosClient");
  const requestHandler = client.interceptors.request.use.mock.calls[0][0] as (
    config: InterceptorConfig,
  ) => InterceptorConfig;
  const responseSuccess = client.interceptors.response.use.mock.calls[0][0] as (
    response: unknown,
  ) => unknown;
  const responseError = client.interceptors.response.use.mock.calls[0][1] as (
    error: unknown,
  ) => Promise<never>;

  return { module, requestHandler, responseSuccess, responseError };
};

describe("axiosClient interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    createMock.mockReset();
    isAxiosErrorMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("adds the auth header when a token exists", async () => {
    localStorage.setItem(TOKEN_KEY, "token");
    const { requestHandler } = await setupModule();

    const result = requestHandler({ headers: {} });

    expect(result.headers.Authorization).toBe("Bearer token");
  });

  it("skips the auth header when no token is stored", async () => {
    const { requestHandler } = await setupModule();

    const result = requestHandler({ headers: {} });

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("returns the response as-is on success", async () => {
    const { responseSuccess } = await setupModule();
    const payload = { data: "ok" };

    expect(responseSuccess(payload)).toBe(payload);
  });

  it("clears token and redirects on 401", async () => {
    localStorage.setItem(TOKEN_KEY, "token");
    const assignMock = vi.fn();
    vi.stubGlobal("window", { location: { assign: assignMock } });
    isAxiosErrorMock.mockReturnValue(true);

    const { responseError } = await setupModule();

    await expect(responseError({ response: { status: 401 } })).rejects.toBeDefined();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(assignMock).toHaveBeenCalledWith("/login");
  });

  it("clears token without redirect when window is unavailable", async () => {
    localStorage.setItem(TOKEN_KEY, "token");
    vi.stubGlobal("window", undefined);
    isAxiosErrorMock.mockReturnValue(true);

    const { responseError } = await setupModule();

    await expect(responseError({ response: { status: 401 } })).rejects.toBeDefined();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("redirects to not found on 404", async () => {
    const assignMock = vi.fn();
    vi.stubGlobal("window", { location: { assign: assignMock } });
    isAxiosErrorMock.mockReturnValue(true);

    const { responseError } = await setupModule();

    await expect(responseError({ response: { status: 404 } })).rejects.toBeDefined();
    expect(assignMock).toHaveBeenCalledWith("/not-found");
  });

  it("redirects to error page on 500", async () => {
    const assignMock = vi.fn();
    vi.stubGlobal("window", { location: { assign: assignMock } });
    isAxiosErrorMock.mockReturnValue(true);

    const { responseError } = await setupModule();

    await expect(responseError({ response: { status: 500 } })).rejects.toBeDefined();
    expect(assignMock).toHaveBeenCalledWith("/error");
  });

  it("does not redirect for non-axios errors", async () => {
    const assignMock = vi.fn();
    vi.stubGlobal("window", { location: { assign: assignMock } });
    isAxiosErrorMock.mockReturnValue(false);

    const { responseError } = await setupModule();

    await expect(responseError(new Error("boom"))).rejects.toBeDefined();
    expect(assignMock).not.toHaveBeenCalled();
  });
});
