import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import { LoadingBlock, SectionHeader } from "../../components";
import type { EducationResponse } from "../../api";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import {
  useEducationForm,
  type EducationFormValues,
} from "../../hooks/education/useEducationForm";
import { useEducationList } from "../../hooks/education/useEducationList";

type EducationView = "list" | "create" | "edit";

interface EducationFormProps {
  mode: "create" | "edit";
  educationId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const EducationForm = ({
  mode,
  educationId,
  onBack,
  onSaved,
}: EducationFormProps) => {
  const { form, isLoading, isSaving, handleSubmit } = useEducationForm({
    mode,
    educationId,
    onSuccess: onSaved,
  });
  const [highlightInput, setHighlightInput] = useState("");
  const [highlightEngInput, setHighlightEngInput] = useState("");
  const highlightValues = Form.useWatch("highlights", form) ?? [];
  const highlightEngValues = Form.useWatch("highlightsEng", form) ?? [];
  const { Text } = Typography;

  const handleAddHighlight = useCallback(() => {
    const value = highlightInput.trim();
    if (!value) {
      return;
    }
    const current = (form.getFieldValue("highlights") as string[] | undefined) ?? [];
    form.setFieldsValue({ highlights: [...current, value] });
    setHighlightInput("");
  }, [form, highlightInput]);

  const handleAddHighlightEng = useCallback(() => {
    const value = highlightEngInput.trim();
    if (!value) {
      return;
    }
    const current =
      (form.getFieldValue("highlightsEng") as string[] | undefined) ?? [];
    form.setFieldsValue({ highlightsEng: [...current, value] });
    setHighlightEngInput("");
  }, [form, highlightEngInput]);

  const handleRemoveHighlightAt = useCallback(
    (indexToRemove: number) => {
      const current =
        (form.getFieldValue("highlights") as string[] | undefined) ?? [];
      form.setFieldsValue({
        highlights: current.filter((_, index) => index !== indexToRemove),
      });
    },
    [form],
  );

  const handleRemoveHighlightEngAt = useCallback(
    (indexToRemove: number) => {
      const current =
        (form.getFieldValue("highlightsEng") as string[] | undefined) ?? [];
      form.setFieldsValue({
        highlightsEng: current.filter((_, index) => index !== indexToRemove),
      });
    },
    [form],
  );

  const highlightTags = useMemo(() => {
    if (!highlightValues.length) {
      return <Text type="secondary">Sin logros</Text>;
    }
    return highlightValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveHighlightAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [highlightValues, handleRemoveHighlightAt, Text]);

  const highlightEngTags = useMemo(() => {
    if (!highlightEngValues.length) {
      return <Text type="secondary">Sin logros en inglés</Text>;
    }
    return highlightEngValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveHighlightEngAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [highlightEngValues, handleRemoveHighlightEngAt, Text]);

  const handleFinish = useCallback(
    async (values: EducationFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  return (
    <div className="education-panel">
      <SectionHeader
        className="education-header"
        title={mode === "edit" ? "Editar estudio" : "Crear estudio"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="education-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="education-loading" tip="Cargando estudio..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="education-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                name="institution"
                label="Institución"
                rules={[{ required: true, message: "Ingresa la institución" }]}
              >
                <Input placeholder="Institución" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="degree"
                label="Título"
                rules={[{ required: true, message: "Ingresa el título" }]}
              >
                <Input placeholder="Título" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="degreeEng"
                label="Título (inglés)"
                rules={[{ required: true, message: "Ingresa el título en inglés" }]}
              >
                <Input placeholder="Degree in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="area"
                label="Área"
                rules={[{ required: true, message: "Ingresa el área" }]}
              >
                <Input placeholder="Área" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="areaEng"
                label="Área (inglés)"
                rules={[{ required: true, message: "Ingresa el área en inglés" }]}
              >
                <Input placeholder="Area in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="Ubicación"
                rules={[{ required: true, message: "Ingresa la ubicación" }]}
              >
                <Input placeholder="Ubicación" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="locationEng"
                label="Ubicación (inglés)"
                rules={[
                  { required: true, message: "Ingresa la ubicación en inglés" },
                ]}
              >
                <Input placeholder="Location in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Fecha inicio"
                rules={[
                  { required: true, message: "Selecciona la fecha de inicio" },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  inputReadOnly
                  className="education-date-picker"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label="Fecha fin"
                rules={[
                  { required: true, message: "Selecciona la fecha de fin" },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  inputReadOnly
                  className="education-date-picker"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Aspectos destacados">
                <Form.Item name="highlights" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="education-highlight-selection">
                  <div className="education-highlight-controls">
                    <Input
                      placeholder="Agregar logro"
                      value={highlightInput}
                      onChange={(event) => setHighlightInput(event.target.value)}
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddHighlight();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddHighlight}
                      disabled={!highlightInput.trim()}
                    >
                      Agregar logro
                    </Button>
                  </div>
                  <div className="education-highlight-list">{highlightTags}</div>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Aspectos destacados (inglés)">
                <Form.Item name="highlightsEng" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="education-highlight-selection">
                  <div className="education-highlight-controls">
                    <Input
                      placeholder="Add highlight in English"
                      value={highlightEngInput}
                      onChange={(event) =>
                        setHighlightEngInput(event.target.value)
                      }
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddHighlightEng();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddHighlightEng}
                      disabled={!highlightEngInput.trim()}
                    >
                      Agregar logro
                    </Button>
                  </div>
                  <div className="education-highlight-list">
                    {highlightEngTags}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              {mode === "edit" ? "Actualizar estudio" : "Guardar estudio"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export const EducationPage = () => {
  const [view, setView] = useState<EducationView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadEducations,
    setSuccessOnReload,
  } = useEducationList();

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
      reloadEducations();
    },
    [reloadEducations, setSuccessOnReload],
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
      },
      {
        title: "Institución",
        dataIndex: "institution",
      },
      {
        title: "Fecha inicio",
        dataIndex: "startDate",
      },
      {
        title: "Fecha fin",
        dataIndex: "endDate",
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: EducationResponse) => (
          <div className="education-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar el estudio con id ${record.id}?`}
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
      <EducationForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <EducationForm
        mode="edit"
        educationId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="education-panel">
      <SectionHeader
        className="education-header"
        title="Educación"
        action={{
          label: "Crear estudio",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="education-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="education-loading" tip="Cargando estudios..." />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
