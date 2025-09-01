# Settings API Documentation

## نظرة عامة

API الإعدادات يتيح إدارة إعدادات الموقع العامة مثل اسم الموقع، معلومات التواصل، وروابط وسائل التواصل الاجتماعي.

## Endpoints

### 1. جلب الإعدادات

**GET** `/setting`

#### الاستجابة

```json
{
  "status": "sucsess",
  "data": {
    "websiteName_ar": "جميعة أصيل",
    "websiteName_en": "Aseel Foundation",
    "websiteLogo": null,
    "contactNumber": "",
    "email": "",
    "address": "",
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "youtube": "",
    "whatsappNumber": "",
    "website": "",
    "description": "",
    "_id": "68b593e4a76d4c85de4f0299",
    "createdAt": "2025-09-01T12:39:00.139Z",
    "updatedAt": "2025-09-01T12:39:00.139Z",
    "__v": 0
  },
  "message": "تم جلب الإعدادات بنجاح"
}
```

### 2. تحديث الإعدادات

**PUT** `/setting`

#### الطلب

```json
{
  "websiteName_ar": "جميعة أصيل",
  "websiteName_en": "Aseel Foundation",
  "contactNumber": "+970 8 123 4567",
  "email": "info@aseel.org",
  "address": "غزة، فلسطين",
  "facebook": "https://facebook.com/aseel.org",
  "instagram": "https://instagram.com/aseel_org",
  "twitter": "https://twitter.com/aseel_org",
  "youtube": "https://youtube.com/@aseel",
  "whatsappNumber": "+970 59 123 4567",
  "website": "https://aseel.org",
  "description": "جمعية خيرية تهدف إلى دعم وتمكين الفئات المحتاجة"
}
```

#### الاستجابة

```json
{
  "status": "sucsess",
  "data": {
    "websiteName_ar": "جميعة أصيل",
    "websiteName_en": "Aseel Foundation",
    "websiteLogo": null,
    "contactNumber": "+970 8 123 4567",
    "email": "info@aseel.org",
    "address": "غزة، فلسطين",
    "facebook": "https://facebook.com/aseel.org",
    "instagram": "https://instagram.com/aseel_org",
    "twitter": "https://twitter.com/aseel_org",
    "youtube": "https://youtube.com/@aseel",
    "whatsappNumber": "+970 59 123 4567",
    "website": "https://aseel.org",
    "description": "جمعية خيرية تهدف إلى دعم وتمكين الفئات المحتاجة",
    "_id": "68b593e4a76d4c85de4f0299",
    "createdAt": "2025-09-01T12:39:00.139Z",
    "updatedAt": "2025-09-01T12:39:00.139Z",
    "__v": 0
  },
  "message": "تم تحديث الإعدادات بنجاح"
}
```

## الملفات المضافة

### 1. `lib/settings.ts`

يحتوي على:

- واجهات TypeScript للإعدادات
- دالة `getSettings()` لجلب الإعدادات
- دالة `updateSettings()` لتحديث الإعدادات

### 2. `hooks/use-settings.ts`

Hook مخصص لإدارة حالة الإعدادات:

- `settings`: البيانات الحالية للإعدادات
- `loading`: حالة التحميل
- `updating`: حالة التحديث
- `error`: رسائل الخطأ
- `fetchSettings()`: جلب الإعدادات
- `updateSettings()`: تحديث الإعدادات

### 3. `app/settings/page.tsx`

تم تحديث صفحة الإعدادات لتشمل:

- استخدام hook الإعدادات
- نموذج تفاعلي مع جميع الحقول
- معالجة حالات التحميل والتحديث
- رسائل النجاح والخطأ
- Skeleton loading للتحميل الأولي
- Loading overlay أثناء التحديث
- معالجة الأخطاء مع إمكانية إعادة المحاولة

### 4. `components/shared/settings-skeleton.tsx`

مكون skeleton مخصص لقسم الإعدادات العامة مع تحسينات في الشكل والمسافات

### 5. `components/shared/settings-page-skeleton.tsx`

مكون skeleton للصفحة بأكملها مع تصميم محسن

### 6. `components/shared/initial-loading-skeleton.tsx`

مكون skeleton محسن للتحميل الأولي مع تأثيرات بصرية

### 7. `components/shared/loading-overlay.tsx`

مكون loading overlay للعمليات مع أحجام مختلفة وتصميم محسن

### 8. `components/shared/error-state.tsx`

