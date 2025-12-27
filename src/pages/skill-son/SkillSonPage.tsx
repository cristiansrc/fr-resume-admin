import {
  Button,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Table,
} from "antd";
import { useCallback, useMemo, useState } from "react";
import { LoadingBlock, SectionHeader } from "../../components";
import type { SkillSonResponse } from "../../api";
import {
  useSkillSonForm,
  type SkillSonFormValues,
} from "../../hooks/skill-son/useSkillSonForm";
import { useSkillSonList } from "../../hooks/skill-son/useSkillSonList";

type SkillSonView = "list" | "create" | "edit";

interface SkillSonFormProps {
  mode: "create" | "edit";
  skillSonId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const SkillSonForm = ({
  mode,
  skillSonId,
  onBack,
  onSaved,
}: SkillSonFormProps) => {
  const { form, isLoading, isSaving, handleSubmit } = useSkillSonForm({
    mode,
    skillSonId,
    onSuccess: onSaved,
  });

  const handleFinish = useCallback(
    async (values: SkillSonFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  return (
    <div className="skill-son-panel">
      <SectionHeader
        className="skill-son-header"
        title={mode === "edit" ? "Editar habilidad hija" : "Crear habilidad hija"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="skill-son-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="skill-son-loading"
          tip="Cargando habilidad hija..."
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="skill-son-form"
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

export const SkillSonPage = () => {
  const [view, setView] = useState<SkillSonView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadSkillSons,
    setSuccessOnReload,
  } = useSkillSonList();

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
      reloadSkillSons();
    },
    [reloadSkillSons, setSuccessOnReload],
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
        render: (_: unknown, record: SkillSonResponse) => (
          <div className="skill-son-actions">
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
      <SkillSonForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <SkillSonForm
        mode="edit"
        skillSonId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="skill-son-panel">
      <SectionHeader
        className="skill-son-header"
        title="Habilidades hijas"
        action={{
          label: "Crear habilidad hija",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="skill-son-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="skill-son-loading"
          tip="Cargando habilidades hijas..."
        />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
