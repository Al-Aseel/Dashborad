"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Target,
  Award,
  Users,
  FileText,
  Briefcase,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProtectedRoute } from "@/components/protected-route";

// Mock data interfaces
interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  beneficiaries: number;
  status: "active" | "completed" | "pending" | "cancelled";
  budget: string;
  startDate: string;
  endDate: string;
  category: string;
  manager: string;
  location: string;
}

interface Report {
  id: string;
  title: string;
  type: "administrative" | "financial" | "media";
  date: string;
  status: "published" | "draft" | "review";
  author: string;
  downloads: number;
  size: string;
}

interface Partner {
  id: string;
  name: string;
  nameEn?: string;
  type: "organization" | "company" | "individual";
  status: "active" | "inactive";
  joinDate: string;
  contribution: string;
  contact: string;
  website?: string;
  projects: number;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "المساعدات الغذائية الطارئة",
      description: "توزيع طرود غذائية للأسر المتضررة في قطاع غزة",
      progress: 85,
      beneficiaries: 2500,
      status: "active",
      budget: "50,000$",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      category: "إغاثة وطوارئ",
      manager: "أحمد محمد",
      location: "غزة",
    },
    {
      id: "2",
      name: "الدعم الصحي للأطفال",
      description: "تقديم الرعاية الصحية والأدوية للأطفال",
      progress: 60,
      beneficiaries: 1200,
      status: "active",
      budget: "35,000$",
      startDate: "2024-03-01",
      endDate: "2024-11-30",
      category: "صحة ورعاية طبية",
      manager: "فاطمة أحمد",
      location: "رفح",
    },
    {
      id: "3",
      name: "التعليم والتدريب المهني",
      description: "برامج تدريبية للشباب في مختلف المهارات",
      progress: 100,
      beneficiaries: 800,
      status: "completed",
      budget: "25,000$",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      category: "تعليم وتدريب",
      manager: "محمد علي",
      location: "خان يونس",
    },
  ]);

  const [reports] = useState<Report[]>([
    {
      id: "1",
      title: "التقرير السنوي 2024",
      type: "administrative",
      date: "2024-12-31",
      status: "published",
      author: "إدارة الجمعية",
      downloads: 245,
      size: "2.5 MB",
    },
    {
      id: "2",
      title: "التقرير المالي - الربع الأول",
      type: "financial",
      date: "2024-03-31",
      status: "published",
      author: "المحاسب المالي",
      downloads: 156,
      size: "1.8 MB",
    },
    {
      id: "3",
      title: "تقرير إعلامي - أنشطة ديسمبر",
      type: "media",
      date: "2024-12-15",
      status: "draft",
      author: "قسم الإعلام",
      downloads: 0,
      size: "3.2 MB",
    },
  ]);

  const [partners] = useState<Partner[]>([
    {
      id: "1",
      name: "مؤسسة الخير الإنسانية",
      nameEn: "Khair Humanitarian Foundation",
      type: "organization",
      status: "active",
      joinDate: "2023-01-15",
      contribution: "100,000$",
      contact: "info@khair.org",
      website: "https://khair.org",
      projects: 5,
    },
    {
      id: "2",
      name: "شركة التكنولوجيا المتقدمة",
      nameEn: "Advanced Technology Company",
      type: "company",
      status: "active",
      joinDate: "2023-06-20",
      contribution: "75,000$",
      contact: "support@tech.com",
      website: "https://advanced-tech.com",
      projects: 3,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
        label: "نشط",
      },
      inactive: {
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800",
        label: "غير نشط",
      },
      completed: {
        variant: "secondary" as const,
        color: "bg-blue-100 text-blue-800",
        label: "مكتمل",
      },
      pending: {
        variant: "outline" as const,
        color: "bg-yellow-100 text-yellow-800",
        label: "قيد الانتظار",
      },
      cancelled: {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
        label: "ملغي",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (item: any, type: string) => {
    console.log("View details:", item, type);
  };

  const handleEdit = (item: any) => {
    console.log("Edit item:", item);
  };

  const handleDelete = (item: any) => {
    console.log("Delete item:", item);
  };

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
  };

  const stats = [
    {
      title: "إجمالي المشاريع",
      value: projects.length.toString(),
      change: "+12%",
      icon: Heart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "المشاريع النشطة",
      value: projects.filter((p) => p.status === "active").length.toString(),
      change: "+8%",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "المشاريع المكتملة",
      value: projects.filter((p) => p.status === "completed").length.toString(),
      change: "+4%",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "إجمالي المستفيدين",
      value: projects
        .reduce((sum, p) => sum + p.beneficiaries, 0)
        .toLocaleString(),
      change: "+15%",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "التقارير الشهرية",
      value: reports.length.toString(),
      change: "+6%",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "الشركاء النشطون",
      value: partners.filter((p) => p.status === "active").length.toString(),
      change: "+3%",
      icon: Briefcase,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="لوحة التحكم الرئيسية"
        description="نظرة عامة على أنشطة ومشاريع الجمعية"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">لوحة التحكم الرئيسية</h2>
              <p className="text-muted-foreground">
                نظرة عامة على أنشطة ومشاريع الجمعية
              </p>
            </div>
            <div className="text-sm text-gray-500">
              آخر تحديث: {new Date().toLocaleDateString("ar-EG")}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-muted-foreground mt-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleQuickAction("add-project")}
                  className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-6 h-6" />
                  <span>إضافة مشروع</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-report")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <FileText className="w-6 h-6" />
                  <span>إضافة تقرير</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-partner")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <UserPlus className="w-6 h-6" />
                  <span>إضافة شريك</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-user")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Users className="w-6 h-6" />
                  <span>إضافة مستخدم</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>المشاريع الحديثة</CardTitle>
                <CardDescription>آخر المشاريع المضافة والمحدثة</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab("projects")}
              >
                عرض الكل
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          {project.beneficiaries} مستفيد
                        </span>
                        <span className="text-sm text-gray-600">
                          {project.budget}
                        </span>
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {project.progress}%
                        </div>
                        <Progress
                          value={project.progress}
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewDetails(project, "project")
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                            <Edit className="w-4 h-4 mr-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>التقارير الحديثة</CardTitle>
                <CardDescription>آخر التقارير المنشورة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{report.title}</h5>
                        <p className="text-xs text-gray-500">
                          {report.author} • {report.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            report.status === "published"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {report.status === "published"
                            ? "منشور"
                            : report.status === "draft"
                            ? "مسودة"
                            : "مراجعة"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Partners */}
            <Card>
              <CardHeader>
                <CardTitle>الشركاء النشطون</CardTitle>
                <CardDescription>الشركاء المساهمون في المشاريع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partners
                    .filter((p) => p.status === "active")
                    .slice(0, 3)
                    .map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">
                            {partner.name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {partner.contribution} • {partner.projects} مشاريع
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            نشط
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
