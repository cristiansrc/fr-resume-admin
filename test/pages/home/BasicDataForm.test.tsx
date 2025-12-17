import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  afterEach,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MemoryRouter } from "react-router-dom";

import { BasicDataForm } from "../../../src/pages/home/BasicDataForm";
import * as refineCore from "@refinedev/core";
import * as basicDataProvider from "../../../src/providers/basicDataProvider";
import { message, notification } from "antd";

vi.mock("@refinedev/core");
vi.mock("../../../src/providers/basicDataProvider");

const basicDataMock = {
  id: "1",
  firstName: "Juan",
  othersName: "Carlos",
  firstSurName: "Reyes",
  othersSurName: "Martínez",
  dateBirth: "2000-01-01",
  located: "Bogotá",
  locatedEng: "Bogotá",
  startWorkingDate: "2020-01-02",
  greeting: "Hola",
  greetingEng: "Hello",
  email: "correo@example.com",
  instagram: "https://instagram.com/test",
  linkedin: "https://linkedin.com/in/test",
  x: "https://x.com/test",
  github: "https://github.com/test",
  description: "Descripción",
  descriptionEng: "Description",
};

describe("BasicDataForm", () => {
  const logoutMock = vi.fn();
  const openNotificationMock = vi.fn();

  const getBasicDataMock = basicDataProvider.getBasicData as unknown as vi.Mock;
  const updateBasicDataMock = basicDataProvider.updateBasicData as unknown as vi.Mock;

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

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    logoutMock.mockImplementation((_, options) => options?.onSuccess?.());

    (refineCore.useLogout as unknown as vi.Mock).mockReturnValue({
      mutate: logoutMock,
      isLoading: false,
    });
    (refineCore.useNotification as unknown as vi.Mock).mockReturnValue({
      open: openNotificationMock,
      close: vi.fn(),
    });

    getBasicDataMock.mockResolvedValue(basicDataMock);
    updateBasicDataMock.mockResolvedValue({
      data: basicDataMock,
      status: 204,
    });
  });

  it("loads the basic data info and renders the form", async () => {
    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    expect(await screen.findByLabelText("Nombre")).toHaveValue("Juan");
    expect(getBasicDataMock).toHaveBeenCalledTimes(1);
  });

  it("handles basic data responses that omit the date values", async () => {
    const partialData = {
      ...basicDataMock,
      dateBirth: undefined,
      startWorkingDate: undefined,
    };

    getBasicDataMock.mockResolvedValueOnce(partialData);

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    expect(await screen.findByLabelText("Nombre")).toHaveValue("Juan");
  });

  it("submits the form and shows success notifications", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(updateBasicDataMock).toHaveBeenCalledTimes(1));

    expect(notificationSuccessSpy).toHaveBeenCalled();
    expect(messageSuccessSpy).toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("uses the fallback success message when the server responds without a description", async () => {
    updateBasicDataMock.mockResolvedValueOnce({
      data: basicDataMock,
      status: 200,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(updateBasicDataMock).toHaveBeenCalledTimes(1));

    expect(messageSuccessSpy).toHaveBeenCalledWith(
      "El servicio respondió correctamente y los cambios fueron guardados.",
    );
  });

  it("trims text fields before sending the payload", async () => {
    const trimmedResponse = {
      ...basicDataMock,
      firstName: " Juan ",
      located: " Bogotá ",
      greeting: " Hola ",
      description: " Descripción ",
    };

    getBasicDataMock.mockResolvedValueOnce(trimmedResponse);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(updateBasicDataMock).toHaveBeenCalledTimes(1));

    expect(updateBasicDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Juan",
        located: "Bogotá",
        greeting: "Hola",
        description: "Descripción",
      }),
    );
  });

  it("sanitizes social inputs before persisting", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const instagramInput = await screen.findByLabelText("Instagram");
    await user.clear(instagramInput);
    await user.type(instagramInput, "instagram.com/nuevo");

    const button = await screen.findByRole("button", { name: /guardar cambios/i });
    await user.click(button);

    await waitFor(() => expect(updateBasicDataMock).toHaveBeenCalledTimes(1));

    expect(updateBasicDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        instagram: "https://instagram.com/nuevo",
      }),
    );
  });

  it("renders a blocking overlay while a save is running", async () => {
    let resolveUpdate: ((value: { data: typeof basicDataMock; status: number }) => void) | undefined;
    updateBasicDataMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const button = await screen.findByRole("button", { name: /guardar cambios/i });
    await user.click(button);

    await waitFor(() =>
      expect(container.querySelector(".basic-data-busy-overlay")).toBeInTheDocument(),
    );

    resolveUpdate?.({ data: basicDataMock, status: 204 });

    await waitFor(() => expect(notificationSuccessSpy).toHaveBeenCalled());
  });

  it("shows an error notification when the update fails", async () => {
    updateBasicDataMock.mockResolvedValue({
      data: basicDataMock,
      status: 500,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );
    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());

    expect(messageErrorSpy).toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("shows the fallback error message when no details are returned", async () => {
    updateBasicDataMock.mockRejectedValueOnce({
      response: { status: 400, data: {} },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    const button = await screen.findByRole("button", { name: /guardar cambios/i });
    await user.click(button);

    await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());

    expect(messageErrorSpy).toHaveBeenCalledWith("No se pudo guardar la información");
  });

  it("logs out when update rejects with unauthorized", async () => {
    updateBasicDataMock.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );
    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(logoutMock).toHaveBeenCalled());
  });

  it("logs out when loading basic data is unauthorized", async () => {
    getBasicDataMock.mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    await waitFor(() => expect(logoutMock).toHaveBeenCalled());
  });

  it("shows an error notification when the update throws unexpectedly", async () => {
    updateBasicDataMock.mockRejectedValueOnce(new Error("timeout"));

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );
    const button = await screen.findByRole("button", { name: /guardar cambios/i });

    await user.click(button);

    await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());
    expect(messageErrorSpy).toHaveBeenCalled();
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("handles load failures by showing a notification", async () => {
    getBasicDataMock.mockRejectedValueOnce(new Error("failed load"));

    render(
      <MemoryRouter>
        <BasicDataForm />
      </MemoryRouter>,
    );

    await waitFor(() => expect(notificationErrorSpy).toHaveBeenCalled());
    expect(openNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });
});
