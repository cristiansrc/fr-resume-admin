import { Form, message } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { useTable } from "@refinedev/antd";
import { useCallback, useState } from "react";
import axios from "axios";
import { IMAGE_RESOURCE } from "../../config/image-config";
import {
  createImage,
  deleteImage,
  type ImagePayload,
  type ImageResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";
import { useModalState } from "../useModalState";

interface ImageFormValues {
  name: string;
  nameEng: string;
}

const toBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Formato no soportado"));
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
  });

export const useImagePage = () => {
  const [form] = Form.useForm<ImageFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isBusy, setBusy] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [fileBase64, setFileBase64] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<RcFile>[]>([]);

  const { tableProps, tableQuery } = useTable<ImageResponse>({
    resource: IMAGE_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });

  const resetFormState = useCallback(() => {
    form.resetFields();
    setFileList([]);
    setFileBase64(undefined);
  }, [form]);

  const {
    isOpen: isModalOpen,
    open: handleOpenModal,
    close: handleCloseModal,
  } = useModalState({ onClose: resetFormState });

  const handleDelete = useCallback(
    async (imageId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteImage(imageId);
        if (status === 200 || status === 201 || status === 204) {
          const successPayload = {
            message: "Imagen eliminada",
            description: "La imagen se eliminó correctamente.",
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
              "La imagen está relacionada. Elimina la relación antes de borrar.",
          });
        } else {
          notifyError({
            message: "Error",
            description: "No se pudo eliminar la imagen",
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [notifyError, notifySuccess, tableQuery],
  );

  const handleCreate = useCallback(
    async (values: ImageFormValues) => {
      if (!fileBase64) {
        message.error("Selecciona una imagen para continuar.");
        return;
      }

      setBusy(true);
      setSaving(true);
      try {
        const payload: ImagePayload = {
          ...values,
          file: fileBase64,
        };
        const { status } = await createImage(payload);
        if (status === 200 || status === 201 || status === 204) {
          const successPayload = {
            message: "Imagen guardada",
            description: "La imagen se guardó correctamente.",
          };
          notifySuccess(successPayload);
          handleCloseModal();
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo guardar la imagen",
        });
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [fileBase64, handleCloseModal, notifyError, notifySuccess, tableQuery],
  );

  const handleBeforeUpload = useCallback(async (file: RcFile) => {
    try {
      const base64 = await toBase64(file);
      setFileBase64(base64);
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          type: file.type,
          size: file.size,
        },
      ]);
    } catch {
      setFileBase64(undefined);
      setFileList([]);
      message.error("No se pudo procesar la imagen seleccionada.");
    }
    return false;
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFileBase64(undefined);
    setFileList([]);
    return true;
  }, []);

  return {
    form,
    isModalOpen,
    isBusy,
    isSaving,
    fileList,
    tableProps,
    isTableLoading: tableProps.loading,
    handleDelete,
    handleCreate,
    handleBeforeUpload,
    handleRemoveFile,
    handleOpenModal,
    handleCloseModal,
  };
};
