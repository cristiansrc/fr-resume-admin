import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { BASIC_DATA_DATE_FORMAT } from "../../config/basic-data-config";
import { isDateOutOfSelectableRange, useBasicDataForm } from "../../hooks/home/useBasicDataForm";
import {
  SOCIAL_FIELD_CONFIG,
  SOCIAL_FIELDS,
  SOCIAL_LABELS,
  validateSocialField,
} from "../../utils/socialLinks";
import { LoadingBlock } from "../../components";

export const BasicDataForm = () => {
  const {
    form,
    isLoading,
    isSaving,
    isBusy,
    handleSubmit,
  } = useBasicDataForm();

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
