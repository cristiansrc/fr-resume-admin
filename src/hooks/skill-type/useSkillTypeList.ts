import { useCallback, useEffect, useState } from "react";
import { deleteSkillType, getSkillTypes, type SkillTypeResponse } from "../../api";
import { useNotifier } from "../useNotifier";

export const useSkillTypeList = () => {
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [data, setData] = useState<SkillTypeResponse[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const loadSkillTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSkillTypes();
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
        description: "No se pudo cargar la lista de tipos de habilidad",
      });
    } finally {
      setLoading(false);
    }
  }, [notifyError, notifySuccess, pendingMessage]);

  useEffect(() => {
    loadSkillTypes();
  }, [loadSkillTypes]);

  const handleDelete = useCallback(
    async (skillTypeId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteSkillType(skillTypeId);
        if (status === 200 || status === 201 || status === 204) {
          notifySuccess({
            message: "Tipo de habilidad eliminado",
            description: "El tipo de habilidad se eliminó correctamente.",
          });
          await loadSkillTypes();
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar el tipo de habilidad",
        });
      } finally {
        setBusy(false);
      }
    },
    [loadSkillTypes, notifyError, notifySuccess],
  );

  const setSuccessOnReload = useCallback((message: string) => {
    setPendingMessage(message);
  }, []);

  return {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkillTypes: loadSkillTypes,
    setSuccessOnReload,
  };
};
