"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  Heart,
  BarChart3,
  Award,
  Calendar,
  Clock,
  Star,
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GalleryUpload } from "@/components/shared/gallery-upload";
import { TagInput } from "@/components/shared/tag-input";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { useCategories } from "@/hooks/use-categories";
import { toBackendUrl } from "@/lib/utils";
import { CategoryManager } from "@/components/shared/category-manager";
import { useActivities, Activity } from "@/hooks/use-activities";
import { activitiesApi } from "@/lib/activities";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface NewsActivity {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: "news" | "activity";
  category: string;
  status: "published" | "draft" | "scheduled";
  author: string;
  publishDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  imageUrl: string;
  mainImage?: { file?: File; url: string };
  gallery?: Array<{ file?: File; url: string; title?: string }>;
  tags: string[];
  views: number;
  featured: boolean;
  createdAt: string;
}

// Move status config outside component to prevent recreation
const STATUS_CONFIG = {
  published: {
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
    label: "منشور",
  },
  draft: {
    variant: "outline" as const,
    color: "bg-gray-100 text-gray-800",
    label: "مسودة",
  },
  scheduled: {
    variant: "outline" as const,
    color: "bg-purple-100 text-purple-800",
    label: "مجدول",
  },
} as const;

// Memoized Stats Card Component
const StatsCard = React.memo(
  ({
    title,
    value,
    icon: Icon,
    iconBgColor,
    iconColor,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    iconBgColor: string;
    iconColor: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

StatsCard.displayName = "StatsCard";

// Memoized News Activity Item Component
const NewsActivityItem = React.memo(
  ({
    item,
    onView,
    onEdit,
    onDelete,
    StatusBadge,
  }: {
    item: NewsActivity;
    onView: (item: NewsActivity) => void;
    onEdit: (item: NewsActivity) => void;
    onDelete: (item: NewsActivity) => void;
    StatusBadge: React.ComponentType<{ status: string }>;
  }) => (
    <div className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={toBackendUrl(item.imageUrl) || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg truncate pr-4">{item.title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge
              className={item.type === "news" ? "bg-blue-500" : "bg-green-500"}
            >
              {item.type === "news" ? "خبر" : "نشاط"}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
            <StatusBadge status={item.status} />
            {item.featured && (
              <Badge className="bg-orange-500">
                <Star className="w-3 h-3 mr-1" />
                مميز
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.summary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>بواسطة: {item.author}</span>
            <span>
              {item.status === "scheduled" ? (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>مجدول: {item.scheduledDate}</span>
                  <Clock className="w-4 h-4" />
                  <span>{item.scheduledTime}</span>
                </div>
              ) : (
                `تاريخ النشر: ${item.publishDate}`
              )}
            </span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{item.views}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="w-4 h-4 mr-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4 mr-2" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
);

NewsActivityItem.displayName = "NewsActivityItem";

// Memoized Featured News Card Component
const FeaturedNewsCard = React.memo(
  ({
    item,
    onView,
    onEdit,
    onDelete,
  }: {
    item: NewsActivity;
    onView: (item: NewsActivity) => void;
    onEdit: (item: NewsActivity) => void;
    onDelete: (item: NewsActivity) => void;
  }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video">
        <img
          src={toBackendUrl(item.imageUrl) || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            className={item.type === "news" ? "bg-blue-500" : "bg-green-500"}
          >
            {item.type === "news" ? "خبر" : "نشاط"}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white">
            {item.category}
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-orange-500">
            <Star className="w-3 h-3 mr-1" />
            مميز
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{item.author}</span>
          <span>{item.publishDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{item.views}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="w-4 h-4 mr-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4 mr-2" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item)}>
                <Trash2 className="w-4 h-4 mr-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
);

FeaturedNewsCard.displayName = "FeaturedNewsCard";

// Memoized Form Field Component
const FormField = React.memo(
  ({
    label,
    children,
    required = false,
  }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()}>
        {label} {required && "*"}
      </Label>
      {children}
    </div>
  )
);

FormField.displayName = "FormField";

export default function NewsActivitiesPage() {
  const { byModule, refreshCategories } = useCategories();
  const naCategories = byModule("news-activities");
  const { toast } = useToast();
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    pagination,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivity,
    uploadImage,
    uploadImages,
  } = useActivities();

  useEffect(() => {
    refreshCategories("news-activities");
  }, [refreshCategories]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Activity[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsActivity | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<NewsActivity>>({});
  const [formImages, setFormImages] = useState<
    Array<{ url: string; title: string; file?: File; fileId?: string }>
  >([]);
  const [formGallery, setFormGallery] = useState<
    Array<{ url: string; title: string; file?: File; fileId?: string }>
  >([]);
  const [formTags, setFormTags] = useState<string[]>([]);

  // Memoized status badge component
  const StatusBadge = useCallback(({ status }: { status: string }) => {
    const config =
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.published;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  }, []);

  // Convert API activities to local format
  const newsActivities = useMemo(
    () =>
      activities.map((activity: Activity) => ({
        id: activity._id,
        title: activity.name,
        content: activity.content,
        summary: activity.description,
        type: (activity.type === "new" ? "news" : activity.type) as
          | "news"
          | "activity",
        category: activity.category?.name || "",
        status: activity.status as "published" | "draft" | "scheduled",
        author:
          (activity as any).author || (activity as any).created_by?.name || "",
        publishDate: new Date(activity.createdAt).toISOString().split("T")[0],
        scheduledDate: activity.scheduledAt
          ? new Date(activity.scheduledAt).toISOString().split("T")[0]
          : undefined,
        scheduledTime: activity.scheduledAt
          ? new Date(activity.scheduledAt).toTimeString().split(" ")[0]
          : undefined,
        imageUrl:
          typeof activity.coverImage === "string"
            ? toBackendUrl(`/upload/file/${activity.coverImage}`)
            : toBackendUrl(activity.coverImage?.url) || "/placeholder.svg",
        mainImage:
          typeof activity.coverImage === "string"
            ? {
                url: `/upload/file/${activity.coverImage}`,
                title: String(activity.coverImage),
              }
            : activity.coverImage
            ? {
                url: activity.coverImage.url,
                title:
                  (activity.coverImage as any)._id ||
                  (activity.coverImage as any).fileName,
              }
            : undefined,
        gallery:
          activity.gallery?.map((img: any) => ({
            url: toBackendUrl(
              img.url?.startsWith("/") ? img.url : `/${img.url}`
            ),
            title: img.title ?? img._id ?? img.fileName,
          })) || [],
        tags: activity.keywords || [],
        views: 0, // API doesn't provide views yet
        featured: activity.isSpecial,
        createdAt: new Date(activity.createdAt).toISOString().split("T")[0],
      })),
    [activities]
  );

  const filteredNewsActivities = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return newsActivities.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(s) ||
        item.content.toLowerCase().includes(s) ||
        item.summary.toLowerCase().includes(s);
      const matchesStatus =
        filterStatus === "all" || item.status === filterStatus;
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [newsActivities, searchTerm, filterStatus, filterType]);

  // Map featuredItems from API into local shape and always show all
  const featuredNews = useMemo(
    () =>
      featuredItems.map((activity: Activity) => ({
        id: activity._id,
        title: activity.name,
        content: activity.content,
        summary: activity.description,
        type: (activity.type === "new" ? "news" : activity.type) as
          | "news"
          | "activity",
        category: activity.category?.name || "",
        status: activity.status as "published" | "draft" | "scheduled",
        author:
          (activity as any).author || (activity as any).created_by?.name || "",
        publishDate: new Date(activity.createdAt).toISOString().split("T")[0],
        scheduledDate: activity.scheduledAt
          ? new Date(activity.scheduledAt).toISOString().split("T")[0]
          : undefined,
        scheduledTime: activity.scheduledAt
          ? new Date(activity.scheduledAt).toTimeString().split(" ")[0]
          : undefined,
        imageUrl:
          typeof activity.coverImage === "string"
            ? toBackendUrl(`/upload/file/${activity.coverImage}`)
            : toBackendUrl(activity.coverImage?.url) || "/placeholder.svg",
        mainImage:
          typeof activity.coverImage === "string"
            ? {
                url: `/upload/file/${activity.coverImage}`,
                title: String(activity.coverImage),
              }
            : activity.coverImage
            ? {
                url: activity.coverImage.url,
                title:
                  (activity.coverImage as any)._id ||
                  (activity.coverImage as any).fileName,
              }
            : undefined,
        gallery:
          activity.gallery?.map((img: any) => ({
            url: toBackendUrl(
              img.url?.startsWith("/") ? img.url : `/${img.url}`
            ),
            title: img.title ?? img._id ?? img.fileName,
          })) || [],
        tags: activity.keywords || [],
        views: (activity as any).numberOfViews || 0,
        featured: activity.isSpecial,
        createdAt: new Date(activity.createdAt).toISOString().split("T")[0],
      })),
    [featuredItems]
  );

  // Dedicated fetch for featured items
  const refreshFeatured = useCallback(async () => {
    try {
      const res = await activitiesApi.getAll({
        isSpecial: true,
        limit: 1000,
        page: 1,
      });
      // اعرض جميع العناصر المميزة بغض النظر عن حالة النشر
      setFeaturedItems(res.data.activities);
    } catch (e) {
      console.error("Failed to load featured items", e);
    }
  }, []);

  // Load featured on mount
  useEffect(() => {
    refreshFeatured();
  }, [refreshFeatured]);

  // Optimized form update handlers
  const updateFormField = useCallback(
    (field: keyof NewsActivity, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAdd = useCallback(async () => {
    await refreshCategories("news-activities");
    setFormData({
      type: "news",
      status: "draft",
      featured: false,
      views: 0,
      publishDate: new Date().toISOString().split("T")[0],
    });
    setFormImages([]);
    setFormGallery([]);
    setFormTags([]);
    setShowAddDialog(true);
  }, [refreshCategories]);

  const handleEdit = async (item: NewsActivity) => {
    setLoading(true);
    try {
      const res = await getActivity(item.id);
      const act: any = res;

      // Map backend activity to formData
      const mappedType = act.type === "new" ? "news" : act.type || "news";
      const scheduledDate = act.scheduledAt
        ? new Date(act.scheduledAt).toISOString().split("T")[0]
        : undefined;
      const scheduledTime = act.scheduledAt
        ? new Date(act.scheduledAt).toTimeString().split(" ")[0]
        : undefined;

      setFormData({
        id: act._id,
        title: act.name || "",
        content: act.content || "",
        summary: act.description || "",
        type: mappedType,
        category: act.category?._id || "",
        status: act.status || "draft",
        author: act.author || "",
        publishDate: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
        scheduledDate,
        scheduledTime,
        featured: !!act.isSpecial,
        tags: act.keywords || [],
        imageUrl: "",
        mainImage: undefined,
        gallery: [],
        views: act.numberOfViews || 0,
        createdAt: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
      } as any);

      // Normalize cover image
      const cover: { url: string; title: string; file?: File } | undefined =
        (() => {
          if (!act.coverImage) return undefined;
          if (typeof act.coverImage === "string") {
            return {
              url: toBackendUrl(`/upload/file/${act.coverImage}`),
              title: String(act.coverImage),
            };
          }
          return {
            url: toBackendUrl(act.coverImage.url),
            title: act.coverImage._id || act.coverImage.fileName,
          };
        })();

      setFormImages(cover ? [cover] : []);

      // Normalize gallery
      const gal = (act.gallery || []).map((img: any) => ({
        url: toBackendUrl(img.url?.startsWith("/") ? img.url : `/${img.url}`),
        // Keep server id separately
        fileId: String(img._id || img.fileName),
        // Prefill with server-provided title if available
        title: img.title || "",
      }));
      setFormGallery(gal);
      setFormTags(act.keywords || []);

      setSelectedItem({
        id: act._id,
        title: act.name,
        content: act.content,
        summary: act.description,
        type: mappedType,
        category: act.category?.name || "",
        status: act.status,
        author: act.author,
        publishDate: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
        scheduledDate,
        scheduledTime,
        imageUrl: cover ? cover.url : "/placeholder.svg",
        mainImage: cover,
        gallery: gal,
        tags: act.keywords || [],
        views: act.numberOfViews || 0,
        featured: !!act.isSpecial,
        createdAt: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
      });

      setShowEditDialog(true);
    } catch (e) {
      console.error("Failed to load activity details", e);
      toast({
        title: "خطأ",
        description: "تعذر تحميل بيانات النشاط",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback((item: NewsActivity) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  }, []);

  const handleView = async (item: NewsActivity) => {
    setLoading(true);
    try {
      const res = await getActivity(item.id);
      const act: any = res;

      const mappedType = act.type === "new" ? "news" : act.type || "news";
      const scheduledDate = act.scheduledAt
        ? new Date(act.scheduledAt).toISOString().split("T")[0]
        : undefined;
      const scheduledTime = act.scheduledAt
        ? new Date(act.scheduledAt).toTimeString().split(" ")[0]
        : undefined;

      // Cover image
      const coverUrl = act.coverImage
        ? typeof act.coverImage === "string"
          ? toBackendUrl(`/upload/file/${act.coverImage}`)
          : toBackendUrl(act.coverImage.url)
        : "/placeholder.svg";

      // Gallery
      const gal = (act.gallery || []).map((img: any) => ({
        url: toBackendUrl(img.url?.startsWith("/") ? img.url : `/${img.url}`),
        title: img.title || "",
      }));

      const normalized: NewsActivity = {
        id: act._id,
        title: act.name,
        content: act.content,
        summary: act.description,
        type: mappedType,
        category: act.category?.name || "",
        status: act.status,
        author: act.author || act.created_by?.name || "",
        publishDate: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
        scheduledDate,
        scheduledTime,
        imageUrl: coverUrl,
        mainImage: coverUrl ? ({ url: coverUrl } as any) : undefined,
        gallery: gal as any,
        tags: act.keywords || [],
        views: act.numberOfViews || 0,
        featured: !!act.isSpecial,
        createdAt: act.createdAt
          ? new Date(act.createdAt).toISOString().split("T")[0]
          : "",
      };
      setSelectedItem(normalized);
      setShowDetailsDialog(true);
    } catch (e) {
      console.error("Failed to load activity details for view", e);
      toast({
        title: "خطأ",
        description: "تعذر تحميل تفاصيل النشاط",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Basic validation according to backend requirements
      if (!formData.category || String(formData.category).trim() === "") {
        toast({
          title: "خطأ",
          description: "الفئة مطلوبة",
          variant: "destructive",
        });
        return;
      }

      // Prepare activity data for API
      // Images are already uploaded when selected
      const coverImageFileName =
        formImages.length > 0 ? formImages[0].title : undefined;

      const galleryItems = formGallery.map((img) => ({
        fileId: (img as any).fileId || img.title,
        title: img.title || undefined,
      }));

      // Format scheduled_time to HH:mm if provided
      let formattedScheduledTime = undefined;
      if (formData.status === "scheduled" && formData.scheduledTime) {
        // Ensure time is in HH:mm format
        const timeParts = formData.scheduledTime.split(":");
        if (timeParts.length >= 2) {
          const hours = timeParts[0].padStart(2, "0");
          const minutes = timeParts[1].padStart(2, "0");
          formattedScheduledTime = `${hours}:${minutes}`;
        } else {
          formattedScheduledTime = formData.scheduledTime;
        }
      }

      const activityData: any = {
        name: formData.title || "",
        coverImage: coverImageFileName,
        // Map UI type to backend accepted values: news -> new
        type: (formData.type || "news") === "news" ? "new" : "activity",
        category: formData.category || "",
        author: formData.author || "",
        status: formData.status || "draft",
        scheduled_date:
          formData.status === "scheduled" && formData.scheduledDate
            ? formData.scheduledDate
            : undefined,
        scheduled_time: formattedScheduledTime,
        description: formData.summary || "",
        content: formData.content || "",
        createdAt: new Date().toISOString().split("T")[0],
        // Backend expects gallery objects with fileId on create
        gallery: galleryItems.length > 0 ? galleryItems : undefined,
        keywords: formTags && formTags.length ? formTags : undefined,
        isSpecial: !!formData.featured,
      };

      if (showEditDialog && selectedItem) {
        // Update existing activity (gallery as array of objects per backend)
        const updatePayload = {
          ...activityData,
          gallery:
            activityData.gallery && (activityData.gallery as any[]).length
              ? (activityData.gallery as any[]).map((g: any) => ({
                  fileId: g.fileId,
                  title: g.title || undefined,
                }))
              : undefined,
        };
        await updateActivity(selectedItem.id, updatePayload);
      } else {
        // Create new activity
        await createActivity(activityData);
      }

      setShowAddDialog(false);
      setShowEditDialog(false);

      // Reset form
      setFormData({});
      setFormImages([]);
      setFormGallery([]);
      setFormTags([]);
      // Refresh featured after save
      refreshFeatured();
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      await deleteActivity(selectedItem.id);
      setShowDeleteDialog(false);
      setSelectedItem(null);
      // Refresh featured after delete
      refreshFeatured();
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = useCallback(() => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setSelectedItem(null);
    setFormData({});
    setFormImages([]);
    setFormGallery([]);
    setFormTags([]);
  }, []);

  // Handle cover image upload
  const handleCoverImageUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setUploadingCoverImage(true);
      try {
        // Take only the first file for cover image
        const file = files[0];
        const uploadedImage = await uploadImage(file);
        const fileId =
          (uploadedImage.data as any).id ||
          (uploadedImage.data as any)._id ||
          uploadedImage.data.fileName;
        setFormImages([
          {
            url: toBackendUrl(uploadedImage.data.url),
            title: String(fileId), // Keep server identifier for delete
            file: file,
          },
        ]);
        toast({
          title: "نجح",
          description: "تم رفع صورة الغلاف بنجاح",
        });
      } catch (error) {
        console.error("Error uploading cover image:", error);
        toast({
          title: "خطأ",
          description: "فشل في رفع صورة الغلاف",
          variant: "destructive",
        });
      } finally {
        setUploadingCoverImage(false);
      }
    },
    [uploadImage, toast]
  );

  // Handle gallery images upload
  const handleGalleryImagesUpload = useCallback(
    async (files: File[]) => {
      setUploadingGalleryImages(true);
      try {
        const uploadedImages = await uploadImages(files);
        const newGalleryItems = uploadedImages.data.map((img, index) => {
          const fileId = (img as any).id || (img as any)._id || img.fileName;
          return {
            url: toBackendUrl(img.url),
            title: "", // user can type, will be sent in payload
            fileId: String(fileId),
            file: files[index],
          };
        });
        setFormGallery((prev) => [...prev, ...newGalleryItems]);
        toast({
          title: "نجح",
          description: `تم رفع ${files.length} صورة بنجاح`,
        });
      } catch (error) {
        console.error("Error uploading gallery images:", error);
      } finally {
        setUploadingGalleryImages(false);
      }
    },
    [uploadImages, toast]
  );

  // Delete single image by server fileId (fileName) when clicking X in edit dialog
  const handleRemoveUploadedImage = useCallback(
    async (index: number, isCover = false) => {
      try {
        if (isCover) {
          const fileId = formImages[0]?.title; // title holds server fileName
          if (fileId) {
            await activitiesApi.deleteImage(fileId);
          }
          setFormImages([]);
        } else {
          const fileId =
            (formGallery[index] as any)?.fileId || formGallery[index]?.title;
          if (fileId) {
            await activitiesApi.deleteImage(fileId);
          }
          setFormGallery((prev) => prev.filter((_, i) => i !== index));
        }
        toast({ title: "نجح", description: "تم حذف الصورة" });
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "خطأ",
          description: "فشل حذف الصورة",
          variant: "destructive",
        });
      }
    },
    [formImages, formGallery, toast]
  );

  // Optimized filter handling with debouncing
  const debouncedFetch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (params: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchActivities(params);
        }, 300); // Reduced from 500ms to 300ms
      };
    })(),
    [fetchActivities]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType !== "all") params.type = filterType;
    if (filterStatus !== "all") params.status = filterStatus;
    if (featuredOnly) params.isSpecial = true;
    debouncedFetch(params);
  }, [searchTerm, filterType, filterStatus, featuredOnly, debouncedFetch]);

  // Debounced search effect - optimized
  useEffect(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  // Memoized handlers for better performance
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleFilterTypeChange = useCallback((value: string) => {
    setFilterType(value);
  }, []);

  const handleFilterStatusChange = useCallback((value: string) => {
    setFilterStatus(value);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFeaturedOnly(false);
    fetchActivities();
  }, [fetchActivities]);

  const handleFeaturedFilter = useCallback(() => {
    setFeaturedOnly((prev) => {
      const next = !prev;
      if (next) {
        fetchActivities({ isSpecial: true });
      } else {
        fetchActivities();
      }
      refreshFeatured();
      return next;
    });
  }, [fetchActivities, refreshFeatured]);

  const handleRefresh = useCallback(() => {
    setFeaturedOnly(false);
    fetchActivities();
    refreshFeatured();
  }, [fetchActivities, refreshFeatured]);

  const handleCategoriesDialog = useCallback(() => {
    setShowCategoriesDialog(true);
  }, []);

  // Memoized pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      fetchActivities({ page });
    },
    [fetchActivities]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      fetchActivities({ limit, page: 1 });
    },
    [fetchActivities]
  );

  // Memoized pagination info
  const paginationInfo = useMemo(
    () => ({
      start: (pagination.page - 1) * pagination.limit + 1,
      end: Math.min(pagination.page * pagination.limit, pagination.total),
      total: pagination.total,
      page: pagination.page,
      totalPages: pagination.totalPages,
    }),
    [pagination]
  );

  // Memoized pagination buttons
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = Math.min(5, pagination.totalPages);

    for (let i = 1; i <= maxButtons; i++) {
      buttons.push(
        <Button
          key={i}
          variant={pagination.page === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={pagination.page === i ? "btn-primary" : ""}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  }, [pagination.page, pagination.totalPages, handlePageChange]);

  return (
    <>
      <DashboardLayout
        title="الأخبار والأنشطة"
        description="إدارة أخبار الجمعية وأنشطتها المختلفة"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                إضافة خبر/نشاط جديد
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={activitiesLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    activitiesLoading ? "animate-spin" : ""
                  }`}
                />
                تحديث
              </Button>
            </div>
            <Button variant="outline" onClick={handleCategoriesDialog}>
              إدارة الفئات
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="إجمالي الأخبار"
              value={useMemo(
                () =>
                  newsActivities.filter((item) => item.type === "news").length,
                [newsActivities]
              )}
              icon={FileText}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatsCard
              title="إجمالي الأنشطة"
              value={useMemo(
                () =>
                  newsActivities.filter((item) => item.type === "activity")
                    .length,
                [newsActivities]
              )}
              icon={Heart}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <StatsCard
              title="المحتوى المنشور"
              value={useMemo(
                () =>
                  newsActivities.filter((item) => item.status === "published")
                    .length,
                [newsActivities]
              )}
              icon={Eye}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />

            <StatsCard
              title="إجمالي المشاهدات"
              value={useMemo(
                () =>
                  newsActivities
                    .reduce((sum, item) => sum + item.views, 0)
                    .toLocaleString(),
                [newsActivities]
              )}
              icon={BarChart3}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* Featured News */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                الأخبار المميزة
              </CardTitle>
              <CardDescription>أهم الأخبار والأنشطة المميزة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredNews.map((item) => (
                  <FeaturedNewsCard
                    key={item.id}
                    item={item}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث في الأخبار والأنشطة..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  value={filterType}
                  onValueChange={handleFilterTypeChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="فلترة حسب النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="news">أخبار</SelectItem>
                    <SelectItem value="activity">أنشطة</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={handleFilterStatusChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="scheduled">مجدول</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={(value) => handleLimitChange(parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="عدد العناصر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                {/* Removed advanced filters button as requested */}
                <Button
                  variant={featuredOnly ? "default" : "outline"}
                  onClick={handleFeaturedFilter}
                >
                  <Star className="w-4 h-4 mr-2" />
                  المميزة فقط
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {activitiesError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-sm font-medium">
                    خطأ في تحميل البيانات:
                  </span>
                  <span className="text-sm">{activitiesError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mr-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {activitiesLoading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>جاري تحميل البيانات...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* News & Activities List */}
          <Card>
            <CardHeader>
              <CardTitle>جميع الأخبار والأنشطة ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNewsActivities.length === 0 && !activitiesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">
                        لا توجد نتائج
                      </h3>
                      <p className="text-sm">
                        {searchTerm ||
                        filterType !== "all" ||
                        filterStatus !== "all"
                          ? "جرب تغيير معايير البحث أو الفلترة"
                          : "لم يتم العثور على أي أخبار أو أنشطة بعد"}
                      </p>
                    </div>
                    {(searchTerm ||
                      filterType !== "all" ||
                      filterStatus !== "all") && (
                      <Button variant="outline" onClick={handleResetFilters}>
                        إعادة تعيين الفلاتر
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredNewsActivities.map((item) => (
                    <NewsActivityItem
                      key={item.id}
                      item={item}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      StatusBadge={StatusBadge}
                    />
                  ))
                )}
              </div>

              {/* Pagination Info */}
              {pagination.total > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      عرض {paginationInfo.start} إلى {paginationInfo.end} من{" "}
                      {paginationInfo.total} نتيجة
                    </span>
                    <span>
                      الصفحة {paginationInfo.page} من{" "}
                      {paginationInfo.totalPages}
                    </span>
                  </div>

                  {/* Pagination Buttons */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        السابق
                      </Button>

                      {paginationButtons}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        التالي
                      </Button>
                    </div>
                  )}
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
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto close-left">
            <DialogHeader dir="rtl" className="text-right items-end">
              <DialogTitle className="w-full text-right">
                {showEditDialog ? "تعديل" : "إضافة"}{" "}
                {formData.type === "news" ? "خبر" : "نشاط"}
              </DialogTitle>
              <DialogDescription className="w-full text-right">
                {showEditDialog ? "قم بتعديل بيانات" : "أضف"}{" "}
                {formData.type === "news" ? "الخبر" : "النشاط"}
              </DialogDescription>
            </DialogHeader>

            <div dir="rtl" className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="العنوان" required>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => updateFormField("title", e.target.value)}
                    placeholder="أدخل عنوان الخبر/النشاط"
                  />
                </FormField>

                <FormField label="النوع" required>
                  <Select
                    value={formData.type || "news"}
                    onValueChange={(value) =>
                      updateFormField("type", value as "news" | "activity")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">خبر</SelectItem>
                      <SelectItem value="activity">نشاط</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="الفئة" required>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) =>
                      updateFormField("category", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {naCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="الكاتب" required>
                  <Input
                    id="author"
                    value={formData.author || ""}
                    onChange={(e) => updateFormField("author", e.target.value)}
                    placeholder="أدخل اسم الكاتب"
                  />
                </FormField>

                <FormField label="الحالة" required>
                  <Select
                    value={formData.status || "draft"}
                    onValueChange={(value) =>
                      updateFormField("status", value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="تاريخ النشر" required>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate || ""}
                    onChange={(e) =>
                      updateFormField("publishDate", e.target.value)
                    }
                  />
                </FormField>
              </div>

              {/* Scheduled Date/Time */}
              {formData.status === "scheduled" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <FormField label="تاريخ الجدولة" required>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate || ""}
                      onChange={(e) =>
                        updateFormField("scheduledDate", e.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="وقت الجدولة" required>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime || ""}
                      onChange={(e) =>
                        updateFormField("scheduledTime", e.target.value)
                      }
                    />
                  </FormField>
                </div>
              )}

              <FormField label="الملخص" required>
                <Textarea
                  id="summary"
                  value={formData.summary || ""}
                  onChange={(e) => updateFormField("summary", e.target.value)}
                  placeholder="أدخل ملخص مختصر للخبر/النشاط"
                  rows={3}
                />
              </FormField>

              <FormField label="المحتوى" required>
                <RichTextEditor
                  key={
                    (showEditDialog && (selectedItem?.id || "edit")) || "add"
                  }
                  value={formData.content || ""}
                  onChange={(value) => updateFormField("content", value)}
                  placeholder="أدخل محتوى الخبر/النشاط..."
                />
              </FormField>

              <FormField label="الكلمات المفتاحية">
                <TagInput
                  tags={formTags}
                  onChange={setFormTags}
                  placeholder="أضف كلمة مفتاحية واضغط Enter"
                />
              </FormField>

              <FormField label="الصورة الرئيسية" required>
                <GalleryUpload
                  currentImages={formImages}
                  onImagesChange={setFormImages}
                  maxImages={1}
                  hideTitles
                  onUpload={handleCoverImageUpload}
                  uploading={uploadingCoverImage}
                  onRemove={async () => {
                    await handleRemoveUploadedImage(0, true);
                  }}
                />
              </FormField>

              <FormField label="معرض الصور (اختياري)">
                <GalleryUpload
                  currentImages={formGallery}
                  onImagesChange={setFormGallery}
                  maxImages={10}
                  onUpload={handleGalleryImagesUpload}
                  uploading={uploadingGalleryImages}
                  onRemove={async (index) => {
                    await handleRemoveUploadedImage(index, false);
                  }}
                />
              </FormField>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) =>
                    updateFormField("featured", checked)
                  }
                />
                <Label htmlFor="featured">مميز</Label>
              </div>
            </div>

            <DialogFooter className="justify-start">
              <Button variant="outline" onClick={handleCloseDialog}>
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
                هل أنت متأكد من حذف "{selectedItem?.title}"؟ لا يمكن التراجع عن
                هذا الإجراء.
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto close-left">
            <DialogHeader className="text-right">
              <DialogTitle>
                تفاصيل {selectedItem?.type === "news" ? "الخبر" : "النشاط"}
              </DialogTitle>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={
                      toBackendUrl(selectedItem.imageUrl) || "/placeholder.svg"
                    }
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    className={
                      selectedItem.type === "news"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }
                  >
                    {selectedItem.type === "news" ? "خبر" : "نشاط"}
                  </Badge>
                  <Badge variant="outline">{selectedItem.category}</Badge>
                  {StatusBadge({ status: selectedItem.status })}
                  {selectedItem.featured && (
                    <Badge className="bg-orange-500">
                      <Star className="w-3 h-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-2xl mb-4">
                  {selectedItem.title}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">الكاتب:</span>{" "}
                    {selectedItem.author}
                  </div>
                  <div>
                    <span className="font-medium">تاريخ النشر:</span>{" "}
                    {selectedItem.publishDate}
                  </div>
                  <div>
                    <span className="font-medium">المشاهدات:</span>{" "}
                    {selectedItem.views}
                  </div>
                  <div>
                    <span className="font-medium">الحالة:</span>{" "}
                    {StatusBadge({ status: selectedItem.status })}
                  </div>
                </div>

                {selectedItem.summary && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">الملخص:</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedItem.summary}
                    </p>
                  </div>
                )}

                <div className="max-w-none">
                  <h4 className="font-bold mb-2">المحتوى:</h4>
                  <div className="ql-snow">
                    <div
                      className="ql-editor"
                      dir={
                        (/[\u0600-\u06FF]/.test(selectedItem.content || "")
                          ? "rtl"
                          : "ltr") as any
                      }
                      dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                    />
                  </div>
                </div>

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-2">الكلمات المفتاحية:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.gallery && selectedItem.gallery.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-3">معرض الصور:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.gallery.map((image: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <img
                              src={
                                toBackendUrl(image.url) || "/placeholder.svg"
                              }
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 text-center">
                            {image.title && String(image.title).trim() !== ""
                              ? image.title
                              : "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="justify-start">
              <Button onClick={() => setShowDetailsDialog(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
      {/* Category Manager Dialog */}
      <Dialog
        open={showCategoriesDialog}
        onOpenChange={setShowCategoriesDialog}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>إدارة فئات الأخبار والأنشطة</DialogTitle>
          </DialogHeader>
          <CategoryManager
            module="news-activities"
            inUseNames={[...new Set(newsActivities.map((n) => n.category))]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
