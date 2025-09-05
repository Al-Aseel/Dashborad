"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { UsersService, type BackendUser } from "@/lib/users";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";
import type { Role } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  KeyRound,
  Mail,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  joinDate: string;
  avatar?: string;
  hasPassword?: boolean;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [backendStats, setBackendStats] = useState<{
    numberOfUsers?: number;
    numberOfActiveUsers?: number;
    numberOfInActiveUsers?: number;
    numberOfSuperAdmins?: number;
  }>({});
  // Helpers: map backend user to UI user shape
  const mapBackendToUi = (u: BackendUser): User => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role:
      u.role === "admin"
        ? "مدير"
        : u.role === "subadmin"
        ? "مدير قسم"
        : u.role === "technical"
        ? "منسق"
        : "مدير عام",
    status: u.isDeleted ? "محظور" : u.isActivated ? "نشط" : "معلق",
    lastLogin:
      u.last_logged_in ||
      (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"),
    joinDate: u.createdAt ? u.createdAt.split("T")[0] : "-",
    avatar: u.photo || undefined,
    hasPassword: u.hasPassword ?? true,
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await UsersService.getAll();
        setUsers(res.data.map(mapBackendToUi));
        setBackendStats({
          numberOfUsers: res.numberOfUsers,
          numberOfActiveUsers: res.numberOfActiveUsers,
          numberOfInActiveUsers: res.numberOfInActiveUsers,
          numberOfSuperAdmins: res.numberOfSuperAdmins,
        });
      } catch (error) {
        // toasts handled by interceptor on 401; show generic error otherwise
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "نشط",
  });

  const mapRoleToBackend = (
    role: string
  ): "superadmin" | "admin" | "subadmin" | "technical" => {
    switch (role) {
      case "مدير":
        return "admin";
      case "مدير قسم":
        return "subadmin";
      case "محاسب":
        return "technical";
      case "منسق":
        return "technical";
      default:
        return "technical";
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "الكل" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, debouncedSearchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "نشط").length;
    const inactive = users.filter((u) => u.status === "معلق").length;
    const admins = users.filter((u) => u.role.includes("مدير")).length;

    return { total, active, inactive, admins };
  }, [users]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "نشط",
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedUser(null);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const sendWelcomeEmail = async (user: User) => {
    // محاكاة إرسال البريد الإلكتروني
    const setupLink = `${window.location.origin}/setup-password?token=${btoa(
      user.email + Date.now()
    )}`;

    console.log(`[v0] إرسال بريد ترحيب إلى: ${user.email}`);
    console.log(`[v0] رابط إعداد كلمة المرور: ${setupLink}`);

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return setupLink;
  };

  const sendPasswordResetEmail = async (user: User) => {
    // محاكاة إرسال البريد الإلكتروني
    const resetLink = `${window.location.origin}/reset-password?token=${btoa(
      user.email + Date.now()
    )}`;

    console.log(`[v0] إرسال بريد إعادة تعيين كلمة المرور إلى: ${user.email}`);
    console.log(`[v0] رابط إعادة تعيين كلمة المرور: ${resetLink}`);

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return resetLink;
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: mapRoleToBackend(formData.role),
      };
      await api.post("/user", payload);
      // Refresh list from backend for source of truth
      const res = await UsersService.getAll();
      setUsers(res.data.map(mapBackendToUi));
      setBackendStats({
        numberOfUsers: res.numberOfUsers,
        numberOfActiveUsers: res.numberOfActiveUsers,
        numberOfInActiveUsers: res.numberOfInActiveUsers,
        numberOfSuperAdmins: res.numberOfSuperAdmins,
      });
      toast({ title: "تم بنجاح", description: "تم إضافة المستخدم بنجاح" });

      closeAddDialog();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const closeResetPasswordDialog = () => {
    setIsResetPasswordDialogOpen(false);
    setSelectedUser(null);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setIsResettingPassword(true);
    try {
      await UsersService.triggerResetPassword(selectedUser.id);

      // تحديث حالة المستخدم
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id ? { ...user, hasPassword: false } : user
        )
      );

      toast({
        title: "تم بنجاح",
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${selectedUser.email}`,
      });

      closeResetPasswordDialog();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.role) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: mapRoleToBackend(formData.role),
        isActivated: formData.status === "نشط",
      } as const;
      if (selectedUser) await UsersService.update(selectedUser.id, payload);
      const res = await UsersService.getAll();
      setUsers(res.data.map(mapBackendToUi));
      setBackendStats({
        numberOfUsers: res.numberOfUsers,
        numberOfActiveUsers: res.numberOfActiveUsers,
        numberOfInActiveUsers: res.numberOfInActiveUsers,
        numberOfSuperAdmins: res.numberOfSuperAdmins,
      });

      closeEditDialog();

      toast({
        title: "تم بنجاح",
        description: `تم تحديث المستخدم بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await UsersService.delete(selectedUser.id);
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));

      closeDeleteDialog();

      toast({
        title: "تم بنجاح",
        description: `تم حذف المستخدم بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "مدير":
        return "bg-red-100 text-red-800";
      case "مدير قسم":
        return "bg-blue-100 text-blue-800";
      case "محاسب":
        return "bg-green-100 text-green-800";
      case "منسق":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-green-100 text-green-800";
      case "معلق":
        return "bg-yellow-100 text-yellow-800";
      case "محظور":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute allowRoles={["superadmin" as Role]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold dynamic-text">
                إدارة المستخدمين
              </h1>
              <p className="text-gray-600 mt-2">
                إدارة مستخدمي النظام والصلاحيات
              </p>
            </div>
            <Button onClick={openAddDialog} className="btn-primary">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي المستخدمين
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">+2 هذا الشهر</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المستخدمون النشطون
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.active / stats.total) * 100)}% من الإجمالي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المستخدمون المعلقون
                </CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.inactive / stats.total) * 100)}% من
                  الإجمالي
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المديرون</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.admins / stats.total) * 100)}% من الإجمالي
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 dynamic-text w-4 h-4" />
                  <Input
                    placeholder="البحث في المستخدمين..."
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">جميع الحالات</SelectItem>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                    <SelectItem value="محظور">محظور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المستخدمين ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                    <TableHead className="text-right">آخر دخول</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.split(" ")[0][0]}
                              {user.name.split(" ")[1]?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {!user.hasPassword && (
                              <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                <KeyRound className="w-3 h-3" />
                                في انتظار إعداد كلمة المرور
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openViewDialog(user)}
                            >
                              <Eye className="ml-2 h-4 w-4" />
                              عرض الملف
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openResetPasswordDialog(user)}
                            >
                              <KeyRound className="ml-2 h-4 w-4" />
                              إعادة تعيين كلمة المرور
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add User Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent dir="rtl" className="max-w-md text-right">
              <DialogHeader>
                <DialogTitle className="dynamic-text">إضافة مستخدم</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="أدخل الاسم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">الدور *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مدير">مدير</SelectItem>
                        <SelectItem value="مدير قسم">مدير قسم</SelectItem>
                        <SelectItem value="محاسب">محاسب</SelectItem>
                        <SelectItem value="منسق">منسق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="معلق">معلق</SelectItem>
                        <SelectItem value="محظور">محظور</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">ملاحظة</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    سيتم إرسال رابط إعداد كلمة المرور إلى البريد الإلكتروني
                    المحدد
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeAddDialog}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  إضافة
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Reset Password Confirmation Dialog */}
          <AlertDialog
            open={isResetPasswordDialogOpen}
            onOpenChange={(open) => {
              if (!open && !isResettingPassword) {
                closeResetPasswordDialog();
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>إعادة تعيين كلمة المرور</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من إعادة تعيين كلمة المرور لهذا المستخدم؟ سيتم
                  إرسال رابط إعادة التعيين إلى بريده الإلكتروني.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={closeResetPasswordDialog}
                  disabled={isResettingPassword}
                >
                  إلغاء
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="btn-primary"
                >
                  {isResettingPassword && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  <KeyRound className="ml-2 h-4 w-4" />
                  إرسال رابط إعادة التعيين
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent dir="rtl" className="max-w-md text-right">
              <DialogHeader>
                <DialogTitle className="dynamic-text">تعديل مستخدم</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">الاسم *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="أدخل الاسم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">الدور *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مدير">مدير</SelectItem>
                        <SelectItem value="مدير قسم">مدير قسم</SelectItem>
                        <SelectItem value="محاسب">محاسب</SelectItem>
                        <SelectItem value="منسق">منسق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">الحالة *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="معلق">معلق</SelectItem>
                        <SelectItem value="محظور">محظور</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={closeEditDialog}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  تحديث
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View User Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent dir="rtl" className="max-w-md text-right">
              <DialogHeader>
                <DialogTitle className="dynamic-text">
                  تفاصيل المستخدم
                </DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={selectedUser.avatar || "/placeholder.svg"}
                        alt={selectedUser.name}
                      />
                      <AvatarFallback>
                        {selectedUser.name.split(" ")[0][0]}
                        {selectedUser.name.split(" ")[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <h3 className="text-lg font-semibold">
                        {selectedUser.name}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        الدور
                      </Label>
                      <Badge className={getRoleColor(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        الحالة
                      </Label>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        تاريخ الانضمام
                      </Label>
                      <p>{selectedUser.joinDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        آخر دخول
                      </Label>
                      <p>{selectedUser.lastLogin}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={closeViewDialog}>إغلاق</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              if (!open && !isDeleting) {
                closeDeleteDialog();
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من حذف هذا المستخدم؟ سيتم نقله إلى الأرشيف ويمكن
                  استرجاعه لاحقاً.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={closeDeleteDialog}
                  disabled={isDeleting}
                >
                  إلغاء
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
