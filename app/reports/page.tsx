"use client";

import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PdfUpload } from "@/components/shared/pdf-upload";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  RefreshCcw,
  Loader2,
  FileText,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadPdf, extractUploadedFileId, deleteFileById } from "@/lib/files";
import {
  createReport,
  listReports,
  getReportById,
  updateReport,
  deleteReport,
} from "@/lib/reports";
import { toBackendUrl } from "@/lib/utils";

interface Report {
  id: number | string;
  title: string;
  type: string;
  author: string;
  date: string;
  status: string;
  downloads: number;
  size: string;
  file?: File;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    author: "",
    date: "",
    status: "",
    file: null as File | null,
    fileId: null as string | null,
    currentFileMeta: null as null | {
      url?: string;
      name?: string;
      size?: number;
      id?: string;
    },
  });

  const reportTypes = [
    "تقرير إعلامي",
    "تقرير مالي",
    "تقرير إداري",
    "تقرير مشاريع",
    "تقرير إحصائي",
  ];
  const mapTypeToBackend = (
    label: string
  ): "media" | "financial" | "management" | "project" | "statistic" => {
    switch (label) {
      case "تقرير إعلامي":
        return "media";
      case "تقرير مالي":
        return "financial";
      case "تقرير إداري":
        return "management";
      case "تقرير مشاريع":
        return "project";
      case "تقرير إحصائي":
        return "statistic";
      default:
        return "media";
    }
  };

  const mapTypeToArabic = (value: string) => {
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

  const reportStatuses = ["مسودة", "منشور", "مؤرشف"];
  const reportStatusesForm = ["مسودة", "منشور"];
  const mapStatusToBackend = (label: string): "draft" | "published" => {
    switch (label) {
      case "مسودة":
        return "draft";
      case "منشور":
        return "published";
      default:
        return "draft";
    }
  };

  const mapStatusToArabic = (value: string) => {
    switch (value) {
      case "published":
        return "منشور";
      case "draft":
        return "مسودة";
      default:
        return value;
    }
  };

  const [totals, setTotals] = useState({
    totalNumberOfReports: 0,
    numberOfMediaReports: 0,
    numberOfFinancialReports: 0,
    numberOfManagementReports: 0,
    numberOfProjectReports: 0,
    numberOfStatisticReports: 0,
  });

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: 1,
        limit: 10,
      };
      if (statusFilter !== "all")
        params.status = mapStatusToBackend(statusFilter);
      if (typeFilter !== "all") params.type = mapTypeToBackend(typeFilter);
      if (searchTerm) params.search = searchTerm;

      const res = await listReports(params);
      const items = res.data.reports || [];
      const mapped: Report[] = items.map((r) => {
        // Extract file size from file object if available
        let fileSize = "";
        if (r.file && typeof r.file === "object" && r.file.size) {
          fileSize = `${(r.file.size / (1024 * 1024)).toFixed(1)} MB`;
        }

        return {
          id: r._id || Math.random(),
          title: r.title,
          type: mapTypeToArabic(r.type),
          author: r.author,
          date: r.createdAt?.slice(0, 10) || "",
          status: mapStatusToArabic(r.status),
          downloads: 0,
          size: fileSize,
        };
      });
      setReports(mapped);
      setTotals({
        totalNumberOfReports: res.totalNumberOfReports || 0,
        numberOfMediaReports: res.numberOfMediaReports || 0,
        numberOfFinancialReports: res.numberOfFinancialReports || 0,
        numberOfManagementReports: res.numberOfManagementReports || 0,
        numberOfProjectReports: res.numberOfProjectReports || 0,
        numberOfStatisticReports: res.numberOfStatisticReports || 0,
      });
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e?.response?.data?.message || "فشل جلب التقارير",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchTerm]);

  // Trigger a simple fade-and-rise animation on initial mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      author: "",
      date: "",
      status: "",
      file: null,
      fileId: null,
      currentFileMeta: null,
    });
  };

  const handleViewReport = async (report: Report) => {
    try {
      // Try fetching full details (including file URL) if we have a backend id
      if (typeof report.id === "string") {
        const full = await getReportById(report.id);
        const r = full.data;
        // Extract file size from file object if available
        let fileSize = "";
        if (r.file && typeof r.file === "object" && r.file.size) {
          fileSize = `${(r.file.size / (1024 * 1024)).toFixed(1)} MB`;
        }

        const enhanced: Report = {
          id: r._id,
          title: r.title,
          type: mapTypeToArabic(r.type),
          author: r.author,
          date: r.createdAt?.slice(0, 10) || "",
          status: mapStatusToArabic(r.status),
          downloads: 0,
          size: fileSize,
        };
        setSelectedReport(enhanced);
      } else {
        setSelectedReport(report);
      }
    } catch {
      setSelectedReport(report);
    } finally {
      setIsViewDialogOpen(true);
    }
  };

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    setIsLoading(true);

    try {
      // إذا كان التقرير من السيرفر نحذف عبر API، وإلا نحذف محليًا فقط
      if (typeof reportToDelete.id === "string") {
        await deleteReport(reportToDelete.id);
        // إعادة تحميل القائمة لضمان التزامن مع السيرفر
        await loadReports();
      } else {
        setReports((prev) =>
          prev.filter((report) => report.id !== reportToDelete.id)
        );
      }

      setIsDeleteDialogOpen(false);
      setReportToDelete(null);

      toast({
        title: "تم بنجاح",
        description: "تم حذف التقرير بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التقرير",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReport = async () => {
    if (
      !formData.title ||
      !formData.type ||
      !formData.author ||
      !formData.date ||
      !formData.status ||
      !formData.fileId
    ) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Validate mapped enums and file id shape
    const mappedType = mapTypeToBackend(formData.type);
    const mappedStatus = mapStatusToBackend(formData.status);
    const isValidObjectId = /^[a-f\d]{24}$/i.test(formData.fileId);
    if (!mappedType || !mappedStatus || !isValidObjectId) {
      toast({
        title: "خطأ",
        description: "القيم غير صالحة، تحقق من النوع والحالة والملف",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: mappedType,
        author: formData.author,
        createdAt: formData.date,
        status: mappedStatus,
        file: formData.fileId!,
      };
      const res = await createReport(payload as any);

      setReports((prev) => [
        {
          id: Date.now(),
          title: res.data.title,
          type: res.data.type,
          author: res.data.author,
          date: res.data.createdAt,
          status: res.data.status,
          downloads: 0,
          size: formData.file
            ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB`
            : "",
          file: formData.file || undefined,
        },
        ...prev,
      ]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "تم بنجاح",
        description: res.message || "تم إضافة التقرير بنجاح",
      });
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        details.forEach((d: any) => {
          toast({
            title: "خطأ",
            description: `${d.msg}`,
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "خطأ",
          description:
            error?.response?.data?.message || "حدث خطأ أثناء إضافة التقرير",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handlePdfChange = async (file: File | null) => {
    try {
      // If removing current file, delete temp from server if exists
      if (!file) {
        if (formData.fileId) {
          try {
            await deleteFileById(formData.fileId);
          } catch {}
        }
        setFormData((prev) => ({ ...prev, file: null, fileId: null }));
        return;
      }

      setIsUploadingFile(true);
      const uploaded = await uploadPdf(file);
      const newFileId = extractUploadedFileId(uploaded);
      if (!newFileId) throw new Error("فشل رفع الملف");

      // If there was a previous fileId, best-effort delete it to avoid orphans
      if (formData.fileId && formData.fileId !== newFileId) {
        try {
          await deleteFileById(formData.fileId);
        } catch {}
      }

      setFormData((prev) => ({ ...prev, file, fileId: newFileId }));
      toast({ title: "تم بنجاح", description: "تم رفع الملف بنجاح" });
    } catch (e) {
      toast({
        title: "خطأ",
        description: "تعذّر رفع الملف، حاول مجددًا",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleEditPdfChange = async (file: File | null) => {
    try {
      if (!file) {
        // Delete existing uploaded file (new or existing) then clear state
        const deleteId =
          formData.fileId || formData.currentFileMeta?.id || null;
        if (deleteId) {
          try {
            await deleteFileById(deleteId);
          } catch {}
        }
        setFormData((prev) => ({
          ...prev,
          file: null,
          fileId: null,
          currentFileMeta: null,
        }));
        toast({ title: "تم", description: "تم حذف الملف" });
        return;
      }

      // Replacing with a new upload
      setIsUploadingFile(true);
      const uploaded = await uploadPdf(file);
      const newFileId = extractUploadedFileId(uploaded);
      if (!newFileId) throw new Error("فشل رفع الملف");

      // Best-effort delete prior file (either newly uploaded or existing)
      const priorId = formData.fileId || formData.currentFileMeta?.id || null;
      if (priorId && priorId !== newFileId) {
        try {
          await deleteFileById(priorId);
        } catch {}
      }

      setFormData((prev) => ({
        ...prev,
        file,
        fileId: newFileId,
        currentFileMeta: null,
      }));
      toast({ title: "تم بنجاح", description: "تم رفع الملف بنجاح" });
    } catch (e) {
      toast({
        title: "خطأ",
        description: "تعذّر معالجة الملف",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleEditReport = async (report: Report) => {
    setSelectedReport(report);
    try {
      if (typeof report.id === "string") {
        const full = await getReportById(report.id);
        const r = full.data;
        const fileObj = (typeof r.file === "object" && r.file) as any;
        setFormData({
          title: r.title,
          type: mapTypeToArabic(r.type),
          author: r.author,
          date: r.createdAt?.slice(0, 10) || "",
          status: mapStatusToArabic(r.status),
          file: null,
          fileId: fileObj && fileObj._id ? String(fileObj._id) : null,
          currentFileMeta: fileObj
            ? {
                url: fileObj.url,
                name: fileObj.originalName || fileObj.fileName,
                size: fileObj.size,
                id: fileObj._id,
              }
            : null,
        });
      } else {
        setFormData({
          title: report.title,
          type: report.type,
          author: report.author,
          date: report.date,
          status: report.status,
          file: report.file || null,
          fileId: null,
          currentFileMeta: null,
        });
      }
    } catch {
      setFormData({
        title: report.title,
        type: report.type,
        author: report.author,
        date: report.date,
        status: report.status,
        file: report.file || null,
        fileId: null,
        currentFileMeta: null,
      });
    } finally {
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateReport = async () => {
    if (
      !formData.title ||
      !formData.type ||
      !formData.author ||
      !formData.date ||
      !formData.status
    ) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Determine effective fileId: prefer newly uploaded, else existing
    const effectiveFileId =
      formData.fileId || formData.currentFileMeta?.id || null;
    if (!effectiveFileId) {
      toast({
        title: "خطأ",
        description: "يرجى رفع أو تحديد ملف PDF",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const mappedType = mapTypeToBackend(formData.type);
      const mappedStatus = mapStatusToBackend(formData.status);
      const fileId = effectiveFileId;

      const payload: any = {
        title: formData.title,
        type: mappedType,
        author: formData.author,
        createdAt: formData.date,
        status: mappedStatus,
        file: fileId!,
      };

      const id = String(selectedReport!.id);
      const res = await updateReport(id, payload);

      setReports((prev) =>
        prev.map((report) =>
          String(report.id) === id
            ? {
                ...report,
                title: res.data.title,
                type: mapTypeToArabic(res.data.type),
                author: res.data.author,
                date: res.data.createdAt?.slice(0, 10) || formData.date,
                status: mapStatusToArabic(res.data.status),
                size: formData.file
                  ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB`
                  : report.size,
                file: formData.file || report.file,
              }
            : report
        )
      );

      setIsEditDialogOpen(false);
      setSelectedReport(null);
      resetForm();

      toast({
        title: "تم بنجاح",
        description: res.message || "تم تحديث التقرير بنجاح",
      });
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        details.forEach((d: any) =>
          toast({
            title: "خطأ",
            description: `${d.msg}`,
            variant: "destructive",
          })
        );
      } else {
        toast({
          title: "خطأ",
          description:
            error?.response?.data?.message || "حدث خطأ أثناء تحديث التقرير",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "منشور":
        return "bg-green-100 text-green-800";
      case "مسودة":
        return "bg-yellow-100 text-yellow-800";
      case "مؤرشف":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      // إذا كان التقرير من السيرفر، اجلب تفاصيله للحصول على رابط الملف واسم الملف
      let fileUrl: string | undefined
      let originalName: string | undefined

      if (typeof report.id === "string") {
        const full: any = await getReportById(report.id);
        const fileObj = (full?.data?.data?.file ??
          full?.data?.file ??
          full?.file) as any;
        const fileUrl = typeof fileObj === "object" ? fileObj?.url : undefined;
        if (fileUrl) {
          const viewUrl = toBackendUrl(fileUrl);
          window.open(viewUrl, "_blank", "noopener,noreferrer");
        } else {
          throw new Error("لا يوجد رابط ملف لهذا التقرير");
        }
      } else if (report.file) {
        // تقرير مضاف محليًا ولم يُحفظ بعد: افتح الملف المحلي مباشرة
        const url = URL.createObjectURL(report.file);
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("لا يوجد ملف مرفق لهذا التقرير");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "تعذر عرض ملف التقرير",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div
        className={`space-y-6 transition-all duration-300 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
            <p className="text-gray-600 mt-1">
              إدارة التقارير الإدارية والمالية والإعلامية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadReports}
              disabled={isLoading}
              title="تحديث"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 ml-2" />
              )}
              تحديث
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة تقرير جديد
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="كل الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="منشور">منشور</SelectItem>
              <SelectItem value="مسودة">مسودة</SelectItem>
              <SelectItem value="مؤرشف">مؤرشف</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في التقارير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">إجمالي التقارير</div>
              <div className="text-2xl font-bold">
                {totals.totalNumberOfReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">تقارير إعلامية</div>
              <div className="text-2xl font-bold">
                {totals.numberOfMediaReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">تقارير مالية</div>
              <div className="text-2xl font-bold">
                {totals.numberOfFinancialReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">تقارير إدارية</div>
              <div className="text-2xl font-bold">
                {totals.numberOfManagementReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">تقارير مشاريع</div>
              <div className="text-2xl font-bold">
                {totals.numberOfProjectReports}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">تقارير إحصائية</div>
              <div className="text-2xl font-bold">
                {totals.numberOfStatisticReports}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            <Loader2 className="w-6 h-6 inline-block ml-2 animate-spin" />
            جاري تحميل البيانات...
          </div>
        ) : (
          <>
            {filteredReports.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    لا توجد تقارير
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "لا توجد تقارير تطابق معايير البحث المحددة"
                      : "لم يتم إنشاء أي تقارير بعد. ابدأ بإضافة تقرير جديد."}
                  </p>
                  {!searchTerm &&
                    statusFilter === "all" &&
                    typeFilter === "all" && (
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة تقرير جديد
                      </Button>
                    )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600">{report.type}</p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span className="font-medium">التاريخ:</span>
                          <span>{report.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">المؤلف:</span>
                          <span className="truncate ml-2">{report.author}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">الحجم:</span>
                          <span>{report.size}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="w-4 h-4 ml-1" />
                          تحميل
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditReport(report)}
                            >
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(report)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent dir="rtl" className="max-w-2xl close-left">
            <DialogHeader dir="rtl">
              <DialogTitle className="text-right">تفاصيل التقرير</DialogTitle>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6 text-right" dir="rtl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      عنوان التقرير
                    </Label>
                    <p className="text-lg font-semibold">
                      {selectedReport.title}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      نوع التقرير
                    </Label>
                    <p className="text-lg">{selectedReport.type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      المؤلف
                    </Label>
                    <p className="text-lg">{selectedReport.author}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      التاريخ
                    </Label>
                    <p className="text-lg">{selectedReport.date}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      الحالة
                    </Label>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      حجم الملف
                    </Label>
                    <p className="text-lg">{selectedReport.size}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    إغلاق
                  </Button>
                  <Button
                    onClick={() =>
                      selectedReport && handleDownload(selectedReport)
                    }
                  >
                    <Download className="w-4 h-4 ml-1" />
                    تحميل التقرير
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent dir="rtl" className="max-w-md close-left text-right">
            <DialogHeader dir="rtl" className="text-right items-end">
              <DialogTitle>تأكيد الحذف</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-gray-600">
                هل أنت متأكد من حذف هذا العنصر؟ سيتم نقله إلى الأرشيف ويمكن
                استرجاعه لاحقاً.
              </p>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  {isLoading ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent
            dir="rtl"
            className="max-w-4xl max-h-[90vh] overflow-y-auto close-left"
          >
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl text-right">
                إضافة تقرير جديد
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    عنوان التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="أدخل عنوان التقرير"
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    نوع التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-11 text-right">
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">
                    المؤلف <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    placeholder="أدخل اسم المؤلف"
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    التاريخ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">
                    الحالة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="h-11 text-right">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatusesForm.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <PdfUpload
                  onFileChange={handlePdfChange}
                  currentFile={formData.file}
                  label={
                    isUploadingFile ? "...جاري رفع الملف" : "ملف التقرير (PDF)"
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddReport}
                  disabled={isLoading || isUploadingFile}
                >
                  {isLoading
                    ? "جاري الإضافة..."
                    : isUploadingFile
                    ? "انتظر رفع الملف"
                    : "إضافة التقرير"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            dir="rtl"
            className="max-w-4xl max-h-[90vh] overflow-y-auto close-left text-right"
          >
            <DialogHeader dir="rtl">
              <DialogTitle className="text-xl text-right">
                تعديل التقرير
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">
                    عنوان التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="أدخل عنوان التقرير"
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">
                    نوع التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-11 text-right">
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-author">
                    المؤلف <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    placeholder="أدخل اسم المؤلف"
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">
                    التاريخ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="h-11 text-right"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-status">
                    الحالة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="h-11 text-right">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatusesForm.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <PdfUpload
                  onFileChange={handleEditPdfChange}
                  currentFile={formData.file}
                  currentFileUrl={formData.currentFileMeta?.url}
                  currentFileName={formData.currentFileMeta?.name}
                  currentFileSize={formData.currentFileMeta?.size}
                  label="ملف التقرير (PDF)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button onClick={handleUpdateReport} disabled={isLoading}>
                  {isLoading ? "جاري التحديث..." : "تحديث التقرير"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
