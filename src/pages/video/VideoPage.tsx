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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNotification } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { useCallback, useMemo, useState } from "react";
import { VIDEO_RESOURCE } from "../../config/video-config";
import {
  createVideo,
  deleteVideo,
  type VideoPayload,
  type VideoResponse,
} from "../../providers/videoProvider";

const { Title, Text } = Typography;

const YOUTUBE_ID_PATTERN =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/;

const getYoutubeVideoId = (url: string) => {
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match?.[1];
};

const getYoutubePreviewUrl = (url: string) => {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;
};

interface VideoFormValues extends VideoPayload {}

export const VideoPage = () => {
  const [form] = Form.useForm<VideoFormValues>();
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
        notifyError("No se pudo eliminar el video");
      } finally {
        setBusy(false);
      }
    },
    [notifyError, open, tableQuery],
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
        notifyError("No se pudo crear el video");
      } finally {
        setBusy(false);
        setSaving(false);
      }
    },
    [form, notifyError, open, tableQuery],
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
        title: "Previsualización",
        dataIndex: "preview",
        render: (_: unknown, record: VideoResponse) => {
          const previewUrl = getYoutubePreviewUrl(record.url);
          if (!previewUrl) {
            return <Text type="secondary">URL inválida</Text>;
          }
          return (
            <div className="video-preview">
              <img src={previewUrl} alt={`${record.name} preview`} loading="lazy" />
            </div>
          );
        },
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: VideoResponse) => (
          <Popconfirm
            title={`¿Está seguro de eliminar el video con id ${record.id}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
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
    <div className="video-panel">
      <div className="video-header">
        <Space size="middle" align="center">
          <Title level={3}>Videos</Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Agregar video
        </Button>
      </div>
      {isBusy && !isTableLoading && (
        <div className="video-busy-overlay">
          <Spin tip="Procesando..." size="large" />
        </div>
      )}
      {isTableLoading ? (
        <div className="video-loading">
          <Spin tip="Cargando videos..." size="large" />
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
        title="Agregar video"
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
          <Form.Item
            label="URL del video"
            name="url"
            rules={[
              { required: true, message: "Ingresa la URL del video" },
              {
                validator: (_, value) =>
                  value && !getYoutubeVideoId(value)
                    ? Promise.reject(
                        new Error("Solo se permiten videos alojados en YouTube"),
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <Input placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX" />
          </Form.Item>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving} block>
              Guardar video
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
