import { useCallback, useState } from "react";

type UseModalStateOptions = {
  onOpen?: () => void;
  onClose?: () => void;
};

export const useModalState = (options: UseModalStateOptions = {}) => {
  const { onOpen, onClose } = options;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
  };
};
