import { useCallback, useEffect, useMemo, useState } from "react";
import { getSkills, type SkillResponse } from "../../api";
import { ResourceSelectorModal, type SelectionMode } from "./ResourceSelectorModal";

interface SkillSelectorProps {
  selectionMode?: SelectionMode;
  buttonLabel?: string;
  title?: string;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: SkillResponse[]) => void;
  disabled?: boolean;
}

export const SkillSelector = ({
  selectionMode = "multiple",
  buttonLabel = "Seleccionar habilidades",
  title = "Seleccionar habilidades",
  initialSelectedIds,
  onConfirm,
  disabled,
}: SkillSelectorProps) => {
  const [data, setData] = useState<SkillResponse[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSkills();
      setData(response ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

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
      tableProps={{
        dataSource: data,
        loading: isLoading,
        pagination: false,
      }}
      columns={columns}
      initialSelectedIds={initialSelectedIds}
      onConfirm={onConfirm}
      disabled={disabled}
    />
  );
};
