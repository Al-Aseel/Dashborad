import React from "react";
import { useSettingsContext } from "@/components/settings-context";
import { cn } from "@/lib/utils";

interface DynamicIconProps {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon: Icon,
  className = "",
  style = {},
  ...props
}) => {
  const { mainColor } = useSettingsContext();

  return (
    <Icon
      className={cn("dynamic-text", className)}
      style={{
        color: mainColor,
        ...style,
      }}
      {...props}
    />
  );
};
