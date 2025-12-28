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
import { LoadingBlock, SectionHeader, SkillSonSelector } from "../../components";
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

  const handleFinish = useCallback(
    async (values: ExperienceFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  const skillSonTags = useMemo(() => {
    if (!selectedSkillSons.length) {
      return <Text type="secondary">Sin habilidades hijas seleccionadas</Text>;
    }
    return selectedSkillSons.map((skillSon: SkillSonResponse) => (
      <Tag key={skillSon.id}>{skillSon.name}</Tag>
    ));
  }, [selectedSkillSons]);

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
