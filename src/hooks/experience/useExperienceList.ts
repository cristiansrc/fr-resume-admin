import { useCallback, useEffect, useState } from "react";
import { deleteExperience, getExperiences, type ExperienceResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useExperienceList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<ExperienceResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getExperiences();
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
        description: "No se pudo cargar la lista de experiencias",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleDelete = useCallback(
    async (experienceId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteExperience(experienceId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Experiencia eliminada",
            description: "La experiencia se eliminó correctamente.",
          });
          await loadExperiences();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar la experiencia",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadExperiences, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadExperiences: loadExperiences,
    setSuccessOnReload,
  };
};
