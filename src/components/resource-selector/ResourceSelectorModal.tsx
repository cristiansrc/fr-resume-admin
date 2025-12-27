import { Button, Modal, Table, Typography } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";

const { Text } = Typography;

export type SelectionMode = "single" | "multiple";

interface ResourceSelectorModalProps<T extends { id: number }> {
  title: string;
  buttonLabel: string;
  selectionMode?: SelectionMode;
  tableProps: TableProps<T>;
  columns: ColumnsType<T>;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: T[]) => void;
  disabled?: boolean;
}

export const ResourceSelectorModal = <T extends { id: number }>({
  title,
  buttonLabel,
  selectionMode = "multiple",
  tableProps,
  columns,
  initialSelectedIds,
  onConfirm,
  disabled,
}: ResourceSelectorModalProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    initialSelectedIds ?? [],
  );
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRowKeys(initialSelectedIds ?? []);
      setSelectedRecords([]);
    }
  }, [isOpen, initialSelectedIds]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedIds = selectedRowKeys.map((key) => Number(key));
    onConfirm(selectedIds, selectedRecords);
    setIsOpen(false);
  }, [onConfirm, selectedRecords, selectedRowKeys]);

  const rowSelection = useMemo(
    () => ({
      type: selectionMode === "single" ? "radio" : "checkbox",
      selectedRowKeys,
      onChange: (keys: Key[], records: T[]) => {
        setSelectedRowKeys(keys);
        setSelectedRecords(records);
      },
    }),
    [selectedRowKeys, selectionMode],
  );

  const selectedCountLabel =
    selectionMode === "single" ? "seleccionado" : "seleccionados";

  return (
    <>
      <Button onClick={handleOpen} disabled={disabled}>
        {buttonLabel}
      </Button>
      <Modal
        open={isOpen}
        title={title}
        onCancel={handleClose}
        onOk={handleConfirm}
        okText="Seleccionar"
        cancelText="Cerrar"
        okButtonProps={{ disabled: selectedRowKeys.length === 0 }}
        width={1000}
        destroyOnClose
        className="resource-selector-modal"
      >
        <div className="resource-selector-meta">
          <Text type="secondary">
            {selectedRowKeys.length} {selectedCountLabel}
          </Text>
        </div>
        <Table
          {...tableProps}
          columns={columns}
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={tableProps.dataSource ?? []}
        />
      </Modal>
    </>
  );
};
