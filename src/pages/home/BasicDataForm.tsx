import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  notification,
  Row,
  Spin,
  Typography,
} from "antd";
import type { AxiosError } from "axios";
import { useLogout, useNotification } from "@refinedev/core";
import dayjs, { Dayjs } from "dayjs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import {
  getBasicData,
  updateBasicData,
  type BasicDataPayload,
  type BasicDataResponse,
} from "../../providers/basicDataProvider";

type SocialField = "instagram" | "linkedin" | "x" | "github";

interface SocialConfig {
  base: string;
  allowedPrefixes: string[];
  hint: string;
}

const SOCIAL_FIELD_CONFIG: Record<SocialField, SocialConfig> = {
  instagram: {
    base: "https://instagram.com/",
    allowedPrefixes: [
      "https://instagram.com/",
      "https://www.instagram.com/",
      "https://instagram.com",
      "https://www.instagram.com",
      "http://instagram.com/",
      "http://www.instagram.com/",
      "http://instagram.com",
      "http://www.instagram.com",
    ],
    hint: "instagram.com",
  },
  linkedin: {
    base: "https://www.linkedin.com/in/",
    allowedPrefixes: [
      "https://www.linkedin.com/in/",
      "https://linkedin.com/in/",
      "https://www.linkedin.com/",
      "https://linkedin.com/",
      "https://www.linkedin.com",
      "https://linkedin.com",
      "http://www.linkedin.com/in/",
      "http://linkedin.com/in/",
      "http://www.linkedin.com/",
      "http://linkedin.com/",
    ],
    hint: "linkedin.com",
  },
  x: {
    base: "https://x.com/",
    allowedPrefixes: [
      "https://x.com/",
      "https://www.x.com/",
      "https://x.com",
      "https://www.x.com",
      "http://x.com/",
      "http://www.x.com/",
      "http://x.com",
      "http://www.x.com",
    ],
    hint: "x.com",
  },
  github: {
    base: "https://github.com/",
    allowedPrefixes: [
      "https://github.com/",
      "https://www.github.com/",
      "https://github.com",
      "https://www.github.com",
      "http://github.com/",
      "http://www.github.com/",
      "http://github.com",
      "http://www.github.com",
    ],
    hint: "github.com",
  },
};

const SOCIAL_LABELS: Record<SocialField, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  github: "GitHub",
};

const SOCIAL_FIELDS: SocialField[] = [
  "instagram",
  "linkedin",
  "x",
  "github",
];

const MIN_SELECTABLE_DATE = dayjs("1970-01-01");

interface BasicDataErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  message: string;
  validationErrors: { field: string; message: string }[];
}

interface BasicDataFormValues {
  firstName: string;
  othersName?: string;
  firstSurName: string;
  othersSurName?: string;
  dateBirth?: Dayjs;
  located: string;
  locatedEng: string;
  startWorkingDate?: Dayjs;
  greeting: string;
  greetingEng: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  github?: string;
  description: string;
  descriptionEng: string;
}

export const sanitizeSocialValue = (
  value: string | undefined,
  config: SocialConfig,
): string => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const lowerTrimmed = trimmed.toLowerCase();

  if (lowerTrimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }

  const hostWithSlash = config.base.replace(/^https?:\/\//, "");
  const hostWithoutSlash = hostWithSlash.replace(/\/$/, "");

  if (
    lowerTrimmed === hostWithoutSlash ||
    lowerTrimmed.startsWith(`${hostWithoutSlash}/`) ||
    lowerTrimmed.startsWith(hostWithSlash)
  ) {
    return `https://${trimmed}`;
  }

  return `${config.base}${trimmed.replace(/^\/+/, "")}`;
};

export const validateSocialField = (
  value: string | undefined,
  config: SocialConfig,
): Promise<void> => {
  if (!value?.trim()) {
    return Promise.resolve();
  }

  const normalized = sanitizeSocialValue(value, config);
  const normalizedLower = normalized.toLowerCase();

  if (!/^https?:\/\//i.test(normalized)) {
    return Promise.reject(new Error("El valor debe tener http(s) al inicio"));
  }

  const hasValidPrefix = config.allowedPrefixes.some((prefix) =>
    normalizedLower.startsWith(prefix),
  );

  if (!hasValidPrefix) {
    return Promise.reject(
      new Error(`La URL debe comenzar con ${config.hint}`),
    );
  }

  return Promise.resolve();
};

export const getFieldValue = (value?: string) => value?.trim() ?? "";

