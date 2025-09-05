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
  Building,
  ExternalLink,
  Activity,
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
import { SingleImageUpload } from "@/components/shared/single-image-upload";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PdfUpload } from "@/components/shared/pdf-upload";
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
import { uploadPdf, deleteFileById } from "@/lib/files";
import { getPartner, updatePartner, deletePartner, validatePartnerData, transformFormDataToAPI } from "@/lib/partners";
import { buildImageUrl } from "@/lib/config";
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
    file: null as File | null,
    currentFileMeta: null as null | { url?: string; name?: string; size?: number; id?: string },
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

  // File handlers for reports
  const handleReportPdfChange = async (file: File | null) => {
    if (file) {
      try {
        setReportLoading(true);
        const response = await uploadPdf(file);
        const fileId = response.data?.id || response.data?._id;
        setReportForm(prev => ({
          ...prev,
          file,
          fileId: fileId || "",
          currentFileMeta: null
        }));
        toast({ title: "تم رفع الملف بنجاح" });
      } catch (error) {
        toast({ title: "فشل في رفع الملف", variant: "destructive" });
      } finally {
        setReportLoading(false);
      }
    } else {
      setReportForm(prev => ({
        ...prev,
        file: null,
        fileId: "",
        currentFileMeta: null
      }));
    }
  };

  const handleRemoveReportFile = async () => {
    try {
      if (reportForm.currentFileMeta?.id) {
        await deleteFileById(reportForm.currentFileMeta.id);
      }
      setReportForm(prev => ({
        ...prev,
        file: null,
        fileId: "",
        currentFileMeta: null
      }));
      toast({ title: "تم حذف الملف" });
    } catch (error) {
      toast({ title: "فشل في حذف الملف", variant: "destructive" });
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
    logo: "",
    logoFileId: "",
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-green-100 text-green-800";
      case "مكتمل":
        return "bg-blue-100 text-blue-800";
      case "قيد التنفيذ":
        return "bg-yellow-100 text-yellow-800";
      case "متوقف":
        return "bg-red-100 text-red-800";
      case "مخطط":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrencyUSD = (value: string | number) => {
    const n =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(n)
      ? `${n.toLocaleString("en-US")} دولار`
      : `${value} دولار`;
  };

  const formatDate = (value: string | Date | undefined) => {
    if (!value) return "";
    try {
      const d = typeof value === "string" ? new Date(value) : value;
      if (Number.isNaN(d.getTime())) return String(value);
      return new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return String(value);
    }
  };


  // دالة لحساب حجم الصورة
  const getImageSize = (imageUrl: string): string => {
    if (!imageUrl) return "";

    // إذا كان URL يحتوي على معرف الملف، استخدم حجم مضغوط
    if (imageUrl.includes("/uploads/")) {
      return "500 KB"; // حجم مضغوط للصور المرفوعة
    }

    // إذا كان URL خارجي، استخدم حجم افتراضي
    if (imageUrl.startsWith("http")) {
      return "1.8 MB"; // حجم افتراضي للصور الخارجية
    }

    return "1.5 MB"; // حجم افتراضي
  };

  // Convert overview form data to partners page format
  const convertOverviewToPartnersFormat = (overviewData: any) => {
    return {
      nameAr: overviewData.name_ar || "",
      nameEn: overviewData.name_en || "",
      email: overviewData.email || "",
      type: overviewData.type || "org",
      website: overviewData.website || "",
      status: overviewData.status || "active",
      joinDate: overviewData.join_date || "",
      logo: overviewData.logo || "",
      logoFileId: overviewData.logoFileId || "",
    };
  };

  // Handle update partner
  const handleUpdatePartner = async () => {
    if (!partnerForm._id) return;

    // Convert data to the format expected by validatePartnerData
    const convertedData = convertOverviewToPartnersFormat(partnerForm);

    // التحقق من صحة البيانات
    const validation = validatePartnerData(convertedData);
    if (!validation.isValid) {
      toast({
        title: "خطأ في البيانات",
        description: validation.errors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setPartnerLoading(true);
    try {
      // تحويل البيانات إلى تنسيق API
      const apiData = transformFormDataToAPI(convertedData);

      // استدعاء API لتحديث الشريك
      const response = await updatePartner({
        _id: partnerForm._id,
        ...apiData,
      });

      if (response.status === "sucsess") {
        setIsPartnerEditOpen(false);

        // تحديث قائمة الشركاء لرؤية التحديثات
        await loadOverview();

        toast({
          title: "تم بنجاح",
          description: response.message || "تم تحديث بيانات الشريك بنجاح",
        });
      } else {
        throw new Error(response.message || "فشل في تحديث الشريك");
      }
    } catch (error: any) {
      console.error("Error updating partner:", error);

      // معالجة أخطاء API
      let errorMessage = "حدث خطأ أثناء تحديث بيانات الشريك";
      if (error.response?.data?.details) {
        // التحقق من نوع details
        if (typeof error.response.data.details === 'object' && error.response.data.details.msg) {
          // إذا كان details كائن يحتوي على msg
          errorMessage = error.response.data.details.msg;
        } else if (Array.isArray(error.response.data.details)) {
          // إذا كان details مصفوفة
          const firstError = error.response.data.details[0];
          if (firstError && firstError.msg) {
            errorMessage = firstError.msg;
          } else {
            errorMessage = error.response.data.details.join("، ");
          }
        } else {
          errorMessage = String(error.response.data.details);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPartnerLoading(false);
    }
  };

  // Load overview from API
  const loadOverview = useCallback(async () => {
    try {
      setIsLoadingOverview(true);
      const res = await getDashboardOverview();
      const { general, recent } = res.data || ({} as any);
      if (general) setGeneralStats(general);

      // Convert status from English to Arabic
      const getStatusInArabic = (status: string) => {
        switch (status) {
          case "active": return "نشط";
          case "completed": return "مكتمل";
          case "in_progress": return "قيد التنفيذ";
          case "paused": return "متوقف";
          case "scheduled": return "مخطط";
          default: return status;
        }
      };

      // Map recent projects
      const mappedProjects: Project[] = Array.isArray(recent?.projects)
        ? recent.projects.map((p: any) => ({
            id: p.id,
            title: p.name || "",
            description: p.description || "",
            progress: 0,
            beneficiaries: String(p.numberOfBeneficiary || 0),
            status: getStatusInArabic(p.status || "active"),
            budget: String(p.budget || 0),
            startDate: p.startDate || "",
            endDate: p.endDate || "",
            category: p.category?.name || "",
            manager: p.manager || "",
            location: p.location || "",
            details: p.content || "",
            mainImage: p.coverImage?.url ? toBackendUrl(p.coverImage.url) : undefined,
            gallery: Array.isArray(p.gallery) ? p.gallery.map((g: any) => ({
              url: toBackendUrl(g.url || ""),
              title: g.title || "",
              fileId: String(g?.id || g?._id || ""),
            })) : [],
            objectives: p.goals || [],
            activities: p.activities || [],
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
      const apiData = (res as any).data;
      
      // Convert status from English to Arabic
      const getStatusInArabic = (status: string) => {
        switch (status) {
          case "active": return "نشط";
          case "completed": return "مكتمل";
          case "in_progress": return "قيد التنفيذ";
          case "paused": return "متوقف";
          case "scheduled": return "مخطط";
          default: return status;
        }
      };
      
      const detailed = {
        ...project,
        title: apiData?.name || project.title,
        description: apiData?.description || project.description,
        manager: apiData?.manager || project.manager,
        location: apiData?.location || project.location,
        budget: String(apiData?.budget || project.budget),
        beneficiaries: String(apiData?.numberOfBeneficiary || project.beneficiaries),
        status: getStatusInArabic(apiData?.status || project.status),
        category: apiData?.category?.name || project.category,
        startDate: apiData?.startDate || project.startDate,
        endDate: apiData?.endDate || project.endDate,
        details: apiData?.content || project.details,
        mainImage: apiData?.coverImage ? toBackendUrl(apiData.coverImage.url || apiData.coverImage) : project.mainImage,
        gallery: Array.isArray(apiData?.gallery) ? apiData.gallery.map((g: any) => ({
          url: toBackendUrl(g.url || ""),
          title: g.title || "",
          fileId: String(g?.id || g?._id || ""),
        })) : project.gallery || [],
        objectives: apiData?.goals || project.objectives || [],
        activities: apiData?.activities || project.activities || [],
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
      icon: Heart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "المشاريع النشطة",
      value: generalStats.totalActiveProjects.toString(),
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "المشاريع المكتملة",
      value: generalStats.totalInactiveProjects.toString(),
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "إجمالي المستفيدين",
      value: generalStats.totalBeneficiaries.toLocaleString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "التقارير الشهرية",
      value: generalStats.totalReports.toString(),
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "الشركاء النشطون",
      value: generalStats.totalActivePartners.toString(),
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
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
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${stat.bgColor} ${stat.color} flex-shrink-0`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">إجراءات سريعة</CardTitle>
              <CardDescription className="text-muted-foreground">الإجراءات الأكثر استخداماً</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleQuickAction("add-project")}
                  className="h-20 flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                  <span>إضافة مشروع</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-report")}
                  variant="outline"
                  className="h-20 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="text-primary font-medium">إضافة تقرير</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-partner")}
                  variant="outline"
                  className="h-20 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <UserPlus className="w-6 h-6 text-primary" />
                  <span className="text-primary font-medium">إضافة شريك</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction("add-user")}
                  variant="outline"
                  className="h-20 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-primary font-medium">إضافة مستخدم</span>
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
                          {project.budget}   دولار 
                        </span>
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                          {report.author} • {formatDate(report.date)}
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
                                  file: null,
                                  currentFileMeta: d?.file ? {
                                    url: d.file.url,
                                    name: d.file.name || d.file.fileName,
                                    size: d.file.size,
                                    id: d.file.id || d.file._id
                                  } : null,
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
                            {partner.nameEn || "غير محدد"} • {partner.projects} مشاريع
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
                                    logo: buildImageUrl(d.logo?.url || "") || "",
                                    logoFileId: d.logo?._id || "",
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
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
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
                {!isViewLoading && (
                  <>
                    <Badge
                      className={getStatusColor(selectedProject?.status || "")}
                    >
                      {selectedProject?.status}
                    </Badge>
                    <Badge variant="outline">{selectedProject?.category}</Badge>
                  </>
                )}
              </div>
            </DialogHeader>
            {isViewLoading && (
              <div className="py-10 flex flex-col items-center justify-center text-gray-600 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <div>جاري تحميل التفاصيل...</div>
              </div>
            )}
            {selectedProject && !isViewLoading && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        معلومات أساسية
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">المدير:</span>
                          <span className="font-medium">
                            {selectedProject.manager}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الموقع:</span>
                          <span className="font-medium">
                            {selectedProject.location}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الميزانية:</span>
                          <span className="font-medium">
                            {formatCurrencyUSD(selectedProject.budget)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">المستفيدون:</span>
                          <span className="font-medium">
                            {selectedProject.beneficiaries}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ البداية:</span>
                          <span className="font-medium">
                            {formatDate(selectedProject.startDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ النهاية:</span>
                          <span className="font-medium">
                            {formatDate(selectedProject.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedProject.mainImage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          الصورة الرئيسية
                        </h4>
                        <img
                          src={selectedProject.mainImage || "/placeholder.svg"}
                          alt={selectedProject.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">الوصف</h4>
                  <p className="text-gray-700">{selectedProject.description}</p>
                </div>

                {selectedProject.objectives && selectedProject.objectives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      الأهداف
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.objectives.map((objective, index) => (
                        <Badge key={index} variant="secondary">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.activities && selectedProject.activities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      الأنشطة الرئيسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.activities.map((activity, index) => (
                        <Badge key={index} variant="outline">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.details && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      تفاصيل المشروع
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedProject.details,
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      معرض الصور الإضافي
                    </h4>
                    <ImageGallery
                      images={selectedProject.gallery.map((img: any) => img.url)}
                      title={selectedProject.title}
                    />
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedProject.gallery.map((img: any, index: number) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-gray-600 mt-2">
                            {img.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report View Dialog */}
        <Dialog open={isReportViewOpen} onOpenChange={setIsReportViewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
              
              <div className="border-t pt-6">
                <PdfUpload
                  onFileChange={handleReportPdfChange}
                  currentFile={reportForm.file}
                  currentFileUrl={reportForm.currentFileMeta?.url}
                  currentFileName={reportForm.currentFileMeta?.name}
                  currentFileSize={reportForm.currentFileMeta?.size}
                  label="ملف التقرير (PDF)"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setIsReportEditOpen(false)} disabled={reportLoading}>إلغاء</Button>
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
                }} disabled={reportLoading}>
                  {reportLoading ? "جاري التحديث..." : "تحديث التقرير"}
                </Button>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="h-6 w-6 text-blue-600" />
                تفاصيل الشريك
              </DialogTitle>
            </DialogHeader>
            
            {partnerLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-gray-600">جاري جلب البيانات...</span>
                </div>
              </div>
            ) : selectedPartnerOverview ? (
              <div className="py-6 space-y-8">
                {/* Header Section - Logo and Basic Info */}
                <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                      {selectedPartnerOverview.logo?.url && selectedPartnerOverview.logo.url !== "" ? (
                        <img
                          src={
                            buildImageUrl(selectedPartnerOverview.logo.url) ||
                            "/placeholder.svg"
                          }
                          alt={selectedPartnerOverview.name_ar && selectedPartnerOverview.name_ar !== "" ? selectedPartnerOverview.name_ar : "صورة الشريك"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    {selectedPartnerOverview.logo?.url && selectedPartnerOverview.logo.url !== "" && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs text-gray-500 shadow-sm border">
                        {getImageSize(selectedPartnerOverview.logo.url)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedPartnerOverview.name_ar && selectedPartnerOverview.name_ar !== "" ? selectedPartnerOverview.name_ar : "غير محدد"}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {selectedPartnerOverview.name_en && selectedPartnerOverview.name_en !== "" ? selectedPartnerOverview.name_en : "غير محدد"}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Badge 
                        variant="outline" 
                        className="px-3 py-1 text-sm border-blue-200 text-blue-700 bg-blue-50"
                      >
                        {selectedPartnerOverview.type && selectedPartnerOverview.type !== "" ? (
                          selectedPartnerOverview.type === "org"
                            ? "مؤسسة"
                            : selectedPartnerOverview.type === "firm"
                            ? "شركة"
                            : selectedPartnerOverview.type === "member"
                            ? "فرد"
                            : selectedPartnerOverview.type
                        ) : "غير محدد"}
                      </Badge>
                      
                      <Badge className={`px-3 py-1 text-sm ${getStatusColor(selectedPartnerOverview.status)}`}>
                        {selectedPartnerOverview.status && selectedPartnerOverview.status !== "" ? (
                          selectedPartnerOverview.status === "active"
                            ? "نشط"
                            : "غير نشط"
                        ) : (
                          "غير محدد"
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    معلومات التواصل
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">
                          البريد الإلكتروني
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <p className="text-gray-800 font-medium">
                            {selectedPartnerOverview.email && selectedPartnerOverview.email !== "" ? selectedPartnerOverview.email : "غير محدد"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">
                          الموقع الإلكتروني
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          {selectedPartnerOverview.website && selectedPartnerOverview.website !== "" ? (
                            <a
                              href={
                                selectedPartnerOverview.website.startsWith("http")
                                  ? selectedPartnerOverview.website
                                  : `https://${selectedPartnerOverview.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                            >
                              {selectedPartnerOverview.website}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <p className="text-gray-500">غير محدد</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">
                          تاريخ الانضمام
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <p className="text-gray-800 font-medium">
                            {selectedPartnerOverview.join_date && selectedPartnerOverview.join_date !== "" ? formatDate(selectedPartnerOverview.join_date) : "غير محدد"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPartnerViewOpen(false)}
                className="px-6 py-2"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Partner Edit Dialog */}
        <Dialog
          open={isPartnerEditOpen}
          onOpenChange={(open) => (open ? null : setIsPartnerEditOpen(false))}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الشريك</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nameAr">اسم الشريك (عربي) *</Label>
                <Input
                  id="edit-nameAr"
                  value={partnerForm.name_ar}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({ ...prev, name_ar: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nameEn">اسم الشريك (إنجليزي)</Label>
                <Input
                  id="edit-nameEn"
                  value={partnerForm.name_en}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({ ...prev, name_en: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">الايميل *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={partnerForm.email}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">نوع الشريك *</Label>
                <Select
                  value={partnerForm.type}
                  onValueChange={(value) =>
                    setPartnerForm((prev) => ({ ...prev, type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org">مؤسسة</SelectItem>
                    <SelectItem value="firm">شركة</SelectItem>
                    <SelectItem value="member">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website">الموقع الإلكتروني</Label>
                <Input
                  id="edit-website"
                  value={partnerForm.website}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">الحالة *</Label>
                <Select
                  value={partnerForm.status}
                  onValueChange={(value) =>
                    setPartnerForm((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-joinDate">تاريخ الانضمام *</Label>
                <Input
                  id="edit-joinDate"
                  type="date"
                  value={partnerForm.join_date}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      join_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>لوجو الشريك</Label>
                <p className="text-xs text-gray-500 mb-2">
                  سيتم ضغط الصورة تلقائياً لتقليل حجمها مع الحفاظ على الجودة
                </p>
                <SingleImageUpload
                  currentImage={partnerForm.logo}
                  currentFileId={partnerForm.logoFileId}
                  onImageChange={(image) =>
                    setPartnerForm((prev) => ({ ...prev, logo: image || "" }))
                  }
                  onFileIdChange={(fileId) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      logoFileId: fileId || "",
                    }))
                  }
                  label="اضغط لاختيار صورة"
                  autoUpload={true}
                />
                {partnerForm.logo && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-500">
                      الصورة الحالية:
                    </Label>
                    <div className="mt-1 w-20 h-20 rounded-lg overflow-hidden border">
                      <img
                        src={partnerForm.logo}
                        alt="الصورة الحالية"
                        className="w-full h-full object-cover"
                      />
              </div>
                    <div className="mt-2 text-xs text-gray-500">
                      حجم الصورة: {getImageSize(partnerForm.logo)}
            </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPartnerEditOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdatePartner} disabled={partnerLoading}>
                {partnerLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
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
