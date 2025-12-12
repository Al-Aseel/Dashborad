"use client";

import {
  Archive,
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Settings,
  Users,
  UserPlus2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/components/auth-provider";
import { useWebsiteInfo } from "@/hooks/use-website-name";

interface SidebarItem {
  icon: any;
  label: string;
  key: string;
  href: string;
}

interface SidebarProps {
  language?: "ar" | "en";
}

// Custom hook for persistent sidebar state
function usePersistentSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Always start with expanded (server default)
  const [isHydrated, setIsHydrated] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // After hydration, load the actual state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        const savedCollapsed = JSON.parse(saved);
        if (savedCollapsed !== false) {
          // Only update if it's different from default
          setIsCollapsed(savedCollapsed);
        }
      }
    } catch (error) {
      console.error("Failed to load sidebar state:", error);
    }
    setIsHydrated(true);

    // Enable animations after a short delay to prevent jarring transitions
    setTimeout(() => {
      setShouldAnimate(true);
    }, 100);
  }, []);

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  };

  return { isCollapsed, setCollapsed, isHydrated, shouldAnimate };
}

export const Sidebar = ({ language = "ar" }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = language === "ar";
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { websiteName, websiteLogo, mainColor } = useWebsiteInfo();

  const { isCollapsed, setCollapsed, isHydrated, shouldAnimate } =
    usePersistentSidebarState();

  // Split website name into two lines: top and bottom
  const [websiteNameTop, websiteNameBottom] = (() => {
    const name = (websiteName || "").trim();
    if (!name) return ["", ""];
    const parts = name.split(/\s+/);
    if (parts.length === 1) return [name, ""];
    const midIndex = Math.ceil(parts.length / 2);
    return [
      parts.slice(0, midIndex).join(" "),
      parts.slice(midIndex).join(" "),
    ];
  })();

  const sidebarItems: SidebarItem[] = [
    { icon: BarChart3, label: "نظرة عامة", key: "overview", href: "/" },
    {
      icon: Camera,
      label: "صور الصفحة الرئيسية",
      key: "home-images",
      href: "/home-images",
    },
    {
      icon: FileText,
      label: "الأخبار والأنشطة",
      key: "news-activities",
      href: "/news-activities",
    },
    { icon: Heart, label: "المشاريع", key: "projects", href: "/projects" },
    { icon: FileText, label: "التقارير", key: "reports", href: "/reports" },
    { icon: Users, label: "الشركاء", key: "partners", href: "/partners" },
    {
      icon: MessageSquare,
      label: "الرسائل",
      key: "messages",
      href: "/messages",
    },
    { icon: UserPlus2, label: "المستخدمين", key: "users", href: "/users" },
    { icon: Archive, label: "الأرشيف", key: "archive", href: "/archive" },
    { icon: Settings, label: "الإعدادات", key: "settings", href: "/settings" },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => {
    setCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-card border-r border-border min-h-screen ${
        shouldAnimate ? "transition-all duration-300 ease-in-out" : ""
      } ${isCollapsed ? "w-16" : "w-64"} ${isRTL ? "border-l border-r-0" : ""}`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className={`p-6 ${isCollapsed ? "px-2" : ""}`}>
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200">
            {websiteLogo ? (
              <img
                src={websiteLogo}
                alt="شعار الموقع"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: mainColor }}
              >
                <Heart className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                {websiteNameTop}
              </h1>
              {websiteNameBottom && (
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {websiteNameBottom}
                </h2>
              )}
            </div>
          )}
        </Link>
      </div>

      <nav className={`px-4 space-y-1 ${isCollapsed ? "px-2" : ""}`}>
        {sidebarItems
          .filter((item) => {
            if (item.key === "users") {
              // Show Users link only when auth loaded and role is superadmin
              return (
                !isLoading && isAuthenticated && user?.role === "superadmin"
              );
            }
            if (item.key === "settings") {
              // Show settings for subadmin+ (view-only for subadmin)
              return (
                !isLoading &&
                isAuthenticated &&
                (user?.role === "subadmin" ||
                  user?.role === "admin" ||
                  user?.role === "superadmin")
              );
            }
            return true;
          })
          .map((item, index) => {
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={index}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${isRTL ? "flex-row" : ""} ${
                  isCollapsed ? "justify-center px-2" : ""
                }`}
                style={{
                  backgroundColor: isActive ? mainColor : undefined,
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 mt-8">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                قطاع غزة - فلسطين
              </span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              تمكين الفئات المهمشة ودعم صمود المجتمع الفلسطيني
            </p>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className={`p-4 mt-auto ${isCollapsed ? "px-2" : ""}`}>
        <div className="border-t border-border pt-4">
          {!isCollapsed && user && (
            <div className="mb-3 text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: mainColor }}
              >
                <span className="text-white text-sm font-medium">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">
                {user.name || "المستخدم"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