export const buildBasicDataPayload = (
  values: BasicDataFormValues,
): BasicDataPayload => ({
  firstName: getFieldValue(values.firstName),
  othersName: getFieldValue(values.othersName),
  firstSurName: getFieldValue(values.firstSurName),
  othersSurName: getFieldValue(values.othersSurName),
  dateBirth: values.dateBirth
    ? values.dateBirth.format(BASIC_DATA_DATE_FORMAT)
    : "",
  located: getFieldValue(values.located),
  locatedEng: getFieldValue(values.locatedEng),
  startWorkingDate: values.startWorkingDate
    ? values.startWorkingDate.format(BASIC_DATA_DATE_FORMAT)
    : "",
  greeting: getFieldValue(values.greeting),
  greetingEng: getFieldValue(values.greetingEng),
  email: getFieldValue(values.email),
  instagram: sanitizeSocialValue(
    values.instagram,
    SOCIAL_FIELD_CONFIG.instagram,
  ),
  linkedin: sanitizeSocialValue(
    values.linkedin,
    SOCIAL_FIELD_CONFIG.linkedin,
  ),
  x: sanitizeSocialValue(values.x, SOCIAL_FIELD_CONFIG.x),
  github: sanitizeSocialValue(
    values.github,
    SOCIAL_FIELD_CONFIG.github,
  ),
  description: getFieldValue(values.description),
  descriptionEng: getFieldValue(values.descriptionEng),
});

export const isDateOutOfSelectableRange = (current?: Dayjs) => {
  if (!current) {
    return false;
  }

  const now = dayjs();
  return (
    current.isBefore(MIN_SELECTABLE_DATE, "day") ||
    current.isAfter(now, "day")
  );
};

export const runBasicDataLoaderIfNeeded = (
  loadOnceRef: MutableRefObject<boolean>,
  loadBasicData: () => Promise<void>,
) => {
  if (loadOnceRef.current) {
    return;
  }

  loadOnceRef.current = true;
  void loadBasicData();
};

