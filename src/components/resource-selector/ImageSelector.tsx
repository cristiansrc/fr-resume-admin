import { Modal } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTable } from "@refinedev/antd";
import { type ImageResponse } from "../../api";
import { IMAGE_RESOURCE } from "../../config/image-config";
import { ResourceSelectorModal, type SelectionMode } from "./ResourceSelectorModal";

interface ImageSelectorProps {
  selectionMode?: SelectionMode;
  buttonLabel?: string;
  title?: string;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: ImageResponse[]) => void;
  disabled?: boolean;
}

export const ImageSelector = ({
  selectionMode = "multiple",
  buttonLabel = "Seleccionar imágenes",
  title = "Seleccionar imágenes",
  initialSelectedIds,
  onConfirm,
  disabled,
}: ImageSelectorProps) => {
  const { tableProps } = useTable<ImageResponse>({
    resource: IMAGE_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });
  const [previewImage, setPreviewImage] = useState<ImageResponse | null>(null);

  const handleOpenPreview = useCallback((record: ImageResponse) => {
    setPreviewImage(record);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

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
        title: "Vista previa",
        dataIndex: "url",
        render: (_: unknown, record: ImageResponse) => (
          <div className="image-preview">
            <button
              type="button"
              onClick={() => handleOpenPreview(record)}
              aria-label={`Ver imagen ${record.name}`}
              className="image-preview-button"
            >
              <img
                src={record.url}
                alt={`Vista previa ${record.name}`}
                loading="lazy"
              />
            </button>
          </div>
        ),
      },
    ],
    [handleOpenPreview],
  );

  return (
    <>
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
      <Modal
        open={Boolean(previewImage)}
        title={previewImage ? `Imagen ${previewImage.name}` : "Imagen"}
        onCancel={handleClosePreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
      >
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={`Imagen ${previewImage.name}`}
            className="image-preview-modal-image"
          />
        ) : null}
      </Modal>
    </>
  );
};
