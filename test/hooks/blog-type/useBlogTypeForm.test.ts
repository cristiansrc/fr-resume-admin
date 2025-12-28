import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "../../../src/api";
import { useBlogTypeForm } from "../../../src/hooks/blog-type/useBlogTypeForm";

const { notifySuccess, notifyError, setFieldsValue } = vi.hoisted(() => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  setFieldsValue: vi.fn(),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Form: {
      ...actual.Form,
      useForm: () => [{ setFieldsValue }],
    },
  };
});

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useBlogTypeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a blog type when editing", async () => {
    (api.getBlogType as unknown as vi.Mock).mockResolvedValue({
      name: "Type",
      nameEng: "Type EN",
    });

    renderHook(() => useBlogTypeForm({ mode: "edit", blogTypeId: 1 }));

    await waitFor(() => expect(api.getBlogType).toHaveBeenCalledWith(1));
    expect(setFieldsValue).toHaveBeenCalledWith({
      name: "Type",
      nameEng: "Type EN",
    });
  });

  it("notifies when blog type fails to load", async () => {
    (api.getBlogType as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useBlogTypeForm({ mode: "edit", blogTypeId: 5 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar el tipo de blog",
        }),
      ),
    );
  });

  it("creates a blog type and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    (api.createBlogType as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useBlogTypeForm({ mode: "create", onSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Type",
        nameEng: "Type EN",
      });
    });

    expect(api.createBlogType).toHaveBeenCalledWith({
      name: "Type",
      nameEng: "Type EN",
    });
    expect(onSuccess).toHaveBeenCalledWith("Tipo de blog creado");
    expect(success).toBe(true);
  });

  it("notifies success when updating without onSuccess", async () => {
    (api.updateBlogType as unknown as vi.Mock).mockResolvedValue({ status: 200 });

    const { result } = renderHook(() =>
      useBlogTypeForm({ mode: "edit", blogTypeId: 4 }),
    );

    const success = await result.current.handleSubmit({
      name: "Type",
      nameEng: "Type EN",
    });

    await waitFor(() =>
      expect(notifySuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Tipo de blog actualizado",
        }),
      ),
    );
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createBlogType as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() => useBlogTypeForm({ mode: "create" }));

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Type",
        nameEng: "Type EN",
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tipo de blog creado" }),
    );
    expect(success).toBe(true);
  });

  it("updates a blog type and notifies on failure", async () => {
    (api.updateBlogType as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useBlogTypeForm({ mode: "edit", blogTypeId: 2 }),
    );

    const success = await result.current.handleSubmit({
      name: "Type",
      nameEng: "Type EN",
    });

    expect(api.updateBlogType).toHaveBeenCalledWith(2, {
      name: "Type",
      nameEng: "Type EN",
    });
    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar el tipo de blog",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
