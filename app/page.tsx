"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
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
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ProgramsApi } from "@/lib/programs";
import { getDashboardOverview } from "@/lib/overview";
import { useAuth } from "@/hooks/use-auth";
import { toBackendUrl } from "@/lib/utils";
import { ProjectForm } from "@/components/projects/project-form";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock data interfaces
interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  beneficiaries: string;
  status: string;
  budget: string;
  startDate: string;
  endDate: string;
  category: string;
  manager: string;
  location: string;
  details?: string;
  mainImage?: string;
  gallery?: Array<{ url: string; title: string; fileId?: string }>;
  objectives?: string[];
  activities?: string[];
  coverFileId?: string;
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { user } = useAuth();

  // Overview API state
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [generalStats, setGeneralStats] = useState({
    totalProjects: 0,
    totalActiveProjects: 0,
    totalInactiveProjects: 0,
    totalBeneficiaries: 0,
    totalReports: 0,
    totalActivePartners: 0,
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [editingProjectInitial, setEditingProjectInitial] = useState<any>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Load overview from API
  const loadOverview = useCallback(async () => {
    try {
      setIsLoadingOverview(true);
      const res = await getDashboardOverview();
      const { general, recent } = res.data || ({} as any);
      if (general) setGeneralStats(general);

      // Map recent projects
      const mappedProjects: Project[] = Array.isArray(recent?.projects)
        ? recent.projects.map((p: any) => ({
            id: p.id,
        title: p.name || "",
            description: "",
            progress: 0,
        beneficiaries: String(p.numberOfBeneficiary || 0),
            status: p.status || "active",
        budget: String(p.budget || 0),
        startDate: p.startDate || "",
        endDate: p.endDate || "",
            category: "",
            manager: "",
            location: "",
            details: "",
            mainImage: p.coverImage?.url ? toBackendUrl(p.coverImage.url) : undefined,
            gallery: [],
            objectives: [],
            activities: [],
            coverFileId: "",
          }))
        : [];
      setProjects(mappedProjects);

      // Map recent reports
      const mappedReports: Report[] = Array.isArray(recent?.reports)
        ? recent.reports.map((r: any) => ({
            id: r.id,
            title: r.title,
            type: (r.type === "financial" ? "financial" : r.type === "media" ? "media" : "administrative") as any,
            date: r.createdAt,
            status: (r.status === "published" ? "published" : r.status === "draft" ? "draft" : "review") as any,
            author: r.author,
            downloads: 0,
            size: r.file?.fileName || "",
          }))
        : [];
      setReports(mappedReports);

      // Map recent partners
      const mappedPartners: Partner[] = Array.isArray(recent?.partners)
        ? recent.partners.map((p: any) => ({
            id: p.id,
            name: p.name_ar,
            nameEn: p.name_en,
            type: (p.type === "org" ? "organization" : p.type === "firm" ? "company" : "individual") as any,
            status: (p.status === "active" ? "active" : "inactive") as any,
            joinDate: p.join_date,
            contribution: "",
            contact: "",
            website: undefined,
            projects: 0,
          }))
        : [];
      setPartners(mappedPartners);
    } catch (error) {
      console.error("Error loading overview:", error);
      toast({
        title: "خطأ في تحميل بيانات النظرة العامة",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOverview(false);
    }
  }, [toast]);

  // Load overview on component mount
  useEffect(() => {
    loadOverview();
  }, [loadOverview]);



  // reports and partners now come from API

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

  const handleViewDetails = async (project: Project) => {
    setIsViewDialogOpen(true);
    setIsViewLoading(true);
    try {
      const res = await ProgramsApi.getProgramById(project.id);
      const detailed = {
        ...project,
        details: (res as any).data?.content || project.details,
        mainImage: (res as any).data?.coverImage ? toBackendUrl((res as any).data.coverImage.url || (res as any).data.coverImage) : project.mainImage,
        gallery: Array.isArray((res as any).data?.gallery) ? (res as any).data.gallery.map((g: any) => ({
          url: toBackendUrl(g.url || ""),
          title: g.title || "",
          fileId: String(g?.id || g?._id || ""),
        })) : project.gallery || [],
        objectives: (res as any).data?.goals || project.objectives || [],
        activities: (res as any).data?.activities || project.activities || [],
      };
      setSelectedProject(detailed);
    } catch (error) {
      console.error("Error loading project details:", error);
      setSelectedProject(project);
      toast({
        title: "خطأ في تحميل التفاصيل",
        description: "حدث خطأ أثناء تحميل تفاصيل المشروع",
        variant: "destructive",
      });
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleEdit = async (project: Project) => {
    setIsEditDialogOpen(true);
    setIsEditLoading(true);
    try {
      const res = await ProgramsApi.getProgramById(project.id);
      const p: any = (res as any).data;
      
      // Map the data properly based on the actual API response structure for ProjectForm
      const initial = {
        name: p.name || "",
        description: p.description || "",
        location: p.location || "",
        category: String(p?.category?._id || ""), // Use category._id directly
        budget: String(p.budget ?? ""),
        beneficiaries: String(p.numberOfBeneficiary ?? ""),
        manager: p.manager || "",
        startDate: p.startDate ? p.startDate.split('T')[0] : "", // Convert ISO date to YYYY-MM-DD
        endDate: p.endDate ? p.endDate.split('T')[0] : "", // Convert ISO date to YYYY-MM-DD
        status:
          p.status === "active"
            ? "نشط"
            : p.status === "completed"
            ? "مكتمل"
            : p.status === "in_progress" || p.status === "scheduled"
            ? "قيد التنفيذ"
            : p.status === "paused" || p.status === "stopped"
            ? "متوقف"
            : "مخطط",
        details: p.content || "",
        mainImage: p.coverImage
          ? toBackendUrl(p.coverImage.url || p.coverImage)
          : null,
        gallery: Array.isArray(p.gallery)
          ? p.gallery.map((g: any) => ({
              url: toBackendUrl(g.url || ""),
              title: g.title || "",
              fileId: String(g?._id || ""), // Use _id directly from gallery items
            }))
          : [],
        objectives: p.goals || [], // ProjectForm expects objectives
        activities: p.activities || [], // ProjectForm expects activities
        coverFileId: String(p?.coverImage?._id || ""), // Use coverImage._id directly
        _id: String(p._id || project.id),
      };
      
      setEditingProjectInitial(initial);
    } catch (error) {
      console.error("Error loading project for editing:", error);
      toast({
        title: "خطأ في تحميل المشروع للتعديل",
        description: "حدث خطأ أثناء تحميل بيانات المشروع",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    setIsDeleteDialogOpen(true);
    setSelectedProject(project);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    
    setDeletingId(selectedProject.id);
    try {
      await ProgramsApi.deleteProgram(selectedProject.id);
      
      // Remove from local state
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      
      toast({
        title: "تم حذف المشروع بنجاح",
        description: `تم حذف مشروع "${selectedProject.title}" بنجاح`,
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "خطأ في حذف المشروع",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateProject = async (values: any) => {
    if (!editingProjectInitial?._id) return;
    
    setIsEditLoading(true);
    try {
      // Map status back to API format
      const statusMap: Record<string, string> = {
        نشط: "active",
        مكتمل: "completed",
        "قيد التنفيذ": "active",
        متوقف: "stopped",
        مخطط: "scheduled",
      };

      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        status: statusMap[values.status] || "active",
        location: values.location,
        budget: Number(String(values.budget).replace(/[^\d.]/g, "")) || 0,
        startDate: values.startDate,
        endDate: values.endDate,
        manager: values.manager,
        numberOfBeneficiary:
          Number(String(values.beneficiaries).replace(/[^\d]/g, "")) || 0,
        content: values.details || "",
        goals: values.objectives || [],
        activities: values.activities || [],
        coverImage: undefined as string | undefined,
        gallery: undefined as
          | Array<{ fileId: string; title?: string }>
          | undefined,
      };

      // coverImage is required by API: ensure we pass the uploaded cover fileId
      if (values.coverFileId) {
        (payload as any).coverImage = values.coverFileId;
      } else {
        // If no coverFileId, try to get it from the existing project data
        (payload as any).coverImage = editingProjectInitial.coverFileId;
      }

      // gallery: map items with fileId
      if (Array.isArray(values.gallery)) {
        const galleryItems = values.gallery
          .map((g: any) => {
            const fileId = g?.fileId;
            if (!fileId) return null;
            return {
              fileId: String(fileId),
              title: g?.title || undefined,
            };
          })
          .filter(Boolean) as Array<{ fileId: string; title?: string }>;
        if (galleryItems.length) (payload as any).gallery = galleryItems;
      }

      await ProgramsApi.updateProgram(editingProjectInitial._id, payload as any);
      
      // Refresh overview data to reflect updates
      await loadOverview();
      
      setIsEditDialogOpen(false);
      setEditingProjectInitial(null);
      
      toast({
        title: "تم تحديث المشروع بنجاح",
        description: `تم تحديث مشروع "${values.name}" بنجاح`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "خطأ في تحديث المشروع",
        description: "حدث خطأ أثناء تحديث المشروع",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-project":
        router.push("/projects");
        break;
      case "add-report":
        router.push("/reports");
        break;
      case "add-partner":
        router.push("/partners");
        break;
      case "add-user":
        router.push("/users");
        break;
      default:
        break;
    }
  };

  const stats = [
    {
      title: "إجمالي المشاريع",
      value: generalStats.totalProjects.toString(),
      change: "+12%",
      icon: Heart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "المشاريع النشطة",
      value: generalStats.totalActiveProjects.toString(),
      change: "+8%",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "المشاريع المكتملة",
      value: generalStats.totalInactiveProjects.toString(),
      change: "+4%",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "إجمالي المستفيدين",
      value: generalStats.totalBeneficiaries.toLocaleString(),
      change: "+15%",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "التقارير الشهرية",
      value: generalStats.totalReports.toString(),
      change: "+6%",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "الشركاء النشطون",
      value: generalStats.totalActivePartners.toString(),
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
                onClick={() => router.push("/projects")}>
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
                        {project.title}
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
                            onClick={() => handleViewDetails(project)}
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

        {/* Project View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {isViewLoading ? (
                  <div className="flex items-center text-gray-600">
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري تحميل التفاصيل...
                  </div>
                ) : (
                  selectedProject?.title
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {!isViewLoading && selectedProject && (
                  <>
                    <Badge className={getStatusBadge(selectedProject.status).props.className}>
                      {selectedProject.status}
                    </Badge>
                    <Badge variant="outline">{selectedProject.category}</Badge>
                  </>
                )}
              </div>
            </DialogHeader>
            
            {!isViewLoading && selectedProject && (
              <div className="space-y-6">
                {/* Project Image */}
                {selectedProject.mainImage && (
                  <div className="flex justify-center">
                    <img
                      src={selectedProject.mainImage}
                      alt={selectedProject.title}
                      className="max-w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">تفاصيل المشروع</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">الوصف:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                      </div>
                      {selectedProject.details && (
                        <div>
                          <span className="font-medium">المحتوى التفصيلي:</span>
                          <div className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: selectedProject.details }} />
                        </div>
                      )}
                      <div>
                        <span className="font-medium">المدير:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.manager}</p>
                      </div>
                      <div>
                        <span className="font-medium">الموقع:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">معلومات المشروع</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">الميزانية:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.budget}</p>
                      </div>
                      <div>
                        <span className="font-medium">عدد المستفيدين:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.beneficiaries}</p>
                      </div>
                      <div>
                        <span className="font-medium">تاريخ البداية:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.startDate}</p>
                      </div>
                      <div>
                        <span className="font-medium">تاريخ الانتهاء:</span>
                        <p className="text-gray-600 mt-1">{selectedProject.endDate}</p>
                      </div>
                      <div>
                        <span className="font-medium">التقدم:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={selectedProject.progress} className="flex-1" />
                          <span className="text-sm font-medium">{selectedProject.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objectives and Activities */}
                {((selectedProject.objectives && selectedProject.objectives.length > 0) || (selectedProject.activities && selectedProject.activities.length > 0)) && (
                  <div className="space-y-4">
                    {selectedProject.objectives && selectedProject.objectives.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">أهداف المشروع</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {selectedProject.objectives!.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedProject.activities && selectedProject.activities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">أنشطة المشروع</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {selectedProject.activities!.map((activity, index) => (
                            <li key={index}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Gallery */}
                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">معرض الصور</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProject.gallery.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={image.title || `صورة ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {image.title && (
                            <p className="text-sm text-gray-600 mt-1 text-center">{image.title}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

                {/* Project Edit Dialog */}
        {isEditDialogOpen && (
        <ProjectForm
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingProjectInitial(null);
          }}
          onSubmit={handleUpdateProject}
          initialData={editingProjectInitial || undefined}
          title="تعديل مشروع"
          isLoading={isEditLoading}
        />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف مشروع "{selectedProject?.title}"؟
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deletingId === selectedProject?.id}
              >
                {deletingId === selectedProject?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  "حذف"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
