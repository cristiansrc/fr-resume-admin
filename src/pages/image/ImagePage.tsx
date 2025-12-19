import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useNotification } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { useCallback, useMemo, useState } from "react";
import { IMAGE_RESOURCE } from "../../config/image-config";
import {
  createImage,
  deleteImage,
  type ImagePayload,
  type ImageResponse,
} from "../../providers/imageProvider";

const { Title } = Typography;

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

export const ImagePage = () => {
  const [form] = Form.useForm<ImageFormValues>();
  const { open } = useNotification();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [fileBase64, setFileBase64] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<RcFile>[]>([]);

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

  const { tableProps, tableQuery } = useTable<ImageResponse>({
    resource: IMAGE_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });

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
        notifyError("No se pudo eliminar la imagen");
      } finally {
        setBusy(false);
      }
    },
    [notifyError, open, tableQuery],
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
          notification.success(successPayload);
          message.success(successPayload.description ?? successPayload.message);
          open?.({
            type: "success",
            ...successPayload,
          });
          setModalOpen(false);
          form.resetFields();
          setFileList([]);
          setFileBase64(undefined);
          await tableQuery.refetch();
          return;
        }

        throw new Error("Respuesta inesperada");
      } catch {
        notifyError("No se pudo guardar la imagen");
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [fileBase64, form, notifyError, open, tableQuery],
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
    } catch (error) {
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
        title: "Vista previa",
        dataIndex: "url",
        render: (_: unknown, record: ImageResponse) => (
          <div className="image-preview">
            <img src={record.url} alt={`Vista previa ${record.name}`} loading="lazy" />
          </div>
        ),
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: ImageResponse) => (
          <Popconfirm
            title={`¿Está seguro de eliminar la imagen con id ${record.id}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okType="danger"
            okButtonProps={{
              loading: isBusy,
              "data-testid": `confirm-delete-${record.id}`,
            }}
            placement="topRight"
          >
            <Button danger type="link">
              Eliminar
            </Button>
          </Popconfirm>
        ),
      },
    ],
    [handleDelete, isBusy],
  );

  const isTableLoading = tableProps.loading;

  return (
    <div className="image-panel">
      <div className="image-header">
        <Space size="middle" align="center">
          <Title level={3}>Imágenes</Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Agregar Imagen
        </Button>
      </div>
      {isBusy && !isTableLoading && (
        <div className="image-busy-overlay">
          <Spin tip="Procesando..." size="large" />
        </div>
      )}
      {isTableLoading ? (
        <div className="image-loading">
          <Spin tip="Cargando imágenes..." size="large" />
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
        title="Agregar Imagen"
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setFileList([]);
          setFileBase64(undefined);
        }}
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
          <Form.Item label="Imagen" required>
            <Upload
              accept="image/*"
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemoveFile}
              fileList={fileList}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
            </Upload>
          </Form.Item>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving} block>
              Guardar Imagen
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
