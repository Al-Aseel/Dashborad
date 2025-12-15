"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ProjectStats } from "@/components/projects/project-stats";
import { ProjectForm } from "@/components/projects/project-form";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Pencil,
  Target,
  Activity,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ProgramsApi } from "@/lib/programs";
import { useAuth } from "@/hooks/use-auth";
import { Permissions } from "@/lib/auth";
import { toBackendUrl } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { API_BASE_URL } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  budget: string;
  beneficiaries: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  manager: string;
  objectives: string[];
  activities: string[];
  details: string;
  mainImage?: string;
  gallery: Array<{ url: string; title: string; fileId?: string }>;
  coverFileId?: string;
  fileId?: string; // File ID for optional file attachment
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { byModule, refreshCategories } = useCategories();
  const projectCategories = byModule("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [apiStats, setApiStats] = useState({
    totalNumberOfPrograms: 0,
    numberOfActivePrograms: 0,
    totalBudget: 0,
    totalNumberOfBeneficiaries: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProjectInitial, setEditingProjectInitial] = useState<
    any | null
  >(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        await refreshCategories("projects");
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    loadCategories();
  }, [refreshCategories]);

  const handleRefresh = useCallback(() => {
    const load = async () => {
      try {
        setIsFetching(true);
        setIsCategoriesLoading(true);
        // Refresh both projects and categories
        await Promise.all([
          refreshCategories("projects"),
          (async () => {
            const res = await ProgramsApi.getPrograms({
              page,
              limit,
              search: debouncedSearchTerm,
            });
            const items = (res.data?.programs || []) as any[];
            const mapped: Project[] = items.map((p: any) =>
              mapProgramToProject(p)
            );
            setProjects(mapped);
            setTotal(res.data?.pagination?.total || 0);
            // Capture API statistics
            setApiStats({
              totalNumberOfPrograms: (res as any).totalNumberOfPrograms || 0,
              numberOfActivePrograms: (res as any).numberOfActivePrograms || 0,
              totalBudget: (res as any).totalBudget || 0,
              totalNumberOfBeneficiaries:
                (res as any).totalNumberOfBeneficiaries || 0,
            });
          })(),
        ]);
      } catch (error) {
        // Fail softly
      } finally {
        setIsFetching(false);
        setIsCategoriesLoading(false);
      }
    };
    load();
  }, [page, limit, debouncedSearchTerm, refreshCategories]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "الكل" || project.status === statusFilter;
      const matchesCategory =
        categoryFilter === "الكل" || project.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, debouncedSearchTerm, statusFilter, categoryFilter]);

  const { toast } = useToast();

  // Download file function - uses program ID, not file ID
  const handleDownloadFile = async (programId: string) => {
    try {
      // إذا كان البرنامج من السيرفر، اجلب تفاصيله للحصول على رابط الملف واسم الملف
      const full: any = await ProgramsApi.getProgramById(programId);
      const fileObj = (full?.data?.data?.file ??
        full?.data?.file) as any;
      let fileUrl: string | undefined;

      if (typeof fileObj === "object" && fileObj?.url) {
        fileUrl = fileObj.url;
      } else if (typeof fileObj === "string") {
        fileUrl = `/upload/file/${fileObj}`;
      }

      if (fileUrl) {
        const viewUrl = toBackendUrl(fileUrl);
        window.open(viewUrl, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("لا يوجد رابط ملف لهذا البرنامج");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحميل الملف",
        variant: "destructive",
      });
    }
  };

  // Formatting helpers
  const formatNumber = (value: string | number) => {
    const n =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n.toLocaleString("ar-EG") : String(value);
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

  const toDateInputValue = (value: string): string => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const mapProgramToProject = (p: any): Project => ({
    id: String(p._id || p.id || Date.now()),
    title: p.name,
    description: p.description,
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
    progress: 0,
    budget: String(p.budget ?? ""),
    beneficiaries: String(p.numberOfBeneficiary ?? ""),
    location: p.location ?? "",
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
    category: p.category?.name || "",
    manager: p.manager ?? "",
    objectives: p.goals || [],
    activities: p.activities || [],
    details: p.content || "",
    mainImage: p.coverImage
      ? toBackendUrl(p.coverImage.url || p.coverImage)
      : undefined,
    gallery: Array.isArray(p.gallery)
      ? p.gallery.map((g: any) => ({
          url: toBackendUrl(g.url || ""),
          title: g.title || "",
          fileId: String(g?.id || g?._id || g?.fileName || ""),
        }))
      : [],
    coverFileId:
      String(
        p?.coverImage?.id || p?.coverImage?._id || p?.coverImage?.fileName || ""
      ) || undefined,
    fileId: p?.file
      ? String(p.file?.id || p.file?._id || p.file?.fileName || p.file || "")
      : undefined,
  });

  // Load programs from API
  useEffect(() => {
    const load = async () => {
      try {
        setIsFetching(true);
        const res = await ProgramsApi.getPrograms({
          page,
          limit,
          search: debouncedSearchTerm,
        });
        const items = (res.data?.programs || []) as any[];
        const mapped: Project[] = items.map((p: any) => mapProgramToProject(p));
        setProjects(mapped);
        setTotal(res.data?.pagination?.total || 0);
        // Capture API statistics
        setApiStats({
          totalNumberOfPrograms: (res as any).totalNumberOfPrograms || 0,
          numberOfActivePrograms: (res as any).numberOfActivePrograms || 0,
          totalBudget: (res as any).totalBudget || 0,
          totalNumberOfBeneficiaries:
            (res as any).totalNumberOfBeneficiaries || 0,
        });
      } catch (error) {
        // Fail softly
      } finally {
        setIsFetching(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearchTerm]);

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

  const handleAddProject = async (projectData: any) => {
    setIsLoading(true);
    try {
      // Map status Arabic to API status values
      const statusMap: Record<string, string> = {
        نشط: "active",
        مكتمل: "completed",
        "قيد التنفيذ": "active",
        متوقف: "stopped",
        مخطط: "scheduled",
      };

      if (!projectData.coverFileId) {
        toast({ title: "صورة الغلاف مطلوبة", variant: "destructive" });
        return;
      }
      if (!projectData.category) {
        toast({ title: "اختر فئة صحيحة", variant: "destructive" });
        return;
      }
      const payload = {
        name: projectData.name,
        description: projectData.description,
        category: projectData.category, // should be categoryId now
        status: statusMap[projectData.status] || "active",
        location: projectData.location,
        budget: Number(String(projectData.budget).replace(/[^\d.]/g, "")) || 0,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        manager: projectData.manager,
        numberOfBeneficiary:
          Number(String(projectData.beneficiaries).replace(/[^\d]/g, "")) || 0,
        content: projectData.details || "",
        goals: projectData.objectives || [],
        activities: projectData.activities || [],
        coverImage: undefined as string | undefined,
        gallery: undefined as
          | Array<{ fileId: string; title?: string }>
          | undefined,
        file: projectData.fileId || undefined,
      };

      // coverImage is required by API: ensure we pass the uploaded cover fileId
      if ((projectData as any).coverFileId) {
        payload.coverImage = (projectData as any).coverFileId;
      }

      // gallery: map items with fileId
      if (Array.isArray(projectData.gallery)) {
        const galleryItems = projectData.gallery
          .map((g: any) => {
            const fileId = g?.fileId || g?.title; // title might store id when editing old data
            if (!fileId) return null;
            return {
              fileId: String(fileId),
              title: g?.title && g.fileId ? g.title : undefined,
            };
          })
          .filter(Boolean) as Array<{ fileId: string; title?: string }>;
        if (galleryItems.length) payload.gallery = galleryItems;
      }

      const res = await ProgramsApi.createProgram(payload as any);

      // Refresh the entire projects list to get latest data from server
      const refreshRes = await ProgramsApi.getPrograms({
        page,
        limit,
        search: debouncedSearchTerm,
      });
      const items = (refreshRes.data?.programs || []) as any[];
      const mapped: Project[] = items.map((p: any) => mapProgramToProject(p));
      setProjects(mapped);
      setTotal(refreshRes.data?.pagination?.total || 0);

      // Update statistics after adding project
      setApiStats({
        totalNumberOfPrograms: (refreshRes as any).totalNumberOfPrograms || 0,
        numberOfActivePrograms: (refreshRes as any).numberOfActivePrograms || 0,
        totalBudget: (refreshRes as any).totalBudget || 0,
        totalNumberOfBeneficiaries:
          (refreshRes as any).totalNumberOfBeneficiaries || 0,
      });

      setIsAddDialogOpen(false);

      toast({ title: res.message || "تم إضافة المشروع بنجاح" });
    } catch (error: any) {
      const data = error?.response?.data;
      const detailsJoined = Array.isArray(data?.details)
        ? data.details
            .map((d: any) => d?.msg)
            .filter(Boolean)
            .join(" | ")
        : undefined;
      toast({
        title: "خطأ في إضافة المشروع",
        description:
          detailsJoined ||
          data?.message ||
          "حدث خطأ أثناء إضافة المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      // Rethrow so the form can map field errors
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await ProgramsApi.deleteProgram(id);

      const projectToDelete = projects.find((p) => p.id === id);
      setProjects(projects.filter((project) => project.id !== id));

      // Update statistics after deleting project
      const updatedProjects = projects.filter((project) => project.id !== id);
      const activeProjects = updatedProjects.filter(
        (p) => p.status === "نشط"
      ).length;
      const calculatedBudget = updatedProjects.reduce((sum, p) => {
        const budget = Number.parseFloat(p.budget.replace(/[^\d.]/g, "")) || 0;
        return sum + budget;
      }, 0);
      const calculatedBeneficiaries = updatedProjects.reduce((sum, p) => {
        const beneficiaries =
          Number.parseInt(p.beneficiaries.replace(/[^\d]/g, "")) || 0;
        return sum + beneficiaries;
      }, 0);

      setApiStats({
        totalNumberOfPrograms: updatedProjects.length,
        numberOfActivePrograms: activeProjects,
        totalBudget: calculatedBudget,
        totalNumberOfBeneficiaries: calculatedBeneficiaries,
      });

      toast({
        title: res?.message || "تم حذف البرنامج بنجاح",
        description: `تم حذف مشروع "${projectToDelete?.title}" بنجاح`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف المشروع",
        description: "حدث خطأ أثناء حذف المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openViewDialog = async (project: Project) => {
    setIsViewDialogOpen(true);
    setIsViewLoading(true);
    try {
      const res = await ProgramsApi.getProgramById(project.id);
      const detailed = mapProgramToProject((res as any).data);
      setSelectedProject(detailed);
    } catch {
      // fallback to selected basic
      setSelectedProject(project);
    } finally {
      setIsViewLoading(false);
    }
  };

  const openEditDialog = async (project: Project) => {
    setIsEditDialogOpen(true);
    setIsViewLoading(true);
    try {
      const res = await ProgramsApi.getProgramById(project.id);
      const p: any = (res as any).data;
      const initial = {
        name: p.name || "",
        description: p.description || "",
        location: p.location || "",
        category: String(p?.category?.id || p?.category?._id || ""),
        topic: "",
        budget: String(p.budget ?? ""),
        beneficiaries: String(p.numberOfBeneficiary ?? ""),
        manager: p.manager || "",
        startDate: p.startDate || "",
        endDate: p.endDate || "",
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
              fileId: String(g?.id || g?._id || g?.fileName || ""),
            }))
          : [],
        objectives: p.goals || [],
        activities: p.activities || [],
        coverFileId:
          String(
            p?.coverImage?.id ||
              p?.coverImage?._id ||
              p?.coverImage?.fileName ||
              ""
          ) || undefined,
        fileId: p?.file
          ? String(p.file?.id || p.file?._id || p.file?.fileName || p.file || "")
          : undefined,
        fileName: p?.file?.originalName || p?.file?.fileName || undefined,
        _id: String(p._id || p.id || project.id),
      };
      setEditingProjectInitial(initial);
    } catch {
      // fallback from table data
      setEditingProjectInitial({
        name: project.title,
        description: project.description,
        location: project.location,
        category: "",
        topic: "",
        budget: String(project.budget),
        beneficiaries: String(project.beneficiaries),
        manager: project.manager,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        details: project.details,
        mainImage: project.mainImage || null,
        gallery: project.gallery || [],
        objectives: project.objectives || [],
        activities: project.activities || [],
        coverFileId: project.coverFileId,
        fileId: project.fileId,
        _id: project.id,
      });
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleUpdateProject = async (formValues: any) => {
    if (!editingProjectInitial?._id) return;
    setIsEditLoading(true);
    try {
      const statusMap: Record<string, string> = {
        نشط: "active",
        مكتمل: "completed",
        "قيد التنفيذ": "active",
        متوقف: "stopped",
        مخطط: "scheduled",
      };

      const payload = {
        name: formValues.name,
        description: formValues.description,
        category: formValues.category,
        status: statusMap[formValues.status] || "active",
        location: formValues.location,
        budget: Number(String(formValues.budget).replace(/[^\d.]/g, "")) || 0,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        manager: formValues.manager,
        numberOfBeneficiary:
          Number(String(formValues.beneficiaries).replace(/[^\d]/g, "")) || 0,
        content: formValues.details || "",
        goals: formValues.objectives || [],
        activities: formValues.activities || [],
        coverImage: undefined as string | undefined,
        gallery: undefined as
          | Array<{ fileId: string; title?: string }>
          | undefined,
        file: formValues.fileId || undefined,
      };

      if (formValues.coverFileId) {
        (payload as any).coverImage = formValues.coverFileId;
      }
      if (Array.isArray(formValues.gallery)) {
        const galleryItems = formValues.gallery
          .map((g: any) => {
            const fileId = g?.fileId || g?.title;
            if (!fileId) return null;
            return {
              fileId: String(fileId),
              title: g?.title && g.fileId ? g.title : undefined,
            };
          })
          .filter(Boolean) as Array<{ fileId: string; title?: string }>;
        if (galleryItems.length) (payload as any).gallery = galleryItems;
      }

      const res = await ProgramsApi.updateProgram(
        editingProjectInitial._id,
        payload as any
      );

      // Refresh list
      const refreshRes = await ProgramsApi.getPrograms({
        page,
        limit,
        search: debouncedSearchTerm,
      });
      const items = (refreshRes.data?.programs || []) as any[];
      const mapped: Project[] = items.map((p: any) => mapProgramToProject(p));
      setProjects(mapped);
      setTotal(refreshRes.data?.pagination?.total || 0);

      // Update statistics after updating project
      setApiStats({
        totalNumberOfPrograms: (refreshRes as any).totalNumberOfPrograms || 0,
        numberOfActivePrograms: (refreshRes as any).numberOfActivePrograms || 0,
        totalBudget: (refreshRes as any).totalBudget || 0,
        totalNumberOfBeneficiaries:
          (refreshRes as any).totalNumberOfBeneficiaries || 0,
      });

      setIsEditDialogOpen(false);
      setEditingProjectInitial(null);
      toast({ title: res?.message || "تم تحديث المشروع بنجاح" });
    } catch (error: any) {
      const data = error?.response?.data;
      const detailsJoined = Array.isArray(data?.details)
        ? data.details
            .map((d: any) => d?.msg)
            .filter(Boolean)
            .join(" | ")
        : undefined;
      toast({
        title: "خطأ في تحديث المشروع",
        description:
          detailsJoined ||
          data?.message ||
          "حدث خطأ أثناء تحديث المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsEditLoading(false);
    }
  };

  const categories = projectCategories.map((cat) => cat.name);
  const statuses = ["نشط", "قيد التنفيذ", "مكتمل", "متوقف", "مؤجل", "مخطط"];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-100">
            <h1 className="text-3xl font-bold text-gray-900">إدارة المشاريع</h1>
            <p className="text-gray-600 mt-2">
              إدارة ومتابعة جميع مشاريع الجمعية
            </p>
          </div>
          <div className="flex gap-2 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-200">
            <Button
              className="btn-primary"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={
                isLoading ||
                (user?.role ? !Permissions.canCreate(user.role as any) : true)
              }
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 ml-2" />
              )}
              مشروع جديد
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>
          </div>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
          <ProjectStats
            projects={projects as any}
            totalNumberOfPrograms={apiStats.totalNumberOfPrograms}
            numberOfActivePrograms={apiStats.numberOfActivePrograms}
            totalBudget={apiStats.totalBudget}
            totalNumberOfBeneficiaries={apiStats.totalNumberOfBeneficiaries}
          />
        </div>

        {/* Filters and Search */}
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المشاريع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الحالات</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue
                      placeholder={
                        isCategoriesLoading ? "جاري التحميل..." : "اختر الفئة"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الفئات</SelectItem>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري تحميل الفئات...
                        </div>
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        لا توجد فئات
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
          <CardHeader>
            <CardTitle>قائمة المشاريع</CardTitle>
            <CardDescription>
              جميع المشاريع مع المعلومات الأساسية والإجراءات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex items-center justify-center py-10 text-gray-600">
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري تحميل البيانات...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-16 text-center text-gray-500 border rounded-md">
                لا توجد بيانات لعرضها.
              </div>
            ) : (
              <Table className="table-fixed">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[20%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">اسم المشروع</TableHead>
                    <TableHead className="text-right">المدير</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الميزانية</TableHead>
                    <TableHead className="text-right">المستفيدون</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project, index) => (
                    <TableRow key={project.id}>
                      <TableCell className="text-right">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm text-gray-500">
                            {project.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right truncate">
                        {project.manager}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right truncate">
                        {project.location}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyUSD(project.budget)}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(project.beneficiaries).toLocaleString("en-US")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-start md:justify-end">
                          {project.fileId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(project.id)}
                              title="تحميل الملف"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewDialog(project)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(project)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                disabled={deletingId === project.id}
                              >
                                {deletingId === project.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف مشروع "{project.title}"؟
                                  لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingId === project.id}
                                >
                                  {deletingId === project.id ? (
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isFetching && filteredProjects.length > 0 && (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-600">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    عرض {(page - 1) * limit + 1} إلى{" "}
                    {Math.min(page * limit, total)} من {total} مشروع
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">عرض:</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, Math.ceil(total / limit)) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ProjectForm
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddProject}
          title="إضافة مشروع جديد"
          isLoading={isLoading}
        />

        <ProjectForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleUpdateProject}
          initialData={editingProjectInitial || undefined}
          title="تعديل مشروع"
          isLoading={isEditLoading}
        />

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

                {selectedProject.objectives.length > 0 && (
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

                {selectedProject.activities.length > 0 && (
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

                {selectedProject.gallery.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      معرض الصور الإضافي
                    </h4>
                    <ImageGallery
                      images={selectedProject.gallery.map((img) => img.url)}
                      title={selectedProject.title}
                    />
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedProject.gallery.map((img, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-gray-600 mt-2">
                            {img.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.fileId && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleDownloadFile(selectedProject.id)}
                      className="btn-primary"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الملف المرفق
                    </Button>
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
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
