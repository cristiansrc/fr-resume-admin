import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "../../../src/api";
import { useBlogList } from "../../../src/hooks/blog/useBlogList";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useBlogList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getBlogs as unknown as vi.Mock).mockResolvedValue({
      content: [],
      totalElements: 0,
    });
  });

  it("loads blogs and supports reload success message", async () => {
    const { result } = renderHook(() => useBlogList());

    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());

    act(() => {
      result.current.setSuccessOnReload("Listo");
    });

    await act(async () => {
      await result.current.reloadBlogs();
    });

    expect(notifySuccess).toHaveBeenCalledWith({
      message: "Listo",
      description: "Listo",
    });
  });

  it("handles delete success and reloads", async () => {
    (api.deleteBlog as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useBlogList());

    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());
    (api.getBlogs as unknown as vi.Mock).mockClear();

    await act(async () => {
      await result.current.handleDelete(5);
    });

    expect(api.deleteBlog).toHaveBeenCalledWith(5);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Blog eliminado" }),
    );
    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());
  });

  it("notifies when delete fails", async () => {
    (api.deleteBlog as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useBlogList());

    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(8);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({ description: "No se pudo eliminar el blog" }),
    );
  });

  it("updates pagination on table change", async () => {
    const { result } = renderHook(() => useBlogList());

    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());
    (api.getBlogs as unknown as vi.Mock).mockClear();

    await act(async () => {
      result.current.pagination.onChange(2, 20);
    });

    await waitFor(() =>
      expect(api.getBlogs).toHaveBeenCalledWith(0, 20, "id,desc"),
    );
  });

  it("handles missing content and total values", async () => {
    (api.getBlogs as unknown as vi.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useBlogList());

    await waitFor(() => expect(api.getBlogs).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(result.current.pagination.total).toBe(0);
  });

  it("notifies when load fails", async () => {
    (api.getBlogs as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useBlogList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de blogs",
        }),
      ),
    );
  });
});
