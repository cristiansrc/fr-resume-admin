import { Form } from "antd";
import type { AxiosError } from "axios";
import { useLogout } from "@refinedev/core";
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
} from "../../api";
import { useNotifier } from "../useNotifier";
import { SOCIAL_FIELD_CONFIG, normalizeSocialValue } from "../../utils/socialLinks";

const MIN_SELECTABLE_DATE = dayjs("1970-01-01");

interface BasicDataErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  message: string;
  validationErrors: { field: string; message: string }[];
}

export interface BasicDataFormValues {
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
  instagram: normalizeSocialValue(
    values.instagram,
    SOCIAL_FIELD_CONFIG.instagram,
  ),
  linkedin: normalizeSocialValue(
    values.linkedin,
    SOCIAL_FIELD_CONFIG.linkedin,
  ),
  x: normalizeSocialValue(values.x, SOCIAL_FIELD_CONFIG.x),
  github: normalizeSocialValue(
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

export const useBasicDataForm = () => {
  const [form] = Form.useForm<BasicDataFormValues>();
  const { mutate: logout } = useLogout();
  const { notifyError, notifySuccess } = useNotifier();
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

      notifyError(errorPayload);
    },
    [handleUnauthorized, notifyError],
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
        notifySuccess(successNotificationPayload);
      } else {
        const errorPayload = {
          message: "Error",
          description:
            "No se pudo actualizar la información. Intenta de nuevo más tarde.",
        };
        notifyError(errorPayload);
      }
    } catch (error) {
      handleError(error, "No se pudo guardar la información");
    } finally {
      setSaving(false);
      setBusy(false);
    }
  };

  return {
    form,
    isLoading,
    isSaving,
    isBusy,
    handleSubmit,
  };
};
