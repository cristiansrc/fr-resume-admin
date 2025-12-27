import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Tag,
  Typography,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import { ImageSelector, LabelSelector, LoadingBlock } from "../../components";
import type { LabelResponse } from "../../api";
import { useHomeContentPage } from "../../hooks/home/useHomeContentPage";

interface HomePageProps {
  homeId?: number;
}

const { Text } = Typography;

const REQUIRED_ARRAY_VALIDATOR = (_: unknown, value?: number[]) => {
  if (Array.isArray(value) && value.length > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona al menos un label"));
};

const REQUIRED_IMAGE_VALIDATOR = (_: unknown, value?: number) => {
  if (typeof value === "number" && value > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona una imagen"));
};

export const HomePage = ({ homeId = 1 }: HomePageProps) => {
  const {
    form,
    isLoading,
    isSaving,
    selectedImage,
    selectedLabels,
    handleImageSelect,
    handleLabelsSelect,
    handleSubmit,
  } = useHomeContentPage({ homeId });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = useCallback(() => {
    if (selectedImage) {
      setIsPreviewOpen(true);
    }
  }, [selectedImage]);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const labelTags = useMemo(() => {
    if (!selectedLabels.length) {
      return <Text type="secondary">Sin labels seleccionados</Text>;
    }
    return selectedLabels.map((label: LabelResponse) => (
      <Tag key={label.id}>{label.name}</Tag>
    ));
  }, [selectedLabels]);

  return (
    <div className="home-content-panel">
      <Typography.Title level={3}>Home</Typography.Title>
      {!isLoading && isSaving && (
        <LoadingBlock className="home-content-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="home-content-loading" tip="Cargando home..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="home-content-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="greeting"
                label="Saludo"
                rules={[{ required: true, message: "Ingresa un saludo" }]}
              >
                <Input placeholder="Saludo en español" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="greetingEng"
                label="Saludo (inglés)"
                rules={[
                  { required: true, message: "Ingresa un saludo en inglés" },
                ]}
              >
                <Input placeholder="Greeting in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buttonWorkLabel"
                label="Etiqueta botón trabajo"
                rules={[
                  { required: true, message: "Ingresa el texto del botón" },
                ]}
              >
                <Input placeholder="Texto para botón de trabajo" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buttonWorkLabelEng"
                label="Etiqueta botón trabajo (inglés)"
                rules={[
                  {
                    required: true,
                    message: "Ingresa el texto del botón en inglés",
                  },
                ]}
              >
                <Input placeholder="Work button label" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buttonContactLabel"
                label="Etiqueta botón contacto"
                rules={[
                  { required: true, message: "Ingresa el texto del botón" },
                ]}
              >
                <Input placeholder="Texto para botón de contacto" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buttonContactLabelEng"
                label="Etiqueta botón contacto (inglés)"
                rules={[
                  {
                    required: true,
                    message: "Ingresa el texto del botón en inglés",
                  },
                ]}
              >
                <Input placeholder="Contact button label" />
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
                <div className="home-image-selection">
                  {selectedImage ? (
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      className="home-image-preview-button"
                      aria-label={`Ver imagen ${selectedImage.name}`}
                    >
                      <img
                        src={selectedImage.url}
                        alt={`Vista previa ${selectedImage.name}`}
                        className="home-image-preview-thumb"
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
              <Form.Item label="Labels" required>
                <Form.Item
                  name="labelIds"
                  rules={[{ validator: REQUIRED_ARRAY_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="home-labels-selection">
                  <div className="home-labels-list">{labelTags}</div>
                  <LabelSelector
                    selectionMode="multiple"
                    buttonLabel="Seleccionar labels"
                    initialSelectedIds={selectedLabels.map((label) => label.id)}
                    onConfirm={handleLabelsSelect}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Guardar Home
            </Button>
          </Form.Item>
        </Form>
      )}
      <Modal
        open={isPreviewOpen}
        title={selectedImage ? `Imagen ${selectedImage.name}` : "Imagen"}
        onCancel={handleClosePreview}
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
    </div>
  );
};
