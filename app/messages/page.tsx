"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/hooks/use-messages";
import {
  Eye,
  Mail,
  Trash2,
  Archive as ArchiveIcon,
  Filter,
  Search,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MessagesPage() {
  const {
    messages,
    loading,
    error,
    pagination,
    deleteMessage,
    markRead,
    archive,
    counts,
    loadMessages,
    goToPage,
    changePageSize,
    searchMessages,
    clearError,
  } = useMessages();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<any>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seenFilter, setSeenFilter] = useState("all");
  const [q, setQ] = useState("");

  const selected =
    selectedMessage || messages.find((m) => m._id === selectedId) || null;

  const handleDeleteClick = (message: any) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      setDeleting(true);
      await deleteMessage(messageToDelete._id);
      // الجدول سيتحدث تلقائيًا من خلال state management
      setDeleting(false);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  // Handle search and filter
  const handleSearch = (searchValue: string) => {
    setQ(searchValue);
    searchMessages(searchValue, seenFilter);
  };

  const handleSeenFilter = (seen: string) => {
    setSeenFilter(seen);
    searchMessages(q, seen);
  };

  const statusBadge = (isSeen: boolean) => {
    const status = isSeen ? "read" : "new";
    const map: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={map[status] || "bg-gray-100 text-gray-800"}>
        {isSeen ? "مقروءة" : "جديدة"}
      </Badge>
    );
  };

  return (
    <DashboardLayout
      title="إدارة الرسائل"
      description="عرض رسائل اتصل بنا والرد عليها"
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearError}>
                  إغلاق
                </Button>
                <Button size="sm" variant="outline" onClick={loadMessages}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة المحاولة
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">الجديدة</p>
                      <p className="text-2xl font-bold">{counts.new}</p>
                    </div>
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">المقروءة</p>
                      <p className="text-2xl font-bold">{counts.read}</p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">إجمالي</p>
                      <p className="text-2xl font-bold">{counts.total}</p>
                    </div>
                    <ArchiveIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="...ابحث بالاسم أو البريد أو الموضوع أو الهاتف"
                  value={q}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={seenFilter} onValueChange={handleSeenFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="حالة القراءة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الرسائل</SelectItem>
                    <SelectItem value="false">غير مقروءة</SelectItem>
                    <SelectItem value="true">مقروءة</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadMessages}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  تحديث
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                الرسائل ({messages.length} من {pagination.total})
              </span>
              <div className="flex items-center gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadMessages}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  تحديث
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-8" /> {/* م */}
                    <Skeleton className="h-4 w-32" /> {/* المرسل */}
                    <Skeleton className="h-4 w-40" /> {/* البريد */}
                    <Skeleton className="h-4 w-24" /> {/* الهاتف */}
                    <Skeleton className="h-4 w-36" /> {/* الموضوع */}
                    <Skeleton className="h-6 w-16" /> {/* الحالة */}
                    <Skeleton className="h-4 w-20" /> {/* التاريخ */}
                    <Skeleton className="h-8 w-28" /> {/* الإجراءات */}
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد رسائل</p>
              </div>
            ) : (
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">م</TableHead>
                    <TableHead className="text-right">المرسل</TableHead>
                    <TableHead className="text-right">البريد</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">الموضوع</TableHead>
                    <TableHead className="w-24 text-center">الحالة</TableHead>
                    <TableHead className="w-28 text-right">التاريخ</TableHead>
                    <TableHead className="w-36 text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m, idx) => (
                    <TableRow key={m._id}>
                      <TableCell className="text-center">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-right">
                        {m.name}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-right">
                        {m.email}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-right">
                        {m.contactInfo || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-right">
                        {m.subject}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusBadge(m.isSeen)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              setMarkingAsRead(m._id);
                              setSelectedId(m._id);
                              setSelectedMessage(m); // استخدام البيانات المحلية
                              await markRead(m._id, true);
                              // الجدول سيتحدث تلقائيًا من خلال state management
                              setMarkingAsRead(null);
                            }}
                            disabled={markingAsRead === m._id || loading}
                          >
                            {markingAsRead === m._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            عرض
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 bg-transparent"
                            onClick={() => handleDeleteClick(m)}
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">عرض</span>
                <Select
                  value={
                    pagination.limit === pagination.total
                      ? "all"
                      : pagination.limit.toString()
                  }
                  onValueChange={(value) => {
                    if (value === "all") {
                      changePageSize(pagination.total);
                    } else {
                      changePageSize(parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="all">عرض الكل</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  {pagination.total > 0
                    ? pagination.limit === pagination.total
                      ? `عرض جميع الرسائل (${pagination.total})`
                      : `${pagination.total} رسالة`
                    : "لا توجد رسائل"}
                </span>
                {pagination.totalPages > 1 &&
                  pagination.limit !== pagination.total && (
                    <span className="text-sm text-gray-500">
                      • الصفحة {pagination.page} من {pagination.totalPages}
                    </span>
                  )}
              </div>

              {pagination.limit === pagination.total &&
                pagination.total > 0 && (
                  <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md">
                    ✓ تم عرض جميع الرسائل
                  </div>
                )}

              {pagination.totalPages > 1 &&
                pagination.limit !== pagination.total && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      السابق
                    </Button>

                    <div className="flex items-center gap-1">
                      {pagination.totalPages <= 7 ? (
                        // إذا كان عدد الصفحات 7 أو أقل، اعرض جميع الصفحات
                        Array.from(
                          { length: pagination.totalPages },
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pagination.page === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => goToPage(pageNum)}
                                className="w-10 h-10"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )
                      ) : (
                        // إذا كان عدد الصفحات أكثر من 7، اعرض 5 صفحات مع إشارات
                        <>
                          {pagination.page > 3 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(1)}
                                className="w-10 h-10"
                              >
                                1
                              </Button>
                              <span className="px-2 text-gray-400">...</span>
                            </>
                          )}

                          {Array.from(
                            { length: Math.min(5, pagination.totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (pagination.page <= 3) {
                                pageNum = i + 1;
                              } else if (
                                pagination.page >=
                                pagination.totalPages - 2
                              ) {
                                pageNum = pagination.totalPages - 4 + i;
                              } else {
                                pageNum = pagination.page - 2 + i;
                              }

                              if (
                                pageNum > pagination.totalPages ||
                                pageNum < 1
                              )
                                return null;

                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    pagination.page === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => goToPage(pageNum)}
                                  className="w-10 h-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}

                          {pagination.page < pagination.totalPages - 2 && (
                            <>
                              <span className="px-2 text-gray-400">...</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(pagination.totalPages)}
                                className="w-10 h-10"
                              >
                                {pagination.totalPages}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="flex items-center gap-2"
                    >
                      التالي
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedId}
          onOpenChange={() => {
            setSelectedId(null);
            setSelectedMessage(null);
          }}
        >
          <DialogContent
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            {selected ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {selected.subject || "تفاصيل الرسالة"}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>المرسل: {selected.name}</span>
                    <span>•</span>
                    <a
                      href={`mailto:${selected.email}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {selected.email}
                    </a>
                    <span>•</span>
                    <span>{new Date(selected.createdAt).toLocaleString()}</span>
                    <span className="grow" />
                    {statusBadge(selected.isSeen)}
                  </div>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium">
                        {selected.contactInfo || "غير متوفر"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-medium">
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">الرسالة:</p>
                    <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap text-sm leading-7">
                      {selected.message}
                    </div>
                  </div>
                </div>
                <DialogFooter />
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p>
                    هل أنت متأكد من أنك تريد حذف هذه الرسالة؟ هذا الإجراء لا
                    يمكن التراجع عنه.
                  </p>
                  {messageToDelete && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium block">
                        المرسل: {messageToDelete.name}
                      </span>
                      <span className="text-sm text-gray-600 block">
                        الموضوع: {messageToDelete.subject}
                      </span>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
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
    </DashboardLayout>
  );
}
