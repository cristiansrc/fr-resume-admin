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
import { LoadingBlock, SectionHeader, SkillSonSelector } from "../../components";
import type { SkillResponse, SkillSonResponse } from "../../api";
import {
  useSkillForm,
  type SkillFormValues,
} from "../../hooks/skill/useSkillForm";
import { useSkillList } from "../../hooks/skill/useSkillList";

type SkillView = "list" | "create" | "edit";

const { Text } = Typography;

const REQUIRED_ARRAY_VALIDATOR = (_: unknown, value?: number[]) => {
  if (Array.isArray(value) && value.length > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Selecciona al menos una habilidad hija"));
};

interface SkillFormProps {
  mode: "create" | "edit";
  skillId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const SkillForm = ({ mode, skillId, onBack, onSaved }: SkillFormProps) => {
  const {
    form,
    isLoading,
    isSaving,
    selectedSkillSons,
    handleSkillSonsSelect,
    handleSubmit,
  } = useSkillForm({
    mode,
    skillId,
    onSuccess: onSaved,
  });

  const handleFinish = useCallback(
    async (values: SkillFormValues) => {
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
    <div className="skill-panel">
      <SectionHeader
        className="skill-header"
        title={mode === "edit" ? "Editar habilidad" : "Crear habilidad"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="skill-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="skill-loading" tip="Cargando habilidad..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="skill-form"
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
              <Form.Item label="Habilidades hijas" required>
                <Form.Item
                  name="skillSonIds"
                  rules={[{ validator: REQUIRED_ARRAY_VALIDATOR }]}
                  noStyle
                >
                  <Input type="hidden" />
                </Form.Item>
                <div className="skill-son-selection">
                  <div className="skill-son-list">{skillSonTags}</div>
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
              {mode === "edit" ? "Actualizar habilidad" : "Guardar habilidad"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export const SkillPage = () => {
  const [view, setView] = useState<SkillView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkills,
    setSuccessOnReload,
  } = useSkillList();

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
      reloadSkills();
    },
    [reloadSkills, setSuccessOnReload],
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
        render: (_: unknown, record: SkillResponse) => (
          <div className="skill-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar la habilidad con id ${record.id}?`}
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
      <SkillForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <SkillForm
        mode="edit"
        skillId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="skill-panel">
      <SectionHeader
        className="skill-header"
        title="Habilidades"
        action={{
          label: "Crear habilidad",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="skill-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock className="skill-loading" tip="Cargando habilidades..." />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
