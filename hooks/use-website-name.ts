import { useSettingsContext } from "@/components/settings-context";

export const useWebsiteInfo = () => {
  const { websiteName, websiteLogo, mainColor } = useSettingsContext();
  return { websiteName, websiteLogo, mainColor };
};
