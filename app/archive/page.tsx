"use client"

import { useState, useCallback, useEffect } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Archive, Search, FileText, ImageIcon, Loader2, Trash2, RotateCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useArchive } from "@/hooks/use-archive"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ArchivePage() {
  const {
    archivedItems,
    loading,
    error,
    pagination,
    fetchArchivedItems,
    searchItems,
  } = useArchive()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  const getTypeColor = (type: string) => {
    // معالجة أنواع مختلفة من الـ response
    const normalizedType = type?.toLowerCase() || ""
    
    switch (normalizedType) {
      case "مشروع":
      case "project":
        return "bg-blue-100 text-blue-800"
      case "صور":
      case "image":
      case "images":
        return "bg-green-100 text-green-800"
      case "تقرير":
      case "report":
        return "bg-purple-100 text-purple-800"
      case "أخبار":
      case "news":
      case "activity":
      case "activities":
        return "bg-orange-100 text-orange-800"
      case "مستخدم":
      case "user":
        return "bg-indigo-100 text-indigo-800"
      case "شريك":
      case "partner":
        return "bg-pink-100 text-pink-800"
      case "program":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // دالة لترجمة النوع إلى العربية
  const translateType = (type: string) => {
    const normalizedType = type?.toLowerCase() || ""
    
    switch (normalizedType) {
      case "activity":
      case "activities":
        return "نشاط"
      case "project":
        return "مشروع"
      case "image":
      case "images":
        return "صورة"
      case "report":
        return "تقرير"
      case "news":
        return "خبر"
      case "user":
        return "مستخدم"
      case "partner":
        return "شريك"
      case "program":
        return "برنامج"
      default:
        return type // إرجاع النوع كما هو إذا لم يكن معروف
    }
  }

  const getTypeIcon = (type: string) => {
    // معالجة أنواع مختلفة من الـ response
    const normalizedType = type?.toLowerCase() || ""
    
    switch (normalizedType) {
      case "مشروع":
      case "project":
        return <FileText className="w-4 h-4" />
      case "صور":
      case "image":
      case "images":
        return <ImageIcon className="w-4 h-4" />
      case "تقرير":
      case "report":
        return <FileText className="w-4 h-4" />
      case "أخبار":
      case "news":
      case "activity":
      case "activities":
        return <FileText className="w-4 h-4" />
      case "مستخدم":
      case "user":
        return <FileText className="w-4 h-4" />
      case "شريك":
      case "partner":
        return <FileText className="w-4 h-4" />
      case "program":
        return <FileText className="w-4 h-4" />
      default:
        return <Archive className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "غير محدد"
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString
      
      // التحقق من أن التاريخ صحيح
      if (isNaN(date.getTime())) {
        return "تاريخ غير صحيح"
      }
      
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return "تاريخ غير صحيح"
    }
  }



  // Handle type filter change
  const handleTypeChange = useCallback(async (value: string) => {
    let newSelectedTypes: string[]
    
    if (value === "all") {
      // اختيار "الكل" يمسح جميع الأنواع المحددة
      newSelectedTypes = []
    } else {
      // تبديل النوع المحدد
      if (selectedTypes.includes(value)) {
        newSelectedTypes = selectedTypes.filter(type => type !== value)
      } else {
        newSelectedTypes = [...selectedTypes, value]
      }
    }
    
    setSelectedTypes(newSelectedTypes)
    
    // البحث سيتم تحديثه تلقائياً عبر useEffect
  }, [selectedTypes])

  // Handle pagination
  const handlePageChange = useCallback(async (page: number) => {
    await fetchArchivedItems({ 
      page, 
      type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
      q: searchQuery.trim() || undefined 
    })
  }, [fetchArchivedItems, selectedTypes, searchQuery])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // تأخير 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search effect when debounced query changes
  useEffect(() => {
    setIsSearching(true);
    
    if (debouncedSearchQuery.trim()) {
      // إذا كان هناك نص بحث، استخدم searchItems
      searchItems(debouncedSearchQuery, { 
        type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined 
      }).finally(() => setIsSearching(false));
    } else {
      // إذا لم يكن هناك نص بحث، جلب البيانات حسب الفلتر فقط
      fetchArchivedItems({ 
        type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined 
      }).finally(() => setIsSearching(false));
    }
  }, [debouncedSearchQuery, selectedTypes, searchItems, fetchArchivedItems]);

  // Effect to update search when filter changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      // إذا كان هناك نص بحث، أعد البحث مع الفلتر الجديد
      setIsSearching(true);
      searchItems(debouncedSearchQuery, { 
        type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined 
      }).finally(() => setIsSearching(false));
    }
  }, [selectedTypes, debouncedSearchQuery, searchItems]);

  // Effect to update data when filter changes without search
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      // إذا لم يكن هناك بحث، جلب البيانات حسب الفلتر فقط
      setIsSearching(true);
      fetchArchivedItems({ 
        type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined 
      }).finally(() => setIsSearching(false));
    }
  }, [selectedTypes, debouncedSearchQuery, fetchArchivedItems]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* قسم الفلتر */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">فلترة حسب النوع</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="all"
                      checked={selectedTypes.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([])
                        }
                      }}
                    />
                    <label htmlFor="all" className="text-sm font-medium text-gray-700 cursor-pointer">الكل</label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="activity"
                      checked={selectedTypes.includes('activity')}
                      onCheckedChange={(checked) => handleTypeChange('activity')}
                    />
                    <label htmlFor="activity" className="text-sm font-medium text-gray-700 cursor-pointer">الأخبار والأنشطة</label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="report"
                      checked={selectedTypes.includes('report')}
                      onCheckedChange={(checked) => handleTypeChange('report')}
                    />
                    <label htmlFor="report" className="text-sm font-medium text-gray-700 cursor-pointer">التقارير</label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="user"
                      checked={selectedTypes.includes('user')}
                      onCheckedChange={(checked) => handleTypeChange('user')}
                    />
                    <label htmlFor="user" className="text-sm font-medium text-gray-700 cursor-pointer">المستخدمين</label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="program"
                      checked={selectedTypes.includes('program')}
                      onCheckedChange={(checked) => handleTypeChange('program')}
                    />
                    <label htmlFor="program" className="text-sm font-medium text-gray-700 cursor-pointer">البرامج</label>
                  </div>
                </div>
              </div>

              {/* قسم البحث */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">البحث</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="البحث في العنوان، الوصف، المؤلف، الكلمات المفتاحية..." 
                    className="pl-10 pr-4 h-12 text-base" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">البحث يعمل تلقائياً أثناء الكتابة في:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>العنوان والوصف</li>
                    <li>المؤلف والكلمات المفتاحية</li>
                    <li>حسب نوع العنصر المحدد</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">العناصر المؤرشفة</CardTitle>
            <CardDescription className="text-gray-600">عرض جميع العناصر المؤرشفة في النظام</CardDescription>
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
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="hover:bg-gray-50">
                        <TableHead className="text-right font-semibold text-gray-700 py-4">#</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">العنوان</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">النوع</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 py-4">تاريخ الأرشفة</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700 py-4">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedItems.map((item, index) => (
                        <TableRow key={item._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="text-center text-gray-600 font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-500">{item.description}</p>
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
                                disabled={loading}
                                className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <RotateCcw className="w-4 h-4 ml-1" />
                                استرجاع
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                    className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 ml-1" />
                                    حذف
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف النهائي</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف "{item.title}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                    >
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
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          if (pagination.totalPages <= 5) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === pagination.page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          
                          // Show first page, last page, current page, and pages around current
                          if (page === 1 || page === pagination.totalPages || 
                              (page >= pagination.page - 1 && page <= pagination.page + 1)) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === pagination.page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          
                          // Show ellipsis
                          if (page === 2 || page === pagination.totalPages - 1) {
                            return (
                              <PaginationItem key={page}>
                                <span className="px-3 py-2">...</span>
                              </PaginationItem>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
