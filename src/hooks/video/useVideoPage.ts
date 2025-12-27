import { Form } from "antd";
import { useTable } from "@refinedev/antd";
import { useCallback, useState } from "react";
import axios from "axios";
import { VIDEO_RESOURCE } from "../../config/video-config";
import {
  createVideo,
  deleteVideo,
  type VideoPayload,
  type VideoResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";
import { isYoutubeUrlValid } from "../../utils/youtube";
import { useModalState } from "../useModalState";

interface VideoFormValues extends VideoPayload {}

export const useVideoPage = () => {
  const [form] = Form.useForm<VideoFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isBusy, setBusy] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const {
    isOpen: isModalOpen,
    open: handleOpenModal,
    close: handleCloseModal,
  } = useModalState();

  const { tableProps, tableQuery } = useTable<VideoResponse>({
    resource: VIDEO_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });

  const handleDelete = useCallback(
    async (videoId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteVideo(videoId);
        if (status === 204) {
          const successPayload = {
            message: "Video eliminado",
            description: "El video se eliminó correctamente.",
          };
          notifySuccess(successPayload);
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 412) {
          notifyError({
            message: "No se pudo eliminar",
            description:
              "El video está relacionado. Elimina la relación antes de borrar.",
          });
        } else {
          notifyError({
            message: "Error",
            description: "No se pudo eliminar el video",
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [notifyError, notifySuccess, tableQuery],
  );

  const handleCreate = useCallback(
    async (values: VideoFormValues) => {
      setBusy(true);
      setSaving(true);
      try {
        const { status } = await createVideo(values);
        if (status === 201) {
          const successPayload = {
            message: "Video creado",
            description: "El video se creó correctamente.",
          };
          notifySuccess(successPayload);
          handleCloseModal();
          form.resetFields();
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo crear el video",
        });
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [form, notifyError, notifySuccess, handleCloseModal, tableQuery],
  );

  const validateYoutubeUrl = useCallback((value?: string) => {
    if (value && !isYoutubeUrlValid(value)) {
      return Promise.reject(
        new Error("Solo se permiten videos alojados en YouTube"),
      );
    }
    return Promise.resolve();
  }, []);

  return {
    form,
    isModalOpen,
    isBusy,
    isSaving,
    tableProps,
    isTableLoading: tableProps.loading,
    handleDelete,
    handleCreate,
    handleOpenModal,
    handleCloseModal,
    validateYoutubeUrl,
  };
};
