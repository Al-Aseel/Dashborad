import React from "react";
import { Button } from "./button";
import { useSettingsContext } from "@/components/settings-context";
import { ButtonProps } from "@radix-ui/react-button";
import { cn } from "@/lib/utils";

interface DynamicButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
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
      style={props.style}
    >
      {children}
    </Button>
  );
};
