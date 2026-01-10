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
import {
  LoadingBlock,
  RichTextEditor,
  SectionHeader,
  SkillSonSelector,
} from "../../components";
import type { ExperienceResponse, SkillSonResponse } from "../../api";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import {
  useExperienceForm,
  type ExperienceFormValues,
} from "../../hooks/experience/useExperienceForm";
import { useExperienceList } from "../../hooks/experience/useExperienceList";

type ExperienceView = "list" | "create" | "edit";

const { Text } = Typography;

const REQUIRED_ARRAY_VALIDATOR = (_: unknown, value?: number[]) => {
  if (Array.isArray(value) && value.length > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona al menos una habilidad hija"));
};

interface ExperienceFormProps {
  mode: "create" | "edit";
  experienceId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const ExperienceForm = ({
  mode,
  experienceId,
  onBack,
  onSaved,
}: ExperienceFormProps) => {
  const {
    form,
    isLoading,
    isSaving,
    selectedSkillSons,
    handleSkillSonsSelect,
    handleSubmit,
  } = useExperienceForm({
    mode,
    experienceId,
    onSuccess: onSaved,
  });
  const [descriptionItemsPdfInput, setDescriptionItemsPdfInput] = useState("");
  const [descriptionItemsPdfEngInput, setDescriptionItemsPdfEngInput] = useState("");
  const descriptionItemsPdfValues =
    Form.useWatch("descriptionItemsPdf", form) ?? [];
  const descriptionItemsPdfEngValues =
    Form.useWatch("descriptionItemsPdfEng", form) ?? [];

  const handleFinish = useCallback(
    async (values: ExperienceFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  const handleAddDescriptionItemsPdf = useCallback(() => {
    const value = descriptionItemsPdfInput.trim();
    if (!value) {
      return;
    }
    const current =
      (form.getFieldValue("descriptionItemsPdf") as string[] | undefined) ?? [];
    form.setFieldsValue({ descriptionItemsPdf: [...current, value] });
    setDescriptionItemsPdfInput("");
  }, [descriptionItemsPdfInput, form]);

  const handleAddDescriptionItemsPdfEng = useCallback(() => {
    const value = descriptionItemsPdfEngInput.trim();
    if (!value) {
      return;
    }
    const current =
      (form.getFieldValue("descriptionItemsPdfEng") as string[] | undefined) ?? [];
    form.setFieldsValue({ descriptionItemsPdfEng: [...current, value] });
    setDescriptionItemsPdfEngInput("");
  }, [descriptionItemsPdfEngInput, form]);

  const handleRemoveDescriptionItemsPdfAt = useCallback(
    (indexToRemove: number) => {
      const current =
        (form.getFieldValue("descriptionItemsPdf") as string[] | undefined) ?? [];
      form.setFieldsValue({
        descriptionItemsPdf: current.filter((_, index) => index !== indexToRemove),
      });
    },
    [form],
  );

  const handleRemoveDescriptionItemsPdfEngAt = useCallback(
    (indexToRemove: number) => {
      const current =
        (form.getFieldValue("descriptionItemsPdfEng") as string[] | undefined) ??
        [];
      form.setFieldsValue({
        descriptionItemsPdfEng: current.filter((_, index) => index !== indexToRemove),
      });
    },
    [form],
  );

  const skillSonTags = useMemo(() => {
    if (!selectedSkillSons.length) {
      return <Text type="secondary">Sin habilidades hijas seleccionadas</Text>;
    }
    return selectedSkillSons.map((skillSon: SkillSonResponse) => (
      <Tag key={skillSon.id}>{skillSon.name}</Tag>
    ));
  }, [selectedSkillSons]);

  const descriptionItemsPdfTags = useMemo(() => {
    if (!descriptionItemsPdfValues.length) {
      return <Text type="secondary">Sin descripciones pdf</Text>;
    }
    return descriptionItemsPdfValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveDescriptionItemsPdfAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [descriptionItemsPdfValues, handleRemoveDescriptionItemsPdfAt, Text]);

  const descriptionItemsPdfEngTags = useMemo(() => {
    if (!descriptionItemsPdfEngValues.length) {
      return <Text type="secondary">Sin descripciones pdf</Text>;
    }
    return descriptionItemsPdfEngValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveDescriptionItemsPdfEngAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [descriptionItemsPdfEngValues, handleRemoveDescriptionItemsPdfEngAt, Text]);

  return (
    <div className="experience-panel">
      <SectionHeader
        className="experience-header"
        title={mode === "edit" ? "Editar experiencia" : "Crear experiencia"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="experience-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="experience-loading"
          tip="Cargando experiencia..."
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="experience-form"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="company"
                label="Empresa"
                rules={[{ required: true, message: "Ingresa la empresa" }]}
              >
                <Input placeholder="Empresa" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="yearStart"
                label="Fecha inicio"
                rules={[
                  { required: true, message: "Selecciona la fecha de inicio" },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  inputReadOnly
                  className="experience-date-picker"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="yearEnd"
                label="Fecha fin"
                rules={[
                  { required: true, message: "Selecciona la fecha de fin" },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  inputReadOnly
                  className="experience-date-picker"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="position"
                label="Posición"
              >
                <Input placeholder="Posición" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="positionEng"
                label="Posición (inglés)"
              >
                <Input placeholder="Position in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="Ubicación"
              >
                <Input placeholder="Ubicación" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="locationEng"
                label="Ubicación (inglés)"
              >
                <Input placeholder="Location in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="summary"
                label="Resumen"
                rules={[
                  { required: true, message: "Ingresa el resumen" },
                ]}
              >
                <RichTextEditor placeholder="Resumen" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="summaryEng"
                label="Resumen (inglés)"
                rules={[
                  { required: true, message: "Ingresa el resumen en inglés" },
                ]}
              >
                <RichTextEditor placeholder="Summary in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="summaryPdf" label="Resumen pdf">
                <Input.TextArea placeholder="Resumen pdf" rows={4} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="summaryPdfEng" label="Resumen pdf (inglés)">
                <Input.TextArea placeholder="Summary pdf in English" rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Descripción pdf">
                <Form.Item name="descriptionItemsPdf" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar descripción pdf"
                      value={descriptionItemsPdfInput}
                      onChange={(event) =>
                        setDescriptionItemsPdfInput(event.target.value)
                      }
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddDescriptionItemsPdf();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddDescriptionItemsPdf}
                      disabled={!descriptionItemsPdfInput.trim()}
                    >
                      Agregar descripción pdf
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">
                    {descriptionItemsPdfTags}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Descripción pdf (inglés)">
                <Form.Item name="descriptionItemsPdfEng" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar descripción pdf en inglés"
                      value={descriptionItemsPdfEngInput}
                      onChange={(event) =>
                        setDescriptionItemsPdfEngInput(event.target.value)
                      }
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddDescriptionItemsPdfEng();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddDescriptionItemsPdfEng}
                      disabled={!descriptionItemsPdfEngInput.trim()}
                    >
                      Agregar descripción pdf
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">
                    {descriptionItemsPdfEngTags}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Habilidades hijas" required>
                <Form.Item
                  name="skillSonIds"
                  rules={[{ validator: REQUIRED_ARRAY_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="experience-skill-son-selection">
                  <div className="experience-skill-son-list">{skillSonTags}</div>
                  <SkillSonSelector
                    selectionMode="multiple"
                    buttonLabel="Seleccionar habilidades hijas"
                    initialSelectedIds={selectedSkillSons.map((skillSon) => skillSon.id)}
                    onConfirm={handleSkillSonsSelect}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              {mode === "edit" ? "Actualizar experiencia" : "Guardar experiencia"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export const ExperiencePage = () => {
  const [view, setView] = useState<ExperienceView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadExperiences,
    setSuccessOnReload,
  } = useExperienceList();

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
      reloadExperiences();
    },
    [reloadExperiences, setSuccessOnReload],
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
      },
      {
        title: "Empresa",
        dataIndex: "company",
      },
      {
        title: "Fecha inicio",
        dataIndex: "yearStart",
      },
      {
        title: "Fecha fin",
        dataIndex: "yearEnd",
      },
      {
        title: "Acciones",
        dataIndex: "actions",
        render: (_: unknown, record: ExperienceResponse) => (
          <div className="experience-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar la experiencia con id ${record.id}?`}
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
      <ExperienceForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <ExperienceForm
        mode="edit"
        experienceId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="experience-panel">
      <SectionHeader
        className="experience-header"
        title="Experiencias"
        action={{
          label: "Crear experiencia",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="experience-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="experience-loading"
          tip="Cargando experiencias..."
        />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
