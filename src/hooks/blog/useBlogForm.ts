import { Form, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createBlog,
  getBlog,
  getBlogTypes,
  updateBlog,
  type BlogPayload,
  type BlogResponse,
  type BlogTypeResponse,
  type ImageResponse,
  type VideoResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface BlogFormValues extends BlogPayload {}

interface UseBlogFormOptions {
  blogId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useBlogForm = ({
  blogId,
  mode,
  onSuccess,
}: UseBlogFormOptions) => {
  const [form] = Form.useForm<BlogFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [blogTypes, setBlogTypes] = useState<BlogTypeResponse[]>([]);
  const [isBlogTypesLoading, setBlogTypesLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoResponse | null>(null);

  const loadBlogTypes = useCallback(async () => {
    setBlogTypesLoading(true);
    try {
      const response = await getBlogTypes();
      setBlogTypes(response ?? []);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar los tipos de blog",
      });
    } finally {
      setBlogTypesLoading(false);
    }
  }, [notifyError]);

  const loadBlog = useCallback(async () => {
    if (mode !== "edit" || !blogId) {
      return;
    }
    setLoading(true);
    try {
      const data: BlogResponse = await getBlog(blogId);
      form.setFieldsValue({
        id: data.id,
        title: data.title,
        titleEng: data.titleEng,
        cleanUrlTitle: data.cleanUrlTitle,
        descriptionShort: data.descriptionShort,
        description: data.description,
        descriptionShortEng: data.descriptionShortEng,
        descriptionEng: data.descriptionEng,
        imageUrlId: data.imageUrl?.id,
        videoUrlId: data.videoUrl?.id,
        blogTypeId: data.blogType?.id,
      });
      setSelectedImage(data.imageUrl ?? null);
      setSelectedVideo(data.videoUrl ?? null);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar el blog",
      });
    } finally {
      setLoading(false);
    }
  }, [blogId, form, mode, notifyError]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  useEffect(() => {
    loadBlogTypes();
  }, [loadBlogTypes]);

  const handleImageSelect = useCallback(
    (selectedIds: number[], selectedRecords: ImageResponse[]) => {
      const [image] = selectedRecords;
      if (image) {
        setSelectedImage(image);
      }
      if (selectedIds[0]) {
        form.setFieldsValue({ imageUrlId: selectedIds[0] });
      }
    },
    [form],
  );

  const handleVideoSelect = useCallback(
    (selectedIds: number[], selectedRecords: VideoResponse[]) => {
      const [video] = selectedRecords;
      if (video) {
        setSelectedVideo(video);
      }
      if (selectedIds[0]) {
        form.setFieldsValue({ videoUrlId: selectedIds[0] });
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: BlogFormValues) => {
      if (!values.imageUrlId) {
        message.error("Selecciona una imagen para continuar.");
        return false;
      }
      if (!values.videoUrlId) {
        message.error("Selecciona un video para continuar.");
        return false;
      }

      setSaving(true);
      try {
        const payload: BlogPayload = {
          ...values,
          id: mode === "edit" ? blogId : values.id,
        };
        const response =
          mode === "edit" && blogId
            ? await updateBlog(blogId, payload)
            : await createBlog(payload);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          const successMessage = mode === "edit" ? "Blog actualizado" : "Blog creado";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "El blog se actualizó correctamente."
                  : "El blog se creó correctamente.",
            });
          }
          return true;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description:
            mode === "edit"
              ? "No se pudo actualizar el blog"
              : "No se pudo crear el blog",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [blogId, mode, notifyError, notifySuccess, onSuccess],
  );

  return {
    form,
    isLoading,
    isSaving,
    blogTypes,
    isBlogTypesLoading,
    selectedImage,
    selectedVideo,
    handleImageSelect,
    handleVideoSelect,
    handleSubmit,
  };
};
