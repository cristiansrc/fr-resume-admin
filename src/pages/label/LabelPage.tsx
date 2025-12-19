import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { useTable } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { PlusOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { LABEL_RESOURCE } from "../../config/label-config";
import {
  createLabel,
  deleteLabel,
  type LabelPayload,
  type LabelResponse,
} from "../../providers/labelProvider";

const { Title } = Typography;

interface LabelFormValues extends LabelPayload {}

export const LabelPage = () => {
  const [form] = Form.useForm<LabelFormValues>();
  const { open } = useNotification();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const notifyError = useCallback(
    (errorMessage: string) => {
      const errorPayload = {
        message: "Error",
        description: errorMessage,
      };
      notification.error(errorPayload);
      message.error(errorMessage);
      open?.({
        type: "error",
        ...errorPayload,
      });
    },
    [open],
  );

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
          notification.success(successPayload);
          message.success(successPayload.description ?? successPayload.message);
          open?.({
            type: "success",
            ...successPayload,
          });
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError("No se pudo eliminar el label");
      } finally {
        setBusy(false);
      }
    },
      [notifyError, open, tableQuery],
  );

  const showDeleteConfirm = useCallback(
    (label: LabelResponse) => {
      Modal.confirm({
        title: "Eliminar label",
        content: `¿Deseas eliminar ${label.name}?`,
        okText: "Sí",
        cancelText: "No",
        okButtonProps: { loading: isBusy },
        onOk: async () => {
          await handleDelete(label.id);
        },
      });
    },
    [handleDelete, isBusy],
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
          notification.success(successPayload);
          message.success(successPayload.description ?? successPayload.message);
          open?.({
            type: "success",
            ...successPayload,
          });
          setModalOpen(false);
          form.resetFields();
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError("No se pudo crear el label");
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [notifyError, form, open, tableQuery],
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
      },
      {
        title: "Nombre",
        dataIndex: "name",
      },
      {
        title: "Nombre (inglés)",
        dataIndex: "nameEng",
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: LabelResponse) => (
          <Button
            danger
            type="link"
            onClick={() => showDeleteConfirm(record)}
          >
            Eliminar
          </Button>
        ),
      },
    ],
    [handleDelete, isBusy],
  );

  const isTableLoading = tableProps.loading;

  return (
    <div className="label-panel">
      <div className="label-header">
        <Space size="middle" align="center">
          <Title level={3}>Labels</Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Agregar Label
        </Button>
      </div>
      {isBusy && !isTableLoading && (
        <div className="label-busy-overlay">
          <Spin tip="Procesando..." size="large" />
        </div>
      )}
      {isTableLoading ? (
        <div className="label-loading">
          <Spin tip="Cargando etiquetas..." size="large" />
        </div>
      ) : (
        <Table
          {...tableProps}
          columns={columns}
          rowKey="id"
          dataSource={tableProps.dataSource ?? []}
        />
      )}
      <Modal
        open={isModalOpen}
        title="Agregar Label"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Ingresa un nombre" }]}
          >
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item
            label="Nombre (inglés)"
            name="nameEng"
            rules={[{ required: true, message: "Ingresa un nombre en inglés" }]}
          >
            <Input placeholder="Name in English" />
          </Form.Item>
          <Form.Item className="basic-data-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              block
            >
              Guardar Label
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
