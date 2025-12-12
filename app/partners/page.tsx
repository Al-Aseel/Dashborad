"use client";

import React from "react";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { SingleImageUpload } from "@/components/shared/single-image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Building,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  ExternalLink,
  Trash2,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  createPartner,
  updatePartner,
  deletePartner,
  getPartners,
  getPartner,
  validatePartnerData,
  transformFormDataToAPI,
  transformAPIToFormData,
  type Partner as PartnerType,
} from "@/lib/partners";
import { buildImageUrl } from "@/lib/config";

interface Partner {
  _id?: string;
  id?: number;
  nameAr: string;
  nameEn: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  website: string;
  joinDate: string;
  logo?: string;
  logoFileId?: string; // معرف ملف اللوجو
}

export default function PartnersPage() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    type: "org",
    status: "active",
    email: "",
    phone: "",
    website: "",
    joinDate: "",
    logo: "",
    logoFileId: "", // معرف ملف اللوجو
  });

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Loading state for partners
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Global stats from API (independent of filters/search)
  const [globalStats, setGlobalStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    inactivePartners: 0,
  });

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch =
        partner.nameAr
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        partner.nameEn
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || partner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [partners, debouncedSearchTerm, statusFilter]);

  // Stats - استخدام الإحصائيات الكاملة من API بدلاً من البيانات المفلترة
  const stats = useMemo(
    () => ({
      total: globalStats.totalPartners,
      active: globalStats.activePartners,
      inactive: globalStats.inactivePartners,
    }),
    [globalStats]
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      type: "org",
      status: "active",
      email: "",
      phone: "",
      website: "",
      joinDate: "",
      logo: "",
      logoFileId: "",
    });
  };

  // Load partners from API
  const loadPartners = async (page = currentPage, limit = pageSize) => {
    setIsLoadingPartners(true);
    try {
      const response = await getPartners({
        search: debouncedSearchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: page,
        limit: limit,
      });

      if (response.status === "sucsess") {
        // تحويل بيانات API إلى تنسيق النموذج
        const transformedPartners = (response.data as any).partners.map(
          (apiPartner: any) => ({
            _id: apiPartner._id,
            id: Date.now() + Math.random(), // توليد ID مؤقت
            nameAr: apiPartner.name_ar,
            nameEn: apiPartner.name_en || "",
            type: apiPartner.type,
            status: apiPartner.status, // الاحتفاظ بالقيمة الإنجليزية
            email: apiPartner.email,
            phone: "",
            website: apiPartner.website || "",
            joinDate: apiPartner.join_date,
            logo: apiPartner.logo?.url || "",
            logoFileId: apiPartner.logo?._id || "",
          })
        );

        setPartners(transformedPartners);

        // تحديث معلومات الـ pagination
        const pagination = (response.data as any).pagination;
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.total);
        setCurrentPage(pagination.page);

        // تحديث الإحصائيات الكاملة من API response
        const resAny = response as any;
        setGlobalStats({
          totalPartners: resAny.totalNumberOfPartners || 0,
          activePartners: resAny.numberOfActivePartners || 0,
          inactivePartners:
            (resAny.totalNumberOfPartners || 0) -
            (resAny.numberOfActivePartners || 0),
        });
      } else {
        throw new Error(response.message || "فشل في تحميل الشركاء");
      }
    } catch (error: any) {
      console.error("Error loading partners:", error);

      let errorMessage = "حدث خطأ أثناء تحميل الشركاء";
      if (error.response?.data?.message) {
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
      setIsLoadingPartners(false);
    }
  };

  // Load partners on mount and when filters change
  React.useEffect(() => {
    setCurrentPage(1); // إعادة تعيين الصفحة إلى 1 عند تغيير الفلاتر
    loadPartners(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Handle add partner
  const handleAddPartner = async () => {
    // التحقق من صحة البيانات
    const validation = validatePartnerData(formData);
    if (!validation.isValid) {
      toast({
        title: "خطأ في البيانات",
        description: validation.errors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // تحويل البيانات إلى تنسيق API
      const apiData = transformFormDataToAPI(formData);

      // استدعاء API لإنشاء الشريك
      const response = await createPartner(apiData);

      if (response.status === "sucsess") {
        closeAddDialog();

        // تحديث قائمة الشركاء لرؤية الشريك الجديد
        await loadPartners(currentPage);

        toast({
          title: "تم بنجاح",
          description: response.message || "تم إضافة الشريك بنجاح",
        });
      } else {
        throw new Error(response.message || "فشل في إنشاء الشريك");
      }
    } catch (error: any) {
      console.error("Error creating partner:", error);

      // معالجة أخطاء API
      let errorMessage = "حدث خطأ أثناء إضافة الشريك";
      if (error.response?.data?.details) {
        // التحقق من نوع details
        if (
          typeof error.response.data.details === "object" &&
          error.response.data.details.msg
        ) {
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
      setIsLoading(false);
    }
  };

  // Handle edit partner
  const openEditDialog = async (partner: Partner) => {
    if (!partner._id) {
      toast({
        title: "خطأ",
        description: "معرف الشريك غير متوفر",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // جلب بيانات الشريك من API
      const response = await getPartner(partner._id);

      if (response.status === "sucsess") {
        const partnerData = response.data;

        // تحديث البيانات في النموذج
        const formDataFromAPI = transformAPIToFormData({
          _id: partnerData._id,
          id: Date.now(),
          name_ar: partnerData.name_ar,
          name_en: partnerData.name_en || "",
          type: partnerData.type,
          status: partnerData.status,
          email: partnerData.email,
          phone: "",
          website: partnerData.website || "",
          join_date: partnerData.join_date,
          logo: partnerData.logo,
          logoFileId: partnerData.logo?._id || "",
        } as any);

        setFormData({
          ...formDataFromAPI,
          phone: "", // لا يوجد حقل phone في API
          logo: buildImageUrl(partnerData.logo?.url || "") || "",
        });

        setSelectedPartner({
          _id: partnerData._id,
          id: Date.now(),
          nameAr: partnerData.name_ar,
          nameEn: partnerData.name_en || "",
          type: partnerData.type,
          status: partnerData.status,
          email: partnerData.email,
          phone: "",
          website: partnerData.website || "",
          joinDate: formDataFromAPI.joinDate, // Use the formatted date
          logo: partnerData.logo?.url || "",
          logoFileId: partnerData.logo?._id || "",
        });

        setIsEditDialogOpen(true);
      } else {
        throw new Error(response.message || "فشل في جلب بيانات الشريك");
      }
    } catch (error: any) {
      console.error("Error fetching partner data:", error);

      let errorMessage = "حدث خطأ أثناء جلب بيانات الشريك";
      if (error.response?.data?.message) {
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
      setIsLoading(false);
    }
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;

    // التحقق من صحة البيانات
    const validation = validatePartnerData(formData);
    if (!validation.isValid) {
      toast({
        title: "خطأ في البيانات",
        description: validation.errors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // تحويل البيانات إلى تنسيق API
      const apiData = transformFormDataToAPI(formData);

      // استدعاء API لتحديث الشريك
      const response = await updatePartner({
        _id: selectedPartner._id || "",
        ...apiData,
      });

      if (response.status === "sucsess") {
        closeEditDialog();

        // تحديث قائمة الشركاء لرؤية التحديثات
        await loadPartners(currentPage);

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
        if (
          typeof error.response.data.details === "object" &&
          error.response.data.details.msg
        ) {
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
      setIsLoading(false);
    }
  };

  // Handle view partner
  const openViewDialog = async (partner: Partner) => {
    setIsLoadingDetails(true);
    try {
      // جلب البيانات المحدثة من API
      const response = await getPartner(partner._id || "");

      if (response.status === "sucsess") {
        // تحويل بيانات API إلى تنسيق النموذج
        const apiPartner = response.data;
        const transformedPartner = {
          _id: apiPartner._id,
          id: Date.now() + Math.random(), // توليد ID مؤقت
          nameAr: apiPartner.name_ar,
          nameEn: apiPartner.name_en || "",
          type: apiPartner.type,
          status: apiPartner.status,
          email: apiPartner.email,
          phone: (apiPartner as any).phone || "",
          website: apiPartner.website || "",
          joinDate: apiPartner.join_date,
          logo: apiPartner.logo?.url || "",
          logoFileId: apiPartner.logo?._id || "",
        };

        setSelectedPartner(transformedPartner);
        setIsViewDialogOpen(true);
      } else {
        throw new Error(response.message || "فشل في جلب بيانات الشريك");
      }
    } catch (error: any) {
      console.error("Error fetching partner details:", error);

      // معالجة أخطاء API
      let errorMessage = "حدث خطأ أثناء جلب بيانات الشريك";
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details.join("، ");
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
      setIsLoadingDetails(false);
    }
  };

  // Handle delete partner
  const openDeleteDialog = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPartner) return;

    setIsDeleting(true);
    try {
      // استدعاء API لحذف الشريك
      const response = await deletePartner(selectedPartner._id || "");

      if (response.status === "sucsess") {
        setIsDeleteDialogOpen(false);
        setSelectedPartner(null);

        // تحديث قائمة الشركاء لرؤية التغييرات
        await loadPartners(currentPage);

        toast({
          title: "تم بنجاح",
          description: response.message || "تم حذف الشريك بنجاح",
        });
      } else {
        throw new Error(response.message || "فشل في حذف الشريك");
      }
    } catch (error: any) {
      console.error("Error deleting partner:", error);

      // معالجة أخطاء API
      let errorMessage = "حدث خطأ أثناء حذف الشريك";
      if (error.response?.data?.details) {
        // التأكد من أن details مصفوفة قبل استخدام join
        if (Array.isArray(error.response.data.details)) {
          errorMessage = error.response.data.details.join("، ");
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
      setIsDeleting(false);
    }
  };

  // Handle visit website
  const handleVisitWebsite = (website: string) => {
    if (website) {
      window.open(
        website.startsWith("http") ? website : `https://${website}`,
        "_blank"
      );
      toast({
        title: "تم فتح الموقع",
        description: "تم فتح موقع الشريك في نافذة جديدة",
      });
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "org":
        return "bg-primary/10 text-primary";
      case "firm":
        return "bg-primary/10 text-primary";
      case "member":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // تنسيق التاريخ لعرضه بشكل مقروء (ميلادي)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
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

    return "1.5 MB"; // حجم افتراضي عام
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedPartner(null);
    resetForm();
  };

  const openAddDialog = () => {
    resetForm();
    setSelectedPartner(null);
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
    setSelectedPartner(null);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isLoadingPartners) return;
    setCurrentPage(page);
    loadPartners(page);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الشركاء</h1>
            <p className="text-gray-600 mt-2">
              إدارة الشركاء والمساهمين في أنشطة الجمعية
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="btn-primary hover:scale-105 transition-transform duration-200 ease-out"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة شريك جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الشركاء
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">شريك مسجل</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الشركاء النشطون
              </CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {stats.active}
                  </div>
                  <p className="text-xs text-muted-foreground">شريك نشط</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الشركاء غير النشطين
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {stats.inactive}
                  </div>
                  <p className="text-xs text-muted-foreground">شريك غير نشط</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الشركاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              عرض:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                setPageSize(newPageSize);
                setCurrentPage(1);
                loadPartners(1, newPageSize);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue>
                  {pageSize === 1000 ? "الكل" : pageSize}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="1000">الكل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => loadPartners(currentPage)}
            disabled={isLoadingPartners}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoadingPartners ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            تحديث
          </Button>
        </div>

        {/* Partners Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              قائمة الشركاء {!isLoadingPartners && `(${totalItems} شريك)`}
            </CardTitle>
            {!isLoadingPartners && totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                الصفحة {currentPage} من {totalPages}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الشريك</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">تاريخ الانضمام</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPartners ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لا توجد شركاء
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {debouncedSearchTerm || statusFilter !== "all"
                              ? "لا توجد نتائج تطابق معايير البحث المحددة"
                              : currentPage > 1
                              ? "لا توجد شركاء في هذه الصفحة"
                              : "لم يتم إضافة أي شركاء بعد"}
                          </p>
                          {debouncedSearchTerm || statusFilter !== "all" ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                              }}
                              className="flex items-center gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              مسح الفلاتر
                            </Button>
                          ) : (
                            <Button
                              onClick={openAddDialog}
                              className="btn-primary hover:scale-105 transition-transform duration-200 ease-out"
                            >
                              <Plus className="w-4 h-4 ml-2" />
                              إضافة أول شريك
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {partner.logo ? (
                              <img
                                src={
                                  buildImageUrl(partner.logo) ||
                                  "/placeholder.svg"
                                }
                                alt={partner.nameAr}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{partner.nameAr}</div>
                            <div className="text-sm text-gray-500">
                              {partner.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(partner.type)}>
                          {partner.type === "org"
                            ? "مؤسسة"
                            : partner.type === "firm"
                            ? "شركة"
                            : partner.type === "member"
                            ? "فرد"
                            : partner.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(partner.joinDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(partner.status)}>
                          {partner.status === "active" ? "نشط" : "غير نشط"}
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
                              onClick={() => openViewDialog(partner)}
                            >
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(partner)}
                            >
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleVisitWebsite(partner.website)
                              }
                            >
                              <ExternalLink className="ml-2 h-4 w-4" />
                              زيارة الموقع
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(partner)}
                              className="text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {!isLoadingPartners && totalPages > 1 && pageSize !== 1000 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
              <div className="text-sm text-muted-foreground">
                {pageSize === 1000
                  ? `عرض جميع الشركاء (${totalItems})`
                  : `عرض ${partners.length} من ${totalItems} شريك`}
              </div>
              <Pagination className="flex items-center">
                <PaginationContent className="gap-2">
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage <= 1 || isLoadingPartners
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(1)}
                          className="cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 min-w-[40px] justify-center"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis className="px-2" />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const page = currentPage - 1 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className={
                            isLoadingPartners
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 min-w-[40px] justify-center"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis className="px-2" />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 min-w-[40px] justify-center"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage >= totalPages || isLoadingPartners
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Show info when "All" is selected */}
          {!isLoadingPartners && pageSize === 1000 && (
            <div className="flex items-center justify-center px-6 py-4 border-t bg-gray-50/50">
              <div className="text-sm text-muted-foreground">
                عرض جميع الشركاء ({totalItems})
              </div>
            </div>
          )}
        </Card>

        {/* Add Partner Dialog */}
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => (open ? openAddDialog() : closeAddDialog())}
        >
          <DialogContent
            dir="rtl"
            className="max-w-2xl max-h-[90vh] overflow-y-auto text-right"
          >
            <DialogHeader>
              <DialogTitle>إضافة شريك</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الشريك (عربي) *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                  }
                  placeholder="أدخل اسم الشريك بالعربية"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم الشريك (إنجليزي)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                  placeholder="أدخل اسم الشريك بالإنجليزية"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">الايميل *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع الشريك *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الشريك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org">مؤسسة</SelectItem>
                    <SelectItem value="firm">شركة</SelectItem>
                    <SelectItem value="member">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">تاريخ الانضمام *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      joinDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>لوجو الشريك *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  سيتم ضغط الصورة تلقائياً لتقليل حجمها مع الحفاظ على الجودة
                </p>
                <SingleImageUpload
                  currentImage={formData.logo}
                  currentFileId={formData.logoFileId}
                  onImageChange={(image) =>
                    setFormData((prev) => ({ ...prev, logo: image || "" }))
                  }
                  onFileIdChange={(fileId) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoFileId: fileId || "",
                    }))
                  }
                  label="اضغط لاختيار صورة"
                  required
                  autoUpload={true}
                />
                {formData.logo && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-500">
                      الصورة المختارة:
                    </Label>
                    <div className="mt-1 w-20 h-20 rounded-lg overflow-hidden border">
                      <img
                        src={formData.logo}
                        alt="الصورة المختارة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      حجم الصورة: {getImageSize(formData.logo)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="sm:justify-start gap-3">
              <Button variant="outline" onClick={closeAddDialog}>
                إلغاء
              </Button>
              <Button
                onClick={handleAddPartner}
                disabled={isLoading}
                className="btn-primary hover:scale-105 transition-transform duration-200 ease-out"
              >
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Partner Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => (open ? null : closeEditDialog())}
        >
          <DialogContent
            dir="rtl"
            className="max-w-2xl max-h-[90vh] overflow-y-auto text-right"
          >
            <DialogHeader>
              <DialogTitle>تعديل بيانات الشريك</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Same form fields as add dialog */}
              <div className="space-y-2">
                <Label htmlFor="edit-nameAr">اسم الشريك (عربي) *</Label>
                <Input
                  id="edit-nameAr"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nameEn">اسم الشريك (إنجليزي)</Label>
                <Input
                  id="edit-nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">الايميل *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">نوع الشريك *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
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
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                />
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
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      joinDate: e.target.value,
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
                  currentImage={formData.logo}
                  currentFileId={formData.logoFileId}
                  onImageChange={(image) =>
                    setFormData((prev) => ({ ...prev, logo: image || "" }))
                  }
                  onFileIdChange={(fileId) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoFileId: fileId || "",
                    }))
                  }
                  label="اضغط لاختيار صورة"
                  autoUpload={true}
                />
                {formData.logo && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-500">
                      الصورة الحالية:
                    </Label>
                    <div className="mt-1 w-20 h-20 rounded-lg overflow-hidden border">
                      <img
                        src={formData.logo}
                        alt="الصورة الحالية"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      حجم الصورة: {getImageSize(formData.logo)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button variant="outline" onClick={closeEditDialog}>
                إلغاء
              </Button>
              <Button
                onClick={handleUpdatePartner}
                disabled={isLoading}
                className="btn-primary hover:scale-105 transition-transform duration-200 ease-out"
              >
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Partner Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            dir="rtl"
            className="max-w-3xl max-h-[90vh] overflow-y-auto text-right"
          >
            <DialogHeader className="border-b pb-4 ">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2 mt-4">
                <Building className="h-6 w-6 text-primary" />
                تفاصيل الشريك
              </DialogTitle>
            </DialogHeader>

            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-gray-600">جاري جلب البيانات...</span>
                </div>
              </div>
            ) : selectedPartner ? (
              <div className="py-6 space-y-8">
                {/* Header Section - Logo and Basic Info */}
                <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                      {selectedPartner.logo && selectedPartner.logo !== "" ? (
                        <img
                          src={
                            buildImageUrl(selectedPartner.logo) ||
                            "/placeholder.svg"
                          }
                          alt={
                            selectedPartner.nameAr &&
                            selectedPartner.nameAr !== ""
                              ? selectedPartner.nameAr
                              : "صورة الشريك"
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    {selectedPartner.logo && selectedPartner.logo !== "" && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs text-gray-500 shadow-sm border">
                        {getImageSize(selectedPartner.logo)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {selectedPartner.nameAr && selectedPartner.nameAr !== ""
                          ? selectedPartner.nameAr
                          : "غير محدد"}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {selectedPartner.nameEn && selectedPartner.nameEn !== ""
                          ? selectedPartner.nameEn
                          : "غير محدد"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5"
                      >
                        {selectedPartner.type && selectedPartner.type !== ""
                          ? selectedPartner.type === "org"
                            ? "مؤسسة"
                            : selectedPartner.type === "firm"
                            ? "شركة"
                            : selectedPartner.type === "member"
                            ? "فرد"
                            : selectedPartner.type
                          : "غير محدد"}
                      </Badge>

                      <Badge
                        className={`px-3 py-1 text-sm ${getStatusColor(
                          selectedPartner.status
                        )}`}
                      >
                        {selectedPartner.status && selectedPartner.status !== ""
                          ? selectedPartner.status === "active"
                            ? "نشط"
                            : "غير نشط"
                          : "غير محدد"}
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
                            {selectedPartner.email &&
                            selectedPartner.email !== ""
                              ? selectedPartner.email
                              : "غير محدد"}
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
                          {selectedPartner.website &&
                          selectedPartner.website !== "" ? (
                            <a
                              href={
                                selectedPartner.website.startsWith("http")
                                  ? selectedPartner.website
                                  : `https://${selectedPartner.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 hover:underline font-medium flex items-center gap-1"
                            >
                              {selectedPartner.website}
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
                            {selectedPartner.joinDate &&
                            selectedPartner.joinDate !== ""
                              ? formatDate(selectedPartner.joinDate)
                              : "غير محدد"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="border-t pt-4 sm:justify-start">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="px-6 py-2"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent dir="rtl" className="max-w-md text-right">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف هذا العنصر؟ سيتم نقله إلى الأرشيف ويمكن
                استرجاعه لاحقاً.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
