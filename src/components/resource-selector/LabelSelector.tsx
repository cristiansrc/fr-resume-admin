import { useMemo } from "react";
import { useTable } from "@refinedev/antd";
import { type LabelResponse } from "../../api";
import { LABEL_RESOURCE } from "../../config/label-config";
import { ResourceSelectorModal, type SelectionMode } from "./ResourceSelectorModal";

interface LabelSelectorProps {
  selectionMode?: SelectionMode;
  buttonLabel?: string;
  title?: string;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: LabelResponse[]) => void;
  disabled?: boolean;
}

export const LabelSelector = ({
  selectionMode = "multiple",
  buttonLabel = "Seleccionar labels",
  title = "Seleccionar labels",
  initialSelectedIds,
  onConfirm,
  disabled,
}: LabelSelectorProps) => {
  const { tableProps } = useTable<LabelResponse>({
    resource: LABEL_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });

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
    ],
    [],
  );

  return (
    <ResourceSelectorModal
      title={title}
      buttonLabel={buttonLabel}
      selectionMode={selectionMode}
      tableProps={tableProps}
      columns={columns}
      initialSelectedIds={initialSelectedIds}
      onConfirm={onConfirm}
      disabled={disabled}
    />
  );
};
