import { api, setAuthToken, clearAuthData } from "./api";

export type Role = "superadmin" | "admin" | "subadmin" | "technical";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  data: AuthUser;
  token: string;
}

export const AuthService = {
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/login", {
      email,
      password,
      rememberMe,
    });
    setAuthToken(data.token, { remember: rememberMe });

    try {
      // Clear both storages first to avoid stale data
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("userData");
        window.localStorage.removeItem("isAuthenticated");

        // Always use localStorage for userData and isAuthenticated
        window.localStorage.setItem("userData", JSON.stringify(data.data));
        window.localStorage.setItem("isAuthenticated", "true");
      }
    } catch {}

    try {
      // Cookie for middleware protection. Use persistent cookie only when rememberMe
      if (rememberMe) {
        // 180 days
        const maxAgeSeconds = 60 * 60 * 24 * 180;
        document.cookie = `isAuthenticated=true; path=/; max-age=${maxAgeSeconds}`;
      } else {
        // Session cookie (no max-age)
        document.cookie = "isAuthenticated=true; path=/";
      }
    } catch {}

    return data;
  },

  async changePassword(
    currentPassword: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    const { data } = await api.patch("/user/change-password", {
      currentPassword,
      password,
      confirmPassword,
    });
    return data;
  },

  async editMyData(userData: { name: string; email: string }): Promise<void> {
    const { data } = await api.put("/user/editMyData", userData);
    return data;
  },

  logout() {
    try {
      setAuthToken(null);
    } catch {}

    // Clear all authentication data using utility function
    clearAuthData();

    // Clear any other localStorage data (not just auth)
    try {
      if (typeof window !== "undefined") {
        const keysToKeep = ["theme", "language", "settings"]; // Keep non-auth data
        const allKeys = Object.keys(window.localStorage);
        allKeys.forEach((key) => {
          if (!keysToKeep.includes(key)) {
            window.localStorage.removeItem(key);
          }
        });
      }
    } catch {}
  },

  async logoutAll(): Promise<void> {
    try {
      await api.get("/logout-all");
    } catch (error) {
      // Even if server call fails, proceed to clear local auth to enforce logout
      console.error("logout-all request failed:", error);
    } finally {
      try {
        AuthService.logout();
      } catch {}
    }
  },
};

// Role-based permission helper
export const Permissions = {
  canManageUsers: (role: Role) => role === "superadmin",
  canDelete: (role: Role) => role === "superadmin" || role === "admin",
  canCreate: (role: Role) => (role !== "technical" ? true : false),
  canEdit: (role: Role) => (role !== "technical" ? true : false),
  canView: () => true,
};
