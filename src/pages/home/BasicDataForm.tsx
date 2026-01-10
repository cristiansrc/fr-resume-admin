import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import {
  isDateOutOfSelectableRange,
  useBasicDataForm,
} from "../../hooks/home/useBasicDataForm";
import {
  SOCIAL_FIELD_CONFIG,
  SOCIAL_FIELDS,
  SOCIAL_LABELS,
  validateSocialField,
} from "../../utils/socialLinks";
import { LoadingBlock, RichTextEditor } from "../../components";

export const BasicDataForm = () => {
  const {
    form,
    isLoading,
    isSaving,
    isBusy,
    handleSubmit,
  } = useBasicDataForm();
  const [wrapperInput, setWrapperInput] = useState("");
  const [wrapperEngInput, setWrapperEngInput] = useState("");
  const [descriptionPdfInput, setDescriptionPdfInput] = useState("");
  const [descriptionPdfEngInput, setDescriptionPdfEngInput] = useState("");
  const wrapperValues = Form.useWatch("wrapper", form) ?? [];
  const wrapperEngValues = Form.useWatch("wrapperEng", form) ?? [];
  const descriptionPdfValues = Form.useWatch("descriptionPdf", form) ?? [];
  const descriptionPdfEngValues = Form.useWatch("descriptionPdfEng", form) ?? [];
  const { Text } = Typography;

  const handleAddWrapper = useCallback(() => {
    const value = wrapperInput.trim();
    if (!value) {
      return;
    }
    const current = (form.getFieldValue("wrapper") as string[] | undefined) ?? [];
    form.setFieldsValue({ wrapper: [...current, value] });
    setWrapperInput("");
  }, [form, wrapperInput]);

  const handleAddWrapperEng = useCallback(() => {
    const value = wrapperEngInput.trim();
    if (!value) {
      return;
    }
    const current = (form.getFieldValue("wrapperEng") as string[] | undefined) ?? [];
    form.setFieldsValue({ wrapperEng: [...current, value] });
    setWrapperEngInput("");
  }, [form, wrapperEngInput]);

  const handleRemoveWrapperAt = useCallback((indexToRemove: number) => {
    const current = (form.getFieldValue("wrapper") as string[] | undefined) ?? [];
    form.setFieldsValue({
      wrapper: current.filter((_, index) => index !== indexToRemove),
    });
  }, [form]);

  const handleRemoveWrapperEngAt = useCallback((indexToRemove: number) => {
    const current = (form.getFieldValue("wrapperEng") as string[] | undefined) ?? [];
    form.setFieldsValue({
      wrapperEng: current.filter((_, index) => index !== indexToRemove),
    });
  }, [form]);

  const handleAddDescriptionPdf = useCallback(() => {
    const value = descriptionPdfInput.trim();
    if (!value) {
      return;
    }
    const current = (form.getFieldValue("descriptionPdf") as string[] | undefined) ?? [];
    form.setFieldsValue({ descriptionPdf: [...current, value] });
    setDescriptionPdfInput("");
  }, [form, descriptionPdfInput]);

  const handleAddDescriptionPdfEng = useCallback(() => {
    const value = descriptionPdfEngInput.trim();
    if (!value) {
      return;
    }
    const current =
      (form.getFieldValue("descriptionPdfEng") as string[] | undefined) ?? [];
    form.setFieldsValue({ descriptionPdfEng: [...current, value] });
    setDescriptionPdfEngInput("");
  }, [form, descriptionPdfEngInput]);

  const handleRemoveDescriptionPdfAt = useCallback((indexToRemove: number) => {
    const current = (form.getFieldValue("descriptionPdf") as string[] | undefined) ?? [];
    form.setFieldsValue({
      descriptionPdf: current.filter((_, index) => index !== indexToRemove),
    });
  }, [form]);

  const handleRemoveDescriptionPdfEngAt = useCallback((indexToRemove: number) => {
    const current =
      (form.getFieldValue("descriptionPdfEng") as string[] | undefined) ?? [];
    form.setFieldsValue({
      descriptionPdfEng: current.filter((_, index) => index !== indexToRemove),
    });
  }, [form]);

  const wrapperTags = useMemo(() => {
    if (!wrapperValues.length) {
      return <Text type="secondary">Sin logros</Text>;
    }
    return wrapperValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveWrapperAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [wrapperValues, handleRemoveWrapperAt, Text]);

  const wrapperEngTags = useMemo(() => {
    if (!wrapperEngValues.length) {
      return <Text type="secondary">Sin logros</Text>;
    }
    return wrapperEngValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveWrapperEngAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [wrapperEngValues, handleRemoveWrapperEngAt, Text]);

  const descriptionPdfTags = useMemo(() => {
    if (!descriptionPdfValues.length) {
      return <Text type="secondary">Sin descripciones pdf</Text>;
    }
    return descriptionPdfValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveDescriptionPdfAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [descriptionPdfValues, handleRemoveDescriptionPdfAt, Text]);

  const descriptionPdfEngTags = useMemo(() => {
    if (!descriptionPdfEngValues.length) {
      return <Text type="secondary">Sin descripciones pdf</Text>;
    }
    return descriptionPdfEngValues.map((item: string, index: number) => (
      <Tag
        key={`${item}-${index}`}
        closable
        onClose={(event) => {
          event.preventDefault();
          handleRemoveDescriptionPdfEngAt(index);
        }}
      >
        {item}
      </Tag>
    ));
  }, [descriptionPdfEngValues, handleRemoveDescriptionPdfEngAt, Text]);

  return (
    <div className="basic-data-panel">
      <Typography.Title level={3}>Datos Básicos</Typography.Title>
      {!isLoading && isBusy && (
        <LoadingBlock className="basic-data-busy-overlay" tip="Procesando..." />
      )}
      {isLoading ? (
        <LoadingBlock
          className="basic-data-loading"
          tip="Cargando información básica..."
        />
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
                  className="basic-data-date-picker"
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
                  className="basic-data-date-picker"
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
                <RichTextEditor placeholder="Descripción en español" />
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
                <RichTextEditor placeholder="Description in English" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Descripción pdf">
                <Form.Item name="descriptionPdf" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar descripción pdf"
                      value={descriptionPdfInput}
                      onChange={(event) => setDescriptionPdfInput(event.target.value)}
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddDescriptionPdf();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddDescriptionPdf}
                      disabled={!descriptionPdfInput.trim()}
                    >
                      Agregar descripción pdf
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">{descriptionPdfTags}</div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Descripción pdf (inglés)">
                <Form.Item name="descriptionPdfEng" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar descripción pdf en inglés"
                      value={descriptionPdfEngInput}
                      onChange={(event) => setDescriptionPdfEngInput(event.target.value)}
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddDescriptionPdfEng();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddDescriptionPdfEng}
                      disabled={!descriptionPdfEngInput.trim()}
                    >
                      Agregar descripción pdf
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">
                    {descriptionPdfEngTags}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Logros">
                <Form.Item name="wrapper" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar logro"
                      value={wrapperInput}
                      onChange={(event) => setWrapperInput(event.target.value)}
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddWrapper();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddWrapper}
                      disabled={!wrapperInput.trim()}
                    >
                      Agregar logro
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">{wrapperTags}</div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Logros (inglés)">
                <Form.Item name="wrapperEng" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <div className="basic-data-recognition-selection">
                  <div className="basic-data-recognition-controls">
                    <Input
                      placeholder="Agregar logro en inglés"
                      value={wrapperEngInput}
                      onChange={(event) => setWrapperEngInput(event.target.value)}
                      onPressEnter={(event) => {
                        event.preventDefault();
                        handleAddWrapperEng();
                      }}
                    />
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={handleAddWrapperEng}
                      disabled={!wrapperEngInput.trim()}
                    >
                      Agregar logro
                    </Button>
                  </div>
                  <div className="basic-data-recognition-list">{wrapperEngTags}</div>
                </div>
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
