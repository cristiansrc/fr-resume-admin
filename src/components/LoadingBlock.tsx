import { Spin } from "antd";

type LoadingBlockProps = {
  className: string;
  tip: string;
  size?: "small" | "default" | "large";
};

export const LoadingBlock = ({
  className,
  tip,
  size = "large",
}: LoadingBlockProps) => (
  <div className={className}>
    <Spin tip={tip} size={size} />
  </div>
);