مكون لعرض حالات الخطأ مع تصميم جذاب وإمكانية إعادة المحاولة

### 9. `components/shared/refresh-button.tsx`

مكون زر تحديث قابل لإعادة الاستخدام مع حالات التحميل المختلفة

### 10. `components/shared/validation-errors.tsx`

مكون لعرض أخطاء التحقق من صحة البيانات أسفل كل حقل بتصميم جذاب

### 11. `components/shared/logo-upload.tsx`

مكون مخصص لرفع شعار الموقع مع معاينة للسحب والإفلات

## الاستخدام

### في المكونات

```typescript
import { useSettings } from "@/hooks/use-settings";

function MyComponent() {
  const {
    settings,
    loading,
    updating,
    error,
    validationErrors,
    updateSettings,
  } = useSettings();

  // استخدام البيانات
  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1>{settings?.websiteName_ar}</h1>

      {/* عرض أخطاء التحقق من صحة البيانات أسفل كل حقل */}
      <ValidationErrors errors={validationErrors} fieldName="websiteName_ar" />

      <button onClick={() => updateSettings({ websiteName_ar: "اسم جديد" })}>
        تحديث
      </button>
    </div>
  );
}
```

### معالجة أخطاء التحقق من صحة البيانات

النظام الآن يتعامل مع أخطاء التحقق من صحة البيانات من الخادم ويعرضها للمستخدم بتصميم جذاب:

```typescript
// مثال على استجابة الخطأ
{
  "status": "error",
  "message": "validation error",
  "details": [
    {
      "param": "websiteLogo",
      "msg": "شعار الموقع مطلوب"
    },
    {
      "param": "contactNumber",
      "msg": "رقم الهاتف مطلوب"
    }
  ]
}
```

**الميزات:**

- عرض الأخطاء أسفل كل حقل على حدة
- تصميم جذاب مع أيقونة AlertCircle
- معالجة تلقائية للأخطاء في Hook
- تجربة مستخدم محسنة مع تحديد واضح للحقول المطلوب إصلاحها
- عدم عرض toast messages لأخطاء التحقق من صحة البيانات
- رفع شعار الموقع مع معاينة وسحب وإفلات

### مكون رفع شعار الموقع

**الميزات:**

- **رفع إلى الخادم**: رفع الصورة مباشرة إلى `/upload/image`
- **معاينة فورية**: عرض الصورة المرفوعة مباشرة
- **سحب وإفلات**: إمكانية سحب الصورة وإفلاتها في المنطقة المخصصة
- **التحقق من الملف**: التحقق من نوع وحجم الملف
- **حالات التحميل**: عرض حالة التحميل أثناء رفع الصورة
- **لا يمكن الحذف**: الصورة لا تُحذف إلا عند استبدالها بصورة أخرى
- **نسخ رابط الصورة**: Badge لنسخ رابط الصورة إلى الحافظة

**كيفية عمل URL الصورة:**

1. **رفع الصورة**: يتم رفع الصورة إلى `/upload/image`
2. **استقبال المسار**: الخادم يعيد مسار الصورة (مثل `temp/1756734925992-9325a00a-6e7e-45c8-8f70-aeeac201887a.png`)
3. **استخراج Host**: استخراج host من `API_BASE_URL` مع إضافة `/` في النهاية
4. **بناء URL كامل**: `host/ + مسار الصورة`
5. **مثال**:
   - `API_BASE_URL = "http://localhost:5000/api/v1"`
   - `host = "http://localhost:5000/"`
   - `مسار الصورة = "temp/1756734925992-9325a00a-6e7e-45c8-8f70-aeeac201887a.png"`
   - `URL النهائي = "http://localhost:5000/temp/1756734925992-9325a00a-6e7e-45c8-8f70-aeeac201887a.png"`

**API Endpoints:**

- **رفع الصورة**: `POST /upload/image`

  - Content-Type: `multipart/form-data`
  - Body: `{ image: File }`
  - Response: `{ data: { url: string, _id: string, ... } }`
  - URL النهائي: `host + response.data.url` (حيث host مستخرج من API_BASE_URL)
  - Image ID: `response.data._id` (يُرسل في حقل websiteLogo عند حفظ الإعدادات)

- **حذف الصورة**: `DELETE /upload/file/:id`
  - متاح للاستخدام المستقبلي عند الحاجة

**شكل استجابة الإعدادات:**

