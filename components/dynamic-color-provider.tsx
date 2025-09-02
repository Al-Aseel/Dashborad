"use client";

import { useEffect } from "react";
import { useSettingsContext } from "./settings-context";
import { useDynamicColor } from "@/hooks/use-dynamic-color";

interface DynamicColorProviderProps {
  children: React.ReactNode;
}

export const DynamicColorProvider = ({
  children,
}: DynamicColorProviderProps) => {
  const { mainColor } = useSettingsContext();

  // استخدام hook اللون الديناميكي
  useDynamicColor(mainColor);

  // تطبيق اللون على document title أيضاً
  useEffect(() => {
    if (mainColor) {
      // يمكن إضافة المزيد من التحديثات هنا
      document.documentElement.style.setProperty("--main-color", mainColor);
    }
  }, [mainColor]);

  return <>{children}</>;
};
