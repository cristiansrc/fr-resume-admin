import { useCallback, useEffect, useMemo, useState } from "react";
import { getSkillSons, type SkillSonResponse } from "../../api";
import { ResourceSelectorModal, type SelectionMode } from "./ResourceSelectorModal";

interface SkillSonSelectorProps {
  selectionMode?: SelectionMode;
  buttonLabel?: string;
  title?: string;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: SkillSonResponse[]) => void;
  disabled?: boolean;
}

export const SkillSonSelector = ({
  selectionMode = "multiple",
  buttonLabel = "Seleccionar habilidades hijas",
  title = "Seleccionar habilidades hijas",
  initialSelectedIds,
  onConfirm,
  disabled,
}: SkillSonSelectorProps) => {
  const [data, setData] = useState<SkillSonResponse[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadSkillSons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSkillSons();
      setData(response ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkillSons();
  }, [loadSkillSons]);

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
