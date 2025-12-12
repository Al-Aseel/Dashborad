"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Archive,
  Search,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart2,
  Newspaper,
  Users,
  FolderArchive,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useArchive } from "@/hooks/use-archive";
import { useToast } from "@/hooks/use-toast";
import { archiveApi } from "@/lib/archive";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/shared/refresh-button";
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

export default function ArchivePage() {
  const {
    archivedItems,
    loading,
    error,
    pagination,
    stats,
    fetchArchivedItems,
    searchItems,
    changePageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = useArchive();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const lastRequestRef = useRef<string>("");
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const typeOptions = [
    { value: "all", label: "الكل" },
    { value: "activity", label: "الأخبار والأنشطة" },
    { value: "report", label: "التقارير" },
    { value: "user", label: "المستخدمين" },
    { value: "program", label: "البرامج" },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: 5, label: "5 عناصر" },
    { value: 10, label: "10 عناصر" },
    { value: 20, label: "20 عنصر" },
    { value: 30, label: "30 عنصر" },
    { value: 50, label: "50 عنصر" },
    { value: -1, label: "عرض الكل" },
  ];

  const getTypeColor = (type: string) => {
    // معالجة أنواع مختلفة من الـ response
    const normalizedType = type?.toLowerCase() || "";

    switch (normalizedType) {
      case "مشروع":
      case "project":
        return "bg-blue-100 text-blue-800";
      case "صور":
      case "image":
      case "images":
        return "bg-green-100 text-green-800";
      case "تقرير":
      case "report":
        return "bg-purple-100 text-purple-800";
      case "أخبار":
      case "news":
      case "activity":
      case "activities":
        return "bg-orange-100 text-orange-800";
      case "مستخدم":
      case "user":
        return "bg-indigo-100 text-indigo-800";
      case "شريك":
      case "partner":
        return "bg-pink-100 text-pink-800";
      case "program":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // دالة لترجمة النوع إلى العربية
  const translateType = (type: string) => {
    const normalizedType = type?.toLowerCase() || "";

    switch (normalizedType) {
      case "activity":
      case "activities":
        return "نشاط";
      case "project":
        return "مشروع";
      case "image":
      case "images":
        return "صورة";
      case "report":
        return "تقرير";
      case "news":
        return "خبر";
      case "user":
        return "مستخدم";
      case "partner":
        return "شريك";
      case "program":
        return "برنامج";
      default:
        return type; // إرجاع النوع كما هو إذا لم يكن معروف
    }
  };

  const getTypeIcon = (type: string) => {
    // معالجة أنواع مختلفة من الـ response
    const normalizedType = type?.toLowerCase() || "";

    switch (normalizedType) {
      case "مشروع":
      case "project":
        return <FileText className="w-4 h-4" />;
      case "صور":
      case "image":
      case "images":
        return <ImageIcon className="w-4 h-4" />;
      case "تقرير":
      case "report":
        return <FileText className="w-4 h-4" />;
      case "أخبار":
      case "news":
      case "activity":
      case "activities":
        return <FileText className="w-4 h-4" />;
      case "مستخدم":
      case "user":
        return <FileText className="w-4 h-4" />;
      case "شريك":
      case "partner":
        return <FileText className="w-4 h-4" />;
      case "program":
        return <FileText className="w-4 h-4" />;
      default:
        return <Archive className="w-4 h-4" />;
    }
  };

  const truncateWords = (
    text: string | undefined | null,
    maxWords: number
  ): string => {
    if (!text) return "-";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return `${words.slice(0, maxWords).join(" ")}…`;
  };

  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "غير محدد";

    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;

      // التحقق من أن التاريخ صحيح
      if (isNaN(date.getTime())) {
        return "تاريخ غير صحيح";
      }

      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "تاريخ غير صحيح";
    }
  };

  // Handle type filter change
  const handleTypeChange = useCallback(
    (value: string) => {
      let newSelectedTypes: string[];

      if (value === "all") {
        // اختيار "الكل" يمسح جميع الأنواع المحددة
        newSelectedTypes = [];
      } else {
        // تبديل النوع المحدد
        if (selectedTypes.includes(value)) {
          newSelectedTypes = selectedTypes.filter((type) => type !== value);
        } else {
          newSelectedTypes = [...selectedTypes, value];
        }
      }

      setSelectedTypes(newSelectedTypes);
    },
    [selectedTypes]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    async (value: string) => {
      const newLimit = parseInt(value);
      await changePageSize(newLimit === -1 ? 1000 : newLimit); // Use large number for "show all"
    },
    [changePageSize]
  );

  // Handle pagination
  const handlePageChange = useCallback(
    async (page: number) => {
      await goToPage(page);
    },
    [goToPage]
  );

  // Permanently delete item
  const handlePermanentDelete = useCallback(
    async (id: string, type: string, displayTitle?: string) => {
      try {
        setDeletingId(id);
        const res = await archiveApi.permanentDelete(type, id);
        toast({ title: "تم الحذف نهائياً", description: res.message });
        await fetchArchivedItems({
          type: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        });
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "حدث خطأ أثناء الحذف النهائي";
        toast({ title: "خطأ", description: msg, variant: "destructive" });
      } finally {
        setDeletingId(null);
      }
    },
    [toast, fetchArchivedItems, selectedTypes]
  );

  // Restore item
  const handleRestore = useCallback(
    async (id: string, type: string) => {
      try {
        setRestoringId(id);
        const res = await archiveApi.restore(type, id);
        toast({ title: "تم الاسترجاع", description: res.message });
        await fetchArchivedItems({
          type: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || "حدث خطأ أثناء الاسترجاع";
        toast({ title: "خطأ", description: msg, variant: "destructive" });
      } finally {
        setRestoringId(null);
      }
    },
    [toast, fetchArchivedItems, selectedTypes]
  );

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // تأخير 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Effect for search query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const requestKey = `search:${debouncedSearchQuery}:${selectedTypes.join(
        ","
      )}`;
      if (lastRequestRef.current !== requestKey) {
        lastRequestRef.current = requestKey;
        setIsSearching(true);
        searchItems(debouncedSearchQuery, {
          type: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        }).finally(() => setIsSearching(false));
      }
    }
  }, [debouncedSearchQuery, selectedTypes, searchItems]);

  // Effect for type filter changes
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      const requestKey = `filter:${selectedTypes.join(",")}`;
      if (lastRequestRef.current !== requestKey) {
        lastRequestRef.current = requestKey;
        setIsSearching(true);
        fetchArchivedItems({
          type: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
        }).finally(() => setIsSearching(false));
      }
    }
  }, [selectedTypes, debouncedSearchQuery, fetchArchivedItems]);

  // Calculate display info
  const currentPageSize = pagination.limit === 1000 ? -1 : pagination.limit;
  const startItem =
    (pagination.page - 1) *
      (currentPageSize === -1 ? pagination.total : currentPageSize) +
    1;
  const endItem = Math.min(
    pagination.page *
      (currentPageSize === -1 ? pagination.total : currentPageSize),
    pagination.total
  );
  // stats now provided from hook

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الأرشيف</h1>
            <p className="text-gray-600 mt-1">
              إدارة العناصر المؤرشفة في النظام
            </p>
          </div>
          <RefreshButton
            onRefresh={() =>
              fetchArchivedItems({
                type:
                  selectedTypes.length > 0
                    ? selectedTypes.join(",")
                    : undefined,
              })
            }
            loading={loading || isSearching}
            variant="outline"
            size="sm"
          />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="overflow-hidden border border-blue-100 shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-blue-700">
                إجمالي المؤرشف
              </CardTitle>
              <FolderArchive className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {stats.totalNumberOfArchivedItems}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-amber-100 shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-amber-700">
                الأخبار والأنشطة
              </CardTitle>
              <Newspaper className="w-5 h-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {stats.totalNumberOfArchivedActivities}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-teal-100 shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-teal-700">البرامج</CardTitle>
              <BarChart2 className="w-5 h-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {stats.totalNumberOfArchivedPrograms}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-purple-100 shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-purple-700">
                التقارير
              </CardTitle>
              <FileText className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {stats.totalNumberOfArchivedReports}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-indigo-100 shadow-sm bg-white">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-indigo-700">
                المستخدمون
              </CardTitle>
              <Users className="w-5 h-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">
                {stats.totalNumberOfArchivedUsers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Section (Condensed single row) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              البحث والفلترة
            </CardTitle>
            <CardDescription className="text-gray-600">
              شريط واحد يضم البحث، الفلاتر، وخيارات العرض
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ابحث في العنوان، الوصف والكلمات المفتاحية..."
                  className="pl-10 pr-4 h-11 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>

              {/* Type badges (toggles) */}
              <div className="flex flex-wrap items-center gap-2">
                {typeOptions.map((opt) => {
                  const isActive =
                    opt.value === "all"
                      ? selectedTypes.length === 0
                      : selectedTypes.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (opt.value === "all") {
                          setSelectedTypes([]);
                        } else {
                          handleTypeChange(opt.value);
                        }
                      }}
                      className={`text-sm px-3 py-1.5 rounded-full border transition ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                      aria-pressed={isActive}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Page size */}
              <div className="flex items-center gap-2 md:min-w-[220px]">
                <span className="text-sm text-gray-600">عرض:</span>
                <Select
                  value={currentPageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  العناصر المؤرشفة
                </CardTitle>
                <CardDescription className="text-gray-600">
                  عرض{" "}
                  <span className="font-medium text-gray-900">{startItem}</span>{" "}
                  إلى{" "}
                  <span className="font-medium text-gray-900">{endItem}</span>{" "}
                  من أصل{" "}
                  <span className="font-medium text-gray-900">
                    {pagination.total}
                  </span>{" "}
                  عنصر
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="mr-2 text-gray-600">جاري التحميل...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-600">
                <span>{error}</span>
              </div>
            ) : archivedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Archive className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد عناصر مؤرشفة</p>
                <p className="text-sm">لم يتم العثور على أي عناصر في الأرشيف</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">
                          #
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4 w-1/2">
                          العنوان
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">
                          النوع
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">
                          تاريخ الأرشفة
                        </TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">
                          الإجراءات
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedItems.map((item, index) => (
                        <TableRow
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="text-center text-gray-600 font-medium">
                            {startItem + index}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="max-w-[560px]">
                              <h4
                                className="font-medium text-gray-900 mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
                                title={item.title ?? item.name ?? "-"}
                              >
                                {truncateWords(item.title ?? item.name, 5)}
                              </h4>
                              <p
                                className="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap"
                                title={item.description}
                              >
                                {item.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={`${getTypeColor(item.type)} border`}
                            >
                              <div className="flex items-center gap-1">
                                {getTypeIcon(item.type)}
                                {translateType(item.type)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-gray-600 py-4">
                            {formatDate(item.deletedAt)}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={loading || restoringId === item._id}
                                className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() =>
                                  handleRestore(item._id, item.type)
                                }
                              >
                                {restoringId === item._id ? (
                                  <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 ml-1" />
                                )}
                                {restoringId === item._id
                                  ? "جارِ الاسترجاع"
                                  : "استرجاع"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                      loading || deletingId === item._id
                                    }
                                    className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    {deletingId === item._id ? (
                                      <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4 ml-1" />
                                    )}
                                    {deletingId === item._id
                                      ? "جارِ الحذف"
                                      : "حذف"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      تأكيد الحذف النهائي
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف "
                                      {item.title ?? item.name ?? "-"}" نهائياً؟
                                      لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() =>
                                        handlePermanentDelete(
                                          item._id,
                                          item.type,
                                          item.title || item.name
                                        )
                                      }
                                    >
                                      {deletingId === item._id && (
                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                      )}
                                      حذف نهائي
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
                </div>

                {/* Pagination Controls - Bottom */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-600 order-2 sm:order-1">
                      صفحة{" "}
                      <span className="font-medium text-gray-900">
                        {pagination.page}
                      </span>{" "}
                      من{" "}
                      <span className="font-medium text-gray-900">
                        {pagination.totalPages}
                      </span>
                    </div>

                    {/* Pagination Controls (centered) */}
                    <div className="flex items-center gap-2 order-1 sm:order-2 mx-auto">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={pagination.page <= 1}
                        className="h-9 w-9 p-0"
                        title="أول صفحة"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>

                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={pagination.page <= 1}
                        className="h-9 px-3"
                        title="السابق"
                      >
                        <ChevronLeft className="w-4 h-4 ml-1" />
                        السابق
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            if (pagination.totalPages <= 5) {
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    page === pagination.page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="h-9 w-9 p-0"
                                >
                                  {page}
                                </Button>
                              );
                            }

                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === pagination.totalPages ||
                              (page >= pagination.page - 1 &&
                                page <= pagination.page + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    page === pagination.page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="h-9 w-9 p-0"
                                >
                                  {page}
                                </Button>
                              );
                            }

                            // Show ellipsis
                            if (
                              page === 2 ||
                              page === pagination.totalPages - 1
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }

                            return null;
                          }
                        )}
                      </div>

                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={pagination.page >= pagination.totalPages}
                        className="h-9 px-3"
                        title="التالي"
                      >
                        التالي
                        <ChevronRight className="w-4 h-4 mr-1" />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.totalPages)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="h-9 w-9 p-0"
                        title="آخر صفحة"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
