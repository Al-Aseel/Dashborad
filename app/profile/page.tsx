"use client";

import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { EditProfileForm } from "@/components/shared/edit-profile-form";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout
        title="الملف الشخصي"
        description="إدارة معلومات حسابك الشخصي"
      >
        <div className="space-y-6">
          <EditProfileForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
