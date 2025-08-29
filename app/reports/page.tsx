"use client"

import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PdfUpload } from "@/components/shared/pdf-upload"
import { useToast } from "@/hooks/use-toast"
import { Download, Eye, Edit, Trash2, MoreHorizontal, Search, Plus } from "lucide-react"
import { useState, useMemo } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Report {
  id: number
  title: string
  type: string
  author: string
  date: string
  status: string
  downloads: number
  size: string
  file?: File
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "تقرير إعلامي - أنشطة ديسمبر",
      type: "تقرير إعلامي",
      author: "قسم الإعلام",
      date: "2024-12-15",
      status: "مسودة",
      downloads: 0,
      size: "3.2 MB",
    },
    {
      id: 2,
      title: "التقرير المالي - الربع الأول",
      type: "تقرير مالي",
      author: "المحاسب المالي",
      date: "2024-03-31",
      status: "منشور",
      downloads: 156,
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "التقرير السنوي 2024",
      type: "تقرير إداري",
      author: "إدارة الجمعية",
      date: "2024-12-31",
      status: "منشور",
      downloads: 245,
      size: "2.5 MB",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    author: "",
    date: "",
    status: "",
    file: null as File | null,
  })

  const reportTypes = ["تقرير إعلامي", "تقرير مالي", "تقرير إداري", "تقرير مشاريع", "تقرير إحصائي"]

  const reportStatuses = ["مسودة", "منشور", "مؤرشف"]

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [reports, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      author: "",
      date: "",
      status: "",
      file: null,
    })
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!reportToDelete) return

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setReports((prev) => prev.filter((report) => report.id !== reportToDelete.id))
      setIsDeleteDialogOpen(false)
      setReportToDelete(null)

      toast({
        title: "تم بنجاح",
        description: "تم نقل التقرير إلى الأرشيف بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التقرير",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReport = async () => {
    if (!formData.title || !formData.type || !formData.author || !formData.date || !formData.status || !formData.file) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newReport: Report = {
        id: Date.now(),
        title: formData.title,
        type: formData.type,
        author: formData.author,
        date: formData.date,
        status: formData.status,
        downloads: 0,
        size: `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB`,
        file: formData.file,
      }

      setReports((prev) => [newReport, ...prev])
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "تم بنجاح",
        description: "تم إضافة التقرير بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التقرير",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditReport = (report: Report) => {
    setSelectedReport(report)
    setFormData({
      title: report.title,
      type: report.type,
      author: report.author,
      date: report.date,
      status: report.status,
      file: report.file || null,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateReport = async () => {
    if (!formData.title || !formData.type || !formData.author || !formData.date || !formData.status) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setReports((prev) =>
        prev.map((report) =>
          report.id === selectedReport?.id
            ? {
                ...report,
                title: formData.title,
                type: formData.type,
                author: formData.author,
                date: formData.date,
                status: formData.status,
                size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : report.size,
                file: formData.file || report.file,
              }
            : report,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedReport(null)
      resetForm()

      toast({
        title: "تم بنجاح",
        description: "تم تحديث التقرير بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التقرير",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "منشور":
        return "bg-green-100 text-green-800"
      case "مسودة":
        return "bg-yellow-100 text-yellow-800"
      case "مؤرشف":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      // تحديث عدد التحميلات
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, downloads: r.downloads + 1 } : r)))

      // محاكاة تحميل الملف
      if (report.file) {
        // إنشاء رابط تحميل للملف
        const url = URL.createObjectURL(report.file)
        const link = document.createElement("a")
        link.href = url
        link.download = `${report.title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // محاكاة تحميل ملف وهمي
        const blob = new Blob(["محتوى التقرير الوهمي"], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${report.title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      toast({
        title: "تم بنجاح",
        description: `تم تحميل "${report.title}" بنجاح`,
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل التقرير",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
            <p className="text-gray-600 mt-1">إدارة التقارير الإدارية والمالية والإعلامية</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة تقرير جديد
          </Button>
        </div>

        <div className="flex gap-4 items-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.type}</p>
                  </div>
                  <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
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
                    <span className="font-medium">التحميلات:</span>
                    <span>{report.downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">الحجم:</span>
                    <span>{report.size}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
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
                      <DropdownMenuItem onClick={() => handleViewReport(report)}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditReport(report)}>
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(report)} className="text-red-600">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل التقرير</DialogTitle>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">عنوان التقرير</Label>
                    <p className="text-lg font-semibold">{selectedReport.title}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">نوع التقرير</Label>
                    <p className="text-lg">{selectedReport.type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">المؤلف</Label>
                    <p className="text-lg">{selectedReport.author}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">التاريخ</Label>
                    <p className="text-lg">{selectedReport.date}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">الحالة</Label>
                    <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">حجم الملف</Label>
                    <p className="text-lg">{selectedReport.size}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">إحصائيات التحميل</Label>
                  <p className="text-lg">{selectedReport.downloads} تحميل</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    إغلاق
                  </Button>
                  <Button onClick={() => selectedReport && handleDownload(selectedReport)}>
                    <Download className="w-4 h-4 ml-1" />
                    تحميل التقرير
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">تأكيد الحذف</DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                هل أنت متأكد من حذف هذا العنصر؟ سيتم نقله إلى الأرشيف ويمكن استرجاعه لاحقاً.
              </p>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">إضافة تقرير جديد</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    عنوان التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان التقرير"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    نوع التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-11">
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="أدخل اسم المؤلف"
                    className="h-11"
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">
                    الحالة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatuses.map((status) => (
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
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, file }))}
                  currentFile={formData.file}
                  label="ملف التقرير (PDF)"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddReport}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? "جاري الإضافة..." : "إضافة التقرير"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">تعديل التقرير</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">
                    عنوان التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان التقرير"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type">
                    نوع التقرير <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-11">
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="أدخل اسم المؤلف"
                    className="h-11"
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-status">
                    الحالة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatuses.map((status) => (
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
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, file }))}
                  currentFile={formData.file}
                  label="ملف التقرير (PDF)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateReport}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? "جاري التحديث..." : "تحديث التقرير"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
