import { Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createSkill,
  getSkill,
  updateSkill,
  type SkillPayload,
  type SkillResponse,
  type SkillSonResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface SkillFormValues extends SkillPayload {}

interface UseSkillFormOptions {
  skillId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useSkillForm = ({ skillId, mode, onSuccess }: UseSkillFormOptions) => {
  const [form] = Form.useForm<SkillFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedSkillSons, setSelectedSkillSons] = useState<SkillSonResponse[]>([]);

  const loadSkill = useCallback(async () => {
    if (mode !== "edit" || !skillId) {
      return;
    }
    setLoading(true);
    try {
      const data: SkillResponse = await getSkill(skillId);
      form.setFieldsValue({
        name: data.name,
        nameEng: data.nameEng,
        skillSonIds: data.skillSons?.map((skillSon) => skillSon.id) ?? [],
      });
      setSelectedSkillSons(data.skillSons ?? []);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar la habilidad",
      });
    } finally {
      setLoading(false);
    }
  }, [form, mode, notifyError, skillId]);

  useEffect(() => {
    loadSkill();
  }, [loadSkill]);

  const handleSkillSonsSelect = useCallback(
    (selectedIds: number[], selectedRecords: SkillSonResponse[]) => {
      if (selectedRecords.length) {
        setSelectedSkillSons(selectedRecords);
      }
      if (selectedIds.length) {
        form.setFieldsValue({ skillSonIds: selectedIds });
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: SkillFormValues) => {
      setSaving(true);
      try {
        const payload: SkillPayload = {
          name: values.name,
          nameEng: values.nameEng,
          skillSonIds: values.skillSonIds,
        };
        const response =
          mode === "edit" && skillId
            ? await updateSkill(skillId, payload)
            : await createSkill(payload);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          const successMessage = mode === "edit" ? "Habilidad actualizada" : "Habilidad creada";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "La habilidad se actualizó correctamente."
                  : "La habilidad se creó correctamente.",
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
              ? "No se pudo actualizar la habilidad"
              : "No se pudo crear la habilidad",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [mode, notifyError, notifySuccess, onSuccess, skillId],
  );

  return {
    form,
    isLoading,
    isSaving,
    selectedSkillSons,
    handleSkillSonsSelect,
    handleSubmit,
  };
};
