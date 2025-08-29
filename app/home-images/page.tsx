"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, Camera, ImageIcon, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GalleryUpload } from "@/components/shared/gallery-upload"
import { DashboardLayout } from "@/components/shared/dashboard-layout"

interface HomeImage {
  id: string
  title: string
  description: string
  imageUrl: string
  isActive: boolean
  isMain: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function HomeImagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<HomeImage | null>(null)

  // Form states
  const [formData, setFormData] = useState<Partial<HomeImage>>({})
  const [formImages, setFormImages] = useState<Array<{ url: string; title: string }>>([])

  // Mock data for home images
  const [homeImages, setHomeImages] = useState<HomeImage[]>([
    {
      id: "1",
      title: "صورة رئيسية - رسالة الأمل",
      description: "صورة تعبر عن رسالة الأمل والعطاء في جمعية أصيل",
      imageUrl: "/charity-hope-main.png",
      isActive: true,
      isMain: true,
      order: 1,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      title: "مساعدات غذائية",
      description: "توزيع المساعدات الغذائية على الأسر المحتاجة",
      imageUrl: "/food-aid-distribution.png",
      isActive: true,
      isMain: false,
      order: 2,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
    },
    {
      id: "3",
      title: "برامج تعليمية",
      description: "دعم التعليم والبرامج التدريبية للشباب",
      imageUrl: "/youth-education-programs.png",
      isActive: true,
      isMain: false,
      order: 3,
      createdAt: "2024-01-08",
      updatedAt: "2024-01-08",
    },
  ])

  const filteredImages = homeImages.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && image.isActive) ||
      (filterStatus === "inactive" && !image.isActive)
    return matchesSearch && matchesFilter
  })

  const mainImage = homeImages.find((img) => img.isMain && img.isActive)
  const sliderImages = homeImages.filter((img) => !img.isMain && img.isActive).sort((a, b) => a.order - b.order)

  const handleAdd = () => {
    setFormData({})
    setFormImages([])
    setShowAddDialog(true)
  }

  const handleEdit = (item: HomeImage) => {
    setSelectedItem(item)
    setFormData(item)
    setFormImages([{ url: item.imageUrl, title: item.title }])
    setShowEditDialog(true)
  }

  const handleDelete = (item: HomeImage) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const handleView = (item: HomeImage) => {
    setSelectedItem(item)
    setShowDetailsDialog(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (showEditDialog && selectedItem) {
        // Update existing image
        setHomeImages((prev) =>
          prev.map((img) =>
            img.id === selectedItem.id ? { ...img, ...formData, imageUrl: formImages[0]?.url || img.imageUrl } : img,
          ),
        )
      } else {
        // Add new image
        const newImage: HomeImage = {
          id: Date.now().toString(),
          title: formData.title || "",
          description: formData.description || "",
          imageUrl: formImages[0]?.url || "",
          isActive: formData.isActive ?? true,
          isMain: formData.isMain ?? false,
          order: homeImages.length + 1,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        }
        setHomeImages((prev) => [...prev, newImage])
      }

      setShowAddDialog(false)
      setShowEditDialog(false)
    } catch (error) {
      console.error("Error saving image:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedItem) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setHomeImages((prev) => prev.filter((img) => img.id !== selectedItem.id))
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting image:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="إدارة صور الصفحة الرئيسية" description="إدارة الصور الرئيسية وصور السلايدر للموقع">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            إضافة صورة جديدة
          </Button>
        </div>

        {/* Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                الصورة الرئيسية
              </CardTitle>
              <CardDescription>الصورة الرئيسية التي تظهر في أعلى الموقع</CardDescription>
            </CardHeader>
            <CardContent>
              {mainImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={mainImage.imageUrl || "/placeholder.svg"}
                      alt={mainImage.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-lg">{mainImage.title}</h3>
                        <p className="text-sm opacity-90">{mainImage.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(mainImage)}>
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleView(mainImage)}>
                      <Eye className="w-4 h-4 mr-2" />
                      عرض
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">لا توجد صورة رئيسية</p>
                    <Button size="sm" className="mt-2" onClick={handleAdd}>
                      إضافة صورة رئيسية
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slider Images Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                صور السلايدر ({sliderImages.length})
              </CardTitle>
              <CardDescription>الصور التي تظهر في السلايدر</CardDescription>
            </CardHeader>
            <CardContent>
              {sliderImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {sliderImages.slice(0, 4).map((image) => (
                    <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" onClick={() => handleView(image)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">لا توجد صور في السلايدر</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث في الصور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصور</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">غير نشطة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الصور ({filteredImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImages.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image.imageUrl || "/placeholder.svg"}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{image.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{image.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={image.isMain ? "default" : "secondary"}>
                          {image.isMain ? "رئيسية" : "سلايدر"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={image.isActive ? "default" : "secondary"}>
                          {image.isActive ? "نشطة" : "غير نشطة"}
                        </Badge>
                      </TableCell>
                      <TableCell>{image.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(image)}>
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(image)}>
                              <Edit className="w-4 h-4 mr-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(image)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setShowEditDialog(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? "تعديل الصورة" : "إضافة صورة جديدة"}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? "قم بتعديل بيانات الصورة" : "أضف صورة جديدة للصفحة الرئيسية"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان الصورة</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الصورة"
              />
            </div>

            <div>
              <Label htmlFor="description">وصف الصورة</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف الصورة"
                rows={3}
              />
            </div>

            <div>
              <Label>الصورة</Label>
              <GalleryUpload currentImages={formImages} onImagesChange={setFormImages} maxImages={1} hideTitles />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">نشطة</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isMain"
                checked={formData.isMain ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
              />
              <Label htmlFor="isMain">صورة رئيسية</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setShowEditDialog(false)
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الصورة "{selectedItem?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الصورة</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedItem.imageUrl || "/placeholder.svg"}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العنوان</Label>
                  <p className="text-sm text-gray-600">{selectedItem.title}</p>
                </div>
                <div>
                  <Label>النوع</Label>
                  <Badge variant={selectedItem.isMain ? "default" : "secondary"}>
                    {selectedItem.isMain ? "رئيسية" : "سلايدر"}
                  </Badge>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Badge variant={selectedItem.isActive ? "default" : "secondary"}>
                    {selectedItem.isActive ? "نشطة" : "غير نشطة"}
                  </Badge>
                </div>
                <div>
                  <Label>تاريخ الإنشاء</Label>
                  <p className="text-sm text-gray-600">{selectedItem.createdAt}</p>
                </div>
              </div>

              <div>
                <Label>الوصف</Label>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
