import { Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  getHome,
  updateHome,
  type HomeResponse,
  type HomeUpdatePayload,
  type ImageResponse,
  type LabelResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";

export interface HomeFormValues extends HomeUpdatePayload {}

interface UseHomeContentPageOptions {
  homeId: number;
}

export const useHomeContentPage = ({ homeId }: UseHomeContentPageOptions) => {
  const [form] = Form.useForm<HomeFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isLoading, setLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<LabelResponse[]>([]);

  const loadHome = useCallback(async () => {
    setLoading(true);
    try {
      const data: HomeResponse = await getHome(homeId);
      form.setFieldsValue({
        greeting: data.greeting,
        greetingEng: data.greetingEng,
        buttonWorkLabel: data.buttonWorkLabel,
        buttonWorkLabelEng: data.buttonWorkLabelEng,
        buttonContactLabel: data.buttonContactLabel,
        buttonContactLabelEng: data.buttonContactLabelEng,
        imageUrlId: data.imageUrl?.id,
        labelIds: data.labels?.map((label) => label.id) ?? [],
      });
      setSelectedImage(data.imageUrl ?? null);
      setSelectedLabels(data.labels ?? []);
    } catch {
      notifyError({
        message: "Error",
        description: "No se pudo cargar la información del home",
      });
    } finally {
      setLoading(false);
    }
  }, [form, homeId, notifyError]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const handleImageSelect = useCallback(
    (selectedIds: number[], selectedRecords: ImageResponse[]) => {
      const [image] = selectedRecords;
      if (image) {
        setSelectedImage(image);
      }
      if (selectedIds[0]) {
        form.setFieldsValue({ imageUrlId: selectedIds[0] });
      }
    },
    [form],
  );

  const handleLabelsSelect = useCallback(
    (selectedIds: number[], selectedRecords: LabelResponse[]) => {
      if (selectedRecords.length) {
        setSelectedLabels(selectedRecords);
      }
      if (selectedIds.length) {
        form.setFieldsValue({ labelIds: selectedIds });
      }
    },
    [form],
  );

  const handleSubmit = useCallback(
    async (values: HomeFormValues) => {
      setSaving(true);
      try {
        const { status } = await updateHome(homeId, values);
        if (status === 204) {
          notifySuccess({
            message: "Home actualizado",
            description: "La información del home se actualizó correctamente.",
          });
          return;
        }
        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo actualizar el home",
        });
      } finally {
        setSaving(false);
      }
    },
    [homeId, notifyError, notifySuccess],
  );

  return {
    form,
    isLoading,
    isSaving,
    selectedImage,
    selectedLabels,
    handleImageSelect,
    handleLabelsSelect,
    handleSubmit,
    reloadHome: loadHome,
  };
};
