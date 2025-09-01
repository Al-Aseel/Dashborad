import { useSettingsContext } from "@/components/settings-context";

export const useWebsiteInfo = () => {
  const { websiteName, websiteLogo } = useSettingsContext();
  return { websiteName, websiteLogo };
};
