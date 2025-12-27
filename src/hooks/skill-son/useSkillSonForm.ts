import { Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createSkillSon,
  getSkillSon,
  updateSkillSon,
  type SkillSonPayload,
  type SkillSonResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface SkillSonFormValues extends SkillSonPayload {}

interface UseSkillSonFormOptions {
  skillSonId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useSkillSonForm = ({
  skillSonId,
  mode,
  onSuccess,
}: UseSkillSonFormOptions) => {
  const [form] = Form.useForm<SkillSonFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const loadSkillSon = useCallback(async () => {
    if (mode !== "edit" || !skillSonId) {
      return;
    }
    setLoading(true);
    try {
      const data: SkillSonResponse = await getSkillSon(skillSonId);
      form.setFieldsValue({
        name: data.name,
        nameEng: data.nameEng,
      });
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar la habilidad hija",
      });
    } finally {
      setLoading(false);
    }
  }, [form, mode, notifyError, skillSonId]);

  useEffect(() => {
    loadSkillSon();
  }, [loadSkillSon]);

  const handleSubmit = useCallback(
    async (values: SkillSonFormValues) => {
      setSaving(true);
      try {
        const payload: SkillSonPayload = {
          name: values.name,
          nameEng: values.nameEng,
        };
        const response =
          mode === "edit" && skillSonId
            ? await updateSkillSon(skillSonId, payload)
            : await createSkillSon(payload);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          const successMessage =
            mode === "edit" ? "Habilidad hija actualizada" : "Habilidad hija creada";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "La habilidad hija se actualizó correctamente."
                  : "La habilidad hija se creó correctamente.",
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
              ? "No se pudo actualizar la habilidad hija"
              : "No se pudo crear la habilidad hija",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [mode, notifyError, notifySuccess, onSuccess, skillSonId],
  );

  return {
    form,
    isLoading,
    isSaving,
    handleSubmit,
  };
};
