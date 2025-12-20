import { Form } from "antd";
import { useTable } from "@refinedev/antd";
import { useCallback, useState } from "react";
import { LABEL_RESOURCE } from "../../config/label-config";
import {
  createLabel,
  deleteLabel,
  type LabelPayload,
  type LabelResponse,
} from "../../api";
import { useNotifier } from "../useNotifier";
import { useModalState } from "../useModalState";

interface LabelFormValues extends LabelPayload {}

export const useLabelPage = () => {
  const [form] = Form.useForm<LabelFormValues>();
  const { notifyError, notifySuccess } = useNotifier();
  const [isBusy, setBusy] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const {
    isOpen: isModalOpen,
    open: handleOpenModal,
    close: handleCloseModal,
  } = useModalState();

  const { tableProps, tableQuery } = useTable<LabelResponse>({
    resource: LABEL_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });

  const handleDelete = useCallback(
    async (labelId: number) => {
      setBusy(true);
      try {
        const { status } = await deleteLabel(labelId);
        if (status === 204) {
          const successPayload = {
            message: "Etiqueta eliminada",
            description: "El label se eliminó correctamente.",
          };
          notifySuccess(successPayload);
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError({
          message: "Error",
          description: "No se pudo eliminar el label",
        });
      } finally {
        setBusy(false);
      }
    },
    [notifyError, notifySuccess, tableQuery],
  );

  const handleCreate = useCallback(
    async (values: LabelFormValues) => {
      setBusy(true);
      setSaving(true);
      try {
        const { status } = await createLabel(values);

        if (status === 201) {
          const successPayload = {
            message: "Label creado",
            description: "El label se creó correctamente.",
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
          description: "No se pudo crear el label",
        });
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [notifyError, notifySuccess, handleCloseModal, form, tableQuery],
  );

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
  };
};
