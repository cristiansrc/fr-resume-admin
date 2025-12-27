import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteBlog, getBlogs, type BlogResponse } from "../../api";
import { useNotifier } from "../useNotifier";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT = "id,desc";

export const useBlogList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<BlogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBlogs(page - 1, pageSize, DEFAULT_SORT);
      setData(response.content ?? []);
      setTotal(response.totalElements ?? 0);
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
        description: "No se pudo cargar la lista de blogs",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, page, pageSize, pendingMessage]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleDelete = useCallback(
    async (blogId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteBlog(blogId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Blog eliminado",
            description: "El blog se eliminó correctamente.",
          });
          await loadBlogs();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar el blog",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadBlogs, notifyError, notifySuccess],
  );

  const handleTableChange = useCallback(
    (nextPage: number, nextPageSize?: number) => {
      setPage(nextPage);
      if (nextPageSize && nextPageSize !== pageSize) {
        setPageSize(nextPageSize);
        setPage(1);
      }
    },
    [pageSize],
  );

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize,
      total,
      showSizeChanger: true,
      onChange: handleTableChange,
    }),
    [handleTableChange, page, pageSize, total],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    pagination,
    handleDelete,
    reloadBlogs: loadBlogs,
    setSuccessOnReload,
  };
};
