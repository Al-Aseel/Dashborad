"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Languages, Users, Settings, LogOut, Moon, Sun } from "lucide-react";
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
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex">
        <Sidebar language={language} />

        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                  >
                    <Languages className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
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
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.name?.[0].toUpperCase() ||
                              user?.email[0].toUpperCase() ||
                              "أ"}
                          </span>
                        </div>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Users className="mr-2 h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>الإعدادات</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowLogout(true)}
                      className="text-red-600 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
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
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
