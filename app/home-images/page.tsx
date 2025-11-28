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
import { DynamicButton } from "@/components/ui/dynamic-button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
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
import {
  SliderImage,
  CreateSliderImageRequest,
  UpdateSliderImageRequest,
} from "@/lib/slider-images";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function HomeImagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

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

  // Set page loaded state after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredImages = (sliderImages || []).filter((image) => {
    if (!image) return false;
    if (!normalizedSearch) return true;
    const titleMatch = image.title
      ?.toLowerCase()
      .includes(normalizedSearch);
    const descriptionMatch = image.description
      ?.toLowerCase()
      .includes(normalizedSearch);
    return Boolean(titleMatch || descriptionMatch);
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
      title: item.title || "",
      description: item.description || "",
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

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    try {
      if (showEditDialog && selectedItem) {
        const updatePayload: UpdateSliderImageRequest = {
          image: uploadedImage.id,
          isActive: formData.isActive,
          isMainImage: formData.isMainImage,
          title: trimmedTitle,
          description: trimmedDescription,
        };

        // Update existing image
        await updateExistingSliderImage(selectedItem._id, updatePayload);

        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث الصورة بنجاح",
          variant: "default",
        });
      } else {
        const createPayload: CreateSliderImageRequest = {
          image: uploadedImage.id,
          isActive: formData.isActive,
          isMainImage: formData.isMainImage,
          title: trimmedTitle,
          description: trimmedDescription,
        };

        // Create new image
        await createNewSliderImage(createPayload);

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
      <div
        className={`space-y-6 transition-all duration-700 ease-out ${
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500 delay-100 ${
            isPageLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="flex gap-3">
            <DynamicButton
              onClick={handleAdd}
              className="btn-primary transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة صورة جديدة
            </DynamicButton>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className={`border-gray-300 hover:bg-gray-50 transform transition-all duration-300 hover:scale-105 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "جاري التحديث..." : "تحديث"}
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-600 delay-200 ${
            isPageLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          {/* Main Image Preview */}
          <Card className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DynamicIcon icon={Camera} className="w-5 h-5" />
                الصورة الرئيسية
              </CardTitle>
              <CardDescription>
                الصورة الرئيسية التي تظهر في أعلى الموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">
                      جاري تحميل الصورة الرئيسية...
                    </p>
                  </div>
                </div>
              ) : mainImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={mainImage.imageUrl || "/placeholder.svg"}
                      alt={mainImage.title || "home image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-lg">
                          {mainImage.title || "بدون عنوان"}
                        </h3>
                        <p className="text-sm opacity-90">
                          {mainImage.description || "لا يوجد وصف"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(mainImage)}
                      className="transform transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(mainImage)}
                      disabled={viewLoading}
                      className="transform transition-all duration-200 hover:scale-105 hover:shadow-md"
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
                    <DynamicButton
                      size="sm"
                      className="mt-2 btn-primary"
                      onClick={handleAdd}
                    >
                      إضافة صورة رئيسية
                    </DynamicButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slider Images Preview */}
          <Card className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DynamicIcon icon={ImageIcon} className="w-5 h-5" />
                صور السلايدر ({otherSliderImages.length})
              </CardTitle>
              <CardDescription>الصور التي تظهر في السلايدر</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">جاري تحميل صور السلايدر...</p>
                  </div>
                </div>
              ) : otherSliderImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {otherSliderImages.slice(0, 4).map((image) => (
                    <div
                      key={image._id}
                      className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.title || "slider image"}
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
        <Card
          className={`transform transition-all duration-500 delay-300 ${
            isPageLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث في الصور..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Table */}
        <Card
          className={`transform transition-all duration-600 delay-400 ${
            isPageLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
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
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600">جاري تحميل الصور...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredImages.length > 0 ? (
                    filteredImages.map((image, index) => (
                      <TableRow
                        key={image._id}
                        className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: isPageLoaded
                            ? "fadeInUp 0.5s ease-out forwards"
                            : "none",
                        }}
                      >
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
                              alt={image.title || "slider image"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium">
                              {image.title || "بدون عنوان"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {image.description || "لا يوجد وصف"}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="transform transition-all duration-200 hover:scale-110 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="transform transition-all duration-200"
                            >
                              <DropdownMenuItem
                                onClick={() => handleView(image)}
                                disabled={viewLoading}
                                className="transform transition-all duration-150 hover:scale-105 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                {viewLoading ? "جاري التحميل..." : "عرض"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(image)}
                                className="transform transition-all duration-150 hover:scale-105 hover:bg-green-50"
                              >
                                <Edit className="w-4 h-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(image)}
                                className="text-red-600 transform transition-all duration-150 hover:scale-105 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !loading ? (
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
                              <DynamicButton
                                onClick={handleAdd}
                                className="btn-primary"
                              >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة صورة جديدة
                              </DynamicButton>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
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
                    className="transform transition-all duration-200 hover:scale-105 hover:shadow-md"
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
                            className="w-8 h-8 p-0 transform transition-all duration-200 hover:scale-110 hover:shadow-md"
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
                    className="transform transition-all duration-200 hover:scale-105 hover:shadow-md"
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
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <DialogTitle className="text-center">
              {showEditDialog ? "تعديل الصورة" : "إضافة صورة جديدة"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {showEditDialog
                ? "قم بتعديل بيانات الصورة"
                : "أضف صورة جديدة للصفحة الرئيسية"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6" dir="rtl">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2 ">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 text-right block"
                >
                  عنوان الصورة (اختياري)
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="أدخل عنوان الصورة (اختياري)"
                  className="w-full text-right"
                />
                <p className="text-xs text-gray-500 text-right">
                  يمكن ترك العنوان فارغاً وسيُعرض النص الافتراضي "بدون عنوان"
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 text-right block"
              >
                وصف الصورة (اختياري)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="أدخل وصف الصورة (اختياري)"
                rows={3}
                className="w-full text-right"
              />
              <p className="text-xs text-gray-500 text-right">
                يمكن ترك الوصف فارغاً وسيُعرض النص الافتراضي "لا يوجد وصف"
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1 text-right">
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
                <div dir="ltr">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1 text-right">
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
                <div dir="ltr">
                  <Switch
                    id="isMainImage"
                    checked={formData.isMainImage}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isMainImage: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 text-right block">
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
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="default"
                          className="bg-green-500 text-white shadow-lg"
                        >
                          <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
                          تم الرفع بنجاح
                        </Badge>
                      </div>
                    )}

                    {/* Remove Button */}
                    {!uploading && (
                      <div className="absolute top-3 right-3 flex gap-2">
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
                      <div className="absolute bottom-3 right-3 left-3 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
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

          <DialogFooter className="flex justify-start gap-3" dir="rtl">
            <DynamicButton
              onClick={handleSave}
              disabled={loading || !uploadedImage}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الحفظ..." : "حفظ"}
            </DynamicButton>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
              }}
            >
              إلغاء
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
              هل أنت متأكد من حذف الصورة "
              {selectedItem?.title || "بدون عنوان"}"؟ لا يمكن
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <DynamicIcon icon={ImageIcon} className="w-6 h-6" />
              تفاصيل الصورة
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              عرض كامل تفاصيل الصورة المحددة
            </DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  جاري تحميل تفاصيل الصورة...
                </p>
                <p className="text-gray-400 text-sm mt-2">يرجى الانتظار</p>
              </div>
            </div>
          ) : selectedItem ? (
            <div className="space-y-8">
              {/* Hero Section with Image */}
              <div className="relative">
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  <img
                    src={selectedItem.imageUrl || "/placeholder.svg"}
                    alt={selectedItem.title || "slider image"}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  {/* Overlay with title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-white text-2xl font-bold mb-2">
                        {selectedItem.title || "بدون عنوان"}
                      </h2>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            selectedItem.isActive ? "default" : "secondary"
                          }
                          className={`${
                            selectedItem.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          } text-white`}
                        >
                          {selectedItem.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                        <Badge
                          variant={
                            selectedItem.isMainImage ? "default" : "outline"
                          }
                          className={`${
                            selectedItem.isMainImage
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          }`}
                        >
                          {selectedItem.isMainImage
                            ? "صورة رئيسية"
                            : "صورة سلايدر"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description Card */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 dynamic-primary rounded-full"></div>
                        وصف الصورة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-blue-100">
                        <p className="text-gray-700 leading-relaxed text-base">
                          {selectedItem.description || "لا يوجد وصف"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        حالة الصورة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100">
                        <span className="text-sm font-medium text-gray-700">
                          الحالة
                        </span>
                        <Badge
                          variant={
                            selectedItem.isActive ? "default" : "secondary"
                          }
                          className={`${
                            selectedItem.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          } text-white`}
                        >
                          {selectedItem.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100">
                        <span className="text-sm font-medium text-gray-700">
                          النوع
                        </span>
                        <Badge
                          variant={
                            selectedItem.isMainImage ? "default" : "outline"
                          }
                          className={`${
                            selectedItem.isMainImage
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          }`}
                        >
                          {selectedItem.isMainImage ? "رئيسية" : "سلايدر"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 dynamic-primary rounded-full"></div>
                        إجراءات سريعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <DynamicButton
                        onClick={() => {
                          setShowDetailsDialog(false);
                          handleEdit(selectedItem);
                        }}
                        className="w-full btn-primary"
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل الصورة
                      </DynamicButton>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Copy image URL to clipboard
                          navigator.clipboard.writeText(
                            selectedItem.imageUrl || ""
                          );
                          toast({
                            title: "تم نسخ الرابط",
                            description: "تم نسخ رابط الصورة إلى الحافظة",
                            variant: "default",
                          });
                        }}
                        className="w-full border-gray-300 hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        نسخ الرابط
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد بيانات
                </h3>
                <p className="text-gray-500">
                  لم يتم العثور على تفاصيل الصورة المطلوبة
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              إغلاق
            </Button>
            {selectedItem && (
              <DynamicButton
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleEdit(selectedItem);
                }}
                className="btn-primary"
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </DynamicButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
