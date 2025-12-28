import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTable } from "@refinedev/antd";

import { VideoSelector } from "../../../src/components/resource-selector/VideoSelector";
import { VIDEO_RESOURCE } from "../../../src/config/video-config";
import { getYoutubePreviewUrl, getYoutubeVideoId } from "../../../src/utils/youtube";

let latestProps: any;

vi.mock("@refinedev/antd", () => ({
  useTable: vi.fn(),
}));

vi.mock("antd", () => ({
  Modal: ({ open, title, children, onCancel }: any) =>
    open ? (
      <div data-testid="video-preview-modal">
        <div>{title}</div>
        <button onClick={onCancel}>cerrar</button>
        {children}
      </div>
    ) : null,
  Typography: {
    Text: ({ children }: any) => <span>{children}</span>,
  },
}));

vi.mock("../../../src/utils/youtube", () => ({
  getYoutubePreviewUrl: vi.fn(),
  getYoutubeVideoId: vi.fn(),
}));

vi.mock("../../../src/components/resource-selector/ResourceSelectorModal", () => ({
  ResourceSelectorModal: (props: any) => {
    latestProps = props;
    const dataSource = props.tableProps?.dataSource ?? [];
    return (
      <div data-testid="resource-selector-modal">
        {dataSource.map((record: any) => (
          <div key={record.id}>
            {props.columns.map((col: any, index: number) => (
              <div key={`${record.id}-${index}`}>
                {col.render
                  ? col.render(record[col.dataIndex], record)
                  : record[col.dataIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const useTableMock = useTable as unknown as vi.Mock;
const getPreviewMock = getYoutubePreviewUrl as unknown as vi.Mock;
const getVideoIdMock = getYoutubeVideoId as unknown as vi.Mock;

describe("VideoSelector", () => {
  beforeEach(() => {
    latestProps = undefined;
    useTableMock.mockReset();
    getPreviewMock.mockReset();
    getVideoIdMock.mockReset();
    useTableMock.mockReturnValue({
      tableProps: {
        dataSource: [
          {
            id: 1,
            name: "Video Uno",
            nameEng: "Video One",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
          {
            id: 2,
            name: "Video Malo",
            nameEng: "Video Bad",
            url: "https://example.com",
          },
        ],
        loading: false,
        pagination: false,
      },
    });
  });

  it("renders the preview column and plays a video", async () => {
    const user = userEvent.setup();
    getPreviewMock.mockImplementation((url: string) =>
      url.includes("youtube") ? "https://img.youtube.com" : null,
    );
    getVideoIdMock.mockImplementation((url: string) =>
      url.includes("youtube") ? "dQw4w9WgXcQ" : undefined,
    );
    render(
      <VideoSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Videos"
        onConfirm={vi.fn()}
      />,
    );

    expect(useTableMock).toHaveBeenCalledWith({
      resource: VIDEO_RESOURCE,
      pagination: { pageSize: 10 },
    });
    expect(screen.getByTestId("resource-selector-modal")).toBeInTheDocument();
    expect(screen.getByText(/URL/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reproducir Video Uno" }));
    expect(screen.getByTestId("video-preview-modal")).toBeInTheDocument();
    expect(screen.getByTitle("Video preview")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    );

    await user.click(screen.getByRole("button", { name: "cerrar" }));
    expect(
      screen.queryByTestId("video-preview-modal"),
    ).not.toBeInTheDocument();
    expect(latestProps.columns).toHaveLength(4);
  });

  it("does not open the modal when the video id is missing", async () => {
    const user = userEvent.setup();
    getPreviewMock.mockReturnValue("https://img.youtube.com");
    getVideoIdMock.mockReturnValue(undefined);

    render(
      <VideoSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Videos"
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reproducir Video Uno" }));
    expect(screen.queryByTestId("video-preview-modal")).not.toBeInTheDocument();
  });
});
