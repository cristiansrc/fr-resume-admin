import { Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createBlogType,
  getBlogType,
  updateBlogType,
  type BlogTypePayload,
  type BlogTypeResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface BlogTypeFormValues extends BlogTypePayload {}

interface UseBlogTypeFormOptions {
  blogTypeId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useBlogTypeForm = ({
  blogTypeId,
  mode,
  onSuccess,
}: UseBlogTypeFormOptions) => {
  const [form] = Form.useForm<BlogTypeFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const loadBlogType = useCallback(async () => {
    if (mode !== "edit" || !blogTypeId) {
      return;
    }
    setLoading(true);
    try {
      const data: BlogTypeResponse = await getBlogType(blogTypeId);
      form.setFieldsValue({
        name: data.name,
        nameEng: data.nameEng,
      });
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar el tipo de blog",
      });
    } finally {
      setLoading(false);
    }
  }, [blogTypeId, form, mode, notifyError]);

  useEffect(() => {
    loadBlogType();
  }, [loadBlogType]);

  const handleSubmit = useCallback(
    async (values: BlogTypeFormValues) => {
      setSaving(true);
      try {
        const payload: BlogTypePayload = {
          name: values.name,
          nameEng: values.nameEng,
        };
        const response =
          mode === "edit" && blogTypeId
            ? await updateBlogType(blogTypeId, payload)
            : await createBlogType(payload);
        if (
          response.status === 200 ||
          response.status === 201 ||
          response.status === 204
        ) {
          const successMessage =
            mode === "edit" ? "Tipo de blog actualizado" : "Tipo de blog creado";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "El tipo de blog se actualizó correctamente."
                  : "El tipo de blog se creó correctamente.",
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
              ? "No se pudo actualizar el tipo de blog"
              : "No se pudo crear el tipo de blog",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [blogTypeId, mode, notifyError, notifySuccess, onSuccess],
  );

  return {
    form,
    isLoading,
    isSaving,
    handleSubmit,
  };
};
