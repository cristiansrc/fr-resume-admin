import { useCallback, useEffect, useState } from "react";
import { deleteEducation, getEducations, type EducationResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useEducationList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<EducationResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadEducations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEducations();
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
        description: "No se pudo cargar la lista de estudios",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadEducations();
  }, [loadEducations]);

  const handleDelete = useCallback(
    async (educationId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteEducation(educationId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Estudio eliminado",
            description: "El estudio se eliminó correctamente.",
          });
          await loadEducations();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar el estudio",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadEducations, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadEducations: loadEducations,
    setSuccessOnReload,
  };
};
