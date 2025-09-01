import { useState, useEffect } from "react";
import { useSettings } from "./use-settings";

export const useWebsiteName = () => {
  const { settings } = useSettings();
  const [websiteName, setWebsiteName] = useState("جمعية أصيل");

  useEffect(() => {
    if (settings?.websiteName_ar) {
      setWebsiteName(settings.websiteName_ar);
    }
  }, [settings?.websiteName_ar]);

  return websiteName;
};
