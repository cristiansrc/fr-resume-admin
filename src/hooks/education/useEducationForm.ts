import { Form } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";
import {
  createEducation,
  getEducation,
  updateEducation,
  type EducationPayload,
  type EducationResponse,
} from "../../api";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import { useNotifier } from "../useNotifier";

export interface EducationFormValues {
  startDate?: Dayjs;
  endDate?: Dayjs;
  institution: string;
  area: string;
  areaEng: string;
  degree: string;
  degreeEng: string;
  location: string;
  locationEng: string;
  highlights?: string[];
  highlightsEng?: string[];
}

interface UseEducationFormOptions {
  educationId?: number;
  mode: "create" | "edit";
  onSuccess?: (message: string) => void;
}

export const useEducationForm = ({
  educationId,
  mode,
  onSuccess,
}: UseEducationFormOptions) => {
  const [form] = Form.useForm<EducationFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const loadEducation = useCallback(async () => {
    if (mode !== "edit" || !educationId) {
      return;
    }
    setLoading(true);
    try {
      const data: EducationResponse = await getEducation(educationId);
      form.setFieldsValue({
        startDate: data.startDate ? dayjs(data.startDate) : undefined,
        endDate: data.endDate ? dayjs(data.endDate) : undefined,
        institution: data.institution,
        area: data.area,
        areaEng: data.areaEng,
        degree: data.degree,
        degreeEng: data.degreeEng,
        location: data.location,
        locationEng: data.locationEng,
        highlights: data.highlights ?? [],
        highlightsEng: data.highlightsEng ?? [],
      });
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar el estudio",
      });
    } finally {
      setLoading(false);
    }
  }, [educationId, form, mode, notifyError]);

  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  const handleSubmit = useCallback(
    async (values: EducationFormValues) => {
      setSaving(true);
      try {
        const payload: EducationPayload = {
          institution: values.institution,
          area: values.area,
          areaEng: values.areaEng,
          degree: values.degree,
          degreeEng: values.degreeEng,
          startDate: values.startDate
            ? values.startDate.format(BASIC_DATA_DATE_FORMAT)
            : "",
          endDate: values.endDate ? values.endDate.format(BASIC_DATA_DATE_FORMAT) : "",
          location: values.location,
          locationEng: values.locationEng,
          highlights: values.highlights ?? [],
          highlightsEng: values.highlightsEng ?? [],
        };
        const response =
          mode === "edit" && educationId
            ? await updateEducation(educationId, payload)
            : await createEducation(payload);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          const successMessage =
            mode === "edit" ? "Estudio actualizado" : "Estudio creado";
          if (onSuccess) {
            onSuccess(successMessage);
          } else {
            notifySuccess({
              message: successMessage,
              description:
                mode === "edit"
                  ? "El estudio se actualizó correctamente."
                  : "El estudio se creó correctamente.",
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
              ? "No se pudo actualizar el estudio"
              : "No se pudo crear el estudio",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [educationId, mode, notifyError, notifySuccess, onSuccess],
  );

  return {
    form,
    isLoading,
    isSaving,
    handleSubmit,
  };
};
