import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "../../../src/api";
import { useBlogForm } from "../../../src/hooks/blog/useBlogForm";

const { notifySuccess, notifyError, setFieldsValue, messageError } = vi.hoisted(
  () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    setFieldsValue: vi.fn(),
    messageError: vi.fn(),
  }),
);

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Form: {
      ...actual.Form,
      useForm: () => [{ setFieldsValue }],
    },
    message: {
      error: messageError,
    },
  };
});

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useBlogForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getBlogTypes as unknown as vi.Mock).mockResolvedValue([]);
  });

  it("loads the blog data when editing", async () => {
    (api.getBlog as unknown as vi.Mock).mockResolvedValue({
      id: 2,
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrl: { id: 10, url: "image" },
      videoUrl: { id: 20, url: "video" },
      blogType: { id: 30, name: "Type" },
    });

    const { result } = renderHook(() =>
      useBlogForm({ mode: "edit", blogId: 2 }),
    );

    await waitFor(() => expect(api.getBlog).toHaveBeenCalledWith(2));
    expect(setFieldsValue).toHaveBeenCalledWith({
      id: 2,
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrlId: 10,
      videoUrlId: 20,
      blogTypeId: 30,
    });
    await waitFor(() =>
      expect(result.current.selectedImage).toEqual({ id: 10, url: "image" }),
    );
    await waitFor(() =>
      expect(result.current.selectedVideo).toEqual({ id: 20, url: "video" }),
    );
  });

  it("notifies when blog types fail to load", async () => {
    (api.getBlogTypes as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useBlogForm({ mode: "create" }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar los tipos de blog",
        }),
      ),
    );
  });

  it("notifies when blog data fails to load", async () => {
    (api.getBlog as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useBlogForm({ mode: "edit", blogId: 9 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar el blog",
        }),
      ),
    );
  });

  it("updates image and video selections", () => {
    const { result } = renderHook(() => useBlogForm({ mode: "create" }));

    act(() => {
      result.current.handleImageSelect([3], [{ id: 3, url: "image" }]);
      result.current.handleVideoSelect([4], [{ id: 4, url: "video" }]);
    });

    expect(setFieldsValue).toHaveBeenCalledWith({ imageUrlId: 3 });
    expect(setFieldsValue).toHaveBeenCalledWith({ videoUrlId: 4 });
    expect(result.current.selectedImage).toEqual({ id: 3, url: "image" });
    expect(result.current.selectedVideo).toEqual({ id: 4, url: "video" });
  });

  it("ignores empty image and video selections", () => {
    const { result } = renderHook(() => useBlogForm({ mode: "create" }));

    act(() => {
      result.current.handleImageSelect([], []);
      result.current.handleVideoSelect([], []);
    });

    expect(setFieldsValue).not.toHaveBeenCalledWith({ imageUrlId: expect.anything() });
    expect(setFieldsValue).not.toHaveBeenCalledWith({ videoUrlId: expect.anything() });
    expect(result.current.selectedImage).toBeNull();
    expect(result.current.selectedVideo).toBeNull();
  });

  it("prevents submit when image or video is missing", async () => {
    const { result } = renderHook(() => useBlogForm({ mode: "create" }));

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit({
        title: "Blog",
        titleEng: "Blog EN",
        cleanUrlTitle: "blog",
        descriptionShort: "Short",
        description: "Desc",
        descriptionShortEng: "Short EN",
        descriptionEng: "Desc EN",
        blogTypeId: 1,
      });
    });

    expect(messageError).toHaveBeenCalledWith(
      "Selecciona una imagen para continuar.",
    );
    expect(success).toBe(false);
  });

  it("prevents submit when video is missing", async () => {
    const { result } = renderHook(() => useBlogForm({ mode: "create" }));

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit({
        title: "Blog",
        titleEng: "Blog EN",
        cleanUrlTitle: "blog",
        descriptionShort: "Short",
        description: "Desc",
        descriptionShortEng: "Short EN",
        descriptionEng: "Desc EN",
        imageUrlId: 10,
        blogTypeId: 1,
      });
    });

    expect(messageError).toHaveBeenCalledWith(
      "Selecciona un video para continuar.",
    );
    expect(success).toBe(false);
  });

  it("creates a blog and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    (api.createBlog as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useBlogForm({ mode: "create", onSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        title: "Blog",
        titleEng: "Blog EN",
        cleanUrlTitle: "blog",
        descriptionShort: "Short",
        description: "Desc",
        descriptionShortEng: "Short EN",
        descriptionEng: "Desc EN",
        imageUrlId: 10,
        videoUrlId: 20,
        blogTypeId: 1,
      });
    });

    expect(api.createBlog).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith("Blog creado");
    expect(success).toBe(true);
  });

  it("notifies success when updating without onSuccess", async () => {
    (api.updateBlog as unknown as vi.Mock).mockResolvedValue({ status: 200 });

    const { result } = renderHook(() =>
      useBlogForm({ mode: "edit", blogId: 7 }),
    );

    const success = await result.current.handleSubmit({
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrlId: 10,
      videoUrlId: 20,
      blogTypeId: 1,
    });

    await waitFor(() =>
      expect(notifySuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blog actualizado",
        }),
      ),
    );
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createBlog as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() => useBlogForm({ mode: "create" }));

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        title: "Blog",
        titleEng: "Blog EN",
        cleanUrlTitle: "blog",
        descriptionShort: "Short",
        description: "Desc",
        descriptionShortEng: "Short EN",
        descriptionEng: "Desc EN",
        imageUrlId: 10,
        videoUrlId: 20,
        blogTypeId: 1,
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Blog creado",
      }),
    );
    expect(success).toBe(true);
  });

  it("updates a blog and notifies on failure", async () => {
    (api.updateBlog as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useBlogForm({ mode: "edit", blogId: 9 }),
    );

    const success = await result.current.handleSubmit({
      id: 9,
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrlId: 10,
      videoUrlId: 20,
      blogTypeId: 1,
    });

    expect(api.updateBlog).toHaveBeenCalledWith(9, expect.any(Object));
    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar el blog",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
