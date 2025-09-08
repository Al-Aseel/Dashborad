"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverImageUpload } from "@/components/shared/cover-image-upload";
import { GalleryUpload } from "@/components/shared/gallery-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { useArrayManager } from "@/hooks/use-array-manager";
import { Plus, X, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useActivities } from "@/hooks/use-activities";
import { toBackendUrl } from "@/lib/utils";
import {
  Dialog as BaseDialog,
  DialogContent as BaseDialogContent,
  DialogHeader as BaseDialogHeader,
  DialogTitle as BaseDialogTitle,
} from "@/components/ui/dialog";
import { CategoryManager } from "@/components/shared/category-manager";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
  initialData?: any;
  title: string;
  isLoading?: boolean; // إضافة خاصية isLoading
}

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  isLoading = false,
}: ProjectFormProps) {
  const { byModule, refreshCategories } = useCategories();
  const { uploadImage, uploadImages, deleteUploadedImage } = useActivities();
  const projectCategories = byModule("projects");
  useEffect(() => {
    refreshCategories("projects");
  }, [refreshCategories]);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    location: string;
    category: string;
    topic: string;
    budget: string;
    beneficiaries: string;
    manager: string;
    startDate: string;
    endDate: string;
    status: string;
    details: string;
    mainImage: string | null;
    gallery: Array<{ url: string; title: string; fileId?: string }>;
  }>({
    name: "",
    description: "",
    location: "",
    category: "",
    topic: "",
    budget: "",
    beneficiaries: "",
    manager: "",
    startDate: "",
    endDate: "",
    status: "مخطط",
    details: "",
    mainImage: null,
    gallery: [],
  });
  const [coverFileId, setCoverFileId] = useState<string | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const {
    items: objectives,
    addItem: addObjective,
    removeItem: removeObjective,
    setItems: setObjectives,
  } = useArrayManager<string>([]);

  const {
    items: activities,
    addItem: addActivity,
    removeItem: removeActivity,
    setItems: setActivities,
  } = useArrayManager<string>([]);

  const [newObjective, setNewObjective] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          location: initialData.location || "",
          category: initialData.category || "",
          topic: initialData.topic || "",
          budget: initialData.budget || "",
          beneficiaries: initialData.beneficiaries || "",
          manager: initialData.manager || "",
          startDate: initialData.startDate || "",
          endDate: initialData.endDate || "",
          status: initialData.status || "مخطط",
          details: initialData.details || "",
          mainImage: initialData.mainImage
            ? toBackendUrl(initialData.mainImage)
            : null,
          gallery: Array.isArray(initialData.gallery)
            ? initialData.gallery.map((g: any) => ({
                ...g,
                url: toBackendUrl(g?.url),
              }))
            : [],
        });
        // Ensure existing cover image id is respected in edit mode
        setCoverFileId(initialData.coverFileId || null);
        setObjectives(initialData.objectives || []);
        setActivities(initialData.activities || []);
      } else {
        setFormData({
          name: "",
          description: "",
          location: "",
          category: "",
          topic: "",
          budget: "",
          beneficiaries: "",
          manager: "",
          startDate: "",
          endDate: "",
          status: "مخطط",
          details: "",
          mainImage: null,
          gallery: [],
        });
        setObjectives([]);
        setActivities([]);
      }
      setNewObjective("");
      setNewActivity("");
    }
  }, [isOpen, initialData, setObjectives, setActivities]);

  // Refresh categories when closing the categories manager dialog
  useEffect(() => {
    if (!showCategoriesDialog) {
      refreshCategories("projects");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCategoriesDialog]);

  // Upload handlers
  const handleCoverUpload = async (file: File) => {
    const res = await uploadImage(file);
    const data: any = res.data;
    const fileId = String(data?.id ?? data?._id ?? data?.fileName);
    setCoverFileId(fileId);
    if (data?.url) {
      setFormData((prev) => ({ ...prev, mainImage: toBackendUrl(data.url) }));
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    setUploadingGallery(true);
    try {
      const res = await uploadImages(files);
      const newItems = res.data.map((img: any, index: number) => ({
        url: toBackendUrl(img?.url) || URL.createObjectURL(files[index]),
        title: "",
        fileId: String(img?.id ?? img?._id ?? img?.fileName),
      }));
      setFormData((prev: any) => ({
        ...prev,
        gallery: [...prev.gallery, ...newItems],
      }));
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (index: number, image: any) => {
    try {
      const fileId = image?.fileId || image?.title;
      if (fileId) await deleteUploadedImage(fileId);
    } finally {
      setFormData((prev: any) => ({
        ...prev,
        gallery: prev.gallery.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate required fields (client-side)
    const errors: Record<string, string> = {};
    if (!formData.description?.trim()) {
      errors.description = "وصف البرنامج مطلوب";
    }
    if (!formData.location?.trim()) {
      errors.location = "موقع البرنامج مطلوب";
    } else if (formData.location.trim().length < 4) {
      errors.location = "موقع البرنامج يجب أن يكون أطول من ثلاث حروف";
    }
    if (!formData.startDate) {
      errors.startDate = "تاريخ البداية مطلوب";
    } else if (isNaN(new Date(formData.startDate).getTime())) {
      errors.startDate = "تاريخ البداية غير صالح";
    }
    if (!formData.endDate) {
      errors.endDate = "تاريخ النهاية مطلوب";
    } else if (isNaN(new Date(formData.endDate).getTime())) {
      errors.endDate = "تاريخ النهاية غير صالح";
    }
    const contentText = (formData.details || "").replace(/<[^>]*>/g, "").trim();
    if (!contentText) {
      errors.content = "المحتوى مطلوب";
    } else if (contentText.length < 7) {
      errors.content = "المحتوى يجب أن يكون أطول من 6 حروف";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await Promise.resolve(
        onSubmit({
          ...formData,
          objectives,
          activities,
          coverFileId,
        })
      );
    } catch (err: any) {
      // Map server-side validation errors if present
      const serverDetails: Array<{ param?: string; msg?: string }> =
        err?.response?.data?.details || [];
      if (Array.isArray(serverDetails) && serverDetails.length > 0) {
        const mapped: Record<string, string> = {};
        for (const d of serverDetails) {
          if (!d?.param || !d?.msg) continue;
          const key = d.param === "content" ? "content" : d.param;
          mapped[key] = d.msg;
        }
        setValidationErrors(mapped);
        return;
      }
      // Fallback: generic error
      setValidationErrors({ content: "حدث خطأ أثناء الإرسال" });
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      addObjective(newObjective.trim());
      setNewObjective("");
    }
  };

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      addActivity(newActivity.trim());
      setNewActivity("");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-center text-xl font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المشروع *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">المدير *</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manager: e.target.value,
                    }))
                  }
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="text-right"
                />
                {validationErrors.location && (
                  <p className="text-sm text-red-600">
                    {validationErrors.location}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoriesDialog(true)}
                    className="bg-transparent"
                  >
                    إدارة الفئات
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, budget: e.target.value }))
                  }
                  className="text-right"
                  placeholder="مثال: 100,000 دولار"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiaries">عدد المستفيدين</Label>
                <Input
                  id="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      beneficiaries: e.target.value,
                    }))
                  }
                  className="text-right"
                  placeholder="مثال: 500 مستفيد"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
                {validationErrors.startDate && (
                  <p className="text-sm text-red-600">
                    {validationErrors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
                {validationErrors.endDate && (
                  <p className="text-sm text-red-600">
                    {validationErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="text-right"
                rows={3}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>أهداف المشروع</Label>
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-right">{objective}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddObjective}
                    className="shrink-0 bg-transparent"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>
                  <Input
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddObjective())
                    }
                    placeholder="أدخل هدف المشروع"
                    className="text-right"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>الأنشطة الرئيسية</Label>
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <span className="flex-1 text-right">{activity}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddActivity}
                    className="shrink-0 bg-transparent"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>
                  <Input
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddActivity())
                    }
                    placeholder="أدخل النشاط الرئيسي"
                    className="text-right"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>تفاصيل المشروع</Label>
              <RichTextEditor
                value={formData.details}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, details: value }))
                }
              />
              {validationErrors.content && (
                <p className="text-sm text-red-600">
                  {validationErrors.content}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مخطط">مخطط</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <CoverImageUpload
                currentImage={formData.mainImage}
                onImageChange={(image) =>
                  setFormData((prev) => ({ ...prev, mainImage: image }))
                }
                onUpload={handleCoverUpload}
                label="الصورة الرئيسية للمشروع"
                required
              />
              {!coverFileId && (
                <p className="text-sm text-red-600">يرجى رفع صورة الغلاف</p>
              )}
            </div>

            <div className="space-y-2">
              <GalleryUpload
                currentImages={formData.gallery as any}
                onImagesChange={(gallery) =>
                  setFormData((prev) => ({ ...prev, gallery }))
                }
                label="معرض الصور (اختياري)"
                maxImages={10}
                onUpload={handleGalleryUpload}
                uploading={uploadingGallery}
                onRemove={handleRemoveGalleryImage}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading} // تعطيل زر الإلغاء أثناء التحميل
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading} // تعطيل زر الإرسال أثناء التحميل
                className="btn-primary hover:scale-105 transition-transform duration-200 ease-out"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {initialData ? "جاري التحديث..." : "جاري الإضافة..."}
                  </>
                ) : initialData ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Categories Manager for Projects */}
      <BaseDialog
        open={showCategoriesDialog}
        onOpenChange={setShowCategoriesDialog}
      >
        <BaseDialogContent className="max-w-xl">
          <BaseDialogHeader>
            <BaseDialogTitle>إدارة فئات المشاريع</BaseDialogTitle>
          </BaseDialogHeader>
          <CategoryManager module="projects" />
        </BaseDialogContent>
      </BaseDialog>
    </>
  );
}
