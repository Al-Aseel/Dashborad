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
  Download,
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
import { api } from "@/lib/api";
import { ProjectForm } from "@/components/projects/project-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReportById, updateReport, deleteReport } from "@/lib/reports";
import { getPartner, updatePartner, deletePartner } from "@/lib/partners";
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

  // Reports dialogs state
  const [isReportViewOpen, setIsReportViewOpen] = useState(false);
  const [isReportEditOpen, setIsReportEditOpen] = useState(false);
  const [isReportDeleteOpen, setIsReportDeleteOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportOverview, setSelectedReportOverview] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    title: "",
    type: "media" as "media" | "financial" | "management" | "project" | "statistic",
    author: "",
    date: "",
    status: "draft" as "published" | "draft",
    fileId: "",
  });

  // Helpers for report labels
  const mapReportTypeToArabic = (value: string) => {
    switch (value) {
      case "media":
        return "تقرير إعلامي";
      case "financial":
        return "تقرير مالي";
      case "management":
        return "تقرير إداري";
      case "project":
        return "تقرير مشاريع";
      case "statistic":
        return "تقرير إحصائي";
      default:
        return value;
    }
  };

  const mapReportStatusToArabic = (value: string) => {
    switch (value) {
      case "published":
        return "منشور";
      case "draft":
        return "مسودة";
      default:
        return value;
    }
  };

  const handleReportDownload = async () => {
    try {
      const f = (selectedReportOverview?.file || {}) as any;
      const fileUrl = typeof f === "object" ? f?.url : undefined;
      if (!fileUrl) throw new Error("no url");

      const viewUrl = toBackendUrl(fileUrl);

      // Try opening directly (works for public/static endpoints)
      const win = window.open(viewUrl, "_blank", "noopener,noreferrer");
      if (win) return;

      // If popup blocked or needs auth, fetch the absolute URL directly (no baseURL prefix)
      const headers: Record<string, string> = {};
      try {
        const token = localStorage.getItem("auth_token");
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch {}

      const res = await fetch(viewUrl, { headers });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const win2 = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!win2) {
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.download = (typeof f === "object" && f.originalName) ? encodeURIComponent(String(f.originalName)) : "report.pdf";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    } catch {
      toast({ title: "خطأ", description: "تعذر عرض ملف التقرير", variant: "destructive" });
    }
  };

  // Partners dialogs state
  const [isPartnerViewOpen, setIsPartnerViewOpen] = useState(false);
  const [isPartnerEditOpen, setIsPartnerEditOpen] = useState(false);
  const [isPartnerDeleteOpen, setIsPartnerDeleteOpen] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [selectedPartnerOverview, setSelectedPartnerOverview] = useState<any>(null);
  const [partnerForm, setPartnerForm] = useState({
    _id: "",
    name_ar: "",
    name_en: "",
    email: "",
    type: "org" as "org" | "member" | "firm",
    website: "",
    status: "active" as "active" | "inactive",
    join_date: "",
  });

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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>التقارير الحديثة</CardTitle>
                  <CardDescription>آخر التقارير المنشورة</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/reports")}>
                  عرض الكل
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{report.title}</h5>
                        <p className="text-sm text-gray-500 mt-1">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={async () => {
                              setReportLoading(true);
                              try {
                                const res = await getReportById(String(report.id));
                                const d: any = res.data;
                                setSelectedReportOverview({
                                  id: d._id,
                                  title: d.title,
                                  type: d.type,
                                  author: d.author,
                                  date: d.createdAt,
                                  status: d.status,
                                  file: d.file,
                                });
                                setIsReportViewOpen(true);
                              } catch (e) {
                                toast({ title: "تعذر تحميل التقرير", variant: "destructive" });
                              } finally {
                                setReportLoading(false);
                              }
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              setReportLoading(true);
                              try {
                                const res = await getReportById(String(report.id));
                                const d: any = res.data;
                                setReportForm({
                                  title: d.title || "",
                                  type: (d.type as any) || "media",
                                  author: d.author || "",
                                  date: (d.createdAt || "").split("T")[0],
                                  status: (d.status as any) || "draft",
                                  fileId: (d?.file as any)?.id || "",
                                });
                                setSelectedReportOverview({ id: d._id });
                                setIsReportEditOpen(true);
                              } catch (e) {
                                toast({ title: "تعذر تحميل التقرير للتحرير", variant: "destructive" });
                              } finally {
                                setReportLoading(false);
                              }
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedReportOverview({ id: report.id });
                              setIsReportDeleteOpen(true);
                            }} className="text-red-600 focus:text-red-700">
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

            {/* Active Partners */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>الشركاء النشطون</CardTitle>
                  <CardDescription>الشركاء المساهمون في المشاريع</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/partners")}>
                  عرض الكل
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners
                    .filter((p) => p.status === "active")
                    .slice(0, 3)
                    .map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {partner.name}
                          </h5>
                          <p className="text-sm text-gray-500 mt-1">
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={async () => {
                                setPartnerLoading(true);
                                try {
                                  const res = await getPartner(String((partner as any).id || partner.id));
                                  const d: any = res.data;
                                  setSelectedPartnerOverview(d);
                                  setIsPartnerViewOpen(true);
                                } catch (e) {
                                  toast({ title: "تعذر تحميل بيانات الشريك", variant: "destructive" });
                                } finally {
                                  setPartnerLoading(false);
                                }
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                عرض
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                setPartnerLoading(true);
                                try {
                                  const res = await getPartner(String((partner as any).id || partner.id));
                                  const d: any = res.data;
                                  setPartnerForm({
                                    _id: d._id,
                                    name_ar: d.name_ar || "",
                                    name_en: d.name_en || "",
                                    email: d.email || "",
                                    type: d.type || "org",
                                    website: d.website || "",
                                    status: d.status || "active",
                                    join_date: (d.join_date || "").split("T")[0],
                                  });
                                  setIsPartnerEditOpen(true);
                                } catch (e) {
                                  toast({ title: "تعذر تحميل الشريك للتحرير", variant: "destructive" });
                                } finally {
                                  setPartnerLoading(false);
                                }
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPartnerOverview({ _id: (partner as any)._id || (partner as any).id });
                                setIsPartnerDeleteOpen(true);
                              }} className="text-red-600 focus:text-red-700">
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

        {/* Report View Dialog */}
        <Dialog open={isReportViewOpen} onOpenChange={setIsReportViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل التقرير</DialogTitle>
            </DialogHeader>

            {reportLoading ? (
              <div className="text-gray-600 flex items-center"><Loader2 className="w-4 h-4 ml-2 animate-spin"/>جاري التحميل...</div>
            ) : selectedReportOverview ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">عنوان التقرير</Label>
                    <p className="text-lg font-semibold">{selectedReportOverview.title}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">نوع التقرير</Label>
                    <p className="text-lg">{mapReportTypeToArabic(selectedReportOverview.type)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">المؤلف</Label>
                    <p className="text-lg">{selectedReportOverview.author}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">التاريخ</Label>
                    <p className="text-lg">{String(selectedReportOverview.date).slice(0,10)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">الحالة</Label>
                    <Badge className="bg-green-100 text-green-800">{mapReportStatusToArabic(selectedReportOverview.status)}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">حجم الملف</Label>
                    <p className="text-lg">{
                      (()=>{
                        const f:any = selectedReportOverview.file || {};
                        const size = typeof f === "object" ? f?.size : undefined;
                        if (!size && size !== 0) return "";
                        const mb = (Number(size) / (1024 * 1024)).toFixed(1);
                        return `${mb} MB`;
                      })()
                    }</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReportViewOpen(false)}>
                    إغلاق
                  </Button>
                  <Button onClick={handleReportDownload}>
                    <Download className="w-4 h-4 ml-1" />
                    تحميل التقرير
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Report Edit Dialog */}
        <Dialog open={isReportEditOpen} onOpenChange={setIsReportEditOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>تعديل التقرير</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input value={reportForm.title} onChange={(e)=>setReportForm((p)=>({...p,title:e.target.value}))} className="text-right"/>
              </div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={reportForm.type} onValueChange={(v)=>setReportForm((p)=>({...p,type:v as any}))}>
                  <SelectTrigger className="text-right"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="media">تقرير إعلامي</SelectItem>
                    <SelectItem value="financial">تقرير مالي</SelectItem>
                    <SelectItem value="management">تقرير إداري</SelectItem>
                    <SelectItem value="project">تقرير مشاريع</SelectItem>
                    <SelectItem value="statistic">تقرير إحصائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={reportForm.status} onValueChange={(v)=>setReportForm((p)=>({...p,status:v as any}))}>
                  <SelectTrigger className="text-right"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input type="date" value={reportForm.date} onChange={(e)=>setReportForm((p)=>({...p,date:e.target.value}))}/>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setIsReportEditOpen(false)}>إلغاء</Button>
                <Button onClick={async ()=>{
                  if(!selectedReportOverview?.id) return;
                  setReportLoading(true);
                  try {
                    const payload:any = {
                      title: reportForm.title,
                      type: reportForm.type,
                      author: reportForm.author,
                      createdAt: reportForm.date,
                      status: reportForm.status,
                      file: reportForm.fileId || "",
                    };
                    await updateReport(String(selectedReportOverview.id), payload);
                    await loadOverview();
                    setIsReportEditOpen(false);
                    toast({title:"تم التحديث"});
                  } catch(e){
                    toast({title:"فشل تحديث التقرير",variant:"destructive"});
                  } finally { setReportLoading(false);} 
                }}>حفظ</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Delete Dialog */}
        <AlertDialog open={isReportDeleteOpen} onOpenChange={setIsReportDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف التقرير</AlertDialogTitle>
              <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={async()=>{
                if(!selectedReportOverview?.id) return;
                setReportLoading(true);
                try{
                  await deleteReport(String(selectedReportOverview.id));
                  await loadOverview();
                  toast({title:"تم حذف التقرير"});
                }catch(e){
                  toast({title:"فشل حذف التقرير",variant:"destructive"});
                }finally{
                  setReportLoading(false);
                  setIsReportDeleteOpen(false);
                }
              }} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Partner View Dialog */}
        <Dialog open={isPartnerViewOpen} onOpenChange={setIsPartnerViewOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الشريك</DialogTitle>
            </DialogHeader>
            {partnerLoading ? (
              <div className="text-gray-600 flex items-center"><Loader2 className="w-4 h-4 ml-2 animate-spin"/>جاري التحميل...</div>
            ) : selectedPartnerOverview ? (
              <div className="space-y-2 text-right">
                <p>الاسم: {selectedPartnerOverview.name_ar}</p>
                <p>النوع: {selectedPartnerOverview.type}</p>
                <p>الحالة: {selectedPartnerOverview.status}</p>
                <p>التاريخ: {selectedPartnerOverview.join_date}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Partner Edit Dialog */}
        <Dialog open={isPartnerEditOpen} onOpenChange={setIsPartnerEditOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>تعديل الشريك</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>الاسم (عربي)</Label>
                <Input className="text-right" value={partnerForm.name_ar} onChange={(e)=>setPartnerForm((p)=>({...p,name_ar:e.target.value}))}/>
              </div>
              <div className="space-y-1">
                <Label>الاسم (إنجليزي)</Label>
                <Input className="text-right" value={partnerForm.name_en} onChange={(e)=>setPartnerForm((p)=>({...p,name_en:e.target.value}))}/>
              </div>
              <div className="space-y-1">
                <Label>البريد</Label>
                <Input className="text-right" value={partnerForm.email} onChange={(e)=>setPartnerForm((p)=>({...p,email:e.target.value}))}/>
              </div>
              <div className="space-y-1">
                <Label>النوع</Label>
                <Select value={partnerForm.type} onValueChange={(v)=>setPartnerForm((p)=>({...p,type:v as any}))}>
                  <SelectTrigger className="text-right"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org">منظمة</SelectItem>
                    <SelectItem value="member">فرد</SelectItem>
                    <SelectItem value="firm">شركة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>الحالة</Label>
                <Select value={partnerForm.status} onValueChange={(v)=>setPartnerForm((p)=>({...p,status:v as any}))}>
                  <SelectTrigger className="text-right"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>تاريخ الانضمام</Label>
                <Input type="date" value={partnerForm.join_date} onChange={(e)=>setPartnerForm((p)=>({...p,join_date:e.target.value}))}/>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setIsPartnerEditOpen(false)}>إلغاء</Button>
                <Button onClick={async()=>{
                  if(!partnerForm._id) return;
                  setPartnerLoading(true);
                  try{
                    await updatePartner({ _id: partnerForm._id, ...partnerForm } as any);
                    await loadOverview();
                    setIsPartnerEditOpen(false);
                    toast({title:"تم التحديث"});
                  }catch(e){
                    toast({title:"فشل تحديث الشريك",variant:"destructive"});
                  }finally{ setPartnerLoading(false);} 
                }}>حفظ</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Partner Delete Dialog */}
        <AlertDialog open={isPartnerDeleteOpen} onOpenChange={setIsPartnerDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف الشريك</AlertDialogTitle>
              <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={async()=>{
                const id = String(selectedPartnerOverview?._id || selectedPartnerOverview?.id || "");
                if(!id) return;
                setPartnerLoading(true);
                try{
                  await deletePartner(id);
                  await loadOverview();
                  toast({title:"تم حذف الشريك"});
                }catch(e){
                  toast({title:"فشل حذف الشريك",variant:"destructive"});
                }finally{ setPartnerLoading(false); setIsPartnerDeleteOpen(false);} 
              }} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
