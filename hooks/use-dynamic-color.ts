import { useGlobalColor } from "@/components/global-color-provider";

export const useDynamicColor = () => {
  const { mainColor, isColorLoading, colorError } = useGlobalColor();

  // Create gradient colors based on main color
  const getGradientColors = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Create lighter version for gradient
    const lightR = Math.min(255, r + 30);
    const lightG = Math.min(255, g + 30);
    const lightB = Math.min(255, b + 30);

    return {
      from: `rgb(${r}, ${g}, ${b})`,
      to: `rgb(${lightR}, ${lightG}, ${lightB})`,
      light: `rgb(${lightR}, ${lightG}, ${lightB})`,
    };
  };

  const gradientColors = getGradientColors(mainColor);

  return {
    mainColor,
    gradientColors,
    isColorLoading,
    colorError,
    getGradientColors,
  };
};
