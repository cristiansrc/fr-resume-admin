import { useCallback, useEffect, useState } from "react";
import { deleteSkill, getSkills, type SkillResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useSkillList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<SkillResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSkills();
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
        description: "No se pudo cargar la lista de habilidades",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleDelete = useCallback(
    async (skillId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteSkill(skillId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Habilidad eliminada",
            description: "La habilidad se eliminó correctamente.",
          });
          await loadSkills();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar la habilidad",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadSkills, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkills: loadSkills,
    setSuccessOnReload,
  };
};