export const BasicDataForm = () => {
  const [form] = Form.useForm<BasicDataFormValues>();
  const { mutate: logout } = useLogout();
  const { open } = useNotification();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const loadOnceRef = useRef(false);

  const handleUnauthorized = useCallback(() => {
    logout(undefined, {
      onSuccess: () => navigate("/login"),
    });
  }, [logout, navigate]);

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      const axiosError = error as AxiosError<BasicDataErrorResponse>;
      const status = axiosError?.response?.status;

      if (status === 401) {
        handleUnauthorized();
        return;
      }

      const errorMessage =
        axiosError?.response?.data?.message ??
        axiosError?.message ??
        fallback;

      const errorPayload = {
        message: "Error",
        description: errorMessage,
      };

      notification.error(errorPayload);
      message.error(errorMessage);
      open?.({
        type: "error",
        ...errorPayload,
      });
    },
    [handleUnauthorized],
  );

  const loadBasicData = useCallback(async () => {
    setBusy(true);
    setLoading(true);
    try {
      const data: BasicDataResponse = await getBasicData();

      form.setFieldsValue({
        firstName: data.firstName,
        othersName: data.othersName,
        firstSurName: data.firstSurName,
        othersSurName: data.othersSurName,
        dateBirth: data.dateBirth ? dayjs(data.dateBirth) : undefined,
        located: data.located,
        locatedEng: data.locatedEng,
        startWorkingDate: data.startWorkingDate
          ? dayjs(data.startWorkingDate)
          : undefined,
        greeting: data.greeting,
        greetingEng: data.greetingEng,
        email: data.email,
        instagram: data.instagram,
        linkedin: data.linkedin,
        x: data.x,
        github: data.github,
        description: data.description,
        descriptionEng: data.descriptionEng,
      });
    } catch (error) {
      handleError(error, "No se pudieron cargar los datos básicos");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [form, handleError]);

  useEffect(() => {
    runBasicDataLoaderIfNeeded(loadOnceRef, loadBasicData);
  }, [loadBasicData]);

  const handleSubmit = async (values: BasicDataFormValues) => {
    setSaving(true);
    setBusy(true);
    try {
    const payload: BasicDataPayload = buildBasicDataPayload(values);

      const { status } = await updateBasicData(payload);

      const successMessage =
        status === 204
          ? "Datos guardados"
          : "El servicio respondió correctamente y los cambios fueron guardados.";
      const successPayload = {
        message: successMessage,
        description:
          status === 204
            ? "Los datos básicos se actualizaron correctamente."
            : undefined,
      };
      const successNotificationPayload = {
        ...successPayload,
        description: successPayload.description ?? successMessage,
      };

      if (status >= 200 && status < 300) {
        notification.success(successNotificationPayload);
        message.success(successPayload.description ?? successPayload.message);
        open?.({
          type: "success",
          ...successNotificationPayload,
        });
      } else {
        const errorPayload = {
          message: "Error",
          description:
            "No se pudo actualizar la información. Intenta de nuevo más tarde.",
        };
        notification.error(errorPayload);
        message.error(errorPayload.description);
        open?.({
          type: "error",
          ...errorPayload,
        });
      }
    } catch (error) {
      handleError(error, "No se pudo guardar la información");
    } finally {
      setSaving(false);
      setBusy(false);
    }
  };

  return (
    <div className="basic-data-panel">
      <Typography.Title level={3}>Datos Básicos</Typography.Title>
      {!isLoading && isBusy && (
        <div className="basic-data-busy-overlay">
          <Spin tip="Procesando..." size="large" />
        </div>
      )}
      {isLoading ? (
        <div className="basic-data-loading">
          <Spin tip="Cargando información básica..." size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="basic-data-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="Nombre"
                rules={[{ required: true, message: "Ingresa tu nombre" }]}
              >
                <Input placeholder="Nombre" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="othersName" label="Otros nombres">
                <Input placeholder="Opcional" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstSurName"
                label="Primer apellido"
                rules={[{ required: true, message: "Ingresa tu apellido" }]}
              >
                <Input placeholder="Apellido paterno" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="othersSurName" label="Otros apellidos">
                <Input placeholder="Opcional" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateBirth"
                label="Fecha de nacimiento"
                rules={[
                  {
                    required: true,
                    message: "Selecciona la fecha de nacimiento",
                  },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  disabledDate={isDateOutOfSelectableRange}
                  defaultPickerValue={dayjs()}
                  inputReadOnly
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startWorkingDate"
                label="Fecha inicio laboral"
                rules={[
                  {
                    required: true,
                    message: "Selecciona la fecha de inicio laboral",
                  },
                ]}
              >
                <DatePicker
                  format={BASIC_DATA_DATE_FORMAT}
                  disabledDate={isDateOutOfSelectableRange}
                  defaultPickerValue={dayjs()}
                  inputReadOnly
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="located"
                label="Ubicación"
                rules={[{ required: true, message: "Ingresa el lugar" }]}
              >
                <Input placeholder="Ciudad, país" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="locatedEng"
                label="Ubicación (inglés)"
                rules={[
                  { required: true, message: "Ingresa ubicación en inglés" },
                ]}
              >
                <Input placeholder="City, country" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="greeting"
                label="Saludo"
                rules={[{ required: true, message: "Ingresa un saludo" }]}
              >
                <Input placeholder="Saludo en español" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="greetingEng"
                label="Saludo (inglés)"
                rules={[
                  { required: true, message: "Ingresa un saludo en inglés" },
                ]}
              >
                <Input placeholder="Greeting in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="email"
                label="Correo electrónico"
                rules={[
                  { required: true, message: "Ingresa un correo válido" },
                  { type: "email", message: "Ingresa un correo válido" },
                ]}
              >
                <Input placeholder="ejemplo@correo.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {SOCIAL_FIELDS.slice(0, 2).map((social) => (
              <Col key={social} xs={24} sm={12}>
                <Form.Item
                  name={social}
                  label={SOCIAL_LABELS[social]}
                  extra={`Se completará automáticamente con ${SOCIAL_FIELD_CONFIG[social].hint}`}
                  rules={[
                    {
                      validator: (_, value) =>
                        validateSocialField(value, SOCIAL_FIELD_CONFIG[social]),
                    },
                  ]}
                >
                  <Input placeholder={`https://${SOCIAL_FIELD_CONFIG[social].hint}/...`} />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={16}>
            {SOCIAL_FIELDS.slice(2).map((social) => (
              <Col key={social} xs={24} sm={12}>
                <Form.Item
                  name={social}
                  label={SOCIAL_LABELS[social]}
                  extra={`Se completará automáticamente con ${SOCIAL_FIELD_CONFIG[social].hint}`}
                  rules={[
                    {
                      validator: (_, value) =>
                        validateSocialField(value, SOCIAL_FIELD_CONFIG[social]),
                    },
                  ]}
                >
                  <Input placeholder={`https://${SOCIAL_FIELD_CONFIG[social].hint}/...`} />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Descripción"
                rules={[{ required: true, message: "Ingresa una descripción" }]}
              >
                <Input.TextArea rows={3} placeholder="Descripción en español" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="descriptionEng"
                label="Descripción (inglés)"
                rules={[
                  { required: true, message: "Ingresa una descripción en inglés" },
                ]}
              >
                <Input.TextArea rows={3} placeholder="Description in English" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="basic-data-actions">
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Guardar cambios
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};
