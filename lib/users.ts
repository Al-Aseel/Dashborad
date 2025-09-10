import { api } from "./api";

export interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "subadmin" | "technical";
  photo?: string | null;
  isActivated?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  last_logged_in?: string;
  hasPassword?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: "superadmin" | "admin" | "subadmin" | "technical";
  isActivated?: boolean;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface UsersListResponse extends ApiResponse<BackendUser[]> {
  numberOfUsers?: number;
  numberOfActiveUsers?: number;
  numberOfInActiveUsers?: number;
  numberOfSuperAdmins?: number;
}

export const UsersService = {
  async getAll(): Promise<UsersListResponse> {
    const { data } = await api.get<UsersListResponse>("/user");
    return data;
  },

  async getById(userId: string): Promise<BackendUser> {
    const { data } = await api.get<ApiResponse<BackendUser>>(`/user/${userId}`);
    return data.data;
  },

  async getMyData(): Promise<BackendUser> {
    const { data } = await api.get<ApiResponse<BackendUser>>("/user/getMyData");
    return data.data;
  },

  async delete(userId: string): Promise<void> {
    await api.delete(`/user/${userId}`);
  },

  async update(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<BackendUser> {
    const { data } = await api.put<ApiResponse<BackendUser>>(
      `/user/${userId}`,
      payload
    );
    return data.data;
  },

  async triggerResetPassword(userId: string): Promise<void> {
    await api.get(`/user/reset-password/${userId}`);
  },
};

export const PasswordService = {
  async resetPasswordWithToken(
    token: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<void> {
    const body = {
      password: newPassword,
      // Laravel-style confirmation key for compatibility
      password_confirmation: confirmPassword ?? newPassword,
    } as const;
    try {
      await api.post(`/user/reset-password`, body, { params: { token } });
    } catch (error: any) {
      const status = error?.response?.status;
      // Fallback for servers expecting PATCH instead of POST
      if (status === 405 || status === 419) {
        await api.patch(`/user/reset-password`, body, { params: { token } });
        return;
      }
      throw error;
    }
  },
};
