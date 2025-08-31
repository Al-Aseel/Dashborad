"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Camera,
  ImageIcon,
  MoreHorizontal,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { useSliderImages } from "@/hooks/use-slider-images";
import { SliderImage } from "@/lib/slider-images";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function HomeImagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SliderImage | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    isActive: boolean;
    isMainImage: boolean;
  }>({
    title: "",
    description: "",
    isActive: true,
    isMainImage: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [deletingImage, setDeletingImage] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Use toast hook
  const { toast } = useToast();

  // Use slider images hook
  const {
    sliderImages,
    loading,
    uploading,
    pagination,
    uploadImageFile,
    createNewSliderImage,
    updateExistingSliderImage,
    deleteExistingSliderImage,
    deleteImageFile,
    fetchSliderImages,
    getSliderImage,
  } = useSliderImages();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith(API_BASE_URL)) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Fetch data when page or pageSize changes
  useEffect(() => {
    fetchSliderImages(currentPage, pageSize);
  }, [currentPage, pageSize, fetchSliderImages]);

  const filteredImages = (sliderImages || []).filter((image) => {
    if (!image || !image.title || !image.description) return false;
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const mainImage = (sliderImages || [])[0]; // First image as main
  const otherSliderImages = (sliderImages || []).slice(1); // Rest as slider images

  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      isActive: true,
      isMainImage: false,
    });
    setSelectedFile(null);
    setUploadedImage(null);
    setPreviewUrl("");
    setShowAddDialog(true);
  };

  const handleEdit = (item: SliderImage) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      isActive: item.isActive ?? true,
      isMainImage: item.isMainImage ?? false,
    });
    setUploadedImage({ id: item.image, url: item.imageUrl || "" });
    setPreviewUrl(item.imageUrl || "");
    setShowEditDialog(true);
  };

  const handleDelete = (item: SliderImage) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleView = async (item: SliderImage) => {
    setViewLoading(true);
    try {
      // Fetch fresh data from server
      const freshData = await getSliderImage(item._id);
      if (freshData) {
        setSelectedItem(freshData);
        setShowDetailsDialog(true);
        toast({
          title: "تم تحميل البيانات بنجاح",
          description: "تم جلب أحدث البيانات من الخادم",
          variant: "default",
        });
      } else {
        toast({
          title: "فشل في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل تفاصيل الصورة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching image details:", error);
      toast({
        title: "فشل في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل تفاصيل الصورة",
        variant: "destructive",
      });
    } finally {
      setViewLoading(false);
    }
  };

  // Handle file selection - Auto upload when file is selected
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await processFile(file);
      }
    }
  };

  // Process file (upload and preview)
  const processFile = async (file: File) => {
    setSelectedFile(file);
    // Create temporary preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Auto upload the file
      const result = await uploadImageFile(file);
      if (result) {
        setUploadedImage(result);
        // Update preview with uploaded image URL
        setPreviewUrl(result.url);
        // Clean up temporary URL
        URL.revokeObjectURL(url);

        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تم رفع الصورة إلى الخادم بنجاح",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "فشل في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      // Clean up temporary URL on error
      URL.revokeObjectURL(url);
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  // Handle form save
  const handleSave = async () => {
    if (!uploadedImage) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار صورة قبل الحفظ",
        variant: "destructive",
      });
      return;
    }

    try {
      if (showEditDialog && selectedItem) {
        // Update existing image
        await updateExistingSliderImage(selectedItem._id, {
          image: uploadedImage.id,
          title: formData.title,
          description: formData.description,
          isActive: formData.isActive,
          isMainImage: formData.isMainImage,
        });

        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث الصورة بنجاح",
          variant: "default",
        });
      } else {
        // Create new image
        await createNewSliderImage({
          image: uploadedImage.id,
          title: formData.title,
          description: formData.description,
          isActive: formData.isActive,
          isMainImage: formData.isMainImage,
        });

        toast({
          title: "تم الإضافة بنجاح",
          description: "تم إضافة الصورة الجديدة بنجاح",
          variant: "default",
        });
      }

      setShowAddDialog(false);
      setShowEditDialog(false);
      setFormData({
        title: "",
        description: "",
        isActive: true,
        isMainImage: false,
      });
      setSelectedFile(null);
      setUploadedImage(null);
      setPreviewUrl("");

      // Refresh data after successful save
      fetchSliderImages(currentPage, pageSize);
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "فشل في الحفظ",
        description: "حدث خطأ أثناء حفظ الصورة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      const success = await deleteExistingSliderImage(selectedItem._id);
      if (success) {
        setShowDeleteDialog(false);
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف الصورة بنجاح",
          variant: "default",
        });

        // Refresh data after successful delete
        fetchSliderImages(currentPage, pageSize);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء حذف الصورة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchSliderImages(currentPage, pageSize);
    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث البيانات بنجاح",
      variant: "default",
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout
      title="إدارة صور الصفحة الرئيسية"
      description="إدارة الصور الرئيسية وصور السلايدر للموقع"
    >
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">جاري تحميل الصور...</p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3">
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة صورة جديدة
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>
          </div>
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
              <CardDescription>
                الصورة الرئيسية التي تظهر في أعلى الموقع
              </CardDescription>
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
                        <p className="text-sm opacity-90">
                          {mainImage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(mainImage)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(mainImage)}
                      disabled={viewLoading}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {viewLoading ? "جاري التحميل..." : "عرض"}
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
                صور السلايدر ({otherSliderImages.length})
              </CardTitle>
              <CardDescription>الصور التي تظهر في السلايدر</CardDescription>
            </CardHeader>
            <CardContent>
              {otherSliderImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {otherSliderImages.slice(0, 4).map((image) => (
                    <div
                      key={image._id}
                      className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleView(image)}
                          disabled={viewLoading}
                        >
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
            </div>
          </CardContent>
        </Card>

        {/* Images Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الصور ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" dir="rtl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">الصورة</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImages.length > 0 ? (
                    filteredImages.map((image, index) => (
                      <TableRow key={image._id}>
                        <TableCell className="text-right">
                          <span className="font-medium text-gray-600">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={image.imageUrl || "/placeholder.svg"}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium">{image.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {image.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={image.isActive ? "default" : "secondary"}
                            className={
                              image.isActive ? "bg-green-500" : "bg-gray-500"
                            }
                          >
                            {image.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={image.isMainImage ? "default" : "outline"}
                            className={image.isMainImage ? "bg-blue-500" : ""}
                          >
                            {image.isMainImage ? "رئيسية" : "سلايدر"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(image)}
                                disabled={viewLoading}
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                {viewLoading ? "جاري التحميل..." : "عرض"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(image)}
                              >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(image)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              لا توجد صور
                            </h3>
                            <p className="text-gray-500 mb-4">
                              {searchTerm
                                ? "لم يتم العثور على صور تطابق البحث"
                                : "لم يتم إضافة أي صور بعد"}
                            </p>
                            {!searchTerm && (
                              <Button
                                onClick={handleAdd}
                                className="bg-gradient-to-r from-blue-500 to-purple-600"
                              >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة صورة جديدة
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    عرض {(pagination.page - 1) * pagination.limit + 1} إلى{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    من {pagination.total} نتيجة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    السابق
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
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
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
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
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    التالي
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">عرض:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) =>
                      handlePageSizeChange(Number(value))
                    }
                  >
                    <SelectTrigger className="w-20 h-8">
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            // Cleanup preview URL
            if (previewUrl && !previewUrl.startsWith(API_BASE_URL)) {
              URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl("");
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "تعديل الصورة" : "إضافة صورة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {showEditDialog
                ? "قم بتعديل بيانات الصورة"
                : "أضف صورة جديدة للصفحة الرئيسية"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  عنوان الصورة
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="أدخل عنوان الصورة"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                وصف الصورة
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="أدخل وصف الصورة"
                rows={3}
                className="w-full"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    نشط
                  </Label>
                  <p className="text-xs text-gray-500">
                    هل الصورة نشطة ومتاحة للعرض؟
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label
                    htmlFor="isMainImage"
                    className="text-sm font-medium text-gray-700"
                  >
                    الصورة الرئيسية
                  </Label>
                  <p className="text-xs text-gray-500">
                    هل هذه الصورة الرئيسية للموقع؟
                  </p>
                </div>
                <Switch
                  id="isMainImage"
                  checked={formData.isMainImage}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMainImage: checked })
                  }
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                الصورة
              </Label>
              <div className="space-y-4">
                {/* File Input - Hidden when image is uploaded */}
                {!uploadedImage && (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploading
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <p className="mb-2 text-sm text-gray-500">
                              جاري رفع الصورة...
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                اضغط لاختيار صورة
                              </span>{" "}
                              أو اسحب وأفلت
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF حتى 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                )}

                {/* Preview */}
                {previewUrl && (
                  <div className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
                            <p className="font-medium">جاري رفع الصورة...</p>
                            <p className="text-sm opacity-80 mt-1">
                              يرجى الانتظار
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {uploadedImage && !uploading && (
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="default"
                          className="bg-green-500 text-white shadow-lg"
                        >
                          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                          تم الرفع بنجاح
                        </Badge>
                      </div>
                    )}

                    {/* Remove Button */}
                    {!uploading && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (uploadedImage?.id) {
                              setDeletingImage(true);
                              try {
                                // Delete image from server
                                await deleteImageFile(uploadedImage.id);
                                toast({
                                  title: "تم حذف الصورة",
                                  description: "تم حذف الصورة من الخادم بنجاح",
                                  variant: "default",
                                });
                              } catch (error) {
                                console.error("Error deleting image:", error);
                                toast({
                                  title: "فشل في حذف الصورة",
                                  description:
                                    "حدث خطأ أثناء حذف الصورة من الخادم",
                                  variant: "destructive",
                                });
                                // Still clear local state even if server deletion fails
                              } finally {
                                setDeletingImage(false);
                              }
                            }
                            // Clear local state
                            setSelectedFile(null);
                            setUploadedImage(null);
                            setPreviewUrl("");
                            // Reset file input
                            const fileInput = document.getElementById(
                              "image-upload"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          disabled={deletingImage}
                          className={`rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100 ${
                            deletingImage
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                          title={deletingImage ? "جاري الحذف..." : "حذف الصورة"}
                        >
                          {deletingImage ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (uploadedImage?.id) {
                              setDeletingImage(true);
                              try {
                                // Delete current image from server
                                await deleteImageFile(uploadedImage.id);
                                toast({
                                  title: "تم حذف الصورة",
                                  description: "تم حذف الصورة الحالية بنجاح",
                                  variant: "default",
                                });
                              } catch (error) {
                                console.error("Error deleting image:", error);
                                toast({
                                  title: "فشل في حذف الصورة",
                                  description:
                                    "حدث خطأ أثناء حذف الصورة الحالية",
                                  variant: "destructive",
                                });
                                // Still clear local state even if server deletion fails
                              } finally {
                                setDeletingImage(false);
                              }
                            }
                            // Clear local state
                            setSelectedFile(null);
                            setUploadedImage(null);
                            setPreviewUrl("");
                            // Reset file input
                            const fileInput = document.getElementById(
                              "image-upload"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          disabled={deletingImage}
                          className={`rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100 ${
                            deletingImage
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                          title={
                            deletingImage ? "جاري الحذف..." : "تغيير الصورة"
                          }
                        >
                          {deletingImage ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Image Info */}
                    {selectedFile && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="opacity-80">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
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
              هل أنت متأكد من حذف الصورة "{selectedItem?.title}"؟ لا يمكن
              التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الصورة</DialogTitle>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">جاري تحميل تفاصيل الصورة...</p>
              </div>
            </div>
          ) : selectedItem ? (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="flex justify-center">
                <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedItem.imageUrl || "/placeholder.svg"}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Image Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    العنوان
                  </Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedItem.title}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    الحالة
                  </Label>
                  <Badge
                    variant={selectedItem.isActive ? "default" : "secondary"}
                    className={
                      selectedItem.isActive ? "bg-green-500" : "bg-gray-500"
                    }
                  >
                    {selectedItem.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    النوع
                  </Label>
                  <Badge
                    variant={selectedItem.isMainImage ? "default" : "outline"}
                    className={selectedItem.isMainImage ? "bg-blue-500" : ""}
                  >
                    {selectedItem.isMainImage ? "رئيسية" : "سلايدر"}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  الوصف
                </Label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
