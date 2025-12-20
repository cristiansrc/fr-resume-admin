import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Upload,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import { type ImageResponse } from "../../api";
import { useImagePage } from "../../hooks/image/useImagePage";
import { LoadingBlock, SectionHeader } from "../../components";

export const ImagePage = () => {
  const {
    form,
    isModalOpen,
    isBusy,
    isSaving,
    fileList,
    tableProps,
    isTableLoading,
    handleDelete,
    handleCreate,
    handleBeforeUpload,
    handleRemoveFile,
    handleOpenModal,
    handleCloseModal,
  } = useImagePage();
  const [previewImage, setPreviewImage] = useState<ImageResponse | null>(null);

  const handleOpenPreview = useCallback((record: ImageResponse) => {
    setPreviewImage(record);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
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
            <button
              type="button"
              onClick={() => handleOpenPreview(record)}
              aria-label={`Ver imagen ${record.name}`}
              className="image-preview-button"
            >
              <img
                src={record.url}
                alt={`Vista previa ${record.name}`}
                loading="lazy"
              />
            </button>
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
    [handleDelete, handleOpenPreview, isBusy],
  );

  return (
    <div className="image-panel">
      <SectionHeader
        className="image-header"
        title="Imágenes"
        action={{
          label: "Agregar Imagen",
          icon: <PlusOutlined />,
          onClick: handleOpenModal,
        }}
      />
      {isBusy && !isTableLoading && (
        <LoadingBlock className="image-busy-overlay" tip="Procesando..." />
      )}
      {isTableLoading ? (
        <LoadingBlock className="image-loading" tip="Cargando imágenes..." />
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
      <Modal
        open={Boolean(previewImage)}
        title={previewImage ? `Imagen ${previewImage.name}` : "Imagen"}
        onCancel={handleClosePreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
      >
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={`Imagen ${previewImage.name}`}
            className="image-preview-modal-image"
          />
        ) : null}
      </Modal>
    </div>
  );
};
