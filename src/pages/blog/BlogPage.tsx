import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Col,
  Table,
  Typography,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import {
  ImageSelector,
  LoadingBlock,
  SectionHeader,
  VideoSelector,
} from "../../components";
import type { BlogPayload, BlogResponse } from "../../api";
import { useBlogForm } from "../../hooks/blog/useBlogForm";
import { useBlogList } from "../../hooks/blog/useBlogList";
import { getYoutubePreviewUrl, getYoutubeVideoId } from "../../utils/youtube";

type BlogView = "list" | "create" | "edit";

const { Text } = Typography;

const REQUIRED_IMAGE_VALIDATOR = (_: unknown, value?: number) => {
  if (typeof value === "number" && value > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona una imagen"));
};

const REQUIRED_VIDEO_VALIDATOR = (_: unknown, value?: number) => {
  if (typeof value === "number" && value > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona un video"));
};

interface BlogFormProps {
  mode: "create" | "edit";
  blogId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const BlogForm = ({ mode, blogId, onBack, onSaved }: BlogFormProps) => {
  const {
    form,
    isLoading,
    isSaving,
    selectedImage,
    selectedVideo,
    handleImageSelect,
    handleVideoSelect,
    handleSubmit,
  } = useBlogForm({
    blogId,
    mode,
    onSuccess: onSaved,
  });
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string>();

  const handleOpenImagePreview = useCallback(() => {
    if (selectedImage) {
      setIsImagePreviewOpen(true);
    }
  }, [selectedImage]);

  const handleCloseImagePreview = useCallback(() => {
    setIsImagePreviewOpen(false);
  }, []);

  const handleOpenVideoPreview = useCallback((url: string) => {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setPreviewVideoId(videoId);
    }
  }, []);

  const handleCloseVideoPreview = useCallback(() => {
    setPreviewVideoId(undefined);
  }, []);

  const previewEmbedUrl = previewVideoId
    ? `https://www.youtube.com/embed/${previewVideoId}?autoplay=1`
    : undefined;

  const handleFinish = useCallback(
    async (values: BlogPayload) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  return (
    <div className="blog-panel">
      <SectionHeader
        className="blog-header"
        title={mode === "edit" ? "Editar blog" : "Crear blog"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="blog-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="blog-loading" tip="Cargando blog..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="blog-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="Título"
                rules={[{ required: true, message: "Ingresa el título" }]}
              >
                <Input placeholder="Título en español" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="titleEng"
                label="Título (inglés)"
                rules={[
                  { required: true, message: "Ingresa el título en inglés" },
                ]}
              >
                <Input placeholder="Title in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="cleanUrlTitle" label="URL limpia">
                <Input placeholder="Opcional" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="descriptionShort"
                label="Descripción corta"
                rules={[
                  { required: true, message: "Ingresa la descripción corta" },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Descripción corta" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="descriptionShortEng"
                label="Descripción corta (inglés)"
                rules={[
                  {
                    required: true,
                    message: "Ingresa la descripción corta en inglés",
                  },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Short description" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="description"
                label="Descripción"
                rules={[
                  { required: true, message: "Ingresa la descripción" },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Descripción" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="descriptionEng"
                label="Descripción (inglés)"
                rules={[
                  { required: true, message: "Ingresa la descripción en inglés" },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Description in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Imagen" required>
                <Form.Item
                  name="imageUrlId"
                  rules={[{ validator: REQUIRED_IMAGE_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="blog-image-selection">
                  {selectedImage ? (
                    <button
                      type="button"
                      onClick={handleOpenImagePreview}
                      className="blog-image-preview-button"
                      aria-label={`Ver imagen ${selectedImage.name}`}
                    >
                      <img
                        src={selectedImage.url}
                        alt={`Vista previa ${selectedImage.name}`}
                        className="blog-image-preview-thumb"
                      />
                    </button>
                  ) : (
                    <Text type="secondary">Sin imagen seleccionada</Text>
                  )}
                  <ImageSelector
                    selectionMode="single"
                    buttonLabel="Seleccionar imagen"
                    initialSelectedIds={selectedImage ? [selectedImage.id] : []}
                    onConfirm={handleImageSelect}
                  />
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Video" required>
                <Form.Item
                  name="videoUrlId"
                  rules={[{ validator: REQUIRED_VIDEO_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="blog-video-selection">
                  {selectedVideo ? (
                    (() => {
                      const previewUrl = getYoutubePreviewUrl(selectedVideo.url);
                      if (!previewUrl) {
                        return <Text type="secondary">URL inválida</Text>;
                      }
                      return (
                        <button
                          type="button"
                          onClick={() => handleOpenVideoPreview(selectedVideo.url)}
                          className="blog-video-preview-button"
                          aria-label={`Reproducir ${selectedVideo.name}`}
                        >
                          <img
                            src={previewUrl}
                            alt={`Vista previa ${selectedVideo.name}`}
                            className="blog-video-preview-thumb"
                          />
                        </button>
                      );
                    })()
                  ) : (
                    <Text type="secondary">Sin video seleccionado</Text>
                  )}
                  <VideoSelector
                    selectionMode="single"
                    buttonLabel="Seleccionar video"
                    initialSelectedIds={selectedVideo ? [selectedVideo.id] : []}
                    onConfirm={handleVideoSelect}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              {mode === "edit" ? "Actualizar blog" : "Guardar blog"}
            </Button>
          </Form.Item>
        </Form>
      )}
      <Modal
        open={isImagePreviewOpen}
        title={selectedImage ? `Imagen ${selectedImage.name}` : "Imagen"}
        onCancel={handleCloseImagePreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
      >
        {selectedImage ? (
          <img
            src={selectedImage.url}
            alt={`Imagen ${selectedImage.name}`}
            className="image-preview-modal-image"
          />
        ) : null}
      </Modal>
      <Modal
        open={Boolean(previewVideoId)}
        title="Previsualización de video"
        onCancel={handleCloseVideoPreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
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

export const BlogPage = () => {
  const [view, setView] = useState<BlogView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    pagination,
    handleDelete,
    reloadBlogs,
    setSuccessOnReload,
  } = useBlogList();

  const handleCreate = useCallback(() => {
    setEditingId(null);
    setView("create");
  }, []);

  const handleEdit = useCallback((id: number) => {
    setEditingId(id);
    setView("edit");
  }, []);

  const handleBackToList = useCallback(() => {
    setView("list");
  }, []);

  const handleSaved = useCallback(
    (message: string) => {
      setSuccessOnReload(message);
      reloadBlogs();
    },
    [reloadBlogs, setSuccessOnReload],
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
      },
      {
        title: "Título",
        dataIndex: "title",
      },
      {
        title: "Título (inglés)",
        dataIndex: "titleEng",
      },
      {
        title: "URL limpia",
        dataIndex: "cleanUrlTitle",
        render: (value: string) => value || <Text type="secondary">-</Text>,
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: BlogResponse) => (
          <div className="blog-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar el blog con id ${record.id}?`}
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
              okType="danger"
              okButtonProps={{ loading: isBusy }}
              placement="topRight"
            >
              <Button danger type="link">
                Eliminar
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [handleDelete, handleEdit, isBusy],
  );

  if (view === "create") {
    return (
      <BlogForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <BlogForm
        mode="edit"
        blogId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="blog-panel">
      <SectionHeader
        className="blog-header"
        title="Blogs"
        action={{
          label: "Crear blog",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="blog-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="blog-loading" tip="Cargando blogs..." />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data ?? []}
          pagination={pagination}
        />
      )}
    </div>
  );
};
