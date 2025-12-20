import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Home } from "../../../src/pages/home";
import * as refineCore from "@refinedev/core";
import * as basicDataProvider from "../../../src/api/basicDataProvider";
import { MemoryRouter } from "react-router-dom";

vi.mock("@refinedev/core");
vi.mock("../../../src/api/basicDataProvider");
vi.mock("../../../src/pages/label/LabelPage", () => ({
  LabelPage: () => <div data-testid="label-page" />,
}));
vi.mock("../../../src/pages/video/VideoPage", () => ({
  VideoPage: () => <div data-testid="video-page" />,
}));
vi.mock("../../../src/pages/image/ImagePage", () => ({
  ImagePage: () => <div data-testid="image-page" />,
}));

const logoutMutation = vi.fn();

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

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (refineCore.useLogout as unknown as vi.Mock).mockReturnValue({
      mutate: logoutMutation,
      isLoading: false,
    });
    (refineCore.useNotification as unknown as vi.Mock).mockReturnValue({
      open: vi.fn(),
      close: vi.fn(),
    });

    (basicDataProvider.getBasicData as unknown as vi.Mock).mockResolvedValue(
      basicDataMock,
    );
    (basicDataProvider.updateBasicData as unknown as vi.Mock).mockResolvedValue({
      data: basicDataMock,
      status: 204,
    });
  });

  it("renders the header title and the Datos Básicos menu option", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/currículum vitae cristhiam reina/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /datos básicos/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /datos básicos/i }),
    ).toBeInTheDocument();
  });

  it("calls logout when the dropdown logout button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText(/abrir menú de usuario/i));
    await user.click(screen.getByRole("button", { name: /salir/i }));

    expect(logoutMutation).toHaveBeenCalled();
  });

  it("only fetches the basic data once on load", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(basicDataProvider.getBasicData).toHaveBeenCalledTimes(1),
    );
  });

  it("re-renders the BasicDataForm when clicking the menu item", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("menuitem", { name: /datos básicos/i }));

    expect(
      await screen.findByRole("heading", { name: /datos básicos/i }),
    ).toBeInTheDocument();
  });

  it("shows alternate content when another menu option is selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const otherMenuItem = screen.getByRole("menuitem", { name: /otra sección/i });
    await user.click(otherMenuItem);

    expect(
      screen.getByText(/contenido de la sección alternativa/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: /datos básicos/i }));

    expect(
      await screen.findByRole("heading", { name: /datos básicos/i }),
    ).toBeInTheDocument();
  });

  it("renders the label page when the label menu option is selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("menuitem", { name: /labels/i }));

    expect(await screen.findByTestId("label-page")).toBeInTheDocument();
  });

  it("renders the video page when the video menu option is selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("menuitem", { name: /videos/i }));

    expect(await screen.findByTestId("video-page")).toBeInTheDocument();
  });

  it("renders the image page when the images menu option is selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("menuitem", { name: /imágenes/i }));

    expect(await screen.findByTestId("image-page")).toBeInTheDocument();
  });
});
