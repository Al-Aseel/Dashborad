# API Integration لصور الشركاء

## نظرة عامة
تم إنشاء API integration كامل لعمليات رفع وحذف صور الشركاء في النظام. يدعم النظام الآن:
- رفع الصور تلقائياً عند اختيارها
- حذف الصور من السيرفر
- تتبع معرفات الملفات
- التحقق من صحة الملفات
- ضغط الصور قبل الرفع

## الملفات المحدثة

### 1. `lib/partner-images.ts`
ملف جديد يحتوي على جميع دوال API لصور الشركاء:

#### الدوال المتاحة:
- `uploadPartnerImage(file: File)` - رفع صورة جديدة
- `deletePartnerImage(fileId: string)` - حذف صورة موجودة
- `extractPartnerImageId(response)` - استخراج معرف الملف من الاستجابة
- `isValidImageFile(file)` - التحقق من نوع الملف
- `isValidFileSize(file, maxSizeMB)` - التحقق من حجم الملف

#### Endpoints المستخدمة:
- **رفع الصورة**: `POST /upload/image`
- **حذف الصورة**: `DELETE /upload/file/{fileId}`

### 2. `components/shared/single-image-upload.tsx`
مكون محدث لرفع الصور مع دعم كامل لـ API:

#### الميزات الجديدة:
- رفع تلقائي للصور
- إدارة معرفات الملفات
- عرض حالة التحميل
- رسائل خطأ مناسبة
- دعم حذف الصور من السيرفر

#### Props الجديدة:
- `onFileIdChange` - callback لتتبع معرف الملف
- `currentFileId` - معرف الملف الحالي
- `autoUpload` - تفعيل/إلغاء الرفع التلقائي

### 3. `app/partners/page.tsx`
صفحة الشركاء محدثة مع دعم معرفات الملفات:

#### التحديثات:
- إضافة حقل `logoFileId` إلى واجهة `Partner`
- تحديث النماذج لتدعم معرفات الملفات
- إدارة الصور مع السيرفر

## كيفية الاستخدام

### 1. رفع صورة جديدة
```tsx
<SingleImageUpload
  currentImage={formData.logo}
  currentFileId={formData.logoFileId}
  onImageChange={(image) => setFormData(prev => ({ ...prev, logo: image }))}
  onFileIdChange={(fileId) => setFormData(prev => ({ ...prev, logoFileId: fileId || "" }))}
  label="اضغط لاختيار صورة"
  required
  autoUpload={true}
/>
```

### 2. رفع صورة يدوياً
```tsx
<SingleImageUpload
  // ... props أخرى
  autoUpload={false}
/>
```

### 3. استخدام API مباشرة
```tsx
import { uploadPartnerImage, deletePartnerImage } from '@/lib/partner-images';

// رفع صورة
const response = await uploadPartnerImage(file);
const fileId = extractPartnerImageId(response);

// حذف صورة
await deletePartnerImage(fileId);
```

## معالجة الأخطاء

### التحقق من نوع الملف
```tsx
if (!isValidImageFile(file)) {
  toast({
    title: "خطأ",
    description: "يرجى اختيار ملف صورة صحيح",
    variant: "destructive",
  });
  return;
}
```

### التحقق من حجم الملف
```tsx
if (!isValidFileSize(file, 5)) {
  toast({
    title: "خطأ",
    description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
    variant: "destructive",
  });
  return;
}
```

## الأمان والتحقق

### 1. نوع الملف
- يتم التحقق من أن الملف هو صورة صحيحة
- يدعم جميع أنواع الصور (JPEG, PNG, GIF, WebP, etc.)

### 2. حجم الملف
- الحد الأقصى الافتراضي: 5 ميجابايت
- قابل للتخصيص عبر `isValidFileSize(file, maxSizeMB)`

### 3. ضغط الصور
- يتم ضغط الصور تلقائياً قبل الرفع
- الحد الأقصى: 1920x1080 بكسل
- جودة: 80%

## إدارة الحالة

### حالات التحميل
- `uploading: false` - جاهز
- `uploading: true` - جاري الرفع
- عرض مؤشر تحميل أثناء العملية

### معرفات الملفات
- يتم تخزين معرف الملف في `formData.logoFileId`
- يتم إرسال المعرف مع بيانات الشريك
- يدعم حذف الصور من السيرفر عند الحاجة

## ملاحظات تقنية

### 1. Timeout
- timeout مخصص لرفع الملفات: 30 ثانية
- timeout عام للـ API: 10 ثانية

### 2. Headers
- لا يتم تحديد `Content-Type` يدوياً
- يترك المتصفح يحدد `boundary` تلقائياً

### 3. Error Handling
- معالجة شاملة للأخطاء
- رسائل خطأ مناسبة للمستخدم
- تسجيل الأخطاء في console للتطوير

## التطوير المستقبلي

### 1. Progress Bar
- إضافة شريط تقدم لرفع الملفات
- عرض النسبة المئوية للرفع

### 2. Multiple Images
- دعم رفع عدة صور
- معرض صور للشركاء

### 3. Image Cropping
- إضافة أداة اقتصاص الصور
- تحديد أبعاد محددة للوجوه

### 4. CDN Integration
- دعم CDN للصور
- تحسين سرعة التحميل

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ في نوع الملف**: تأكد من اختيار ملف صورة صحيح
2. **خطأ في حجم الملف**: تأكد من أن الحجم أقل من 5MB
3. **خطأ في الاتصال**: تحقق من اتصال الإنترنت
4. **خطأ في السيرفر**: تحقق من حالة السيرفر

### حلول:
1. إعادة المحاولة
2. التحقق من نوع الملف
3. ضغط الصورة يدوياً
4. الاتصال بفريق الدعم التقني
