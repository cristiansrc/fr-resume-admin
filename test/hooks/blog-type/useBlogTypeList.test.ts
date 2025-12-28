import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "../../../src/api";
import { useBlogTypeList } from "../../../src/hooks/blog-type/useBlogTypeList";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useBlogTypeList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getBlogTypes as unknown as vi.Mock).mockResolvedValue([]);
  });

  it("loads blog types and supports reload success message", async () => {
    const { result } = renderHook(() => useBlogTypeList());

    await waitFor(() => expect(api.getBlogTypes).toHaveBeenCalled());

    act(() => {
      result.current.setSuccessOnReload("Hecho");
    });

    await act(async () => {
      await result.current.reloadBlogTypes();
    });

    expect(notifySuccess).toHaveBeenCalledWith({
      message: "Hecho",
      description: "Hecho",
    });
  });

  it("handles undefined responses", async () => {
    (api.getBlogTypes as unknown as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBlogTypeList());

    await waitFor(() => expect(api.getBlogTypes).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("handles delete success and reloads", async () => {
    (api.deleteBlogType as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useBlogTypeList());

    await waitFor(() => expect(api.getBlogTypes).toHaveBeenCalled());
    (api.getBlogTypes as unknown as vi.Mock).mockClear();

    await act(async () => {
      await result.current.handleDelete(3);
    });

    expect(api.deleteBlogType).toHaveBeenCalledWith(3);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tipo de blog eliminado" }),
    );
    await waitFor(() => expect(api.getBlogTypes).toHaveBeenCalled());
  });

  it("notifies when delete fails", async () => {
    (api.deleteBlogType as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useBlogTypeList());

    await waitFor(() => expect(api.getBlogTypes).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(8);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar el tipo de blog",
      }),
    );
  });

  it("notifies when load fails", async () => {
    (api.getBlogTypes as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useBlogTypeList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de tipos de blog",
        }),
      ),
    );
  });
});
