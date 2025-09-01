# Messages API Integration

تم إنشاء API integration كامل لصفحة الرسائل مع الدوال التالية:

## API Endpoints

### 1. Get All Messages

- **Method**: GET
- **Endpoint**: `/message`
- **Parameters**:
  - `page` (optional): رقم الصفحة (افتراضي: 1)
  - `limit` (optional): عدد الرسائل في الصفحة (افتراضي: 50)
  - `status` (optional): فلترة حسب الحالة (new, read, replied, archived)
  - `search` (optional): البحث في النص

### 2. Get Specific Message

- **Method**: GET
- **Endpoint**: `/message/:id`
- **Parameters**:
  - `id`: معرف الرسالة
- **Note**: حالياً يتم استخدام البيانات المحلية عند الضغط على "عرض" حتى يتم إصلاح الـ API endpoint

### 3. Delete Message

- **Method**: DELETE
- **Endpoint**: `/message/:id`
- **Parameters**:
  - `id`: معرف الرسالة

## الملفات المُحدثة

### 1. `lib/messages.ts`

ملف API جديد يحتوي على:

- `getAllMessages()`: جلب جميع الرسائل
- `getMessageById()`: جلب رسالة محددة
- `deleteMessage()`: حذف رسالة
- `updateMessageStatus()`: تحديث حالة الرسالة
- `markMessageAsRead()`: تحديد الرسالة كمقروءة
- `archiveMessage()`: أرشفة الرسالة
- `replyToMessage()`: الرد على الرسالة

### 2. `hooks/use-messages.ts`

تم تحديث Hook لاستخدام API بدلاً من localStorage:

- إضافة `loading` state
- إضافة `error` handling
- تحديث جميع الدوال لاستخدام API calls
- إضافة `loadMessages()` و `clearError()`

### 3. `app/messages/page.tsx`

تم تحديث الصفحة لتشمل:

- Error alerts مع إمكانية إعادة المحاولة
- Loading skeletons للبيانات
- Empty state عندما لا توجد رسائل
- Loading indicators في العنوان

## الميزات الجديدة

### Error Handling

- عرض رسائل الخطأ في Alert component
- إمكانية إغلاق الخطأ أو إعادة المحاولة
- معالجة أخطاء الشبكة والـ API

### Loading States

- Skeleton loading للبطاقات الإحصائية
- Skeleton loading للجدول
- Loading spinner في عنوان الجدول

### User Experience

- Empty state عندما لا توجد رسائل
- تحديث فوري للواجهة بعد العمليات
- رسائل خطأ واضحة باللغة العربية
- عرض تفاصيل الرسالة (بدون إمكانية الرد)
- واجهة مبسطة للعرض فقط
- تأكيد الحذف مع عرض تفاصيل الرسالة
- عرض معلومات الاتصال (الهاتف) في الجدول والتفاصيل
- تحديث تلقائي للجدول بعد كل عملية قراءة أو حذف
- Loading states للعمليات (قراءة وحذف)
- **Pagination**: التنقل بين الصفحات مع تحديد عدد العناصر
- **البحث المباشر**: البحث في الاسم والبريد والموضوع والهاتف
- **الفلترة**: فلترة حسب الحالة (جديدة/مقروءة)

## الميزات الجديدة

### Pagination

- **تحديد عدد العناصر**: 5, 10, 20, 50 عنصر لكل صفحة
- **التنقل**: أزرار السابق والتالي
- **أرقام الصفحات**: عرض أرقام الصفحات مع التنقل المباشر
- **معلومات الصفحة**: عرض "X من Y" للعناصر

### البحث والفلترة

- **البحث المباشر**: البحث أثناء الكتابة في جميع الحقول
- **فلترة الحالة**: فلترة حسب الحالة (جديدة/مقروءة/الكل)
- **دمج البحث والفلترة**: إمكانية البحث مع الفلترة معاً
- **إعادة تعيين الصفحة**: العودة للصفحة الأولى عند البحث

## الاستخدام

```typescript
import { useMessages } from "@/hooks/use-messages";

function MessagesPage() {
  const {
    messages,
    loading,
    error,
    pagination,
    deleteMessage,
    markRead,
    archive,
    counts,
    loadMessages,
    goToPage,
    changePageSize,
    searchMessages,
    clearError,
  } = useMessages();

  // استخدام الدوال...
}
```

## متطلبات API

يجب أن يكون الـ API backend يدعم:

1. **GET /message** - إرجاع قائمة الرسائل مع pagination
2. **GET /message/:id** - إرجاع رسالة محددة
3. **DELETE /message/:id** - حذف رسالة
4. **PATCH /message/:id** - تحديث حالة الرسالة أو الرد

### Response Format

```typescript
// GET /message
{
  messages: ContactMessage[],
  total: number,
  page: number,
  limit: number
}

// GET /message/:id
{
  message: ContactMessage
}

// DELETE /message/:id
{
  success: boolean,
  message: string
}
```

### ContactMessage Interface

```typescript
interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  subject: string;
  contactInfo?: string;
  isSeen: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
```

### API Response Format

```typescript
// GET /message
{
  "status": "success",
  "data": {
    "messages": ContactMessage[],
    "total": number,
    "page": string,
    "limit": string,
    "totalPages": number
  },
  "message": "تم جلب الرسائل بنجاح"
}

// GET /message/:id
{
  "status": "success",
  "data": {
    "message": ContactMessage
  },
  "message": "تم جلب الرسالة بنجاح"
}

// DELETE /message/:id
{
  "status": "success",
  "data": {
    "message": "تم حذف الرسالة بنجاح"
  },
  "message": "تم حذف الرسالة بنجاح"
}
```

## ملاحظات مهمة:

- **لا يتم الرد على الرسائل من Dashboard**: تم إزالة قسم الرد من صفحة العرض
- **عرض فقط**: صفحة الرسائل مخصصة للعرض والإدارة فقط
- **API endpoint للرسالة الواحدة**: غير متاح حالياً (404 error)
- **الإحصائيات المبسطة**: تم إزالة card "تم الرد" لأنها غير مستخدمة
