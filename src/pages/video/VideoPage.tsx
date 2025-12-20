import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Typography,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { type VideoResponse } from "../../api";
import { useVideoPage } from "../../hooks/video/useVideoPage";
import { getYoutubePreviewUrl, getYoutubeVideoId } from "../../utils/youtube";
import { LoadingBlock, SectionHeader } from "../../components";

const { Text } = Typography;

export const VideoPage = () => {
  const {
    form,
    isModalOpen,
    isBusy,
    isSaving,
    tableProps,
    isTableLoading,
    handleDelete,
    handleCreate,
    handleOpenModal,
    handleCloseModal,
    validateYoutubeUrl,
  } = useVideoPage();
  const [previewVideoId, setPreviewVideoId] = useState<string>();

  const handleOpenPreview = useCallback((url: string) => {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setPreviewVideoId(videoId);
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideoId(undefined);
  }, []);

  const previewEmbedUrl = previewVideoId
    ? `https://www.youtube.com/embed/${previewVideoId}?autoplay=1`
    : undefined;

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
              <button
                type="button"
                onClick={() => handleOpenPreview(record.url)}
                aria-label={`Reproducir ${record.name}`}
                className="video-preview-button"
              >
                <img
                  src={previewUrl}
                  alt={`${record.name} preview`}
                  loading="lazy"
                />
              </button>
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
    [handleDelete, handleOpenPreview, isBusy],
  );

  return (
    <div className="video-panel">
      <SectionHeader
        className="video-header"
        title="Videos"
        action={{
          label: "Agregar video",
          icon: <PlusOutlined />,
          onClick: handleOpenModal,
        }}
      />
      {isBusy && !isTableLoading && (
        <LoadingBlock className="video-busy-overlay" tip="Procesando..." />
      )}
      {isTableLoading ? (
        <LoadingBlock className="video-loading" tip="Cargando videos..." />
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
        onCancel={handleCloseModal}
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
                validator: (_, value) => validateYoutubeUrl(value),
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
      <Modal
        open={Boolean(previewVideoId)}
        title="Previsualización de video"
        onCancel={handleClosePreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
        closeIcon={<CloseOutlined />}
      >
        {previewEmbedUrl ? (
          <div className="video-preview-frame">
            <iframe
              src={previewEmbedUrl}
              title="Video preview"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="video-preview-iframe"
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
