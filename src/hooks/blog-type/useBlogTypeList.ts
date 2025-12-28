import { useCallback, useEffect, useState } from "react";
import { deleteBlogType, getBlogTypes, type BlogTypeResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useBlogTypeList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<BlogTypeResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadBlogTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBlogTypes();
      setData(response ?? []);
      if (pendingMessage) {
        notifySuccess({
          message: pendingMessage,
          description: pendingMessage,
        });
        setPendingMessage(null);
      }
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar la lista de tipos de blog",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadBlogTypes();
  }, [loadBlogTypes]);

  const handleDelete = useCallback(
    async (blogTypeId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteBlogType(blogTypeId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Tipo de blog eliminado",
            description: "El tipo de blog se eliminó correctamente.",
          });
          await loadBlogTypes();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar el tipo de blog",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadBlogTypes, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadBlogTypes: loadBlogTypes,
    setSuccessOnReload,
  };
};