```json
{
  "status": "sucsess",
  "data": {
    "mainColor": "#007bff",
    "_id": "68b593e4a76d4c85de4f0299",
    "websiteName_ar": "جميعة أصيل",
    "websiteName_en": "Aseel Foundation",
    "websiteLogo": {
      "_id": "68b5a9e4cc27a4a0f6be08b5",
      "url": "setting/1756735972689-fa667e09-9859-4528-966a-b69df4036770.png",
      "fileName": "1756735972689-fa667e09-9859-4528-966a-b69df4036770.png",
      "originalName": "Screenshot 2025-03-06 170024.png",
      "mimeType": "image/png",
      "size": 41503
    },
    "contactNumber": "+970594136074",
    "email": "abosido2@gmail.com",
    "address": "Yafa St, Gaza City, Northern Gaza Strip, Palestine",
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "youtube": "",
    "whatsappNumber": "",
    "website": "",
    "description": "",
    "createdAt": "2025-09-01T12:39:00.139Z",
    "updatedAt": "2025-09-01T14:13:07.296Z",
    "__v": 0
  },
  "message": "تم جلب الإعدادات بنجاح"
}
```

**ميزة نسخ الرابط:**

- **Badge تفاعلي**: عرض badge "نسخ الرابط" مع أيقونة Copy
- **تأكيد النسخ**: تغيير النص إلى "تم النسخ" مع أيقونة Check
- **Clipboard API**: استخدام Clipboard API الحديث مع fallback للمتصفحات القديمة
- **تأثيرات بصرية**: hover effects وانتقالات سلسة

**استخراج Image ID من Object:**

عند تحميل الإعدادات، `websiteLogo` هو object يحتوي على معلومات الصورة:

```typescript
// استخراج imageId من websiteLogo object
let websiteLogoId = null;
if (settings.websiteLogo && typeof settings.websiteLogo === "object") {
  websiteLogoId = settings.websiteLogo._id;
}

// مثال:
// websiteLogo = {
//   "_id": "68b5a9e4cc27a4a0f6be08b5",
//   "url": "setting/1756735972689-fa667e09-9859-4528-966a-b69df4036770.png",
//   "fileName": "1756735972689-fa667e09-9859-4528-966a-b69df4036770.png",
//   ...
// }
// النتيجة: imageId = "68b5a9e4cc27a4a0f6be08b5"
```

**كيفية عمل Image ID:**

1. **رفع الصورة**: يتم رفع الصورة إلى `/upload/image`
2. **استقبال البيانات**: الخادم يعيد بيانات كاملة للصورة بما فيها `_id`
3. **تخزين Image ID**: يتم تخزين `_id` في state المكون
4. **إرسال في Payload**: عند حفظ الإعدادات، يتم إرسال `imageId` في حقل `websiteLogo`
5. **تحميل الإعدادات**: عند تحميل الإعدادات، يتم استخراج `imageId` من `websiteLogo._id`
6. **بناء URL الصورة**: `host + websiteLogo.url` (مثال: `http://localhost:5000/setting/1756735972689-fa667e09-9859-4528-966a-b69df4036770.png`)
7. **تمرير URL للمكون**: يتم تمرير URL الصورة إلى مكون LogoUpload عبر prop `imageUrl`
8. **مثال Payload**:
   ```json
   {
     "websiteName_ar": "جميعة أصيل",
     "websiteLogo": "68b5a9e4cc27a4a0f6be08b5",
     "contactNumber": "+970594136074",
     ...
   }
   ```

**الاستخدام:**

```typescript
<LogoUpload
  value={formData.websiteLogo}
  imageUrl={logoImageUrl}
  onChange={(value) => handleInputChange("websiteLogo", value || "")}
  onError={(error) => {
    toast({
      title: "خطأ في رفع الصورة",
      description: error,
      variant: "destructive",
    });
  }}
  disabled={updating}
/>
```

### كيفية عمل النظام الجديد

**عند رفع صورة جديدة:**

1. **رفع الصورة**: يتم رفع الصورة إلى `/upload/image`
2. **معاينة فورية**: يتم عرض معاينة الصورة فوراً بعد نجاح الرفع
3. **استقبال البيانات**: الخادم يعيد بيانات كاملة للصورة بما فيها `_id`
4. **تخزين Image ID**: يتم تخزين `_id` في state المكون
5. **إرسال في Payload**: عند حفظ الإعدادات، يتم إرسال `imageId` في حقل `websiteLogo`

