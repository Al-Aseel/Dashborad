"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { Plus, Building, Search, MoreHorizontal, Eye, Edit, ExternalLink, Trash2, Loader2 } from "lucide-react"

interface Partner {
  id: number
  nameAr: string
  nameEn: string
  type: string
  status: string
  email: string
  phone: string
  website: string
  joinDate: string
  projects: number
  logo?: string
}

export default function PartnersPage() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: 1,
      nameAr: "مؤسسة الخير الإنسانية",
      nameEn: "Khair Humanitarian Foundation",
      type: "مؤسسة",
      status: "نشط",
      email: "info@khair.org",
      phone: "+966 11 234 5678",
      website: "https://khair.org",
      contribution: "100,000$",
      joinDate: "2023-01-15",
      projects: 5,
      logo: "/heart-hands-logo.png",
    },
    {
      id: 2,
      nameAr: "شركة التكنولوجيا المتقدمة",
      nameEn: "Advanced Technology Company",
      type: "شركة",
      status: "نشط",
      email: "support@tech.com",
      phone: "+966 13 876 5432",
      website: "https://tech.com",
      joinDate: "2023-06-20",
      projects: 3,
      logo: "/aramco-logo.png",
    },
    {
      id: 3,
      nameAr: "أحمد محمد الذهبي",
      nameEn: "Ahmed Mohammed Al-Dhahabi",
      type: "فرد",
      status: "غير نشط",
      email: "ahmed@email.com",
      phone: "+966 12 345 6789",
      website: "https://ahmed.com",
      joinDate: "2022-12-10",
      projects: 1,
    },
  ])

  // States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    type: "",
    status: "نشط",
    email: "",
    phone: "",
    website: "",
    joinDate: "",
    logo: "",
  })

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch =
        partner.nameAr.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        partner.nameEn.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [partners, debouncedSearchTerm, statusFilter])

  // Stats
  const stats = useMemo(
    () => ({
      total: partners.length,
      active: partners.filter((p) => p.status === "نشط").length,
      inactive: partners.filter((p) => p.status === "غير نشط").length,
      totalProjects: partners.reduce((sum, p) => sum + p.projects, 0),
    }),
    [partners],
  )

  // Reset form
  const resetForm = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      type: "",
      status: "نشط",
      email: "",
      phone: "",
      website: "",
      contribution: "",
      joinDate: "",
      logo: "",
    })
  }

  // Handle add partner
  const handleAddPartner = async () => {
    if (!formData.nameAr || !formData.nameEn || !formData.type || !formData.email) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPartner: Partner = {
        id: Date.now(),
        ...formData,
        projects: 0,
      }

      setPartners((prev) => [...prev, newPartner])
      closeAddDialog()

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الشريك بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الشريك",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit partner
  const openEditDialog = (partner: Partner) => {
    setSelectedPartner(partner)
    setFormData({
      nameAr: partner.nameAr,
      nameEn: partner.nameEn,
      type: partner.type,
      status: partner.status,
      email: partner.email,
      phone: partner.phone,
      website: partner.website,
      contribution: partner.contribution,
      joinDate: partner.joinDate,
      logo: partner.logo || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPartners((prev) =>
        prev.map((partner) => (partner.id === selectedPartner.id ? { ...partner, ...formData } : partner)),
      )

      closeEditDialog()

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات الشريك بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الشريك",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view partner
  const openViewDialog = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsViewDialogOpen(true)
  }

  // Handle delete partner
  const openDeleteDialog = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPartner) return

    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPartners((prev) => prev.filter((partner) => partner.id !== selectedPartner.id))
      setIsDeleteDialogOpen(false)
      setSelectedPartner(null)

      toast({
        title: "تم بنجاح",
        description: "تم حذف الشريك بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الشريك",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle visit website
  const handleVisitWebsite = (website: string) => {
    if (website) {
      window.open(website.startsWith("http") ? website : `https://${website}`, "_blank")
      toast({
        title: "تم فتح الموقع",
        description: "تم فتح موقع الشريك في نافذة جديدة",
      })
    }
  }

  const getStatusColor = (status: string) => {
    return status === "نشط" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "مؤسسة":
        return "bg-blue-100 text-blue-800"
      case "شركة":
        return "bg-purple-100 text-purple-800"
      case "فرد":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedPartner(null)
    resetForm()
  }

  const openAddDialog = () => {
    resetForm()
    setSelectedPartner(null)
    setIsAddDialogOpen(true)
  }

  const closeAddDialog = () => {
    setIsAddDialogOpen(false)
    resetForm()
    setSelectedPartner(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الشركاء</h1>
            <p className="text-gray-600 mt-2">إدارة الشركاء والمساهمين في أنشطة الجمعية</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة شريك جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الشركاء</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">شريك مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الشركاء النشطون</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">شريك نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الشركاء غير النشطين</CardTitle>
              <Building className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">شريك غير نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">مشروع مشترك</p>
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
              <SelectItem value="نشط">نشط</SelectItem>
              <SelectItem value="غير نشط">غير نشط</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partners Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الشركاء ({filteredPartners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الشريك</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">تاريخ الانضمام</TableHead>
                  <TableHead className="text-right">المشاريع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {partner.logo ? (
                            <img
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.nameAr}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{partner.nameAr}</div>
                          <div className="text-sm text-gray-500">{partner.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(partner.type)}>{partner.type}</Badge>
                    </TableCell>
                    <TableCell>{partner.joinDate}</TableCell>
                    <TableCell>{partner.projects}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(partner.status)}>{partner.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(partner)}>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(partner)}>
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVisitWebsite(partner.website)}>
                            <ExternalLink className="ml-2 h-4 w-4" />
                            زيارة الموقع
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(partner)} className="text-red-600">
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Partner Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => (open ? openAddDialog() : closeAddDialog())}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة شريك</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الشريك (عربي) *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                  placeholder="أدخل اسم الشريك بالعربية"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم الشريك (إنجليزي)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="أدخل اسم الشريك بالإنجليزية"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">معلومات الاتصال *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع الشريك *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الشريك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مؤسسة">مؤسسة</SelectItem>
                    <SelectItem value="شركة">شركة</SelectItem>
                    <SelectItem value="فرد">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">تاريخ الانضمام *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, joinDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>لوجو الشريك *</Label>
                <SingleImageUpload
                  currentImage={formData.logo}
                  onImageChange={(image) => setFormData((prev) => ({ ...prev, logo: image }))}
                  label="اضغط لاختيار صورة"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeAddDialog}>
                إلغاء
              </Button>
              <Button onClick={handleAddPartner} disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Partner Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => (open ? null : closeEditDialog())}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nameEn">اسم الشريك (إنجليزي)</Label>
                <Input
                  id="edit-nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">معلومات الاتصال *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">نوع الشريك *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مؤسسة">مؤسسة</SelectItem>
                    <SelectItem value="شركة">شركة</SelectItem>
                    <SelectItem value="فرد">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-website">الموقع الإلكتروني</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">الحالة *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-joinDate">تاريخ الانضمام *</Label>
                <Input
                  id="edit-joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, joinDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>لوجو الشريك</Label>
                <SingleImageUpload
                  currentImage={formData.logo}
                  onImageChange={(image) => setFormData((prev) => ({ ...prev, logo: image }))}
                  label="اضغط لاختيار صورة"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>
                إلغاء
              </Button>
              <Button onClick={handleUpdatePartner} disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Partner Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الشريك</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {selectedPartner.logo ? (
                      <img
                        src={selectedPartner.logo || "/placeholder.svg"}
                        alt={selectedPartner.nameAr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedPartner.nameAr}</h3>
                    <p className="text-gray-600">{selectedPartner.nameEn}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">النوع</Label>
                    <p className="mt-1">{selectedPartner.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الحالة</Label>
                    <p className="mt-1">
                      <Badge className={getStatusColor(selectedPartner.status)}>{selectedPartner.status}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">البريد الإلكتروني</Label>
                    <p className="mt-1">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الهاتف</Label>
                    <p className="mt-1">{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">الموقع الإلكتروني</Label>
                    <p className="mt-1">
                      <a
                        href={
                          selectedPartner.website.startsWith("http")
                            ? selectedPartner.website
                            : `https://${selectedPartner.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedPartner.website}
                      </a>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">المساهمة</Label>
                    <p className="mt-1 font-medium">{selectedPartner.contribution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">تاريخ الانضمام</Label>
                    <p className="mt-1">{selectedPartner.joinDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">عدد المشاريع</Label>
                    <p className="mt-1 font-medium">{selectedPartner.projects}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف هذا العنصر؟ سيتم نقله إلى الأرشيف ويمكن استرجاعه لاحقاً.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
