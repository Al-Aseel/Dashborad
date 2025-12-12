"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Languages,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "./sidebar";
import { useAuthContext } from "@/components/auth-provider";
import { LogoutDialog } from "@/components/logout-dialog";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useWebsiteInfo } from "@/hooks/use-website-name";
import { useWebsiteUrl } from "@/hooks/use-website-url";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const DashboardLayout = ({
  children,
  title,
  description,
}: DashboardLayoutProps) => {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const isRTL = language === "ar";
  const { logout, user } = useAuthContext();
  const [showLogout, setShowLogout] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { mainColor } = useWebsiteInfo();
  const { websiteUrl, isLoading: isWebsiteUrlLoading } = useWebsiteUrl();

  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex">
        <Sidebar language={language} />

        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-card/80 backdrop-blur-md border-b border-border/50 px-6 py-4 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {title && (
                  <div className="animate-fade-in-up">
                    <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Website Review Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-lg hover:bg-muted/50 transition-all duration-200 border-2"
                  onClick={() => {
                    if (websiteUrl) {
                      window.open(websiteUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  disabled={isWebsiteUrlLoading || !websiteUrl}
                  style={{
                    borderColor: mainColor,
                    color: mainColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${mainColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <ExternalLink className="w-4 h-4 ml-2" />
                  {isWebsiteUrlLoading ? "جاري التحميل..." : "مراجعة الموقع"}
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  aria-label="Toggle theme"
                >
                  {!mounted ? (
                    <Moon className="w-4 h-4" />
                  ) : resolvedTheme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200 p-0"
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-muted transition-all duration-200">
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                          style={{
                            background: `linear-gradient(135deg, ${mainColor}, ${mainColor}dd)`,
                            boxShadow: `0 4px 12px ${mainColor}40`,
                          }}
                        >
                          <span className="text-white text-sm font-semibold">
                            {user?.name?.[0]?.toUpperCase() ||
                              user?.email?.[0]?.toUpperCase() ||
                              "أ"}
                          </span>
                        </div>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 p-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl"
                    align="end"
                    forceMount
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-border/50 mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name || "المستخدم"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>

                    <DropdownMenuItem
                      asChild
                      className="rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Users className="h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>الإعدادات</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => setShowLogout(true)}
                      className="text-red-600 focus:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <LogoutDialog
                  isOpen={showLogout}
                  onClose={() => setShowLogout(false)}
                  onConfirm={() => {
                    setShowLogout(false);
                    logout();
                  }}
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
