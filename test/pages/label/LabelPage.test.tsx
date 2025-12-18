import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { message, notification } from "antd";

import * as refineCore from "@refinedev/core";
import { LabelPage } from "../../../src/pages/label/LabelPage";
import * as labelProvider from "../../../src/providers/labelProvider";
import { useTable } from "@refinedev/antd";

vi.mock("../../../src/providers/labelProvider");
vi.mock("@refinedev/core");
vi.mock("@refinedev/antd", () => ({
  useTable: vi.fn(),
}));

const createLabelMock = labelProvider.createLabel as unknown as vi.Mock;
const deleteLabelMock = labelProvider.deleteLabel as unknown as vi.Mock;
const useTableMock = useTable as unknown as vi.Mock;
const refetchMock = vi.fn();

const notificationSuccessSpy = vi
  .spyOn(notification, "success")
  .mockImplementation(() => undefined);
const notificationErrorSpy = vi
  .spyOn(notification, "error")
  .mockImplementation(() => undefined);
const messageSuccessSpy = vi
  .spyOn(message, "success")
  .mockImplementation(() => undefined);
const messageErrorSpy = vi
  .spyOn(message, "error")
  .mockImplementation(() => undefined);

const openNotificationMock = vi.fn();

const defaultLabels = [
  {
    id: 1,
    name: "Etiqueta 1",
    nameEng: "Label One",
  },
];

const createdLabel = {
  id: 2,
  name: "Etiqueta Nueva",
  nameEng: "New Label",
};

describe("LabelPage", () => {
  beforeEach(() => {
    createLabelMock.mockReset();
    deleteLabelMock.mockReset();
    openNotificationMock.mockReset();
    refetchMock.mockReset();
    useTableMock.mockReturnValue({
      tableProps: {
        dataSource: defaultLabels,
        loading: false,
        pagination: false,
      },
      tableQuery: {
        refetch: refetchMock,
      },
    });
    createLabelMock.mockResolvedValue({
      data: createdLabel,
      status: 201,
    });
    deleteLabelMock.mockResolvedValue({ status: 204 });

    notificationSuccessSpy.mockClear();
    notificationErrorSpy.mockClear();
    messageSuccessSpy.mockClear();
    messageErrorSpy.mockClear();

    (refineCore.useNotification as unknown as vi.Mock).mockReturnValue({
      open: openNotificationMock,
      close: vi.fn(),
    });
  });

  it("loads and displays the labels", async () => {
    render(<LabelPage />);

    expect(await screen.findByText("Etiqueta 1")).toBeInTheDocument();
  });

  it("creates a label, shows the overlay, and notifies success", async () => {
    const user = userEvent.setup();
    let resolveCreate: ((value: { data: typeof createdLabel; status: number }) => void) | undefined;
    createLabelMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const { container } = render(<LabelPage />);

    await screen.findByText("Etiqueta 1");
    const deleteButton = await screen.findByRole("button", { name: /eliminar/i });

    await user.click(screen.getByRole("button", { name: /agregar label/i }));
    await user.type(screen.getByLabelText("Nombre"), "Etiqueta Nueva");
    await user.type(screen.getByLabelText("Nombre (inglés)"), "New Label");

    const submitButton = screen.getByRole("button", { name: /guardar label/i });
    await user.click(submitButton);

    await waitFor(() => expect(createLabelMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(container.querySelector(".label-busy-overlay")).toBeInTheDocument(),
    );

    resolveCreate?.({ data: createdLabel, status: 201 });

    await waitFor(() => expect(notificationSuccessSpy).toHaveBeenCalled());
    expect(messageSuccessSpy).toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1));
  });

  it("keeps the modal open when creating fails", async () => {
    const user = userEvent.setup();
    createLabelMock.mockRejectedValueOnce(new Error("failed"));

    render(<LabelPage />);

    await user.click(screen.getByRole("button", { name: /agregar label/i }));
    await user.type(screen.getByLabelText("Nombre"), "Etiqueta Falla");
    await user.type(screen.getByLabelText("Nombre (inglés)"), "Fail Label");

    const submitButton = screen.getByRole("button", { name: /guardar label/i });
    await user.click(submitButton);

    await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());
    expect(messageErrorSpy).toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deletes a label and refreshes the list when confirmed", async () => {
    const user = userEvent.setup();
    let resolveDelete: ((value: { status: number }) => void) | undefined;
    deleteLabelMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
    );

    const { container } = render(<LabelPage />);
    await screen.findByText("Etiqueta 1");
    const deleteButton = await screen.findByRole("button", { name: /eliminar/i });

    try {
      await user.click(deleteButton);
      const confirmButton = await screen.findByTestId("confirm-delete-1");
      await user.click(confirmButton);

      await waitFor(() =>
        expect(container.querySelector(".label-busy-overlay")).toBeInTheDocument(),
      );

      await act(async () => {
        resolveDelete?.({ status: 204 });
      });

      await waitFor(() => expect(notificationSuccessSpy).toHaveBeenCalled());
      expect(messageSuccessSpy).toHaveBeenCalled();
      expect(openNotificationMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "success" }),
      );
      await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1));
    } finally {
      //
    }
  });

  it("shows an error notification when deletion fails", async () => {
    const user = userEvent.setup();
    deleteLabelMock.mockResolvedValueOnce({ status: 500 });

    render(<LabelPage />);
    await screen.findByText("Etiqueta 1");
    const deleteButton = await screen.findByRole("button", { name: /eliminar/i });

    try {
      await user.click(deleteButton);
      const confirmButton = await screen.findByTestId("confirm-delete-1");
      await user.click(confirmButton);

      await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());
      expect(messageErrorSpy).toHaveBeenCalled();
      expect(openNotificationMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
      expect(refetchMock).not.toHaveBeenCalled();
    } finally {
      //
    }
  });
});
