import {
  Button,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import { LoadingBlock, SectionHeader, SkillSelector } from "../../components";
import type { SkillResponse, SkillTypeResponse } from "../../api";
import {
  useSkillTypeForm,
  type SkillTypeFormValues,
} from "../../hooks/skill-type/useSkillTypeForm";
import { useSkillTypeList } from "../../hooks/skill-type/useSkillTypeList";

type SkillTypeView = "list" | "create" | "edit";

const { Text } = Typography;

const REQUIRED_ARRAY_VALIDATOR = (_: unknown, value?: number[]) => {
  if (Array.isArray(value) && value.length > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona al menos una habilidad"));
};

interface SkillTypeFormProps {
  mode: "create" | "edit";
  skillTypeId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const SkillTypeForm = ({
  mode,
  skillTypeId,
  onBack,
  onSaved,
}: SkillTypeFormProps) => {
  const {
    form,
    isLoading,
    isSaving,
    selectedSkills,
    handleSkillsSelect,
    handleSubmit,
  } = useSkillTypeForm({
    mode,
    skillTypeId,
    onSuccess: onSaved,
  });

  const handleFinish = useCallback(
    async (values: SkillTypeFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  const skillTags = useMemo(() => {
    if (!selectedSkills.length) {
      return <Text type="secondary">Sin habilidades seleccionadas</Text>;
    }
    return selectedSkills.map((skill: SkillResponse) => (
      <Tag key={skill.id}>{skill.name}</Tag>
    ));
  }, [selectedSkills]);

  return (
    <div className="skill-type-panel">
      <SectionHeader
        className="skill-type-header"
        title={mode === "edit" ? "Editar tipo de habilidad" : "Crear tipo de habilidad"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="skill-type-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="skill-type-loading"
          tip="Cargando tipo de habilidad..."
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="skill-type-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Nombre"
                rules={[{ required: true, message: "Ingresa el nombre" }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="nameEng"
                label="Nombre (inglés)"
                rules={[
                  { required: true, message: "Ingresa el nombre en inglés" },
                ]}
              >
                <Input placeholder="Name in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Habilidades" required>
                <Form.Item
                  name="skillIds"
                  rules={[{ validator: REQUIRED_ARRAY_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="skill-type-selection">
                  <div className="skill-type-list">{skillTags}</div>
                  <SkillSelector
                    selectionMode="multiple"
                    buttonLabel="Seleccionar habilidades"
                    initialSelectedIds={selectedSkills.map((skill) => skill.id)}
                    onConfirm={handleSkillsSelect}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              {mode === "edit"
                ? "Actualizar tipo de habilidad"
                : "Guardar tipo de habilidad"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export const SkillTypePage = () => {
  const [view, setView] = useState<SkillTypeView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkillTypes,
    setSuccessOnReload,
  } = useSkillTypeList();

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
      reloadSkillTypes();
    },
    [reloadSkillTypes, setSuccessOnReload],
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
        render: (_: unknown, record: SkillTypeResponse) => (
          <div className="skill-type-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar el tipo de habilidad con id ${record.id}?`}
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
      <SkillTypeForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <SkillTypeForm
        mode="edit"
        skillTypeId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="skill-type-panel">
      <SectionHeader
        className="skill-type-header"
        title="Tipos de habilidad"
        action={{
          label: "Crear tipo de habilidad",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="skill-type-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="skill-type-loading"
          tip="Cargando tipos de habilidad..."
        />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
