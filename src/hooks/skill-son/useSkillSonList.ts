import { useCallback, useEffect, useState } from "react";
import { deleteSkillSon, getSkillSons, type SkillSonResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useSkillSonList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<SkillSonResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadSkillSons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSkillSons();
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
        description: "No se pudo cargar la lista de habilidades hijas",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadSkillSons();
  }, [loadSkillSons]);

  const handleDelete = useCallback(
    async (skillSonId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteSkillSon(skillSonId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Habilidad hija eliminada",
            description: "La habilidad hija se eliminó correctamente.",
          });
          await loadSkillSons();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar la habilidad hija",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadSkillSons, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkillSons: loadSkillSons,
    setSuccessOnReload,
  };
};
