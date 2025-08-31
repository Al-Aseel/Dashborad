# Slider Images API Integration

## نظرة عامة

تم إنشاء API integration كامل لإدارة صور السلايدر في صفحة home-images. يتضمن النظام رفع الصور وإنشاء وتعديل وحذف صور السلايدر.

## الملفات المُنشأة

### 1. `lib/slider-images.ts`

يحتوي على جميع الدوال للتعامل مع API endpoints:

- `uploadImage(file: File)`: رفع صورة إلى الخادم
- `deleteUploadedImage(imageId: string)`: حذف صورة من الخادم
- `createSliderImage(data)`: إنشاء صورة سلايدر جديدة
- `getAllSliderImages()`: جلب جميع صور السلايدر
- `getSliderImageById(id)`: جلب صورة سلايدر محددة
- `updateSliderImage(id, data)`: تحديث صورة سلايدر
- `deleteSliderImage(id)`: حذف صورة سلايدر

### 2. `hooks/use-slider-images.ts`

Hook مخصص لإدارة حالة صور السلايدر:

- إدارة حالة التحميل والرفع
- إدارة الأخطاء وعرض الرسائل
- تحديث القائمة تلقائياً
- إدارة token المصادقة

## سير العمل (Workflow)

### 1. رفع الصورة

```typescript
// 1. اختيار ملف - يتم الرفع تلقائياً
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file) {
    // إنشاء preview مؤقت
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    // رفع الصورة تلقائياً
    const result = await uploadImageFile(file);
    if (result) {
      setUploadedImage(result);
      setPreviewUrl(result.url); // تحديث بـ URL النهائي من API_BASE_URL
      URL.revokeObjectURL(tempUrl); // تنظيف الذاكرة
    }
  }
};
```

### 2. إنشاء صورة سلايدر

```typescript
// الصورة مرفوعة تلقائياً عند الاختيار
await createNewSliderImage({
  image: uploadedImage.id,
  title: formData.title,
  description: formData.description,
});
```

### 3. تحديث صورة سلايدر

```typescript
await updateExistingSliderImage(selectedItem._id, {
  image: uploadedImage.id,
  title: formData.title,
  description: formData.description,
});
```

### 4. حذف صورة سلايدر

```typescript
await deleteExistingSliderImage(selectedItem._id);
```

## API Endpoints

### رفع الصور

- **POST** `/upload/image`
  - Body: `FormData` مع ملف الصورة
  - Response: `{ id: string, url: string }`

### حذف الصور

- **DELETE** `/upload/file/:id`
  - Response: `{ status: string, message: string }`

### صور السلايدر

- **POST** `/slider-image` - إنشاء صورة جديدة
- **GET** `/slider-image` - جلب جميع الصور
- **GET** `/slider-image/:id` - جلب صورة محددة
- **PUT** `/slider-image/:id` - تحديث صورة
- **DELETE** `/slider-image/:id` - حذف صورة

## الميزات

### 1. رفع الصور

- دعم جميع أنواع الصور (image/\*)
- رفع تلقائي بمجرد اختيار الصورة
- عرض preview فوري مع حالة الرفع
- إدارة حالة الرفع (loading) مع overlay
- تنظيف الذاكرة تلقائياً

### 2. إدارة الصور

- عرض جميع صور السلايدر في جدول
- البحث في الصور
- عرض تفاصيل الصورة
- تعديل وحذف الصور

### 3. واجهة المستخدم

- تصميم متجاوب
- رسائل نجاح وخطأ
- حالات تحميل
- تنظيف الذاكرة تلقائياً

### 4. إدارة الأخطاء

- معالجة أخطاء الشبكة
- رسائل خطأ واضحة
- إعادة المحاولة التلقائية

## الاستخدام

```typescript
import { useSliderImages } from "@/hooks/use-slider-images";

function MyComponent() {
  const {
    sliderImages,
    loading,
    uploading,
    uploadImageFile,
    createNewSliderImage,
    updateExistingSliderImage,
    deleteExistingSliderImage,
  } = useSliderImages();

  // استخدام الدوال...
}
```

## ملاحظات مهمة

1. **Base URL**: يتم استخدام الجزء الأساسي من `NEXT_PUBLIC_API_BASE_URL` (مثل `http://localhost:5000`) من ملف `.env.local` كـ base URL للصور
2. **Token**: يتم إرسال token المصادقة تلقائياً مع كل طلب
3. **Memory Management**: يتم تنظيف preview URLs تلقائياً
4. **Error Handling**: معالجة شاملة للأخطاء مع رسائل واضحة
5. **Loading States**: إدارة حالات التحميل لتحسين UX
