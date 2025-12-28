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
import type { BlogTypeResponse } from "../../api";
import {
  useBlogTypeForm,
  type BlogTypeFormValues,
} from "../../hooks/blog-type/useBlogTypeForm";
import { useBlogTypeList } from "../../hooks/blog-type/useBlogTypeList";

type BlogTypeView = "list" | "create" | "edit";

interface BlogTypeFormProps {
  mode: "create" | "edit";
  blogTypeId?: number;
  onBack: () => void;
  onSaved: (message: string) => void;
}

const BlogTypeForm = ({
  mode,
  blogTypeId,
  onBack,
  onSaved,
}: BlogTypeFormProps) => {
  const { form, isLoading, isSaving, handleSubmit } = useBlogTypeForm({
    mode,
    blogTypeId,
    onSuccess: onSaved,
  });

  const handleFinish = useCallback(
    async (values: BlogTypeFormValues) => {
      const success = await handleSubmit(values);
      if (success) {
        onBack();
      }
    },
    [handleSubmit, onBack],
  );

  return (
    <div className="blog-type-panel">
      <SectionHeader
        className="blog-type-header"
        title={mode === "edit" ? "Editar tipo de blog" : "Crear tipo de blog"}
        action={{
          label: "Volver",
          onClick: onBack,
        }}
      />
      {!isLoading && isSaving && (
        <LoadingBlock className="blog-type-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="blog-type-loading"
          tip="Cargando tipo de blog..."
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          className="blog-type-form"
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
              {mode === "edit"
                ? "Actualizar tipo de blog"
                : "Guardar tipo de blog"}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export const BlogTypePage = () => {
  const [view, setView] = useState<BlogTypeView>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    data,
    isLoading,
    isBusy,
    handleDelete,
    reloadBlogTypes,
    setSuccessOnReload,
  } = useBlogTypeList();

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
      reloadBlogTypes();
    },
    [reloadBlogTypes, setSuccessOnReload],
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
        render: (_: unknown, record: BlogTypeResponse) => (
          <div className="blog-type-actions">
            <Button type="link" onClick={() => handleEdit(record.id)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Está seguro de eliminar el tipo de blog con id ${record.id}?`}
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
      <BlogTypeForm
        mode="create"
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editingId) {
    return (
      <BlogTypeForm
        mode="edit"
        blogTypeId={editingId}
        onBack={handleBackToList}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="blog-type-panel">
      <SectionHeader
        className="blog-type-header"
        title="Tipos de blog"
        action={{
          label: "Crear tipo de blog",
          onClick: handleCreate,
        }}
      />
      {isBusy && !isLoading && (
        <LoadingBlock className="blog-type-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="blog-type-loading"
          tip="Cargando tipos de blog..."
        />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={data ?? []} />
      )}
    </div>
  );
};
