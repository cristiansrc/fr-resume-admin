import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { type LabelResponse } from "../../api";
import { useLabelPage } from "../../hooks/label/useLabelPage";
import { LoadingBlock, SectionHeader } from "../../components";

export const LabelPage = () => {
  const {
    form,
    isModalOpen,
    isBusy,
    isSaving,
    tableProps,
    isTableLoading,
    handleDelete,
    handleCreate,
    handleOpenModal,
    handleCloseModal,
  } = useLabelPage();

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
        render: (_: unknown, record: LabelResponse) => (
          <Popconfirm
            title={`Estas seguro de eliminar el label con id ${record.id}`}
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
        ),
      },
    ],
    [handleDelete, isBusy],
  );

  return (
    <div className="label-panel">
      <SectionHeader
        className="label-header"
        title="Labels"
        action={{
          label: "Agregar Label",
          icon: <PlusOutlined />,
          onClick: handleOpenModal,
        }}
      />
      {isBusy && !isTableLoading && (
        <LoadingBlock className="label-busy-overlay" tip="Procesando..." />
      )}
      {isTableLoading ? (
        <LoadingBlock className="label-loading" tip="Cargando etiquetas..." />
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
        title="Agregar Label"
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
          <Form.Item className="basic-data-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              block
            >
              Guardar Label
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
