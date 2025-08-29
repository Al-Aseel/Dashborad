import { api, setAuthToken } from "./api";

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
        window.sessionStorage.removeItem("userData");
        window.sessionStorage.removeItem("isAuthenticated");

        const targetStorage = rememberMe
          ? window.localStorage
          : window.sessionStorage;
        targetStorage.setItem("userData", JSON.stringify(data.data));
        targetStorage.setItem("isAuthenticated", "true");
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

    // Clear all client-side storage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
      }
    } catch {}
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {}

    // Expire all cookies (not just auth)
    try {
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf("=");
          const name = (eqPos > -1 ? cookie.substr(0, eqPos) : cookie).trim();
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
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
