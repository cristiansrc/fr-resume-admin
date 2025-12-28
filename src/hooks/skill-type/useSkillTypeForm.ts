import { Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createSkillType,
  getSkillType,
  updateSkillType,
  type SkillResponse,
  type SkillTypePayload,
  type SkillTypeResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface SkillTypeFormValues extends SkillTypePayload {}

interface UseSkillTypeFormOptions {
  skillTypeId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useSkillTypeForm = ({
  skillTypeId,
  mode,
  onSuccess,
}: UseSkillTypeFormOptions) => {
  const [form] = Form.useForm<SkillTypeFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillResponse[]>([]);

  const loadSkillType = useCallback(async () => {
    if (mode !== "edit" || !skillTypeId) {
      return;
    }
    setLoading(true);
    try {
      const data: SkillTypeResponse = await getSkillType(skillTypeId);
      form.setFieldsValue({
        name: data.name,
        nameEng: data.nameEng,
        skillIds: data.skills?.map((skill) => skill.id) ?? [],
      });
      setSelectedSkills(data.skills ?? []);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar el tipo de habilidad",
      });
    } finally {
      setLoading(false);
    }
  }, [form, mode, notifyError, skillTypeId]);

  useEffect(() => {
    loadSkillType();
  }, [loadSkillType]);

  const handleSkillsSelect = useCallback(
    (selectedIds: number[], selectedRecords: SkillResponse[]) => {
      if (selectedRecords.length) {
        setSelectedSkills(selectedRecords);
      }
      if (selectedIds.length) {
        form.setFieldsValue({ skillIds: selectedIds });
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: SkillTypeFormValues) => {
      setSaving(true);
      try {
        const payload: SkillTypePayload = {
          name: values.name,
          nameEng: values.nameEng,
          skillIds: values.skillIds,
        };
        const response =
          mode === "edit" && skillTypeId
            ? await updateSkillType(skillTypeId, payload)
            : await createSkillType(payload);
        if (
          response.status === 200 ||
          response.status === 201 ||
          response.status === 204
        ) {
          const successMessage =
            mode === "edit"
              ? "Tipo de habilidad actualizado"
              : "Tipo de habilidad creado";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "El tipo de habilidad se actualizó correctamente."
                  : "El tipo de habilidad se creó correctamente.",
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
              ? "No se pudo actualizar el tipo de habilidad"
              : "No se pudo crear el tipo de habilidad",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [mode, notifyError, notifySuccess, onSuccess, skillTypeId],
  );

  return {
    form,
    isLoading,
    isSaving,
    selectedSkills,
    handleSkillsSelect,
    handleSubmit,
  };
};