**عند تحميل الإعدادات:**

1. **استخراج البيانات**: يتم استخراج `imageId` من `websiteLogo._id`
2. **بناء URL الصورة**: `host + websiteLogo.url` (مثال: `http://localhost:5000/setting/1756735972689-fa667e09-9859-4528-966a-b69df4036770.png`)
3. **تمرير URL للمكون**: يتم تمرير URL الصورة إلى مكون LogoUpload عبر prop `imageUrl`
4. **عرض الصورة**: يتم عرض الصورة الموجودة في المعاينة

**عند إرسال بيانات غير صحيحة:**

1. **لا تظهر toast messages** لأخطاء التحقق من صحة البيانات
2. **تظهر رسائل الخطأ** أسفل كل حقل يحتاج إصلاح
3. **Toast يظهر فقط** عند النجاح أو للأخطاء العامة (غير أخطاء التحقق)

**مثال:**

- ✅ **نجح الحفظ**: toast "تم حفظ الإعدادات بنجاح"
- ❌ **خطأ في التحقق**: رسائل أسفل الحقول فقط
- ❌ **خطأ في الخادم**: toast "خطأ في حفظ الإعدادات"

### مباشرة من API

```typescript
import { getSettings, updateSettings } from "@/lib/settings";

// جلب الإعدادات
const settings = await getSettings();

// تحديث الإعدادات
const updatedSettings = await updateSettings({
  websiteName_ar: "اسم جديد",
  email: "new@email.com",
});
```

### تحديث ديناميكي لاسم الموقع

**الميزة:**

- يتم تحديث اسم الموقع في الـ sidebar تلقائياً عند تغييره في صفحة الإعدادات
- لا حاجة لإعادة تحميل الصفحة أو إعادة تشغيل التطبيق

**التنفيذ:**

```typescript
// Hook مخصص لإدارة اسم الموقع
import { useWebsiteName } from "@/hooks/use-website-name";

export const useWebsiteName = () => {
  const { settings } = useSettings();
  const [websiteName, setWebsiteName] = useState("جمعية أصيل");

  useEffect(() => {
    if (settings?.websiteName_ar) {
      setWebsiteName(settings.websiteName_ar);
    }
  }, [settings?.websiteName_ar]);

  return websiteName;
};

// استخدام في Sidebar
const websiteName = useWebsiteName();

// عرض ديناميكي
<h1 className="text-lg font-bold text-foreground">{websiteName}</h1>;
```

**كيفية العمل:**

1. **تغيير اسم الموقع** في صفحة الإعدادات
2. **حفظ الإعدادات** - يتم إرسال البيانات إلى الخادم
3. **تحديث State** - يتم تحديث `settings` في `useSettings` hook
4. **تحديث Sidebar** - يتم تحديث `websiteName` في `useWebsiteName` hook
5. **عرض فوري** - يتم عرض الاسم الجديد في الـ sidebar فوراً

## الميزات

1. **إدارة الحالة**: Hook مخصص لإدارة حالة الإعدادات
2. **معالجة الأخطاء**: معالجة شاملة للأخطاء مع رسائل مناسبة
3. **تحميل تفاعلي**: مؤشرات تحميل أثناء العمليات
4. **TypeScript**: دعم كامل لـ TypeScript مع واجهات محددة
5. **Toast Notifications**: إشعارات نجاح وخطأ تلقائية
6. **Form Validation**: تحقق من صحة البيانات المدخلة
7. **Skeleton Loading**: مؤشرات تحميل متقدمة مع skeleton UI محسن
8. **Loading Overlay**: طبقة تحميل أثناء العمليات مع أحجام مختلفة
9. **Error States**: حالات خطأ محسنة مع تصميم جذاب وإمكانية إعادة المحاولة
10. **Responsive Design**: تصميم متجاوب لجميع أحجام الشاشات
11. **Visual Enhancements**: تحسينات بصرية مع مسافات وأحجام محسنة
12. **Smooth Animations**: حركات سلسة وتأثيرات بصرية
13. **Refresh Functionality**: أزرار تحديث في جميع الأقسام
14. **Reusable Components**: مكونات قابلة لإعادة الاستخدام
15. **Validation Error Handling**: معالجة شاملة لأخطاء التحقق من صحة البيانات
16. **Arabic Field Labels**: تسميات عربية واضحة للحقول
17. **Dynamic Website Name**: تحديث ديناميكي لاسم الموقع في الـ sidebar
