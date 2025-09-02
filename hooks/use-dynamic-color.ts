import { useEffect } from "react";

// دالة لتحويل hex color إلى HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // إزالة # إذا كانت موجودة
  hex = hex.replace("#", "");

  // تحويل hex إلى RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// دالة لإنشاء ألوان متدرجة من اللون الأساسي
function generateColorVariants(hexColor: string) {
  const hsl = hexToHSL(hexColor);

  return {
    main: hexColor,
    hover: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 20)}%)`,
    light: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 30, 95)}%)`,
    dark: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 30, 10)}%)`,
    hsl: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
  };
}

// دالة لتحديث CSS Variables
function updateCSSVariables(color: string) {
  const variants = generateColorVariants(color);
  const root = document.documentElement;

  // تحديث متغيرات CSS الأساسية
  root.style.setProperty("--main-color", variants.main);
  root.style.setProperty("--main-color-hover", variants.hover);
  root.style.setProperty("--main-color-light", variants.light);
  root.style.setProperty("--main-color-dark", variants.dark);

  // تحديث متغيرات shadcn/ui
  root.style.setProperty("--primary", variants.hsl);
  root.style.setProperty("--ring", variants.hsl);
  root.style.setProperty("--sidebar-primary", variants.hsl);
  root.style.setProperty("--sidebar-ring", variants.hsl);
}

// Hook لاستخدام اللون الديناميكي
export function useDynamicColor(mainColor: string) {
  useEffect(() => {
    if (mainColor) {
      updateCSSVariables(mainColor);
    }
  }, [mainColor]);

  return {
    updateColor: updateCSSVariables,
  };
}
