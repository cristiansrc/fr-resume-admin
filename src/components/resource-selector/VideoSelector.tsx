import { Modal, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTable } from "@refinedev/antd";
import { type VideoResponse } from "../../api";
import { VIDEO_RESOURCE } from "../../config/video-config";
import { getYoutubePreviewUrl, getYoutubeVideoId } from "../../utils/youtube";
import { ResourceSelectorModal, type SelectionMode } from "./ResourceSelectorModal";

const { Text } = Typography;

interface VideoSelectorProps {
  selectionMode?: SelectionMode;
  buttonLabel?: string;
  title?: string;
  initialSelectedIds?: number[];
  onConfirm: (selectedIds: number[], selectedRecords: VideoResponse[]) => void;
  disabled?: boolean;
}

export const VideoSelector = ({
  selectionMode = "multiple",
  buttonLabel = "Seleccionar videos",
  title = "Seleccionar videos",
  initialSelectedIds,
  onConfirm,
  disabled,
}: VideoSelectorProps) => {
  const { tableProps } = useTable<VideoResponse>({
    resource: VIDEO_RESOURCE,
    pagination: {
      pageSize: 10,
    },
  });
  const [previewVideoId, setPreviewVideoId] = useState<string>();

  const handleOpenPreview = useCallback((url: string) => {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setPreviewVideoId(videoId);
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideoId(undefined);
  }, []);

  const previewEmbedUrl = previewVideoId
    ? `https://www.youtube.com/embed/${previewVideoId}?autoplay=1`
    : undefined;

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
        title: "Previsualización",
        dataIndex: "preview",
        render: (_: unknown, record: VideoResponse) => {
          const previewUrl = getYoutubePreviewUrl(record.url);
          if (!previewUrl) {
            return <Text type="secondary">URL inválida</Text>;
          }
          return (
            <div className="video-preview">
              <button
                type="button"
                onClick={() => handleOpenPreview(record.url)}
                aria-label={`Reproducir ${record.name}`}
                className="video-preview-button"
              >
                <img
                  src={previewUrl}
                  alt={`${record.name} preview`}
                  loading="lazy"
                />
              </button>
            </div>
          );
        },
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
        open={Boolean(previewVideoId)}
        title="Previsualización de video"
        onCancel={handleClosePreview}
        footer={null}
        destroyOnClose
        centered
        width={900}
      >
        {previewEmbedUrl ? (
          <div className="video-preview-frame">
            <iframe
              src={previewEmbedUrl}
              title="Video preview"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="video-preview-iframe"
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
};
