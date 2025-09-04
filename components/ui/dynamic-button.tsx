import React from "react";
import { Button, ButtonProps } from "./button";
import { useSettingsContext } from "@/components/settings-context";
import { cn } from "@/lib/utils";

interface DynamicButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const DynamicButton: React.FC<DynamicButtonProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const { mainColor } = useSettingsContext();

  return (
    <Button
      {...props}
      variant={variant}
      className={cn(variant === "default" && "btn-primary", className)}
    >
      {children}
    </Button>
  );
};
