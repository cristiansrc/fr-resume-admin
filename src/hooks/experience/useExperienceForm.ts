import { Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";
import {
  createExperience,
  getExperience,
  updateExperience,
  type ExperiencePayload,
  type ExperienceResponse,
  type SkillSonResponse,
} from "../../api";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import { useNotifier } from "../useNotifier";

export interface ExperienceFormValues {
  yearStart?: Dayjs;
  yearEnd?: Dayjs;
  company: string;
  description: string;
  descriptionEng: string;
  skillSonIds: number[];
}

interface UseExperienceFormOptions {
  experienceId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useExperienceForm = ({
  experienceId,
  mode,
  onSuccess,
}: UseExperienceFormOptions) => {
  const [form] = Form.useForm<ExperienceFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedSkillSons, setSelectedSkillSons] = useState<SkillSonResponse[]>([]);

  const loadExperience = useCallback(async () => {
    if (mode !== "edit" || !experienceId) {
      return;
    }
    setLoading(true);
    try {
      const data: ExperienceResponse = await getExperience(experienceId);
      form.setFieldsValue({
        yearStart: data.yearStart ? dayjs(data.yearStart) : undefined,
        yearEnd: data.yearEnd ? dayjs(data.yearEnd) : undefined,
        company: data.company,
        description: data.description,
        descriptionEng: data.descriptionEng,
        skillSonIds: data.skillSons?.map((skillSon) => skillSon.id) ?? [],
      });
      setSelectedSkillSons(data.skillSons ?? []);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar la experiencia",
      });
    } finally {
      setLoading(false);
    }
  }, [experienceId, form, mode, notifyError]);

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

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
    async (values: ExperienceFormValues) => {
      setSaving(true);
      try {
        const payload: ExperiencePayload = {
          yearStart: values.yearStart
            ? values.yearStart.format(BASIC_DATA_DATE_FORMAT)
            : "",
          yearEnd: values.yearEnd ? values.yearEnd.format(BASIC_DATA_DATE_FORMAT) : "",
          company: values.company,
          description: values.description,
          descriptionEng: values.descriptionEng,
          skillSonIds: values.skillSonIds,
        };
        const response =
          mode === "edit" && experienceId
            ? await updateExperience(experienceId, payload)
            : await createExperience(payload);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          const successMessage =
            mode === "edit" ? "Experiencia actualizada" : "Experiencia creada";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "La experiencia se actualizó correctamente."
                  : "La experiencia se creó correctamente.",
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
              ? "No se pudo actualizar la experiencia"
              : "No se pudo crear la experiencia",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [experienceId, mode, notifyError, notifySuccess, onSuccess],
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
