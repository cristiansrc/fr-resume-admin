import { Button, Space, Typography } from "antd";
import type { ButtonProps } from "antd";
import type { ReactNode } from "react";

const { Title } = Typography;

type SectionHeaderAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  buttonProps?: ButtonProps;
};

type SectionHeaderProps = {
  className?: string;
  title: string;
  action?: SectionHeaderAction;
};

export const SectionHeader = ({
  className,
  title,
  action,
}: SectionHeaderProps) => (
  <div className={className}>
    <Space size="middle" align="center">
      <Title level={3}>{title}</Title>
    </Space>
    {action ? (
      <Button
        type="primary"
        icon={action.icon}
        onClick={action.onClick}
        {...action.buttonProps}
      >
        {action.label}
      </Button>
    ) : null}
  </div>
);
